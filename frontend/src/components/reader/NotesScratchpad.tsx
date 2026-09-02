import React, { useState, useEffect } from 'react';
import { getNote, saveNote } from '../../api';

export default function NotesScratchpad({ paperId }: { paperId: string }) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Saved');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    getNote(paperId).then(note => {
      setContent(note.content);
      setIsInitialLoad(false);
    }).catch(() => setStatus('Failed to load'));
  }, [paperId]);

  // Debounced auto-save
  useEffect(() => {
    if (isInitialLoad) return;
    
    setStatus('Saving...');
    const timer = setTimeout(() => {
      saveNote(paperId, content).then(() => {
        setStatus('Saved');
      }).catch(() => setStatus('Error saving'));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [content, paperId, isInitialLoad]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Markdown Notes</h2>
        <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800">
          {status}
        </span>
      </div>
      
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        className="flex-1 w-full bg-zinc-900/50 border border-border rounded-lg p-5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none font-mono leading-relaxed"
        placeholder="# My Research Notes&#10;&#10;Start typing here... (Auto-saves to database)"
      />
    </div>
  );
}
