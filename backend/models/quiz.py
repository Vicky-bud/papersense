import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text
from sqlalchemy import JSON
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship

from backend.models.base import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    paper_id = Column(UUID(as_uuid=True), ForeignKey("papers.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    paper = relationship("Paper", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    submissions = relationship("QuizSubmission", back_populates="quiz", cascade="all, delete-orphan")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of strings e.g., ["A", "B", "C", "D"]
    correct_answer_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=True)
    
    # Context tracing metadata
    context_page_number = Column(Integer, nullable=True)
    context_snippet = Column(Text, nullable=True)

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")

class QuizSubmission(Base):
    __tablename__ = "quiz_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False) # e.g., 80.0
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    quiz = relationship("Quiz", back_populates="submissions")
