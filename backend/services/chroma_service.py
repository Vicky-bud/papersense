import chromadb
from typing import List, Dict
import uuid
import os
import google.generativeai as genai
from backend.config import settings

class GeminiEmbeddingFunction(chromadb.EmbeddingFunction):
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
    
    def __call__(self, input: chromadb.Documents) -> chromadb.Embeddings:
        response = genai.embed_content(
            model="models/gemini-embedding-2",
            content=input,
            task_type="retrieval_document"
        )
        return response['embedding']

class ChromaService:
    def __init__(self):
        os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
        self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIRECTORY)
        self.embedding_fn = GeminiEmbeddingFunction()
        self.collection = self.client.get_or_create_collection(
            name="papers_chunks_gemini_v3",
            embedding_function=self.embedding_fn
        )

    def index_chunks(self, chunks: List[Dict]):
        if not chunks:
            return
            
        ids = []
        documents = []
        metadatas = []
        
        for chunk in chunks:
            chunk_id = str(uuid.uuid4())
            ids.append(chunk_id)
            documents.append(chunk["text_snippet"])
            metadatas.append({
                "paper_id": chunk["paper_id"],
                "chunk_index": chunk["chunk_index"],
                "page_number": chunk["page_number"],
                "file_type": chunk["file_type"]
            })
            
        self.collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )

    def delete_paper(self, paper_id: str):
        self.collection.delete(where={"paper_id": paper_id})
