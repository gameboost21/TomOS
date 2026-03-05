"""Authentication and user-related helpers.

This module contains password hashing, JWT token creation and FastAPI
dependency helpers to get the current user and enforce role-based access.
"""

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
    """Hash a plaintext password using bcrypt.

    Args:
        password: Plaintext password to hash.

    Returns:
        The hashed password string.
    """
    return bcrypt.hash(password)

def verify_password(plaintext: str, hashed: str):
    """Verify a plaintext password against a bcrypt hash.

    Args:
        plaintext: The plaintext password to verify.
        hashed: The stored bcrypt hash to verify against.

    Returns:
        True if the password matches, False otherwise.
    """
    return bcrypt.verify(plaintext, hashed)

def create_access_token(user: Users, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token for a user.

    Args:
        user: The `Users` instance to include in the token subject.
        expires_delta: Optional timedelta to set token expiry; defaults to 15 minutes.

    Returns:
        Encoded JWT as a string.
    """
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

get_current_user.__doc__ = """Dependency to retrieve the current user from a JWT token.

Raises:
    HTTPException: 401 if credentials are invalid or user not found.

Returns:
    Users: The authenticated user instance.
"""

def require_role(required_roles: List[UserRoles]):
    """Return a dependency that enforces a set of allowed `UserRoles`.

    Args:
        required_roles: List of allowed `UserRoles` for the protected endpoint.

    Returns:
        A dependency callable that raises HTTPException 403 when unauthorized.
    """
    def role_checker(user: Users = Depends(get_current_user)):
        if user.role not in required_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return user
    return role_checker

require_admin = require_role([UserRoles.admin])
require_moderator = require_role([UserRoles.admin, UserRoles.moderator])
require_super_user = require_role([UserRoles.admin, UserRoles.moderator, UserRoles.super_user])
require_viewer = require_role([UserRoles.admin, UserRoles.moderator, UserRoles.super_user, UserRoles.viewer])

def get_users(user: Users, session: Session):
    """Retrieve all users.

    Args:
        user: The requesting user (dependency-injected).
        session: Database session.

    Returns:
        List[Users]: All users in the database.
    """
    statement = select(Users)
    users =  session.exec(statement).all()

    return users



def get_user(id: int, session: Session):
    """Get a single user by id.

    Args:
        id: User id to lookup.
        session: Database session.

    Raises:
        HTTPException: 404 if the user is not found.

    Returns:
        Users: The requested user instance.
    """
    statement = select(Users).where(Users.id == id)
    user = session.exec(statement).one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user



def login_user(username: str, password: str, session: Session):
    """Authenticate a user and return an access token.

    Args:
        username: Username credential.
        password: Plaintext password credential.
        session: Database session.

    Raises:
        HTTPException: 401 if credentials are invalid.

    Returns:
        dict: A token response containing `access_token` and `token_type`.
    """
    statement = select(Users).where(Users.username == username)
    user = session.exec(statement).one_or_none()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Username or Password", headers={"WWW-Authenticate":"Bearer"})
    access_token = create_access_token(user)
    return {"access_token": access_token, "token_type":"bearer"}

    
def register_user(user_schema: uc, session: Session) -> Users:
    """Register a new user if username/email are not already taken.

    Args:
        user_schema: A `UserCreate` schema with registration data.
        session: Database session.

    Raises:
        HTTPException: 400 if a user with the same username or email exists.

    Returns:
        Users: The newly created user instance.
    """
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

