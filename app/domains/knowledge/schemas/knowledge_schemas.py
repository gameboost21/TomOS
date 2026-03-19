from typing import Optional, List
from pydantic import BaseModel

class ArticleCreate(BaseModel):
    title: str
    body: str
    category_id: Optional[int] = None
    tags: List[int] = []

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    category_id: Optional[int] = None
    tags: Optional[List[int]] = None
    