from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone

if TYPE_CHECKING:
    from domains.users.models.user_models import Users

class Articles(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    body: str = Field(default="")
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    created_at: datetime = Field(default_factory=lambda :datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda :datetime.now(timezone.utc))
    
    owner_id: int = Field(foreign_key="users.id") 

    owner: Optional["Users"] = Relationship(back_populates="knowledge")

    attachment: List["Attachment"] = Relationship(back_populates="articles")


class Category(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    name: str = Field(unique=True, index=True)
    parent_category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    

class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)

class ArticleTag(SQLModel, table=True):
    article_id: Optional[int] = Field(default=None, foreign_key="articles.id", primary_key=True)
    tag_id: Optional[int] = Field(default=None, foreign_key="tag.id", primary_key=True)

class Attachment(SQLModel, table=True):
    filename: str = Field(unique=True, primary_key=True)
    storage_key: str
    mime_type: str

    article_id: int = Field(foreign_key="articles.id")

    articles: Optional["Articles"] = Relationship(back_populates="attachment")
