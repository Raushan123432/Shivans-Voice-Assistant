import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, X, Trash2, ShieldAlert, Sparkles, Plus, Save } from 'lucide-react';

interface MemoryModalProps {
  onClose: () => void;
  assistantName: string;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({ onClose, assistantName }) => {
  const [memories, setMemories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jarvis_ai_memories');
      return stored ? JSON.parse(stored) : [
        `User is named ${localStorage.getItem('user_profile_name') || 'Guest User'}.`,
        `Preferred system assistant identity is set to "${assistantName}".`,
        `Selected voice frequency profile is currently calibrated to "Zephyr".`,
        `Primary communication channel calibrated to "English" with multi-dialect support.`,
        `Real-time emotional voice-barge interruptions are ENABLED.`
      ];
    }
    return [];
  });

  const [newMemory, setNewMemory] = useState('');

  // Persist memory array dynamically
  useEffect(() => {
    localStorage.setItem('jarvis_ai_memories', JSON.stringify(memories));
  }, [memories]);

  const handleAddMemory = () => {
    if (!newMemory.trim()) return;
    setMemories(prev => [...prev, newMemory.trim()]);
    setNewMemory('');
  };

  const handleDeleteMemory = (index: number) => {
    setMemories(prev => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass rounded-3xl w-full max-w-lg shadow-[0_24px_64px_rgba(139,92,246,0.15)] relative overflow-hidden bg-zinc-950/95 border border-white/10 p-6 flex flex-col max-h-[85vh]"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-400 via-pink-500 to-indigo-500" />
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 animate-pulse">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
                {assistantName.toUpperCase()} COGNITIVE MEMORY
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">
                Persistent facts recorded in semantic memory bank
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input area to seed new memories */}
        <div className="mb-5 bg-zinc-900/40 p-3 rounded-2xl border border-white/5 flex gap-2 shrink-0">
          <input
            type="text"
            placeholder="Add something custom Babu should remember about you..."
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddMemory(); }}
            className="flex-1 bg-zinc-950/80 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500/40 font-mono"
          />
          <button
            onClick={handleAddMemory}
            className="px-3 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500/30 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Save
          </button>
        </div>

        {/* List scroll viewport */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {memories.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-zinc-500 text-xs font-mono gap-1">
              <span>&gt; Cognitive memory buffer is currently vacant.</span>
              <span className="text-[9px] text-zinc-600">Interact with Babu or add items above to build memories.</span>
            </div>
          ) : (
            memories.map((mem, index) => (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                key={index}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mt-1.5 shrink-0 animate-pulse" />
                  <span className="text-xs font-mono text-zinc-300 leading-relaxed leading-normal">
                    {mem}
                  </span>
                </div>
                
                <button
                  onClick={() => handleDeleteMemory(index)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                  title="Forget Memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Sync backup warning footer */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase shrink-0">
          <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
          <span>Synchronized dynamically across active live sessions</span>
        </div>
      </motion.div>
    </div>
  );
};

export default MemoryModal;
