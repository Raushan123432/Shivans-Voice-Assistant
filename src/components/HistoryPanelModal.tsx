import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, X, Trash2, Search, Copy, Check, MessageSquare, ExternalLink, Calendar } from 'lucide-react';
import { ChatMessage } from '../types';

interface HistoryPanelModalProps {
  onClose: () => void;
  chatMessages: ChatMessage[];
  onClearHistory: () => void;
}

export const HistoryPanelModal: React.FC<HistoryPanelModalProps> = ({
  onClose,
  chatMessages,
  onClearHistory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredMessages = chatMessages.filter((msg) => {
    if (!searchQuery.trim()) return true;
    return msg.text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const getCleanTime = (timestamp?: string | number) => {
    if (!timestamp) return 'Just Now';
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col shadow-[0_24px_64px_rgba(139,92,246,0.15)] relative overflow-hidden bg-zinc-950/95 border border-white/10"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-400 via-indigo-500 to-cyan-500" />
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-white/5 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 animate-pulse">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-2">
                CONVERSATION DATABASE LOGS
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-sans uppercase font-bold">
                  IndexedDB
                </span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                Archived message history stream
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {chatMessages.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Wipe out IndexedDB past transcripts permanently?')) {
                    onClearHistory();
                  }
                }}
                className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold"
                title="Wipe database history"
              >
                <Trash2 className="w-4 h-4" />
                <span>Wipe Database</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl glass text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-4 bg-zinc-950/40 border-b border-white/5 flex gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search conversations by keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/60 border border-white/5 focus:border-purple-500/40 focus:outline-none text-xs text-zinc-200 placeholder-zinc-500 font-mono transition-all"
            />
          </div>
        </div>

        {/* List of Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-1.5 font-mono">
              <MessageSquare className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
              <span>&gt; No recorded transcripts found.</span>
              <span className="text-[10px] text-zinc-600">Start talking to the assistant to compile your database transcripts.</span>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isUser = msg.isUser;
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col gap-1.5 max-w-[85%] ${
                    isUser ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span className="font-bold uppercase tracking-wider text-zinc-400">
                      {isUser ? 'User Statement' : 'Shivansh Response'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {getCleanTime(msg.timestamp)}
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl text-xs leading-relaxed group relative border transition-all ${
                    isUser 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/20 text-cyan-100 rounded-tr-none'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-200 rounded-tl-none'
                  }`}>
                    <p className="font-sans whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Inline copy button */}
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 hover:bg-black text-zinc-400 hover:text-white transition-all cursor-pointer border border-white/5"
                      title="Copy message text"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer database stats */}
        <div className="px-6 py-4 border-t border-white/5 bg-zinc-950/60 flex justify-between items-center text-[10px] font-mono text-zinc-500 shrink-0">
          <span>Indexed Total: <strong className="text-zinc-300">{chatMessages.length} elements</strong></span>
          <span>Buffer: <strong className="text-emerald-400">Live Syncing</strong></span>
        </div>
      </motion.div>
    </div>
  );
};

export default HistoryPanelModal;
