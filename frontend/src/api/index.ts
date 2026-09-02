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
