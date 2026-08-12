import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Keyboard, Send, X, Sparkles } from 'lucide-react';

interface KeyboardModalProps {
  onClose: () => void;
  onSendText: (text: string) => void;
}

export const KeyboardModal: React.FC<KeyboardModalProps> = ({ onClose, onSendText }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendText(text.trim());
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden flex flex-col"
      >
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-purple-500/20 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="font-mono font-bold text-sm text-purple-200 tracking-wider">
              TYPE TEXT TO ZOYA AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask Shivansh AI anything or give a command (e.g. 'Chrome kholo', 'YouTube kholo', 'What is the weather today?')..."
            rows={4}
            className="w-full p-4 rounded-2xl bg-zinc-900 border border-purple-500/30 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-400 resize-none"
            autoFocus
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Press Enter to send</span>
            </div>

            <button
              type="submit"
              disabled={!text.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>SEND COMMAND</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
