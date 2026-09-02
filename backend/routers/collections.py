from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid

from backend.database import get_db
from backend.models.collection import Collection, paper_collection_link
from backend.models.paper import Paper

router = APIRouter()

class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CollectionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]

class AddPaperRequest(BaseModel):
    paper_id: str

@router.post("/", response_model=CollectionResponse)
async def create_collection(request: CollectionCreate, db: AsyncSession = Depends(get_db)):
    collection = Collection(name=request.name, description=request.description)
    db.add(collection)
    await db.commit()
    await db.refresh(collection)
    return {
        "id": str(collection.id),
        "name": collection.name,
        "description": collection.description
    }

@router.get("/", response_model=List[CollectionResponse])
async def list_collections(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection))
    collections = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "description": c.description
        }
        for c in collections
    ]

@router.post("/{collection_id}/papers")
async def add_paper_to_collection(collection_id: str, request: AddPaperRequest, db: AsyncSession = Depends(get_db)):
    # Insert directly into the association table
    stmt = paper_collection_link.insert().values(paper_id=request.paper_id, collection_id=collection_id)
    try:
        await db.execute(stmt)
        await db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Paper already in collection or invalid IDs")
    return {"status": "success"}

@router.get("/{collection_id}/papers")
async def get_collection_papers(collection_id: str, db: AsyncSession = Depends(get_db)):
    # Eager load the related papers
    result = await db.execute(
        select(Collection)
        .options(selectinload(Collection.papers))
        .where(Collection.id == collection_id)
    )
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
        
    return [{"id": str(p.id), "title": p.title, "is_indexed": p.is_indexed} for p in collection.papers]
