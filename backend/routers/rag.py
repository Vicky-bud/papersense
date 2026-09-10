from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.services.rag_service import RagService
from backend.database import get_db
from backend.models.chat import ChatHistory

router = APIRouter()

class QueryRequest(BaseModel):
    paper_id: str
    query: str
    top_k: int = 5

@router.post("/query")
async def query_paper(request: QueryRequest, db: AsyncSession = Depends(get_db)):
    try:
        paper_uuid = uuid.UUID(request.paper_id)
        stmt = select(ChatHistory).where(ChatHistory.paper_id == paper_uuid).order_by(ChatHistory.created_at)
        result = await db.execute(stmt)
        history = result.scalars().all()
        
        rag = RagService()
        return StreamingResponse(rag.query_document(request.paper_id, request.query, request.top_k, history), media_type="text/event-stream")
    except Exception as e:
        import traceback
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"RAG Endpoint Error for {request.paper_id}: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
