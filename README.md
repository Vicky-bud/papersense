# PaperSense

PaperSense is an AI-powered research assistant designed to help you quickly synthesize, interrogate, and test your comprehension of dense academic papers. Rather than passively reading, you can chat with the document to extract insights and instantly generate rigorous multiple-choice quizzes to evaluate your understanding.

## Features

- **Document Ingestion**: Upload academic PDFs, which are automatically chunked and indexed into a local vector database.
- **Stateful RAG Chat**: Ask questions about the paper. The AI synthesizes answers using exact excerpts from your upload, streams the response token-by-token, and provides clickable source citations back to the original text.
- **Knowledge Assessment**: Generate 5-question multiple-choice quizzes dynamically created from the paper's contents.
- **Notes Scratchpad**: A simple markdown scratchpad per paper to jot down ideas.

## Stack Overview

- **Frontend**: React + Vite + TailwindCSS + Lucide Icons
- **Backend**: FastAPI (Python)
- **Database**: SQLite (via SQLAlchemy & asyncpg/aiosqlite)
- **Vector Search**: ChromaDB (Local)
- **LLM**: Google Gemini (via `google-generativeai`)

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Google Gemini API Key

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Copy the environment variables template and add your API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```
4. Initialize the database:
   ```bash
   python -m backend.init_db
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Environment Variables
See the `.env.example` file for required environment variables:
- `GEMINI_API_KEY`: Your Google AI Studio API key.

## License
MIT License
