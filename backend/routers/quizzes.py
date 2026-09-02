from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import uuid

from backend.database import get_db
from backend.services.quiz_generator import QuizGeneratorService
from backend.models.quiz import Quiz, QuizQuestion, QuizSubmission

router = APIRouter()

class QuizGenerationRequest(BaseModel):
    paper_id: str

class QuizQuestionResponse(BaseModel):
    id: str
    question_text: str
    options: List[str]
    # For testing/displaying we might omit the correct answer depending on the UI state,
    # but for a simple API, returning everything is fine if the frontend manages state.
    correct_answer_index: int
    explanation: str
    context_page_number: Optional[int]
    context_snippet: Optional[str]

class QuizResponse(BaseModel):
    id: str
    paper_id: str
    title: str
    questions: List[QuizQuestionResponse]

class QuizSubmissionRequest(BaseModel):
    answers: dict[str, int] # question_id -> selected_option_index

class QuizSubmissionResponse(BaseModel):
    submission_id: str
    score: float
    correct_answers: int
    total_questions: int

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(request: QuizGenerationRequest, db: AsyncSession = Depends(get_db)):
    try:
        service = QuizGeneratorService()
        quiz = await service.generate_quiz(db, request.paper_id)
        
        # Load questions explicitly if lazy-loading fails in async mode
        stmt = select(QuizQuestion).where(QuizQuestion.quiz_id == quiz.id)
        result = await db.execute(stmt)
        questions = result.scalars().all()
        
        return {
            "id": str(quiz.id),
            "paper_id": str(quiz.paper_id),
            "title": quiz.title,
            "questions": [
                {
                    "id": str(q.id),
                    "question_text": q.question_text,
                    "options": q.options,
                    "correct_answer_index": q.correct_answer_index,
                    "explanation": q.explanation,
                    "context_page_number": q.context_page_number,
                    "context_snippet": q.context_snippet
                }
                for q in questions
            ]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate quiz: " + str(e))

@router.post("/{quiz_id}/submit", response_model=QuizSubmissionResponse)
async def submit_quiz(quiz_id: str, request: QuizSubmissionRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id)
    result = await db.execute(stmt)
    questions = result.scalars().all()
    
    if not questions:
        raise HTTPException(status_code=404, detail="Quiz not found.")
        
    total_questions = len(questions)
    correct_answers = 0
    
    for q in questions:
        selected = request.answers.get(str(q.id))
        if selected is not None and selected == q.correct_answer_index:
            correct_answers += 1
            
    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0.0
    
    submission = QuizSubmission(
        quiz_id=quiz_id,
        score=score,
        total_questions=total_questions,
        correct_answers=correct_answers
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    
    return {
        "submission_id": str(submission.id),
        "score": submission.score,
        "correct_answers": submission.correct_answers,
        "total_questions": submission.total_questions
    }
