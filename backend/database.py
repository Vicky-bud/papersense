from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.config import settings

# Async Engine (For FastAPI endpoints)
async_engine = create_async_engine(settings.async_database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=async_engine)

# Sync Engine (For migrations or background tasks if needed)
sync_engine = create_engine(settings.sync_database_url, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
