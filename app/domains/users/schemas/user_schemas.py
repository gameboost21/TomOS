from typing import Optional
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel): 
    username: str
    password: str

    
