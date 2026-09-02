from fastapi import FastAPI
from backend.routers import papers, rag, quizzes

app = FastAPI(title="PaperSense API")

app.include_router(papers.router, prefix="/api/v1/papers", tags=["Papers"])
app.include_router(rag.router, prefix="/api/v1/rag", tags=["RAG"])
app.include_router(quizzes.router, prefix="/api/v1/quizzes", tags=["Quizzes"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
