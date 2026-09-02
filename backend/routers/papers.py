from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import shutil
from pathlib import Path

from backend.database import get_db
from backend.models.paper import Paper, Chunk
from backend.services.document_parser import DocumentParser
from backend.services.chroma_service import ChromaService

router = APIRouter()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

class PaperResponse(BaseModel):
    id: str
    title: str
    is_indexed: int
    chunk_count: int

@router.post("/upload", response_model=PaperResponse)
async def upload_paper(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=422, detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
        
    file.file.seek(0, 2)
    file_size = file.file.tell()
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")
    file.file.seek(0)
    
    paper = Paper(
        title=file.filename,
        pdf_url="",
        is_indexed=1
    )
    db.add(paper)
    await db.commit()
    await db.refresh(paper)
    
    paper_dir = UPLOAD_DIR / str(paper.id)
    paper_dir.mkdir(parents=True, exist_ok=True)
    file_path = paper_dir / f"original{ext}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save file.")
        
    paper.pdf_url = str(file_path)
    await db.commit()
    
    try:
        parser = DocumentParser()
        chunks_data = parser.chunk_document(str(file_path), ext, str(paper.id))
        
        db_chunks = [
            Chunk(
                paper_id=paper.id,
                page_number=c["page_number"],
                text_content=c["text_snippet"],
                metadata_=c
            )
            for c in chunks_data
        ]
        db.add_all(db_chunks)
        
        chroma = ChromaService()
        chroma.index_chunks(chunks_data)
        
        paper.is_indexed = 2
        paper.chunk_count = len(chunks_data)
        await db.commit()
        await db.refresh(paper)
        
    except Exception as e:
        paper.is_indexed = 3
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
        
    return {
        "id": str(paper.id),
        "title": paper.title,
        "is_indexed": paper.is_indexed,
        "chunk_count": paper.chunk_count
    }
