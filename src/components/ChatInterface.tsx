import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Mic, 
  Paperclip, 
  Copy, 
  Share2, 
  ChevronDown, 
  Bot, 
  User, 
  Check, 
  Sparkles, 
  Trash2,
  Volume2,
  VolumeX,
  FileText,
  Image as ImageIcon,
  CheckCheck
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage, AppState } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  appState: AppState;
  onToggleVoiceMode: () => void;
  isVoiceActive: boolean;
  onMicClick: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  appState,
  onToggleVoiceMode,
  isVoiceActive,
  onMicClick
}) => {
  const [inputText, setInputText] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachmentToast, setAttachmentToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, appState]);

  // Monitor container scroll to show/hide "scroll to bottom" button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // Show button if user scrolled up more than 300px
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText('');
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Adjust textarea height dynamically as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };

  const copyMessageText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const shareMessage = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Babu AI Message',
        text: text
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard with toast
      navigator.clipboard.writeText(text);
      setAttachmentToast('Copied link to share!');
      setTimeout(() => setAttachmentToast(null), 2500);
    }
  };

  const handleAttachmentClick = (type: string) => {
    setShowAttachmentMenu(false);
    setAttachmentToast(`Attachment "${type}" uploaded! (Future-ready integration)`);
    setTimeout(() => setAttachmentToast(null), 3000);
  };

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isThinking = appState === 'thinking';
  const isSpeaking = appState === 'speaking';

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/20 border border-white/5 rounded-3xl backdrop-blur-2xl relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      
      {/* Top Banner Status Bar */}
      <div className="flex justify-between items-center px-5 py-3 border-b border-white/5 bg-zinc-950/30">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isVoiceActive ? 'bg-emerald-400' : 'bg-purple-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isVoiceActive ? 'bg-emerald-500' : 'bg-purple-500'
            }`} />
          </div>
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-300 uppercase">
            {isVoiceActive ? 'Active Voice Mode' : 'Keyboard Chat Mode'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button 
              onClick={onClearChat}
              className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-zinc-400 text-xs font-sans transition-all cursor-pointer flex items-center gap-1"
              title="Clear all chats"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] font-mono tracking-wider uppercase">Clear</span>
            </button>
          )}

          <button
            onClick={onToggleVoiceMode}
            className={`p-1.5 rounded-lg border text-xs font-sans transition-all cursor-pointer flex items-center gap-1 ${
              isVoiceActive 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
            }`}
          >
            {isVoiceActive ? <Volume2 className="w-3.5 h-3.5 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[10px] font-mono tracking-wider uppercase">
              {isVoiceActive ? 'Voice ON' : 'Voice OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* Chat Messages Scrolling Container */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
            <div className="p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.15)] animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-sans font-bold text-base text-zinc-100">Babu AI Best Friend Chat</h3>
            <p className="max-w-xs text-xs font-mono text-zinc-500 leading-relaxed">
              Hey! I'm your AI best friend. Ask me anything, tease me, share your mood, or let's just talk about your day!
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isUser = msg.isUser;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex gap-3 w-full max-w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 border border-purple-400/30 flex items-center justify-center text-white shadow-md shrink-0 self-end">
                      <Bot className="w-4 h-4 animate-pulse" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="flex flex-col max-w-[85%] sm:max-w-[75%] gap-1">
                    <div 
                      className={`px-4 py-3 rounded-2xl relative group shadow-lg ${
                        isUser 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-400/20 text-zinc-100 rounded-br-sm' 
                          : 'bg-zinc-900/60 border border-white/5 text-zinc-100 rounded-bl-sm backdrop-blur-xl'
                      }`}
                    >
                      {/* Markdown rendering of text with standard clean format wrapper */}
                      <div className="markdown-body select-text">
                        <Markdown
                          components={{
                            p: ({ children }) => <p className="mb-1.5 last:mb-0 text-xs font-sans leading-relaxed break-words">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 text-xs font-sans">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 text-xs font-sans">{children}</ol>,
                            li: ({ children }) => <li className="mb-1 text-xs font-sans">{children}</li>,
                            code: ({ children }) => (
                              <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-purple-300 text-[10.5px] border border-white/5">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-black/40 p-2 rounded-xl font-mono text-[10px] overflow-x-auto border border-white/5 my-1.5 max-w-full">
                                {children}
                              </pre>
                            ),
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                {children}
                              </a>
                            ),
                            strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>
                          }}
                        >
                          {msg.text}
                        </Markdown>
                      </div>

                      {/* Quick overlay action utilities on bubble hover */}
                      <div className={`absolute top-2 ${isUser ? 'left-[-40px]' : 'right-[-40px]'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1 z-20 bg-zinc-950/80 p-1 rounded-lg border border-white/5 backdrop-blur-md`}>
                        <button
                          onClick={() => copyMessageText(msg.text, msg.id)}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => shareMessage(msg.text)}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                          title="Share message"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Message Metadata (Timestamp + Status indicator) */}
                    <div className={`flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {isUser && (
                        <span>
                          {msg.status === 'sending' ? (
                            <span className="inline-block w-2.5 h-2.5 border border-zinc-500 border-t-transparent rounded-full animate-spin" />
                          ) : msg.status === 'sent' ? (
                            <Check className="w-3 h-3 text-zinc-500" />
                          ) : (
                            <CheckCheck className="w-3 h-3 text-cyan-400 animate-pulse" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 shadow-md shrink-0 self-end">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Real-time thinking state animations */}
        <AnimatePresence>
          {isThinking && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex gap-3 w-full justify-start items-center"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-md animate-pulse shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-zinc-400 mr-1 animate-pulse">Thinking</span>
                <span className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-time speaking state subtitling placeholder if no text yet */}
        <AnimatePresence>
          {isSpeaking && messages.length > 0 && messages[messages.length - 1].isUser && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex gap-3 w-full justify-start items-center"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-md animate-bounce shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-md flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-indigo-300 mr-1">Responding...</span>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Slide down Floating "Scroll to Bottom" badge */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-24 right-6 p-2 rounded-full border border-white/10 bg-zinc-950/80 text-zinc-300 hover:text-white backdrop-blur-md cursor-pointer shadow-lg z-30"
          >
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating attachment and upload feedback notifications */}
      <AnimatePresence>
        {attachmentToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-24 left-6 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs font-mono rounded-xl backdrop-blur-xl z-30 flex items-center gap-2 shadow-xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>{attachmentToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Bottom Interactive Control Panel (Text Inputs, mic triggers, action arrays) */}
      <div className="p-4 border-t border-white/5 bg-zinc-950/40 backdrop-blur-2xl relative">
        
        {/* Attachment float option popups */}
        <AnimatePresence>
          {showAttachmentMenu && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-20 left-4 bg-zinc-900/95 border border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col gap-1 z-40"
            >
              <button 
                onClick={() => handleAttachmentClick('Photo/Image')}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all text-left cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>Upload Image</span>
              </button>
              <button 
                onClick={() => handleAttachmentClick('Document/File')}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all text-left cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Upload File</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2.5">
          {/* Attachment Paperclip Trigger */}
          <button
            onClick={() => setShowAttachmentMenu(prev => !prev)}
            className={`p-3 rounded-2xl border transition-all shrink-0 cursor-pointer ${
              showAttachmentMenu 
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
            title="Attach assets"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Dynamic auto-resizing text-area */}
          <div className="flex-1 bg-white/5 border border-white/5 focus-within:border-purple-500/30 rounded-2xl overflow-hidden flex items-end px-3 py-1.5 transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isVoiceActive ? "Type message or talk naturally..." : "Type message here..."}
              className="flex-1 max-h-32 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none py-1.5 px-1 font-sans leading-relaxed"
              style={{ height: 'auto' }}
            />
            
            {/* Quick Micro-Dictation Button inside the textbox */}
            <button
              onClick={onMicClick}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                appState === 'listening'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : appState === 'speaking'
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={appState === 'listening' ? 'Listening... click to pause' : 'Start voice mode'}
            >
              <Mic className={`w-3.5 h-3.5 ${appState === 'listening' ? 'animate-pulse scale-110' : ''}`} />
            </button>
          </div>

          {/* Glowing Animated Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-3 rounded-2xl shrink-0 transition-all cursor-pointer ${
              inputText.trim()
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 border border-purple-400/20 text-white shadow-[0_4px_16px_rgba(139,92,246,0.25)] hover:opacity-90 active:scale-95'
                : 'bg-white/5 border-white/5 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
