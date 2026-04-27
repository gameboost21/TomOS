"""
Finance service — DKB CSV parser and transaction CRUD.
 
DKB export format (as of 2025):
- Semicolon-separated, values quoted with double quotes
- Date format: DD.MM.YY
- Decimal format: German (comma as separator, e.g. -0,01)
- Encoding: UTF-8
- Header block at top (account info rows) before column headers
- Trailing columns may be empty
"""

import hashlib
import csv
import io
from decimal import Decimal, InvalidOperation
from datetime import date, datetime
from typing import List, Tuple, Optional

from fastapi import HTTPException
from sqlmodel import Session, select

from domains.finance.models.finance_models import Transaction, Category, ImportBatch
from domains.finance.schemas.finance_schemas import CategoryCreate
from domains.users.models.user_models import Users

# ── Column name mapping ───────────────────────────────────────────────────────
# Maps DKB's raw German header names to our model field names.
# Strip whitespace when matching since DKB sometimes pads headers.

COLUMN_MAP = {
    "Buchungsdatum":        "payment_date",
    "Wertstellung":         "value_date",
    "Status":               "status",
    "Zahlungspflichtige*r": "payer",
    "Zahlungsempfänger*in": "payee",
    "Verwendungszweck":     "description",
    "Umsatztyp":            "transaction_type",
    "IBAN":                 "iban",
    "Betrag (€)":           "amount",
    "Gläubiger-ID":         "creditor_id",
    "Mandatsreferenz":      "mandate_reference",
    "Kundenreferenz":       "client_reference"
}


# ── Parsing helpers ───────────────────────────────────────────────────────────

def _parse_date(value: str) -> date:
    """Parse DKB date format DD.MM.YY into a Python date"""
    value = value.strip()
    try:
        return datetime.strptime(value, "%d.%m.%y").date()
    except ValueError:
        # Fallback: try DD.MM.YYYY in case format changes
        try:
            return datetime.strptime(value, "%d.%m.%Y").date()
        except ValueError:
            raise ValueError(f"Cannot parse date: '{value}'")
        
def _parse_amount(value: str) -> Decimal:
    """
    Parse German decimal format to Decimal.
    '1.234,56'  → Decimal('1234.56')
    '-0,01'     → Decimal('-0.01')
    """
    value = value.strip()
    #Removing thousand-separators (dots), replace decimal comma with dot
    normalised = value.replace(".", "").replace(",",".")#
    try:
        return Decimal(normalised)
    except InvalidOperation:
        return ValueError(f"Cannot parse amount: '{value}'")
    
def _make_row_hash(payment_date: date, amount: Decimal, iban: str, description: str) -> str:
    """
    Create a stable deduplication hash from the most unique combination of fields.
    Using SHA-256 truncated to 16 chars is sufficient for dedup purposes.
    """
    raw = f"{payment_date}|{amount}|{iban or ''}|{description or ''}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


# ── CSV Parser ────────────────────────────────────────────────────────────────


def parse_dkb_csv(file_content: bytes) -> List[dict]:
    """
    Parse a DKB transaction CSV export.
 
    DKB files have a header block (account info) before the actual
    column headers. We skip rows until we find the line that starts
    with 'Buchungsdatum' which marks the real header row.
 
    Returns a list of dicts with normalised field names.
    """
    try:
        text = file_content.decode("utf-8")
    except UnicodeDecodeError:
        #Fallback to Latin-1 for older exports
        text = file_content.decode("iso-8859-1")

    lines = text.splitlines()

    #Find header row - first line with "Buchungsdatum"
    header_line_index = None
    for i, line in enumerate(lines):
        if line.startswith("Buchungsdatum"):
            header_line_index = i
            break
    
    if header_line_index is None:
        raise ValueError(
            "Could not find column headers in CSV. "
            "Expected a row starting with 'Buchungsdatum'."
        )
    
    #Reconstructing date portion for CSV header
    data_lines = lines[header_line_index]
    data_text = "\n".join(data_lines)

    reader = csv.DictReader(io.StringIO(data_text), delimiter=";", quotechar='"')

    rows = []

    for raw_row in reader:
        #Stripping whitespaces from keys and values
        row = {k.strip(): (v.strip() if v else "") for k, v in raw_row.items() if k}

        #Skip entirely empty rows
        if not any(row.values()):
            continue

        #Map German column names to field names
        mapped = {}
        for german_key, field_name in COLUMN_MAP.items():
            raw_value = row.get(german_key, "")

            if field_name in ("payment_date", "value_date"):
                if raw_value:
                    mapped[field_name] = _parse_date(raw_value)
                else:
                    continue
            elif field_name == "amount":
                if raw_value:
                    mapped[field_name] = _parse_amount(raw_value)
                else:
                    continue
            else:
                mapped[field_name] = raw_value if raw_value else None
            
        # Skipping rows with no valid date (footers etc.)
        if "payment_date" not in mapped:
            continue

        rows.append(mapped)
    return rows


# ── Default categories seed ───────────────────────────────────────────────────

DEFAULT_CATEGORIES = [
    {"name": "Food & Groceries",  "color": "#16a34a", "icon": "🛒"},
    {"name": "Transport",         "color": "#2563eb", "icon": "🚆"},
    {"name": "Housing & Utilities","color": "#9333ea", "icon": "🏠"},
    {"name": "Health",            "color": "#dc2626", "icon": "💊"},
    {"name": "Entertainment",     "color": "#f59e0b", "icon": "🎬"},
    {"name": "Subscriptions",     "color": "#0891b2", "icon": "📱"},
    {"name": "Income",            "color": "#059669", "icon": "💰"},
    {"name": "Transfers",         "color": "#6b7280", "icon": "🔄"},
    {"name": "Other",             "color": "#a1a1aa", "icon": "📦"},
]

def seed_categories(session: Session):
    """Insert default categories if none exist yet."""
    existing = session.exec(select(Category)).first()
    if existing:
        return #Already seeded
    
    for cat_data in DEFAULT_CATEGORIES:
        session.add(Category(**cat_data))
    session.commit()

# ── Import service ────────────────────────────────────────────────────────────

def import_transactions(
        file_content: bytes,
        filename: str,
        session: Session,
        user: Users,
) -> Tuple[int, int, ImportBatch]:
    """
    Parse a DKB CSV and persist new transactions.
    Duplicates (matched by row_hash) are silently skipped.
 
    Returns (imported_count, skipped_count, batch).
    """
    rows = parse_dkb_csv(file_content)

    if not rows:
        raise HTTPException(status_code=400, detail="No transaction found in file.")
    
    #Create and import batch record
    batch = ImportBatch(filename=filename, owner_id=user.id)
    session.add(batch)
    session.flush()

    imported = 0
    skipped = 0

    for row in rows:
        row_hash = _make_row_hash(
            row.get("payment_date"),
            row.get("amount", Decimal("0")),
            row.get("iban"),
            row.get("description")
        )

        #Checking for duplicates
        existing = session.exec(
            select(Transaction).where(Transaction.row_hash == row_hash)
        ).one_or_none

        if existing:
            skipped += 1
            continue

        transaction = Transaction(
            **row,
            row_hash=row_hash,
            batch_id=batch.id,
            owner_id=user.id
        )
        session.add(transaction)
        imported += 1
    
    #Update batch counts and commit to DB
    batch.transaction_count = imported
    batch.skipped_count = skipped
    session.commit()

    return imported, skipped, batch 

# ── Transaction CRUD ──────────────────────────────────────────────────────────

def get_transactions(
    session: Session,
    user: Users,
    category_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    limit: int = 100,
    offset = 0,
) -> List[Transaction]:
    
    statement = select(Transaction).where(Transaction.owner_id == user.id)

    if category_id is not None:
        statement = statement.where(Transaction.category_id == category_id)
    if transaction_type:
        statement = statement.where(Transaction.transaction_type == transaction_type)

    statement = statement.order_by(Transaction.payment_date.desc()).offset(offset).limit(limit)
    return session.exec(statement)

def update_transaction_category(
    transaction_id: int,
    category_id: Optional[int],
    session: Session,
    user: Users,
) -> Transaction:
    transaction = session.exec(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.owner_id == user.id,
        )
    ).one_or_none()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    transaction.category_id = category_id
    session.commit()
    session.refresh(transaction)
    return transaction

# ── Category CRUD ─────────────────────────────────────────────────────────────

def get_categories(session: Session) -> List[Category]:
    return session.exec(select(Category)).all()

def create_category(data: CategoryCreate, session: Session) -> Category:
    existing = session.exec(
        select(Category).where(Category.name == data.name)
    ).one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    category = Category(**data.model_dump())
    session.add(category)
    session.commit()
    session.refresh(category)
    return category