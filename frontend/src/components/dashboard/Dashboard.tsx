import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, FolderOpen, UploadCloud, Trash2, Loader2, Plus, MoreVertical, Check, FolderPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPapers, uploadPaper, deletePaper, getCollections, createCollection, addPaperToCollection, getCollectionPapers } from '../../api';

interface Paper {
  id: string;
  title: string;
  is_indexed: number;
  chunk_count: number;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
}

export default function Dashboard() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Create collection state
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Dropdown state for adding paper to collection
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const colls = await getCollections();
      setCollections(colls);
      
      if (activeCollectionId) {
        const collPapers = await getCollectionPapers(activeCollectionId);
        setPapers(collPapers);
      } else {
        const allPapers = await getPapers();
        setPapers(allPapers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeCollectionId]);

  useEffect(() => {
    const isProcessing = papers.some(p => p.is_indexed === 1);
    if (!isProcessing) return;
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [papers, activeCollectionId]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadPaper(file);
      await fetchDashboardData();
    } catch (err) {
      alert("Failed to upload paper. Please ensure it is a valid format (<50MB).");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (paperId: string) => {
    if (!confirm("Are you sure you want to delete this paper and all its data?")) return;
    try {
      await deletePaper(paperId);
      await fetchDashboardData();
    } catch (err) {
      alert("Failed to delete paper.");
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      await createCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsCreatingCollection(false);
      await fetchDashboardData();
    } catch (err) {
      alert("Failed to create collection.");
    }
  };

  const handleAddPaperToCollection = async (collectionId: string, paperId: string) => {
    try {
      await addPaperToCollection(collectionId, paperId);
      setActiveDropdown(null);
      // Optional toast/notification here
    } catch (err) {
      alert("Paper might already be in this collection.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-200 p-8 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="text-primary" size={24} />
            <h1 className="text-2xl font-semibold tracking-tight text-white">PaperSense</h1>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx,.txt"
          />
          
          <button 
            onClick={handleUploadClick}
            disabled={uploading}
            className="flex items-center gap-2 bg-zinc-800 text-sm font-medium px-4 py-2 rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Collections */}
          <div className="col-span-1 border-r border-border pr-6 lg:min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Collections</h3>
              <button 
                onClick={() => setIsCreatingCollection(true)}
                className="text-zinc-400 hover:text-emerald-400 transition-colors"
                title="New Collection"
              >
                <Plus size={14} />
              </button>
            </div>
            
            <div className="space-y-1">
              <div 
                onClick={() => setActiveCollectionId(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium cursor-pointer transition-colors border ${
                  activeCollectionId === null 
                  ? 'bg-zinc-800/80 text-white border-zinc-700' 
                  : 'text-zinc-400 border-transparent hover:bg-zinc-900'
                }`}
              >
                <BookOpen size={16} className={activeCollectionId === null ? "text-emerald-400" : "text-zinc-500"} />
                All Papers
              </div>
              
              {collections.map(coll => (
                <div 
                  key={coll.id}
                  onClick={() => setActiveCollectionId(coll.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium cursor-pointer transition-colors border ${
                    activeCollectionId === coll.id 
                    ? 'bg-zinc-800/80 text-white border-zinc-700' 
                    : 'text-zinc-400 border-transparent hover:bg-zinc-900'
                  }`}
                >
                  <FolderOpen size={16} className={activeCollectionId === coll.id ? "text-emerald-400" : "text-zinc-500"} />
                  {coll.name}
                </div>
              ))}
              
              {isCreatingCollection && (
                <form onSubmit={handleCreateCollection} className="mt-2 flex items-center gap-2 px-2">
                  <input 
                    type="text" 
                    autoFocus
                    value={newCollectionName}
                    onChange={e => setNewCollectionName(e.target.value)}
                    onBlur={() => { if(!newCollectionName) setIsCreatingCollection(false) }}
                    placeholder="Folder name..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </form>
              )}
            </div>
          </div>

          {/* Library Table */}
          <div className="col-span-1 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">
                {activeCollectionId ? collections.find(c => c.id === activeCollectionId)?.name : 'All Papers'}
              </h2>
              <span className="text-xs font-mono text-zinc-500">{papers.length} DOCUMENTS</span>
            </div>
            
            <div className="card rounded-lg overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
                <thead>
                  <tr className="bg-zinc-900/50 border-b border-border">
                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Document Title</th>
                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 text-sm">Loading library...</td>
                    </tr>
                  ) : papers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 text-sm">
                        No papers found in this view.
                      </td>
                    </tr>
                  ) : (
                    papers.map(paper => (
                      <tr key={paper.id} className="hover:bg-zinc-900/30 transition-colors group relative">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white mb-1 truncate max-w-xs">{paper.title}</div>
                          <div className="text-xs text-zinc-500 font-mono">{paper.id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4">
                          {paper.is_indexed === 2 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Indexed · {paper.chunk_count} Chunks
                            </span>
                          ) : paper.is_indexed === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                              <Loader2 size={12} className="animate-spin" />
                              Processing
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-3 h-full">
                          
                          {/* Add to Collection Dropdown */}
                          <div className="relative">
                            <button 
                              onClick={() => setActiveDropdown(activeDropdown === paper.id ? null : paper.id)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
                              title="Add to Collection"
                            >
                              <FolderPlus size={16} />
                            </button>
                            
                            {activeDropdown === paper.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-10 py-1">
                                <div className="px-3 py-2 border-b border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                  Add to folder
                                </div>
                                {collections.length === 0 ? (
                                  <div className="px-3 py-2 text-xs text-zinc-500 italic">No folders created</div>
                                ) : (
                                  collections.map(c => (
                                    <button 
                                      key={c.id}
                                      onClick={() => handleAddPaperToCollection(c.id, paper.id)}
                                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                                    >
                                      {c.name}
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          
                          <button onClick={() => handleDelete(paper.id)} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete Paper">
                            <Trash2 size={16} />
                          </button>
                          
                          <Link to={`/workspace/${paper.id}`} className="ml-2 bg-white text-zinc-950 px-3 py-1.5 rounded text-sm font-medium hover:bg-zinc-200 transition-colors">
                            Open &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay to close dropdowns when clicking outside */}
      {activeDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setActiveDropdown(null)} />
      )}
    </div>
  );
}
