from typing import Optional
from pydantic import BaseModel, EmailStr, validator
from domains.users.models.user_models import UserRoles

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel): 
    username: str
    password: str

class UserRoleUpdate(BaseModel):
    role: UserRoles

    
