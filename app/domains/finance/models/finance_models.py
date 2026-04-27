from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, date, timezone
from decimal import Decimal

if TYPE_CHECKING:
    from domains.users.models.user_models import Users

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    color: str = Field(default="#6b7280")
    icon: str = Field(default="💳")

    transactions: List["Transaction"] = Relationship(back_populates="category")

class ImportBatch(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str
    imported_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    transaction_count: int = Field(default=0)
    skipped_count: int = Field(default=0)

    owner_id: int = Field(foreign_key="users.id")
    owner: Optional["Users"] = Relationship(back_populates="import_batches")

    transactions: List["Transaction"] = Relationship(back_populates="batch")

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    payment_date: date
    value_date: date
    status: str
    payer: Optional[str] = Field(default=None)
    payee: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    transaction_type: str
    iban: Optional[str] = Field(default=None)
    amount: Decimal = Field(decimal_places=2, max_digits=12)
    creditor_id: Optional[str] = Field(default=None)
    mandate_reference: Optional[str] = Field(default=None)
    client_reference: Optional[str] = Field(default=None)

    #Deduplication Hash
    row_hash: str = Field(unique=True, index=True)

    #Relations
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    category: Optional[Category] = Relationship(back_populates="transactions")

    batch_id: Optional[int] = Field(default=None, foreign_key="importbatch.id")
    batch: Optional[ImportBatch] = Relationship(back_populates="transactions")

    owner_id: int = Field(foreign_key="users.id")
    owner: Optional[Users] = Relationship(back_populates="transactions")