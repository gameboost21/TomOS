from sqlmodel import Session, select
from fastapi import HTTPException, Response
from datetime import datetime, timezone

from domains.tasks.models.task_models import Task
from domains.users.models.user_models import Users
from domains.tasks.schemas.task_schemas import TaskCreate, TaskUpdate

def create_task(task_schema: TaskCreate, session: Session, user: Users) -> Task:
    task_model = Task(**task_schema.model_dump(), owner_id=user.id)

    session.add(task_model)
    session.commit()
    session.refresh(task_model)
    
    return task_model

def get_tasks(session: Session, user: Users):
    
    statement = select(Task).where(Task.owner_id == user.id, Task.deleted_at.is_(None))
    tasks = session.exec(statement).all()
    return tasks

def get_task_by_id(id: int, session: Session, user: Users):
    
    statement = select(Task).where(Task.id == id, Task.owner_id == user.id, Task.deleted_at.is_(None))
    task = session.exec(statement).one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    return task

def delete_task(id: int, session: Session, user: Users):
    statement = select(Task).where(Task.id == id, Task.owner_id == user.id)
    task = session.exec(statement).one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.deleted_at is not None:
        return Response(status_code=204)

    task.deleted_at = datetime.now(timezone.utc)

    session.commit()

    return Response(status_code=204)

def update_task(id: int, task_schema: TaskUpdate, session: Session, user: Users) -> Task:
    
    updates = task_schema.model_dump(exclude_unset=True).items()
    statement = select(Task).where(Task.id == id, Task.owner_id == user.id ,Task.deleted_at.is_(None))
    task = session.exec(statement).one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not Found")
    
    for field, value in updates:
        setattr(task, field, value)

    task.updated_at = datetime.now(timezone.utc)

    session.commit()
    session.refresh(task)
    return task

    