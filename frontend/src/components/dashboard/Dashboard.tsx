import React from 'react';
import { BookOpen, FolderOpen, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-zinc-200 p-8 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="text-primary" size={24} />
            <h1 className="text-2xl font-semibold tracking-tight text-white">PaperSense</h1>
          </div>
          <button className="flex items-center gap-2 bg-zinc-800 text-sm font-medium px-4 py-2 rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700">
            <UploadCloud size={16} />
            Upload Document
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Collections */}
          <div className="col-span-1 border-r border-border pr-6 min-h-[500px]">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Collections</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded text-sm text-zinc-300 font-medium cursor-pointer border border-zinc-700/50">
                <FolderOpen size={16} className="text-zinc-400" />
                All Papers
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded text-sm text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900 cursor-pointer transition-colors">
                <FolderOpen size={16} className="text-zinc-500" />
                Transformer Architectures
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded text-sm text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900 cursor-pointer transition-colors">
                <FolderOpen size={16} className="text-zinc-500" />
                NLP Baselines
              </div>
            </div>
          </div>

          {/* Library Table */}
          <div className="col-span-3">
            <div className="card rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/50 border-b border-border">
                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Document Title</th>
                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white mb-1">Attention Is All You Need</div>
                      <div className="text-xs text-zinc-500 font-mono">Added today</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Indexed · 32 Chunks
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to="/workspace/dummy-uuid" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                        Open Workspace &rarr;
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
