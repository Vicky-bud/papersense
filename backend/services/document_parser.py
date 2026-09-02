import fitz
import docx
from typing import List, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter

class DocumentParser:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
            encoding_name="cl100k_base",
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap
        )

    def parse_pdf(self, file_path: str) -> List[Dict]:
        pages = []
        doc = fitz.open(file_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            if text.strip():
                pages.append({"page_number": page_num + 1, "text": text.strip()})
        return pages

    def parse_docx(self, file_path: str) -> List[Dict]:
        pages = []
        doc = docx.Document(file_path)
        full_text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        if full_text:
            pages.append({"page_number": 1, "text": full_text})
        return pages

    def parse_txt(self, file_path: str) -> List[Dict]:
        pages = []
        for encoding in ["utf-8", "latin-1"]:
            try:
                with open(file_path, "r", encoding=encoding) as f:
                    text = f.read()
                    if text.strip():
                        pages.append({"page_number": 1, "text": text.strip()})
                break
            except UnicodeDecodeError:
                continue
        return pages

    def chunk_document(self, file_path: str, ext: str, paper_id: str) -> List[Dict]:
        if ext == ".pdf":
            pages = self.parse_pdf(file_path)
        elif ext == ".docx":
            pages = self.parse_docx(file_path)
        elif ext == ".txt":
            pages = self.parse_txt(file_path)
        else:
            raise ValueError(f"Unsupported extension: {ext}")

        chunks = []
        chunk_index = 0
        for page in pages:
            page_chunks = self.splitter.split_text(page["text"])
            for snippet in page_chunks:
                chunks.append({
                    "paper_id": str(paper_id),
                    "chunk_index": chunk_index,
                    "page_number": page["page_number"],
                    "file_type": ext,
                    "text_snippet": snippet
                })
                chunk_index += 1
                
        return chunks
