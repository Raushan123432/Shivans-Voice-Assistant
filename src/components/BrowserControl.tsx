import React, { useState } from 'react';
import { Globe, Search, Youtube, Mail, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';

export const BrowserControl: React.FC = () => {
  const [url, setUrl] = useState('https://www.google.com');
  const [searchQuery, setSearchQuery] = useState('');

  const quickLinks = [
    { name: 'Google Search', icon: Search, url: 'https://www.google.com', color: 'text-blue-400' },
    { name: 'YouTube Pro', icon: Youtube, url: 'https://www.youtube.com', color: 'text-red-500' },
    { name: 'Gmail Workspace', icon: Mail, url: 'https://mail.google.com', color: 'text-rose-400' },
    { name: 'Tech News', icon: Globe, url: 'https://news.google.com', color: 'text-cyan-400' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery.trim())}`;
    window.open(searchUrl, '_blank');
    setSearchQuery('');
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6 custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-900">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight font-sans text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400 animate-pulse" />
            Browser Control Center
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Execute web searches, navigate URLs, and inspect web activity via JARVIS
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-mono font-bold">
          SECURE BROWSER ENGINE
        </div>
      </div>

      {/* URL / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 backdrop-blur-xl flex flex-col sm:flex-row gap-3 shadow-xl">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search Google e.g., "Search for Python courses" or type website URL...'
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-400 text-white placeholder-slate-500 text-xs font-mono outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
        >
          <span>SEARCH SIR</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <div
              key={link.name}
              onClick={() => window.open(link.url, '_blank')}
              className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-sky-500/20 hover:border-sky-400/50 backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-lg flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${link.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                    {link.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">
                    Direct Voice Web Access
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
            </div>
          );
        })}
      </div>

      {/* Clean Glass Simulated Browser View */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl flex flex-col gap-3 shadow-2xl">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold">https://www.google.com</span>
          </div>
          <span className="text-emerald-400 font-bold text-[10px]">ENCRYPTED SSL</span>
        </div>

        <div className="h-64 rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col items-center justify-center text-center gap-3">
          <Globe className="w-12 h-12 text-sky-400/60 animate-pulse" />
          <p className="text-sm font-bold text-slate-200 font-sans">JARVIS Browser Engine Standby</p>
          <p className="text-xs font-mono text-slate-400 max-w-md">
            Say "Jarvis, search today's weather" or "Jarvis, search Python tutorials" to automatically open web results.
          </p>
        </div>
      </div>

    </div>
  );
};

export default BrowserControl;
