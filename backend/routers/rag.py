from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from backend.services.rag_service import RagService

router = APIRouter()

class QueryRequest(BaseModel):
    paper_id: str
    query: str
    top_k: int = 5

class SourceChunk(BaseModel):
    page_number: int
    text: str
    chunk_index: int

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]

@router.post("/query", response_model=QueryResponse)
async def query_paper(request: QueryRequest):
    try:
        rag = RagService()
        response = await rag.query_document(request.paper_id, request.query, request.top_k)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
