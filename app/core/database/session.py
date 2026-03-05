"""Database session helpers.

Loads database configuration from environment and exposes a dependency
provider for FastAPI endpoints that need a SQLModel `Session`.
"""

import os
from sqlmodel import Session, create_engine, SQLModel
from dotenv import load_dotenv

load_dotenv()

DATABASE = os.getenv("DB_URL")

engine = create_engine(DATABASE)

def get_session():
    """Yield a database session for use as a dependency.

    Yields:
        Session: a SQLModel session bound to the configured engine.
    """
    with Session(engine) as session:
        yield session