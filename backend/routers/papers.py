from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import shutil
import os
import uuid
from pathlib import Path

from backend.database import get_db, AsyncSessionLocal
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
    pdf_url: str

@router.get("/", response_model=list[PaperResponse])
async def get_papers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Paper).order_by(Paper.id.desc()))
    papers = result.scalars().all()
    return [
        {
            "id": str(p.id),
            "title": p.title,
            "is_indexed": p.is_indexed,
            "chunk_count": p.chunk_count,
            "pdf_url": p.pdf_url
        }
        for p in papers
    ]

@router.delete("/{paper_id}")
async def delete_paper(paper_id: str, db: AsyncSession = Depends(get_db)):
    paper_uuid = uuid.UUID(paper_id)
    result = await db.execute(select(Paper).where(Paper.id == paper_uuid))
    paper = result.scalars().first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    # Delete from ChromaDB
    chroma = ChromaService()
    chroma.delete_paper(paper_id)
    
    # Delete from SQL
    await db.delete(paper)
    await db.commit()
    
    # Delete local files
    paper_dir = UPLOAD_DIR / paper_id
    if paper_dir.exists():
        shutil.rmtree(paper_dir)
        
    return {"message": "Paper deleted successfully"}

def process_paper_background(paper_id: str, file_path: str, ext: str):
    from backend.database import SessionLocal
    with SessionLocal() as db:
        paper_uuid = uuid.UUID(paper_id)
        try:
            paper = db.query(Paper).filter(Paper.id == paper_uuid).first()
            if not paper:
                return

            parser = DocumentParser()
            chunks_data = parser.chunk_document(file_path, ext, paper_id)
            
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
            db.commit()
            
        except Exception as e:
            paper = db.query(Paper).filter(Paper.id == paper_uuid).first()
            if paper:
                paper.is_indexed = 3
                db.commit()


@router.post("/upload", response_model=PaperResponse)
async def upload_paper(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: AsyncSession = Depends(get_db)
):
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
    
    # Offload processing to background task
    background_tasks.add_task(process_paper_background, str(paper.id), str(file_path), ext)
        
    return {
        "id": str(paper.id),
        "title": paper.title,
        "is_indexed": paper.is_indexed,
        "chunk_count": paper.chunk_count,
        "pdf_url": paper.pdf_url
    }
