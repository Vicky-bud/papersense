import React, { useEffect, useRef, useState } from 'react';

interface PdfViewerProps {
  url: string;
  targetPage: number | null;
  highlightChunk: number | null;
}

export default function PdfViewer({ url, targetPage, highlightChunk }: PdfViewerProps) {
  // For a student project, an iframe is reliable and handles standard PDF features out of the box.
  // The '#page=X' fragment is natively supported by Chrome/Firefox PDF viewers.
  const [iframeUrl, setIframeUrl] = useState(url);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetPage) {
      setIframeUrl(`${url}#page=${targetPage}`);
    }
  }, [targetPage, url]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {/* 
        The iframe renders the browser's native PDF viewer. 
        Native PDF viewers support the page fragment.
      */}
      <iframe
        src={iframeUrl}
        className={`w-full h-full border-none transition-all duration-300 ${highlightChunk !== null ? 'ring-2 ring-primary ring-inset' : ''}`}
        title="Document Viewer"
      />
      
      {/* Simulated Highlight Overlay for the emerald border effect requested */}
      {highlightChunk !== null && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-pulse">
          <div className="border border-primary bg-primary/5 p-4 rounded text-primary text-xs font-mono shadow-lg backdrop-blur-sm">
            Targeting context from chunk §{highlightChunk} on page {targetPage}
          </div>
        </div>
      )}
    </div>
  );
}
