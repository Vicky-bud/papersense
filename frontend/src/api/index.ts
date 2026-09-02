export const API_BASE = 'http://localhost:8000/api/v1';

export async function askQuestion(paperId: string, query: string) {
  const res = await fetch(`${API_BASE}/rag/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paper_id: paperId, query, top_k: 5 }),
  });
  if (!res.ok) throw new Error('Failed to fetch answer');
  return res.json();
}

export async function generateQuiz(paperId: string) {
  const res = await fetch(`${API_BASE}/quizzes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paper_id: paperId }),
  });
  if (!res.ok) throw new Error('Failed to generate quiz');
  return res.json();
}

export async function submitQuiz(quizId: string, answers: Record<string, number>) {
  const res = await fetch(`${API_BASE}/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error('Failed to submit quiz');
  return res.json();
}

export async function getNote(paperId: string) {
  const res = await fetch(`${API_BASE}/notes/${paperId}`);
  if (!res.ok) throw new Error('Failed to fetch note');
  return res.json();
}

export async function saveNote(paperId: string, content: string) {
  const res = await fetch(`${API_BASE}/notes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paper_id: paperId, content }),
  });
  if (!res.ok) throw new Error('Failed to save note');
  return res.json();
}

export async function getPapers() {
  const res = await fetch(`${API_BASE}/papers/`);
  if (!res.ok) throw new Error('Failed to fetch papers');
  return res.json();
}

export async function deletePaper(paperId: string) {
  const res = await fetch(`${API_BASE}/papers/${paperId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete paper');
  return res.json();
}

export async function uploadPaper(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/papers/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload paper');
  return res.json();
}

// --- Collections API ---
export async function getCollections() {
  const res = await fetch(`${API_BASE}/collections/`);
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
}

export async function createCollection(name: string) {
  const res = await fetch(`${API_BASE}/collections/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create collection');
  return res.json();
}

export async function addPaperToCollection(collectionId: string, paperId: string) {
  const res = await fetch(`${API_BASE}/collections/${collectionId}/papers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paper_id: paperId }),
  });
  if (!res.ok) throw new Error('Failed to add paper to collection');
  return res.json();
}

export async function getCollectionPapers(collectionId: string) {
  const res = await fetch(`${API_BASE}/collections/${collectionId}/papers`);
  if (!res.ok) throw new Error('Failed to fetch collection papers');
  return res.json();
}

// --- Chat History API ---
export async function getChatHistory(paperId: string) {
  const res = await fetch(`${API_BASE}/chat/${paperId}`);
  if (!res.ok) throw new Error('Failed to fetch chat history');
  return res.json();
}

export async function saveChatHistory(paperId: string, query: string, answer: string, sources: any[]) {
  const res = await fetch(`${API_BASE}/chat/${paperId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, answer, sources }),
  });
  if (!res.ok) throw new Error('Failed to save chat history');
  return res.json();
}
