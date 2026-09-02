import chromadb
from typing import List, Dict
import uuid
import os
from backend.config import settings

class ChromaService:
    def __init__(self):
        os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
        self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIRECTORY)
        self.collection = self.client.get_or_create_collection(name="papers_chunks")

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
