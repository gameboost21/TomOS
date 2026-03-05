"""Application entrypoint for the FastAPI service.

Configures CORS and mounts domain routers for tasks and users.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from domains.tasks.routers import task_router
from domains.users.routers import user_router



app = FastAPI()

origins = [
    "https://tomos.tuschkoreit.de"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(task_router.router)
app.include_router(user_router.router)