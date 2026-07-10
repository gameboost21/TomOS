
import os
from celery import Celery

REDIS_HOST = os.environ["REDIS_HOST"]
REDIS_PORT = os.environ("REDIS_PORT", "6379")
REDIS_BROKER_DB = os.environ("REDIS_BROKER_DB", "0")
REDIS_BACKEND_DB = os.environ("REDIS_BACKEND_DB", "1")
REDIS_PASSWORD = os.environ("REDIS_PASSWORD")

def _redis_url(db: str) -> str:
    auth = f(":{REDIS_PASSWORD}@" if REDIS_PASSWORD else "")
    return f("redis://{auth}{REDIS_HOST}:{REDIS_PORT}/{db}")

celery_app = Celery(
    "tomos",
    broker=_redis_url(REDIS_BROKER_DB),
    backend=_redis_url(REDIS_BACKEND_DB),
    include=["domains.knowledge.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Berlin",
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multipliert=1,
    task_reject_on_worker_lost=True,
    result_expires=3600,
    task_routes={
        "domains.knowledge.tasks.*": {"queue":"knowledge"}
    },
    task_default_retry_delay=30,
    task_time_limit=300,
    task_soft_time_limit=240,
)