import logging
from celery import shared_task
from celery.expressions import SoftTimeLimitExceeded
from sqlmodel import Session

from core.database.session import get_session

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    autoretry_for=(ConnectionError, TimeoutError),
    retry_backoff=True,
    retry_backoff_max=120,
    retry_jitter=True
)

def generate_note_embedding(self, note_id: int) -> dict:
    