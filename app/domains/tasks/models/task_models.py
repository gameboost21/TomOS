from enum import Enum
from typing import Optional, Dict, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone

if TYPE_CHECKING:
    from domains.users.models.user_models import Users

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    task_name: str
    description: str
    due_date: datetime
    assignee: str
    done: bool = False
    urgent: bool = False

    created_at: datetime =Field(default_factory=lambda :datetime.now(timezone.utc))
    updated_at: datetime =Field(default_factory=lambda :datetime.now(timezone.utc))
    deleted_at: Optional[datetime] = Field(default=None)

    owner_id: int = Field(foreign_key="users.id")

    owner: Optional["Users"] = Relationship(back_populates="tasks")
