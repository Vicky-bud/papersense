import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-zinc-100">
      <FileQuestion size={64} className="text-zinc-700 mb-6" />
      <h1 className="text-4xl font-semibold mb-2">404</h1>
      <p className="text-zinc-400 mb-8 font-mono text-sm">This page could not be found.</p>
      <Link 
        to="/" 
        className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  );
}
