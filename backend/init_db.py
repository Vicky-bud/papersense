import asyncio
from backend.database import sync_engine
from backend.models import Base

def init_db():
    Base.metadata.create_all(bind=sync_engine)

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
