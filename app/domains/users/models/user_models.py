from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum

if TYPE_CHECKING:
    from domains.tasks.models.task_models import Task

class UserRoles(str, Enum):
    admin = "admin"
    moderator = "moderator"
    super_user = "super_user"
    viewer = "viewer"

class Users(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str
    hashed_password: str
    role: UserRoles = Field(default=UserRoles.viewer)

    tasks: List["Task"] = Relationship(back_populates="owner")