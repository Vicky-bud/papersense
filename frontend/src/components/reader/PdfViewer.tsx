import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the worker to use the unpkg CDN for the correct version of pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  targetPage: number | null;
  highlightChunk: number | null;
}

export default function PdfViewer({ url, targetPage, highlightChunk }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  useEffect(() => {
    if (targetPage) {
      setCurrentPage(targetPage);
    }
  }, [targetPage]);

  useEffect(() => {
    // Basic resize observer to make PDF responsive
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    // Initial delay to ensure layout is calculated
    setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="w-full h-full relative overflow-y-auto bg-[#09090B] flex flex-col items-center py-8" ref={containerRef}>
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col items-center"
        loading={
          <div className="text-zinc-500 font-mono text-sm mt-20">Loading document securely...</div>
        }
      >
        <div className={`transition-all duration-300 ${highlightChunk !== null ? 'ring-2 ring-primary ring-inset' : ''}`}>
          <Page 
            pageNumber={currentPage} 
            width={containerWidth * 0.9} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </div>
      </Document>
      
      {numPages && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur border border-zinc-700 px-4 py-2 rounded-full flex items-center gap-4 text-xs font-mono z-50">
          <button 
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
          >
            Prev
          </button>
          <span className="text-zinc-300">
            {currentPage} / {numPages}
          </span>
          <button 
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
            className="text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* Simulated Highlight Overlay */}
      {highlightChunk !== null && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-pulse z-40">
          <div className="border border-primary bg-primary/5 p-4 rounded text-primary text-xs font-mono shadow-lg backdrop-blur-sm">
            Targeting context from chunk §{highlightChunk} on page {targetPage}
          </div>
        </div>
      )}
    </div>
  );
}
