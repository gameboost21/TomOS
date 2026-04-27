from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlmodel import Session
from typing import Optional

from core.database.session import get_session
from domains.users.models.user_models import Users
from domains.users.services.user_service import require_viewer as viewer
from domains.users.services.user_service import require_admin as admin

from domains.finance.schemas.finance_schemas import (
    TransactionRead,
    TransactionCategoryUpdate,
    CategoryRead,
    CategoryCreate,
    ImportResult,
)

from domains.finance.services.finance_services import (
    import_transactions,
    get_transactions,
    update_transaction_category,
    get_categories,
    create_category,
    seed_categories
)

router = APIRouter(prefix="/finance", tags=["finance"])

# ── Categories ────────────────────────────────────────────────────────────────

@router.get("/categories", response_model=list[CategoryRead])
def get_categories_endpoint(_: Users = Depends(viewer), session: Session = Depends(get_session)):
    return get_categories(session)

@router.post("/categories", response_model=CategoryRead)
def create_category_endpoint(data: CategoryCreate, _: Users = Depends(admin), session: Session = Depends(get_session)):
    return create_category(data, session)

@router.post("/categories/seed", status_code=204)
def seed_categories_endpoint(_: Users = Depends(admin), session: Session = Depends(get_session)):
    """Populate the default category set. Safe to call multiple times."""
    seed_categories(session)

# ── Import ────────────────────────────────────────────────────────────────────

@router.post("/import", response_model=ImportResult)
async def import_csv_endpoint(
    file: UploadFile = File(...),
    user: Users = Depends(viewer),
    session: Session = Depends(get_session)
):
    if not file.filename.endswith(".csv"):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Only .csv files are accepted")
    
    content = await file.read()
    imported, skipped, batch = import_transactions(content, file.filename, session, user)

    return ImportResult(
        filename=file.filename,
        imported=imported,
        skipped=skipped,
        batch_id=batch.id,
    )

# ── Transactions ──────────────────────────────────────────────────────────────

@router.get("/transactions", response_model=list[TransactionRead])
def get_transactions_endpoint(
    category_id: Optional[int] = Query(default=None),
    transaction_type: Optional[str] = Query(default=None),
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0),
    user: Users = Depends(viewer),
    session: Session = Depends(get_session),
):
    return get_transactions(session, user, category_id, transaction_type, limit, offset)

@router.put("/transactions/{id}/category", response_model=TransactionRead)
def update_category_endpoint(
    id: int,
    data: TransactionCategoryUpdate,
    user: Users = Depends(viewer),
    session: Session = Depends(get_session)
):
    return update_transaction_category(id, data.category_id, session, user)

