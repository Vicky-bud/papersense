import React, { useState, useEffect } from 'react';
import { askQuestion, getChatHistory, saveChatHistory } from '../../api';
import { Loader2, Send, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SynthesisFeedProps {
  paperId: string;
  onCitationClick: (page: number, chunkIndex: number) => void;
}

interface Source {
  page_number: number;
  chunk_index: number;
  text: string;
}

interface HistoryEntry {
  id?: string;
  query: string;
  answer: string;
  sources: Source[];
}

export default function SynthesisFeed({ paperId, onCitationClick }: SynthesisFeedProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    getChatHistory(paperId)
      .then(data => {
        setHistory(data);
      })
      .catch(console.error)
      .finally(() => setInitialLoading(false));
  }, [paperId]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const currentQuery = query;
    setLoading(true);
    setQuery('');
    
    try {
      const res = await askQuestion(paperId, currentQuery);
      
      // Save to database
      try {
        await saveChatHistory(paperId, currentQuery, res.answer, res.sources);
      } catch (err) {
        console.error("Failed to save chat history to DB");
      }
      
      setHistory(prev => [...prev, { query: currentQuery, answer: res.answer, sources: res.sources }]);
    } catch (err) {
      setHistory(prev => [...prev, { query: currentQuery, answer: "Failed to retrieve an answer. Please try again.", sources: [] }]);
    } finally {
      setLoading(false);
    }
  };

  /** Split markdown text around [p. X, §Y] badges, render markdown segments, insert clickable badges */
  const renderAnswerWithCitations = (text: string) => {
    const badgeRegex = /\[p\.\s*(\d+),\s*§(\d+)\]/g;
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = badgeRegex.exec(text)) !== null) {
      // Render markdown for text before the badge
      if (match.index > lastIndex) {
        const mdChunk = text.substring(lastIndex, match.index);
        segments.push(
          <ReactMarkdown key={`md-${lastIndex}`} components={markdownComponents}>
            {mdChunk}
          </ReactMarkdown>
        );
      }

      const page = parseInt(match[1], 10);
      const chunk = parseInt(match[2], 10);
      segments.push(
        <button
          key={`cite-${match.index}`}
          onClick={() => onCitationClick(page, chunk)}
          className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer align-baseline"
          title={`Jump to page ${page}, chunk ${chunk}`}
        >
          <FileText size={9} />
          p.{page} §{chunk}
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    // Render remaining markdown
    if (lastIndex < text.length) {
      segments.push(
        <ReactMarkdown key={`md-${lastIndex}`} components={markdownComponents}>
          {text.substring(lastIndex)}
        </ReactMarkdown>
      );
    }

    return segments.length > 0 ? segments : (
      <ReactMarkdown components={markdownComponents}>{text}</ReactMarkdown>
    );
  };

  /** Custom component overrides to style rendered markdown within the dark theme */
  const markdownComponents = {
    h1: ({ children, ...props }: any) => <h1 className="text-lg font-semibold text-zinc-100 mt-5 mb-2 leading-tight" {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 className="text-base font-semibold text-zinc-100 mt-4 mb-2 leading-tight" {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 className="text-sm font-semibold text-zinc-200 mt-3 mb-1.5 uppercase tracking-wide" {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p className="text-sm text-zinc-300 leading-relaxed mb-3" {...props}>{children}</p>,
    ul: ({ children, ...props }: any) => <ul className="list-disc list-outside pl-5 mb-3 space-y-1" {...props}>{children}</ul>,
    ol: ({ children, ...props }: any) => <ol className="list-decimal list-outside pl-5 mb-3 space-y-1" {...props}>{children}</ol>,
    li: ({ children, ...props }: any) => <li className="text-sm text-zinc-300 leading-relaxed" {...props}>{children}</li>,
    strong: ({ children, ...props }: any) => <strong className="font-semibold text-zinc-100" {...props}>{children}</strong>,
    em: ({ children, ...props }: any) => <em className="italic text-zinc-400" {...props}>{children}</em>,
    hr: (props: any) => <hr className="border-zinc-800 my-4" {...props} />,
    blockquote: ({ children, ...props }: any) => <blockquote className="border-l-2 border-zinc-700 pl-3 my-3 text-sm text-zinc-400 italic" {...props}>{children}</blockquote>,
    code: ({ children, className, ...props }: any) => {
      const isInline = !className;
      return isInline
        ? <code className="bg-zinc-800 text-emerald-400 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
        : <code className={`block bg-zinc-900 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto my-3 ${className || ''}`} {...props}>{children}</code>;
    },
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 tracking-tight text-zinc-100">Synthesis Feed</h2>
      
      <div className="flex-1 overflow-y-auto pr-2 mb-4 space-y-5">
        {history.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <FileText size={32} className="text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500">Ask a question about the paper.<br/>The AI will synthesize an answer from relevant sections.</p>
          </div>
        )}

        {history.map((entry, i) => (
          <div key={i} className="space-y-3">
            {/* User query bubble */}
            <div className="flex justify-end">
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-sm text-zinc-200">{entry.query}</p>
              </div>
            </div>
            
            {/* AI answer card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl rounded-bl-sm p-5">
              <div className="prose-sm">
                {renderAnswerWithCitations(entry.answer)}
              </div>
              
              {entry.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Referenced Sources</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.sources.map((src, j) => (
                      <button
                        key={j}
                        onClick={() => onCitationClick(src.page_number, src.chunk_index)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50 hover:text-zinc-200 hover:border-zinc-600 transition-colors cursor-pointer"
                        title={src.text.substring(0, 100)}
                      >
                        <FileText size={9} />
                        p.{src.page_number} §{src.chunk_index}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-sm text-zinc-200">{query || '...'}</p>
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl rounded-bl-sm p-5 flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-zinc-500" />
              <span className="text-sm text-zinc-500">Synthesizing from paper context…</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleQuery} className="mt-auto relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about this paper…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all"
        />
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="absolute inset-y-1.5 right-1.5 px-3 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-30 transition-colors flex items-center justify-center"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </form>
    </div>
  );
}
