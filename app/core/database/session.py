import os
from sqlmodel import Session, create_engine, SQLModel
from dotenv import load_dotenv

load_dotenv()

DATABASE = os.getenv("DB_URL")

engine = create_engine(DATABASE)

def get_session():
    with Session(engine) as session:
        yield session