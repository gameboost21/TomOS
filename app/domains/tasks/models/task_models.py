from enum import Enum
from typing import Optional, Dict
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone

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
    deleted_at: datetime =Field(default_factory=lambda :datetime.now(timezone.utc))
