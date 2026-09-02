from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.database import get_db
from backend.models.note import Note

router = APIRouter()

class NoteSaveRequest(BaseModel):
    paper_id: str
    content: str

class NoteResponse(BaseModel):
    id: str
    paper_id: str
    content: str

@router.get("/{paper_id}", response_model=NoteResponse)
async def get_note(paper_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).where(Note.paper_id == paper_id))
    note = result.scalar_one_or_none()
    
    if not note:
        # Return an empty note placeholder so frontend can just bind to it
        return {"id": "", "paper_id": paper_id, "content": ""}
        
    return {"id": str(note.id), "paper_id": str(note.paper_id), "content": note.content}

@router.post("/", response_model=NoteResponse)
async def save_note(request: NoteSaveRequest, db: AsyncSession = Depends(get_db)):
    # Upsert logic for simple debounce
    result = await db.execute(select(Note).where(Note.paper_id == request.paper_id))
    note = result.scalar_one_or_none()
    
    if note:
        note.content = request.content
    else:
        note = Note(paper_id=request.paper_id, content=request.content)
        db.add(note)
        
    await db.commit()
    await db.refresh(note)
    
    return {"id": str(note.id), "paper_id": str(note.paper_id), "content": note.content}
