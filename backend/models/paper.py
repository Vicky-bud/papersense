import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, ForeignKey
from sqlalchemy import JSON
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship

from backend.models.base import Base

class Paper(Base):
    __tablename__ = "papers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    authors = Column(String, nullable=True)
    abstract = Column(Text, nullable=True)
    arxiv_id = Column(String, nullable=True, unique=True)
    pdf_url = Column(String, nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Metadata for indexing state
    is_indexed = Column(Integer, default=0) # 0: pending, 1: processing, 2: indexed, 3: failed
    chunk_count = Column(Integer, default=0)

    # Relationships
    chunks = relationship("Chunk", back_populates="paper", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="paper", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="paper", cascade="all, delete-orphan")

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    paper_id = Column(UUID(as_uuid=True), ForeignKey("papers.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    
    # Optional metadata dictionary (for section titles or bounding boxes)
    metadata_ = Column(JSON, nullable=True)
    
    # Relationships
    paper = relationship("Paper", back_populates="chunks")
