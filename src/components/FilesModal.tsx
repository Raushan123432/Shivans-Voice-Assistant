import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Folder, X, FileText, Image, Code, Search, Plus, Trash2, Download } from 'lucide-react';

interface FilesModalProps {
  onClose: () => void;
}

export const FilesModal: React.FC<FilesModalProps> = ({ onClose }) => {
  const [search, setSearch] = useState('');
  const [files, setFiles] = useState([
    { name: 'ZoyaSystemConfig.json', type: 'code', size: '24 KB', date: '2026-08-05' },
    { name: 'NeuralVoiceWeights.bin', type: 'binary', size: '142 MB', date: '2026-08-04' },
    { name: 'DesktopAutomationScript.py', type: 'code', size: '18 KB', date: '2026-08-03' },
    { name: 'CyberAvatarRender.png', type: 'image', size: '4.2 MB', date: '2026-08-02' },
    { name: 'MeetingTranscriptSummary.txt', type: 'doc', size: '12 KB', date: '2026-08-01' }
  ]);

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-3xl bg-zinc-950 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-emerald-500/20 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-sm text-emerald-200 tracking-wider">
              CYBER FILE SYSTEM BROWSER
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search files by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-emerald-500/30 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* File list */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filtered.map((f, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 flex items-center justify-between text-xs font-mono transition-all"
              >
                <div className="flex items-center gap-3">
                  {f.type === 'code' ? (
                    <Code className="w-4 h-4 text-cyan-400" />
                  ) : f.type === 'image' ? (
                    <Image className="w-4 h-4 text-purple-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="text-zinc-200 font-bold">{f.name}</span>
                </div>

                <div className="flex items-center gap-4 text-zinc-500 text-[11px]">
                  <span>{f.size}</span>
                  <span>{f.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
