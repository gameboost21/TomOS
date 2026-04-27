from typing import Optional, List
from pydantic import BaseModel
from decimal import Decimal
from datetime import date

class TransactionRead(BaseModel):
    id: int
    payment_date: date
    value_date: date
    status: str
    payer: Optional[str]
    payee: Optional[str]
    description: Optional[str]
    transaction_type: str
    iban: Optional[str]
    amount: Decimal
    creditor_id: Optional[str]
    mandate_reference: Optional[str]
    client_reference: Optional[str]
    category_id: Optional[int]
    batch_id: Optional[int]

    class Config:
        from_attributes: True

class TransactionCategoryUpdate(BaseModel):
    category_id: Optional[int]

class CategoryRead(BaseModel):
    id:int
    name: str
    color: str
    icon: str

    class Config:
        from_attributes: True

class CategoryCreate(BaseModel):
    name: str
    color: str
    icon: str

class ImportResult(BaseModel):
    filename: str
    imported: int
    skipped: int
    batch_id: int