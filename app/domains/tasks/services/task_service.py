from sqlmodel import Session, select
from fastapi import HTTPException

from domains.tasks.models.task_models import Task
from domains.tasks.schemas.task_schemas import TaskCreate, TaskUpdate

def create_task(task_schema: TaskCreate, session: Session) -> Task:
    task_model = Task(**task_schema.model_dump())

    session.add(task_model)
    session.commit()
    session.refresh(task_model)
    
    return task_model

def get_tasks(session: Session):
    
    statement = select(Task)
    tasks = session.exec(statement).all()
    return tasks

def get_task_by_id(id: int, session: Session):
    
    statement = select(Task).where(Task.id == id)
    task = session.exec(statement).one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    return task

def delete_task(id: int, session: Session):
    statement = select(Task).where(Task.id == id)
    task = session.exec(statement).one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)
    session.commit()

    return "Task Deleted Successfully"

def update_task(id: int, task_schema: TaskUpdate, session: Session) -> Task:
    
    updates = task_schema.model_dump(exclude_unset=True).items()
    statement = select(Task).where(Task.id == id)
    task = session.exec(statement).one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not Found")
    
    for field, value in updates:
        setattr(task, field, value)

    session.commit()
    session.refresh(task)
    return task

    