import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Database, Bot, ArrowRight, ArrowDown, BookOpen } from 'lucide-react';
import { uploadPaper } from '../../api';

export default function LandingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadPaper(file);
      // After upload, redirect directly to the workspace for the new paper
      navigate(`/workspace/${result.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to upload document. See console for details.');
      setIsUploading(false);
    }
    
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-300 flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold tracking-tight text-lg">
            <BookOpen size={20} className="text-emerald-500" />
            PaperSense
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 lg:py-32 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-zinc-400 text-xs font-mono mb-4 uppercase tracking-widest shadow-sm">
            AI Research Assistant
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white text-balance leading-tight">
            Understand academic papers faster.
          </h1>
          
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto text-balance">
            Upload PDFs, ask questions, and get precise answers backed by direct citations to the source text.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              disabled={isUploading}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-50"
            >
              <Upload size={18} />
              {isUploading ? 'Processing Document...' : 'Upload PDF'}
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="bg-[#0F0F11] border-t border-zinc-800/50 py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">How PaperSense Works</h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              A transparent Retrieval-Augmented Generation (RAG) pipeline designed for academic accuracy.
            </p>
          </div>

          {/* Desktop Horizontal Flow */}
          <div className="hidden lg:flex items-center justify-between gap-4 max-w-4xl mx-auto">
            <FlowItem icon={<FileText />} title="PDF" subtitle="Upload" />
            <ArrowRight size={20} className="text-zinc-600 shrink-0" />
            <FlowItem icon={<FileText className="opacity-50" />} title="Text Extraction" subtitle="PyMuPDF" />
            <ArrowRight size={20} className="text-zinc-600 shrink-0" />
            <FlowItem icon={<Database />} title="Embeddings" subtitle="ChromaDB" />
            <ArrowRight size={20} className="text-zinc-600 shrink-0" />
            <FlowItem icon={<Bot />} title="Gemini" subtitle="LLM Synthesis" />
            <ArrowRight size={20} className="text-zinc-600 shrink-0" />
            <FlowItem icon={<FileText />} title="Answers" subtitle="With Citations" highlight />
          </div>

          {/* Mobile Vertical Flow */}
          <div className="flex flex-col lg:hidden items-center gap-4 max-w-xs mx-auto">
            <FlowItem icon={<FileText />} title="PDF" subtitle="Upload" className="w-full" />
            <ArrowDown size={20} className="text-zinc-600" />
            <FlowItem icon={<FileText className="opacity-50" />} title="Text Extraction" subtitle="PyMuPDF" className="w-full" />
            <ArrowDown size={20} className="text-zinc-600" />
            <FlowItem icon={<Database />} title="Embeddings" subtitle="ChromaDB" className="w-full" />
            <ArrowDown size={20} className="text-zinc-600" />
            <FlowItem icon={<Bot />} title="Gemini" subtitle="LLM Synthesis" className="w-full" />
            <ArrowDown size={20} className="text-zinc-600" />
            <FlowItem icon={<FileText />} title="Answers" subtitle="With Citations" highlight className="w-full" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 text-center text-zinc-500 text-sm">
        <div className="max-w-5xl mx-auto px-6">
          <p>Built with FastAPI, React, ChromaDB, and Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
}

function FlowItem({ icon, title, subtitle, highlight = false, className = '' }: { icon: React.ReactNode, title: string, subtitle: string, highlight?: boolean, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${highlight ? 'bg-emerald-900/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-300'} ${className} w-32 shrink-0 text-center`}>
      <div className={`mb-3 p-3 rounded-full ${highlight ? 'bg-emerald-500/10' : 'bg-zinc-800/50'}`}>
        {icon}
      </div>
      <div className={`font-medium text-sm ${highlight ? 'text-emerald-300' : 'text-zinc-200'}`}>{title}</div>
      <div className="text-[10px] uppercase tracking-widest opacity-60 mt-1 font-mono">{subtitle}</div>
    </div>
  );
}
