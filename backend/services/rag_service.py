import os
from typing import List, Dict
import google.generativeai as genai
from backend.services.chroma_service import ChromaService
from backend.config import settings

class RagService:
    def __init__(self):
        self.chroma = ChromaService()
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-pro')

    async def query_document(self, paper_id: str, query: str, top_k: int = 5) -> Dict:
        results = self.chroma.collection.query(
            query_texts=[query],
            n_results=top_k,
            where={"paper_id": paper_id}
        )

        if not results["documents"] or not results["documents"][0]:
            return {"answer": "No relevant context found in this document.", "sources": []}

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
        
        sources = []
        context_blocks = []
        
        for idx, (doc, meta) in enumerate(zip(documents, metadatas)):
            page_number = meta.get("page_number", 0)
            chunk_index = meta.get("chunk_index", 0)
            sources.append({
                "page_number": page_number,
                "text": doc,
                "chunk_index": chunk_index
            })
            context_blocks.append(f"--- Chunk {chunk_index} (Page {page_number}) ---\n{doc}")
            
        context_text = "\n\n".join(context_blocks)
        
        prompt = (
            "You are a helpful academic research assistant. Use the provided excerpts from a paper to answer the user's query.\n"
            "If the answer is not contained in the excerpts, say so.\n"
            "CRITICAL INSTRUCTION: When you reference information from the excerpts, you MUST append a citation badge at the end of the sentence formatted exactly as: [p. X, §Y] where X is the Page number from the excerpt metadata and Y is the Chunk number.\n\n"
            f"EXCERPTS:\n{context_text}\n\n"
            f"USER QUERY: {query}"
        )
        
        response = self.model.generate_content(prompt)
        
        return {
            "answer": response.text,
            "sources": sources
        }
