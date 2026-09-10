from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from backend.routers import papers, rag, quizzes, collections, notes, chat

from backend.config import settings

app = FastAPI(title="PaperSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(papers.router, prefix="/api/v1/papers", tags=["Papers"])
app.include_router(rag.router, prefix="/api/v1/rag", tags=["RAG"])
app.include_router(quizzes.router, prefix="/api/v1/quizzes", tags=["Quizzes"])
app.include_router(collections.router, prefix="/api/v1/collections", tags=["Collections"])
app.include_router(notes.router, prefix="/api/v1/notes", tags=["Notes"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
