import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any
import google.generativeai as genai

from backend.config import settings
from backend.models.paper import Chunk
from backend.models.quiz import Quiz, QuizQuestion

class QuizGeneratorService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-pro')

    async def generate_quiz(self, db: AsyncSession, paper_id: str) -> Quiz:
        # 1. Fetch chunks from the database
        stmt = select(Chunk).where(Chunk.paper_id == paper_id).order_by(Chunk.page_number, Chunk.id)
        result = await db.execute(stmt)
        chunks = result.scalars().all()

        if not chunks:
            raise ValueError("No text chunks found for this paper.")

        # Construct the context payload (Limit context if necessary, but gemini 1.5 pro handles 1M+ tokens)
        context_blocks = []
        for chunk in chunks:
            context_blocks.append(f"--- Page {chunk.page_number} ---\n{chunk.text_content}")
            
        full_context = "\n\n".join(context_blocks)

        # 2. Define the JSON schema prompt
        prompt = (
            "You are an expert academic evaluator. Based on the provided research paper excerpts, "
            "generate a rigorous multiple-choice quiz testing deep technical comprehension.\n"
            "Generate exactly 5 questions.\n"
            "Return the output STRICTLY as a raw JSON object with the following schema, and absolutely no other text or markdown blocks:\n"
            "{\n"
            '  "title": "A concise title for the quiz",\n'
            '  "questions": [\n'
            "    {\n"
            '      "question_text": "The question",\n'
            '      "options": ["Option A", "Option B", "Option C", "Option D"],\n'
            '      "correct_answer_index": 0, // integer 0-3\n'
            '      "explanation": "Why this answer is correct",\n'
            '      "context_page_number": 1, // the page number where the answer is found\n'
            '      "context_snippet": "A short exact quote from the paper proving the answer"\n'
            "    }\n"
            "  ]\n"
            "}\n\n"
            f"PAPER TEXT:\n{full_context}"
        )

        # 3. Generate content
        response = self.model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        # 4. Parse response and store in DB
        try:
            quiz_data = json.loads(response.text)
        except json.JSONDecodeError:
            raise ValueError("Failed to parse the LLM output as JSON.")

        quiz = Quiz(
            paper_id=paper_id,
            title=quiz_data.get("title", "Generated Quiz")
        )
        db.add(quiz)
        await db.flush() # flush to get quiz.id

        questions = []
        for q_data in quiz_data.get("questions", []):
            question = QuizQuestion(
                quiz_id=quiz.id,
                question_text=q_data["question_text"],
                options=q_data["options"],
                correct_answer_index=q_data["correct_answer_index"],
                explanation=q_data["explanation"],
                context_page_number=q_data.get("context_page_number"),
                context_snippet=q_data.get("context_snippet")
            )
            questions.append(question)
            
        db.add_all(questions)
        await db.commit()
        await db.refresh(quiz)

        return quiz
