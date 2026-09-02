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
