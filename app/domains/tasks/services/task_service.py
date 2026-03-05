"""Task-related business logic.

Provides helpers to create, read, update and delete tasks while enforcing
ownership and soft-deletion semantics.
"""

from sqlmodel import Session, select
from fastapi import HTTPException, Response
from datetime import datetime, timezone

from domains.tasks.models.task_models import Task
from domains.users.models.user_models import Users
from domains.tasks.schemas.task_schemas import TaskCreate, TaskUpdate

def create_task(task_schema: TaskCreate, session: Session, user: Users) -> Task:
    """Create a new task owned by `user`.

    Args:
        task_schema: Payload for creating the task.
        session: Database session.
        user: The owner user instance.

    Returns:
        Task: The created task model.
    """
    task_model = Task(**task_schema.model_dump(), owner_id=user.id)

    session.add(task_model)
    session.commit()
    session.refresh(task_model)
    
    return task_model

def get_tasks(session: Session, user: Users):
    """Return non-deleted tasks belonging to the given user.

    Args:
        session: Database session.
        user: The owner user instance.

    Returns:
        List[Task]: Tasks owned by `user` that are not soft-deleted.
    """
    statement = select(Task).where(Task.owner_id == user.id, Task.deleted_at.is_(None))
    tasks = session.exec(statement).all()
    return tasks

def get_task_by_id(id: int, session: Session, user: Users):
    """Retrieve a single task by id for the given user.

    Args:
        id: Task id to retrieve.
        session: Database session.
        user: The owner user instance.

    Raises:
        HTTPException: 404 if the task is not found or not accessible.

    Returns:
        Task: The requested task.
    """
    statement = select(Task).where(Task.id == id, Task.owner_id == user.id, Task.deleted_at.is_(None))
    task = session.exec(statement).one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    return task

def delete_task(id: int, session: Session, user: Users):
    """Soft-delete a task by setting `deleted_at`.

    If the task is already deleted, the function is idempotent and returns 204.

    Args:
        id: Task id to delete.
        session: Database session.
        user: The owner user instance.

    Raises:
        HTTPException: 404 if the task does not exist.

    Returns:
        Response: FastAPI response with status 204.
    """
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
    """Apply partial updates to a task owned by `user`.

    Args:
        id: Task id to update.
        task_schema: Partial update payload.
        session: Database session.
        user: The owner user instance.

    Raises:
        HTTPException: 404 if the task is not found.

    Returns:
        Task: The updated task model.
    """
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

    