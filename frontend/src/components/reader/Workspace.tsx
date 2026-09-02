import React, { useState } from 'react';
import PdfViewer from './PdfViewer';
import SynthesisFeed from './SynthesisFeed';
import { useParams } from 'react-router-dom';

export default function Workspace() {
  const { paperId } = useParams<{ paperId: string }>();
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [highlightChunk, setHighlightChunk] = useState<number | null>(null);

  // In a real app we'd fetch the paper URL from the backend using the paperId
  const paperUrl = `http://localhost:8000/uploads/${paperId}/original.pdf`;

  const handleCitationClick = (page: number, chunkIndex: number) => {
    setTargetPage(page);
    setHighlightChunk(chunkIndex);
    // Auto-clear highlight after a few seconds
    setTimeout(() => setHighlightChunk(null), 3000);
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background">
      {/* Left Pane: Document Viewer */}
      <div className="pane-left relative">
        <PdfViewer 
          url={paperUrl} 
          targetPage={targetPage} 
          highlightChunk={highlightChunk} 
        />
      </div>

      {/* Right Pane: Synthesis Feed & Notes */}
      <div className="pane-right">
        <SynthesisFeed 
          paperId={paperId || ''} 
          onCitationClick={handleCitationClick} 
        />
      </div>
    </div>
  );
}
