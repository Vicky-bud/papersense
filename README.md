# PaperSense

**Understand academic papers faster.**

PaperSense is an AI-powered academic research assistant. Upload PDFs, ask questions, and get precise, mathematically-formatted answers backed by direct citations to the source text. Rather than passively reading, you can interact with your documents to extract insights and generate rigorous multiple-choice quizzes to evaluate your understanding.

## Features

- **Document Ingestion**: Upload academic PDFs. Documents are automatically parsed, chunked, and indexed into a local vector database.
- **Transparent RAG Chat**: Ask questions and get answers synthesized directly from your upload. The AI streams the response token-by-token and provides an expandable "Retrieved Context" panel showing exactly which chunks and page numbers were used, along with similarity distance scores.
- **Mathematical Rendering**: Native parsing and rendering of academic LaTeX mathematical equations in chat responses.
- **Knowledge Assessment**: Generate dynamic 5-question multiple-choice quizzes from the paper's contents.
- **Notes Scratchpad**: A simple markdown scratchpad per paper to jot down ideas.

## Architecture and RAG Pipeline

PaperSense utilizes a Retrieval-Augmented Generation (RAG) pipeline designed for academic accuracy:

1. **PDF Upload**: User uploads a document.
2. **Text Extraction**: PyMuPDF extracts text accurately, preserving academic formatting.
3. **Chunking**: Text is split into overlapping logical chunks.
4. **Embeddings**: Google Gemini Embedding Models convert chunks into dense vector representations.
5. **Vector Storage**: ChromaDB stores and indexes the embeddings locally.
6. **Retrieval**: When a query is made, ChromaDB retrieves the top-k most semantically similar chunks, returning their distance scores.
7. **Synthesis**: Google Gemini (Flash) synthesizes the retrieved context into a coherent, citation-backed answer.

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, React Markdown (with Katex/Math support)
- **Backend**: FastAPI (Python)
- **Database**: SQLite (via SQLAlchemy and aiosqlite) for metadata and chat history
- **Vector Search**: ChromaDB (Local)
- **LLM Engine**: Google Gemini via the `google-genai` SDK

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Google Gemini API Key

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env` and add your Google Gemini API key:
   ```bash
   cp .env.example .env
   ```

4. Initialize the database:
   ```bash
   python -m backend.init_db
   ```

5. Run the FastAPI server:
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

Required variables in your `.env` file:
```env
GEMINI_API_KEY="your_api_key_here"
```

## Screenshots

*(Add screenshots of the Landing Page, Dashboard, and Synthesis Feed here)*

## Live Demo

*(Insert deployment link here when available)*

## API Documentation

When the backend is running, FastAPI provides automatic interactive API documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Limitations

- **Multimodal extraction**: Currently, diagrams and charts within PDFs are not parsed or passed to the LLM.
- **Context Window**: Extremely large papers might retrieve too many chunks, though `top_k` limits this.
- **Local Storage**: ChromaDB and SQLite run locally. Production deployments require migrating to managed databases (e.g., PostgreSQL + pgvector).

## Future Improvements

- Add support for Multi-Paper Synthesis (chatting across a collection of papers).
- Implement OCR for scanned PDFs.
- Add explicit similarity score threshold filtering in the RAG pipeline.
- Support multimodal retrieval (images/charts) using Gemini 1.5 Pro.
