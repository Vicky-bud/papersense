from backend.models.base import Base
from backend.models.paper import Paper, Chunk
from backend.models.collection import Collection, paper_collection_link
from backend.models.quiz import Quiz, QuizQuestion, QuizSubmission
from backend.models.note import Note
from backend.models.chat import ChatHistory

__all__ = [
    "Base",
    "Paper",
    "Chunk",
    "Collection",
    "paper_collection_link",
    "Quiz",
    "QuizQuestion",
    "QuizSubmission",
    "Note",
    "ChatHistory"
]
