import os
from typing import Optional, List
from dotenv import load_dotenv
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlmodel import Session, select
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timezone, timedelta

from domains.users.models.user_models import UserRoles, Users
from domains.users.schemas.user_schemas import UserCreate as uc
from core.database.session import get_session

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM=os.getenv("ALGORITHM", "HS256")

if not SECRET_KEY:
    raise ValueError("SECRET_KEY not set")

bcrypt = CryptContext(schemes="bcrypt", deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password: str):
    return bcrypt.hash(password)

def verify_password(plaintext: str, hashed: str):
    return bcrypt.verify(plaintext, hashed)

def create_access_token(user: Users, expires_delta: Optional[timedelta] = None):
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode = {
        "sub": str(user.id),
        "username": user.username,
        "role": user.role.value,
        "exp": expire
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail="Invalid Credentials",
        headers={"WWW-Authenticate":"Bearer"}
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    statement = select(Users).where(Users.id == user_id)
    user = session.exec(statement).one_or_none()
    if user is None:
        raise credentials_exception
    return user

def require_role(required_roles: List[UserRoles]):
    def role_checker(user: Users = Depends(get_current_user)):
        if user.role not in required_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return user
    return role_checker

require_admin = require_role([UserRoles.admin])
require_moderator = require_role([UserRoles.admin, UserRoles.moderator])
require_super_user = require_role([UserRoles.admin, UserRoles.moderator, UserRoles.super_user])
require_viewer = require_role([UserRoles.admin, UserRoles.moderator, UserRoles.super_user, UserRoles.viewer])

#def get_users():



#def get_user():



def login_user(username: str, password: str, session: Session):
    statement = select(Users).where(Users.username == username)
    user = session.exec(statement).one_or_none()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Username or Password", headers={"WWW-Authenticate":"Bearer"})
    access_token = create_access_token(user)
    return {"access_token": access_token, "token_type":"bearer"}

    
def register_user(user_schema: uc, session: Session) -> Users:
    # Check if user exists
    existing_user = session.exec(
        select(Users).where(
            (Users.username == user_schema.username) |
            (Users.email == user_schema.email)
        )
    ).one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create the new user
    hashed_pw = hash_password(user_schema.password)
    new_user = Users(
        username=user_schema.username,
        email=user_schema.email,
        hashed_password=hashed_pw,
        role=UserRoles.viewer
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return new_user

