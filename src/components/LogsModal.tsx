import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, X, RefreshCw, Copy, Check, Trash2, ArrowDown, Play, Pause, Search } from 'lucide-react';

interface LogsModalProps {
  onClose: () => void;
}

export const LogsModal: React.FC<LogsModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || '');
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for live log updates
  useEffect(() => {
    fetchLogs();
    
    let intervalId: any = null;
    if (isAutoRefresh) {
      intervalId = setInterval(() => {
        fetchLogs();
      }, 2500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoRefresh]);

  // Auto-scroll to bottom of logs on new inputs
  useEffect(() => {
    if (consoleEndRef.current && isAutoRefresh) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isAutoRefresh]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logs);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Parse lines to add coloring based on log level
  const logLines = logs.split('\n').filter(line => line.trim() !== '');
  
  const filteredLines = logLines.filter(line => {
    // 1. Level Filter
    if (selectedLevel !== 'ALL' && !line.includes(`[${selectedLevel}]`)) {
      return false;
    }
    // 2. Search Query Filter
    if (searchQuery.trim() !== '' && !line.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getLineStyle = (line: string) => {
    if (line.includes('[ERROR]')) return 'text-rose-400 font-bold bg-rose-500/5 px-1 py-0.5 rounded';
    if (line.includes('[EXCEPTION]')) return 'text-red-500 font-bold bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20';
    if (line.includes('[WARN]')) return 'text-amber-400 bg-amber-500/5 px-1 py-0.5 rounded';
    if (line.includes('[APPLICATION-STARTUP]') || line.includes('[BACKEND-STARTUP]')) return 'text-purple-300 font-bold';
    if (line.includes('[PORT-BINDING]')) return 'text-cyan-400 font-bold';
    if (line.includes('[AUTOMATION-COMMAND]')) return 'text-emerald-400 font-semibold';
    if (line.includes('[AGENT-STARTUP]')) return 'text-indigo-400 font-semibold';
    return 'text-zinc-300';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-[0_24px_64px_rgba(139,92,246,0.15)] relative overflow-hidden bg-zinc-950/95 border border-white/10"
      >
        {/* Dynamic header bar with gradient */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-500" />
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 animate-pulse">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-2">
                MYRAA SYSTEM TERMINAL LOGS
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider">
                  Active
                </span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                Real-time Process Monitor & Diagnostic Stream
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              disabled={isLoading || !logs}
              className="p-2.5 rounded-xl glass hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold"
              title="Copy All Logs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Manual Refresh button */}
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className={`p-2.5 rounded-xl glass hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold ${
                isLoading ? 'animate-spin' : ''
              }`}
              title="Manual Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Auto refresh toggle */}
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold ${
                isAutoRefresh
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-zinc-500/5 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
              title={isAutoRefresh ? 'Pause Auto-scroll' : 'Enable Auto-scroll'}
            >
              {isAutoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isAutoRefresh ? 'Live' : 'Paused'}</span>
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl glass text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3 px-6 py-4 bg-zinc-950/40 border-b border-white/5">
          {/* Search box */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter logs by keyword (e.g. startup, error)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/60 border border-white/5 focus:border-purple-500/40 focus:outline-none text-xs text-zinc-200 placeholder-zinc-500 font-mono transition-all"
            />
          </div>

          {/* Level Filter dropdown options */}
          <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto">
            {['ALL', 'INFO', 'WARN', 'ERROR', 'EXCEPTION'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer uppercase ${
                  selectedLevel === lvl
                    ? 'bg-purple-500/20 text-purple-200 border-purple-500/30 font-bold shadow-md'
                    : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Logs terminal viewport */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-relaxed select-text scrollbar-thin scrollbar-thumb-zinc-800"
        >
          {isLoading && logLines.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-500 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              <span>Fetching diagnostics data...</span>
            </div>
          ) : filteredLines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2 font-mono">
              <span>&gt; No log entries match filter selection.</span>
              <span className="text-[9px] text-zinc-600">Selected Level: {selectedLevel} | Search: "{searchQuery}"</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredLines.map((line, idx) => {
                // Parse timestamp and category dynamically
                const parts = line.match(/^\[(.*?)\]\s+\[(.*?)\]\s+\[(.*?)\]\s+(.*)$/);
                
                if (parts) {
                  const [_, timestamp, level, category, msg] = parts;
                  const cleanTime = timestamp.split('T')[1]?.slice(0, 8) || timestamp;
                  
                  return (
                    <div key={idx} className="flex items-start gap-2 hover:bg-white/5 p-0.5 rounded transition-colors group">
                      <span className="text-[10px] text-zinc-600 select-none">{cleanTime}</span>
                      <span className={`text-[10px] font-bold select-none min-w-[50px] ${
                        level === 'ERROR' || level === 'EXCEPTION' ? 'text-rose-400' :
                        level === 'WARN' ? 'text-amber-400' : 'text-cyan-500'
                      }`}>
                        [{level}]
                      </span>
                      <span className="text-[10px] text-purple-400 font-bold select-none min-w-[130px] border-r border-white/5 pr-2 mr-1">
                        [{category}]
                      </span>
                      <span className={`flex-1 break-all ${getLineStyle(line)}`}>
                        {msg}
                      </span>
                    </div>
                  );
                }

                // Fallback for custom or direct lines
                return (
                  <div key={idx} className={`hover:bg-white/5 p-0.5 rounded transition-colors ${getLineStyle(line)}`}>
                    {line}
                  </div>
                );
              })}
              <div ref={consoleEndRef} />
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="px-6 py-4 border-t border-white/5 bg-zinc-950/60 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-zinc-500 gap-2">
          <div className="flex items-center gap-4">
            <span>Lines Shown: <span className="text-zinc-300 font-bold">{filteredLines.length}</span></span>
            <span>Total Buffer: <span className="text-zinc-300 font-bold">{logLines.length} lines</span></span>
          </div>
          <div>
            <span>Logs stored locally in <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded">./logs/app.log</code></span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LogsModal;
