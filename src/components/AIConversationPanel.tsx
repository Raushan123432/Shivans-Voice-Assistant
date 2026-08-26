import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Copy, Volume2, Bot, User, Check, Sparkles, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIConversationPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onStartVoice: () => void;
  isListening?: boolean;
  onSpeakText?: (text: string) => void;
}

export const AIConversationPanel: React.FC<AIConversationPanelProps> = ({
  messages,
  onSendMessage,
  onStartVoice,
  isListening = false,
  onSpeakText
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-slate-950/90 border border-purple-500/20 rounded-2xl backdrop-blur-2xl p-4 sm:p-6 shadow-2xl font-sans overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white font-sans">
              SHIVANSH AI COGNITIVE CONVERSATION
            </h2>
            <p className="text-[10px] font-mono text-slate-400">
              REAL-TIME DIRECT DESKTOP INTELLIGENCE
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
          ONLINE • READY
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 font-mono text-xs gap-2"
            >
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
              <p className="text-sm font-bold text-slate-200">SHIVANSH Neural Interface Standby</p>
              <p className="text-slate-400 max-w-sm">
                Type a command or click the microphone to ask SHIVANSH about system status, applications, files, or tasks.
              </p>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'} gap-1`}
              >
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  {msg.isUser ? (
                    <>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-cyan-400 font-bold">SIR</span>
                      <User className="w-3 h-3 text-cyan-400" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-purple-400" />
                      <span className="text-purple-300 font-bold">SHIVANSH</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </>
                  )}
                </div>

                <div className={`group relative max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm font-sans shadow-lg leading-relaxed ${
                  msg.isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-purple-500/30 text-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}

                  {/* Message Actions */}
                  {!msg.isUser && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {onSpeakText && (
                        <button
                          onClick={() => onSpeakText(msg.text)}
                          className="hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors ml-2"
                          title="Speak response"
                        >
                          <Volume2 className="w-3 h-3 text-purple-400" />
                          <span>Speak</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-900">
        <button
          type="button"
          onClick={onStartVoice}
          className={`p-3 rounded-xl transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
              : 'bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-400'
          }`}
          title={isListening ? 'Stop Listening' : 'Voice Input'}
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message or command for SHIVANSH..."
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 text-white placeholder-slate-500 text-xs font-mono outline-none transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 disabled:opacity-40 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SEND</span>
        </button>
      </form>

    </div>
  );
};

export default AIConversationPanel;
