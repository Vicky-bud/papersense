import React, { useState } from 'react';
import PdfViewer from './PdfViewer';
import SynthesisFeed from './SynthesisFeed';
import NotesScratchpad from './NotesScratchpad';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Workspace() {
  const { paperId } = useParams<{ paperId: string }>();
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [highlightChunk, setHighlightChunk] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'synthesis' | 'notes'>('synthesis');

  const paperUrl = `http://localhost:8000/uploads/${paperId}/original.pdf`;

  const handleCitationClick = (page: number, chunkIndex: number) => {
    setTargetPage(page);
    setHighlightChunk(chunkIndex);
    setTimeout(() => setHighlightChunk(null), 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen overflow-hidden bg-background">
      <div className="pane-left relative">
        <PdfViewer url={paperUrl} targetPage={targetPage} highlightChunk={highlightChunk} />
      </div>

      <div className="pane-right flex flex-col">
        {/* Workspace Toolbar */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex gap-6 items-center">
            <Link 
              to="/"
              className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-white transition-colors border-r border-zinc-800 pr-6"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>
            
            <div className="flex gap-4">
              <button 
              onClick={() => setActiveTab('synthesis')}
              className={`text-sm font-medium transition-colors ${activeTab === 'synthesis' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Synthesis Q&A
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`text-sm font-medium transition-colors ${activeTab === 'notes' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Scratchpad
            </button>
            </div>
          </div>
          
          <Link to={`/quiz/${paperId}`} className="text-xs font-mono bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded hover:bg-primary/20 transition-colors">
            Generate Quiz
          </Link>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'synthesis' ? (
            <SynthesisFeed paperId={paperId || ''} onCitationClick={handleCitationClick} />
          ) : (
            <NotesScratchpad paperId={paperId || ''} />
          )}
        </div>
      </div>
    </div>
  );
}
