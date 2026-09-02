import React, { useState } from 'react';
import { askQuestion } from '../../api';
import { Loader2, Search } from 'lucide-react';

interface SynthesisFeedProps {
  paperId: string;
  onCitationClick: (page: number, chunkIndex: number) => void;
}

interface Source {
  page_number: number;
  chunk_index: number;
  text: string;
}

export default function SynthesisFeed({ paperId, onCitationClick }: SynthesisFeedProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setAnswer('');
    setSources([]);
    
    try {
      const res = await askQuestion(paperId, query);
      setAnswer(res.answer);
      setSources(res.sources);
    } catch (err) {
      setAnswer("Failed to retrieve an answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse the citation badges [p. X, §Y] and make them clickable
  const renderTextWithBadges = (text: string) => {
    const badgeRegex = /\[p\.\s*(\d+),\s*§(\d+)\]/g;
    const parts = [];
    let lastIndex = 0;
    
    let match;
    while ((match = badgeRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      
      const page = parseInt(match[1], 10);
      const chunk = parseInt(match[2], 10);
      
      parts.push(
        <span 
          key={`badge-${match.index}`} 
          className="badge mx-1"
          onClick={() => onCitationClick(page, chunk)}
          title="Click to view in document"
        >
          {match[0]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-6 tracking-tight text-zinc-100">Synthesis Feed</h2>
      
      <div className="flex-1 overflow-y-auto pr-4 mb-4 space-y-6">
        {answer && (
          <div className="card p-5 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Generated Synthesis</h3>
            <div className="text-zinc-300 leading-relaxed text-sm">
              {renderTextWithBadges(answer)}
            </div>
            
            {sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-xs font-mono text-zinc-500 mb-2">SOURCES REFERENCED</h4>
                <div className="space-y-2">
                  {sources.map((src, i) => (
                    <div key={i} className="text-xs text-zinc-500 flex gap-2 cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => onCitationClick(src.page_number, src.chunk_index)}>
                      <span className="font-mono text-primary shrink-0">[p. {src.page_number}, §{src.chunk_index}]</span>
                      <span className="line-clamp-1">{src.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleQuery} className="mt-auto relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-zinc-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about this paper..."
          className="w-full bg-zinc-900 border border-border rounded-md py-3 pl-10 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
        />
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="absolute inset-y-1 right-1 px-3 bg-zinc-800 text-xs font-medium text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Ask'}
        </button>
      </form>
    </div>
  );
}
