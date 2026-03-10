from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from core.database.session import get_session
from sqlmodel import Session

from domains.users.models.user_models import Users
from domains.users.schemas.user_schemas import UserCreate as uc
from domains.users.schemas.user_schemas import LoginRequest, UserRoleUpdate
from domains.users.services.user_service import get_current_user as gcu

router = APIRouter()

from domains.users.services.user_service import get_users as get_users_service
from domains.users.services.user_service import get_user as get_user_service
from domains.users.services.user_service import register_user as register_user_service
from domains.users.services.user_service import login_user as login_user_service
from domains.users.services.user_service import delete_user as delete_user_service
from domains.users.services.user_service import update_user_role as update_user_role_service

from domains.users.services.user_service import require_admin as admin
from domains.users.services.user_service import require_moderator as mod
from domains.users.services.user_service import require_super_user as su
from domains.users.services.user_service import require_viewer as viewer

#Admin Endpoints
@router.get("/users")
def get_all_users_endpoint(_: Users = Depends(admin), session: Session = Depends(get_session)):
     return get_users_service(session)
    
@router.get("/users/{id}")
def get_user_endpoint(id: int, _: Users = Depends(admin), session: Session = Depends(get_session)):
    return get_user_service(id, session)

@router.delete("/users/{id}", status_code=204)
def delete_user_endpoint(id: int, current_user: Users = Depends(admin), session: Session = Depends(get_session)):
    return delete_user_service(id, session)

@router.put("/users/{id}/role")
def update_user_role_endpoint(id: int, role_update: UserRoleUpdate, _: Users = Depends(admin), session: Session = Depends(get_session)):
    return update_user_role_service(id, role_update.role, session)


#User Endpoints
@router.post("/login")
def login_user_endpoint(login_data: LoginRequest, session: Session = Depends(get_session)):
    return login_user_service(login_data.username, login_data.password, session)

@router.post("/register")
def register_user_endpoint(user_schema: uc, session: Session = Depends(get_session)):
    return register_user_service(user_schema, session)

@router.get("/me")
def get_current_user_endpoint(current_user: Users = Depends(gcu)):
    return current_user