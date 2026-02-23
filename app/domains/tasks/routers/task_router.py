from fastapi import APIRouter, Depends
from core.database.session import get_session
from sqlmodel import Session

from domains.users.models.user_models import Users

from domains.tasks.services.task_service import create_task as create_task_service 
from domains.tasks.services.task_service import get_tasks as get_tasks_service
from domains.tasks.services.task_service import get_task_by_id as get_task_service
from domains.tasks.services.task_service import delete_task as delete_task_service
from domains.tasks.services.task_service import update_task as update_task_service
from domains.users.services.user_service import require_admin as admin
from domains.users.services.user_service import require_moderator as mod
from domains.users.services.user_service import require_super_user as su
from domains.users.services.user_service import require_viewer as viewer

from domains.tasks.schemas.task_schemas import TaskCreate, TaskUpdate

router = APIRouter()

@router.post("/tasks")
def create_task_endpoint(task_schema: TaskCreate,  user: Users = Depends(viewer), session: Session = Depends(get_session)):
    return create_task_service(task_schema, session, user) #<-- This references the create_task function inside TaskCreate.py

@router.get("/tasks")
def get_all_tasks(user: Users = Depends(viewer), session: Session = Depends(get_session)):
    return get_tasks_service(session, user)

@router.get("/tasks/{id}")
def get_task(id: int, user: Users = Depends(viewer), session: Session = Depends(get_session)):
    return get_task_service(id, session, user)

@router.delete("/tasks/{id}", status_code=204)
def delete_task(id: int, user: Users = Depends(su), session: Session = Depends(get_session)):
    return delete_task_service(id, session, user)

@router.put("/tasks/{id}")
def update_task(id: int,task_schema: TaskUpdate, user: Users = Depends(viewer), session: Session = Depends(get_session)):
    return update_task_service(id, task_schema, session, user)
