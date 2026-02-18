from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class TaskCreate(BaseModel):
    task_name: str
    description: str
    due_date: datetime
    assignee: str
    done: bool = False
    urgent: bool

class TaskUpdate(BaseModel):
    task_name:   Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee: Optional[str] = None
    urgent: Optional[bool] = None
    done: Optional[bool] = None
    
