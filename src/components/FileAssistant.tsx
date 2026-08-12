import React, { useState } from 'react';
import { FileText, Folder, Search, ExternalLink, Download, FileCode, FileSpreadsheet, HardDrive, Filter } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'PDF' | 'Folder' | 'Document' | 'Code' | 'Spreadsheet';
  size: string;
  modified: string;
  location: string;
}

export const FileAssistant: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const files: FileItem[] = [
    { id: '1', name: 'Roushan_Kumar_Resume_2026.pdf', type: 'PDF', size: '2.4 MB', modified: 'Today at 02:15 PM', location: 'C:/Users/Roushan/Documents/' },
    { id: '2', name: 'Downloads', type: 'Folder', size: '14.2 GB', modified: 'Today at 01:00 PM', location: 'C:/Users/Roushan/' },
    { id: '3', name: 'SHIVANSH_System_Architecture.docx', type: 'Document', size: '1.8 MB', modified: 'Yesterday at 05:40 PM', location: 'C:/Users/Roushan/Desktop/' },
    { id: '4', name: 'App.tsx', type: 'Code', size: '36 KB', modified: '10 mins ago', location: 'C:/Users/Roushan/Projects/shivansh-os/src/' },
    { id: '5', name: 'Project_Budget_Q3_2026.xlsx', type: 'Spreadsheet', size: '520 KB', modified: 'Aug 10, 2026', location: 'C:/Users/Roushan/Documents/Finance/' },
  ];

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'ALL' || f.type.toUpperCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'PDF': return <FileText className="w-5 h-5 text-rose-400" />;
      case 'Folder': return <Folder className="w-5 h-5 text-amber-400" />;
      case 'Document': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'Code': return <FileCode className="w-5 h-5 text-cyan-400" />;
      case 'Spreadsheet': return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6 custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-900">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight font-sans text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-emerald-400 animate-pulse" />
            Smart File Assistant
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Locate, search, and manage system files using natural voice queries
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
          STORAGE SEARCH READY
        </div>
      </div>

      {/* Search Bar & Filter Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Voice command search e.g., "Find my resume" or "Show PDF files"...'
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 focus:border-emerald-400 text-white placeholder-slate-500 text-xs font-mono outline-none shadow-lg"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PDF', 'FOLDER', 'DOCUMENT', 'CODE', 'SPREADSHEET'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                filterType === cat
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* File Cards List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-400 font-mono text-xs">
            No matching files found. Try saying "Shivansh, find my Downloads folder".
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-emerald-500/20 hover:border-emerald-400/50 backdrop-blur-xl transition-all duration-300 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                  {getFileIcon(file.type)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    {file.name}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {file.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end text-xs font-mono">
                <div className="flex flex-col items-end text-slate-400 text-[11px]">
                  <span className="text-emerald-400 font-bold">{file.size}</span>
                  <span className="text-[10px]">{file.modified}</span>
                </div>

                <button
                  onClick={() => alert(`Opening file: ${file.name}`)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 text-emerald-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>OPEN FILE</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default FileAssistant;
