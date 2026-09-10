from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Any
import uuid

from backend.database import get_db
from backend.models.chat import ChatHistory

router = APIRouter()

class ChatSaveRequest(BaseModel):
    query: str
    answer: str
    sources: List[Any]

class ChatHistoryResponse(BaseModel):
    id: str
    query: str
    answer: str
    sources: List[Any]
    created_at: str

@router.post("/{paper_id}")
async def save_chat_history(paper_id: str, request: ChatSaveRequest, db: AsyncSession = Depends(get_db)):
    try:
        paper_uuid = uuid.UUID(paper_id)
        chat = ChatHistory(
            paper_id=paper_uuid,
            query=request.query,
            answer=request.answer,
            sources_json=request.sources
        )
        db.add(chat)
        await db.commit()
        await db.refresh(chat)
        return {"status": "success", "id": str(chat.id)}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid paper ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{paper_id}", response_model=List[ChatHistoryResponse])
async def get_chat_history(paper_id: str, db: AsyncSession = Depends(get_db)):
    try:
        paper_uuid = uuid.UUID(paper_id)
        stmt = select(ChatHistory).where(ChatHistory.paper_id == paper_uuid).order_by(ChatHistory.created_at)
        result = await db.execute(stmt)
        history = result.scalars().all()
        
        return [
            {
                "id": str(h.id),
                "query": h.query,
                "answer": h.answer,
                "sources": h.sources_json,
                "created_at": h.created_at.isoformat()
            }
            for h in history
        ]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid paper ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
