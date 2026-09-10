import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy import JSON
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship

from backend.models.base import Base

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    paper_id = Column(UUID(as_uuid=True), ForeignKey("papers.id", ondelete="CASCADE"), nullable=False)
    query = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources_json = Column(JSON, nullable=False) # Store the array of source dicts
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    paper = relationship("Paper", back_populates="chat_history")
