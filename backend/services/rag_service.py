import os
from typing import List, Dict
from google import genai
from google.genai import types
from backend.services.chroma_service import ChromaService
from backend.config import settings

class RagService:
    def __init__(self):
        self.chroma = ChromaService()
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def query_document(self, paper_id: str, query: str, top_k: int = 5, history: List = None):
        import traceback
        import logging
        import json
        logger = logging.getLogger(__name__)
        
        paper_id_str = str(paper_id)
        
        try:
            results = self.chroma.collection.query(
                query_texts=[query],
                n_results=top_k,
                where={"paper_id": paper_id_str}
            )
            
            logger.info(f"Raw query results for paper_id {paper_id_str}: {results}")

            if not results.get("documents") or not results["documents"][0] or len(results["documents"][0]) == 0:
                logger.warning(f"No vector embeddings found for paper_id: {paper_id_str}.")
                yield f"data: {json.dumps({'type': 'error', 'error': 'No vector embeddings found for this paper.'})}\n\n"
                return

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
                "If the answer is not contained in the excerpts, say so.\n\n"
                f"EXCERPTS:\n{context_text}\n\n"
                f"USER QUERY: {query}"
            )

            # Yield sources first
            yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
            
            chat_history = []
            if history:
                for h in history:
                    chat_history.append(types.Content(role="user", parts=[types.Part.from_text(text=h.query)]))
                    chat_history.append(types.Content(role="model", parts=[types.Part.from_text(text=h.answer)]))
                    
            chat = self.client.aio.chats.create(model=settings.GEMINI_MODEL, history=chat_history)
            
            response = await chat.send_message_stream(prompt)
            
            async for chunk in response:
                yield f"data: {json.dumps({'type': 'token', 'content': chunk.text})}\n\n"
                
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            
        except Exception as e:
            logger.error(f"Error querying ChromaDB or Gemini API for paper {paper_id_str}: {e}")
            traceback.print_exc()
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
