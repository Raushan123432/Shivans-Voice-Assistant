import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Send, 
  Sparkles, 
  Globe, 
  Volume2, 
  VolumeX, 
  Settings, 
  History, 
  Brain, 
  Zap, 
  Radio, 
  MessageSquare, 
  Compass, 
  Clock, 
  X, 
  Sliders, 
  Sun, 
  Moon, 
  Trash2, 
  Copy, 
  Check, 
  ChevronRight, 
  Terminal, 
  Layers,
  HelpCircle,
  Languages,
  User,
  Shield,
  Activity
} from 'lucide-react';
import { AppState } from '../types';
import audioStreamer from '../services/AudioStreamer';

interface HomeTabProps {
  appState: AppState;
  emotion: string;
  onStartVoice: () => void;
  onTriggerAction: (command: string) => void;
  onTriggerDirectLock?: () => void;
  assistantName: string;
  AssistantOrbComponent?: React.ComponentType<{ appState: AppState; emotion: string }>;
  VoiceButtonComponent?: React.ComponentType<{ appState: AppState; onClick: () => void }>;
  onOpenChat?: () => void;
  onOpenSettings?: () => void;
}

// Supported Indian & Global Languages
export const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'en-US', name: 'English (US)', native: 'English', flag: '🇺🇸' },
  { code: 'en-IN', name: 'English (India)', native: 'English (IN)', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or-IN', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as-IN', name: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ur-IN', name: 'Urdu', native: 'اردو', flag: '🇮🇳' },
  { code: 'sa-IN', name: 'Sanskrit', native: 'संस्कृतम्', flag: '🇮🇳' },
  { code: 'fr-FR', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'es-ES', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'de-DE', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja-JP', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
];

export const HomeTab: React.FC<HomeTabProps> = ({
  appState,
  emotion,
  onStartVoice,
  onTriggerAction,
  assistantName,
  AssistantOrbComponent,
  onOpenChat,
  onOpenSettings
}) => {
  // Selected Language State
  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0]); // Default Hindi
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Wake-word / Hands-Free mode toggle
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Command Input State
  const [commandInput, setCommandInput] = useState('');

  // Conversation & Subtitle State
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sample conversation transcript history
  const [conversationHistory, setConversationHistory] = useState<Array<{ id: string; sender: 'user' | 'ai'; text: string; time: string; lang: string }>>([
    { id: '1', sender: 'ai', text: 'Namaste! Main aapka 3D AI Voice Assistant hoon. Aap mujhse kya puchna chahte hain?', time: '10:30 AM', lang: 'Hindi' },
    { id: '2', sender: 'user', text: 'What can you do for me today?', time: '10:31 AM', lang: 'English' },
    { id: '3', sender: 'ai', text: 'I can help you with voice commands, weather updates, opening apps, setting reminders, translating languages, and chatting naturally in 15+ Indian languages!', time: '10:31 AM', lang: 'English' },
  ]);

  // Live STT & AI Subtitle HUD State
  const [liveUserSpeech, setLiveUserSpeech] = useState<string>('');
  const [liveAiSubtitle, setLiveAiSubtitle] = useState<string>('Ready to listen. Say "Hey Aura" or click the mic.');

  // Theme option (Cyber Dark, Neon Cyan, Matrix Emerald, Deep Violet)
  const [currentTheme, setCurrentTheme] = useState<'cyber' | 'cyan' | 'purple' | 'matrix'>('cyber');

  // Interrupt active speech
  const handleInterruptSpeech = () => {
    audioStreamer.interrupt();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Submit Text Command
  const handleCommandSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commandInput.trim()) return;

    const newCmd = commandInput.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append to conversation
    setConversationHistory(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text: newCmd, time: timeStr, lang: selectedLang.name }
    ]);

    setLiveUserSpeech(newCmd);
    setLiveAiSubtitle('Processing your query in ' + selectedLang.name + '...');

    onTriggerAction(newCmd);
    setCommandInput('');
  };

  // Handle Quick Command Action
  const handleQuickCommand = (cmd: string) => {
    setCommandInput(cmd);
    onTriggerAction(cmd);
    setLiveUserSpeech(cmd);
    setLiveAiSubtitle(`Executing "${cmd}"...`);
  };

  // Copy transcript
  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Status Badge Metadata
  const getStatusInfo = () => {
    switch (appState) {
      case 'listening':
        return { label: 'LISTENING', color: 'from-cyan-400 to-blue-500', glow: 'shadow-[0_0_20px_#00f0ff]', ring: 'border-cyan-400' };
      case 'speaking':
        return { label: 'SPEAKING', color: 'from-purple-500 to-pink-500', glow: 'shadow-[0_0_20px_#ec4899]', ring: 'border-pink-400' };
      case 'thinking':
        return { label: 'THINKING', color: 'from-amber-400 to-orange-500', glow: 'shadow-[0_0_20px_#f59e0b]', ring: 'border-amber-400' };
      case 'connecting':
        return { label: 'CONNECTING', color: 'from-blue-400 to-indigo-500', glow: 'shadow-[0_0_20px_#3b82f6]', ring: 'border-blue-400' };
      default:
        return { label: 'IDLE • READY', color: 'from-cyan-500 to-purple-600', glow: 'shadow-[0_0_15px_rgba(0,240,255,0.3)]', ring: 'border-cyan-500/30' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-between py-2 px-3 sm:px-6 relative z-10 text-slate-100 select-none max-w-7xl mx-auto">
      
      {/* Dynamic Background Atmosphere Glows */}
      <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
        currentTheme === 'cyan' ? 'bg-cyan-500/15' :
        currentTheme === 'purple' ? 'bg-purple-500/15' :
        currentTheme === 'matrix' ? 'bg-emerald-500/15' : 'bg-blue-600/15'
      }`} />

      {/* TOP FUTURISTIC HEADER */}
      <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 sm:px-6 rounded-3xl glass-cyber border border-cyan-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        
        {/* Left: AI Assistant Name & Avatar */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] border border-cyan-300/40">
            <Sparkles className="w-5 h-5 animate-pulse text-cyan-200" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black animate-ping" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black font-display tracking-tight bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-300 bg-clip-text text-transparent">
                {assistantName || 'AURA'} <span className="text-xs font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30">3D QUANTUM</span>
              </h1>
            </div>
            <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-cyan-400" /> Multilingual Voice AI Core
            </p>
          </div>
        </div>

        {/* Center: Real-Time Status Pill */}
        <div className="flex items-center gap-2">
          <div className={`px-4 py-1.5 rounded-full glass-cyber border ${statusInfo.ring} flex items-center gap-2 text-xs font-mono font-extrabold uppercase tracking-widest ${statusInfo.glow} transition-all`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r ${statusInfo.color} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r ${statusInfo.color}`} />
            </span>
            <span className="text-cyan-300">{statusInfo.label}</span>
          </div>
        </div>

        {/* Right: Language Selector, Hands-Free Switch, History & Settings */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          
          {/* Multilingual Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-cyan-500/30 text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Select Language"
            >
              <span>{selectedLang.flag}</span>
              <span>{selectedLang.name}</span>
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Language Dropdown Modal */}
            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-3xl glass-cyber border border-cyan-500/40 p-2 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.9)] custom-scrollbar"
                >
                  <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-white/10 flex items-center justify-between">
                    <span>Select Language (15+ Indian)</span>
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang);
                          setShowLangMenu(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                          selectedLang.code === lang.code
                            ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white border border-cyan-400/50 font-bold'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                        <span className="text-[10px] text-cyan-400 opacity-80">{lang.native}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hands-Free VAD Switch */}
          <button
            onClick={() => setHandsFreeMode(!handsFreeMode)}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              handsFreeMode
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title="Hands-Free Mode"
          >
            <Radio className={`w-3.5 h-3.5 ${handsFreeMode ? 'text-purple-400 animate-pulse' : ''}`} />
            <span>Hands-Free</span>
          </button>

          {/* History Drawer Toggle */}
          <button
            onClick={() => setHistoryDrawerOpen(true)}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
            title="Conversation History"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

        </div>

      </header>

      {/* CENTER STAGE: 3D AI CORE / ORB + HUD SUBTITLE + CONTROL BUTTONS */}
      <main className="w-full flex-1 flex flex-col items-center justify-center my-4 relative">
        
        {/* 3D AI Orb Container */}
        <div className="relative w-full max-w-lg flex flex-col items-center justify-center">
          
          {/* Main Three.js 3D Orb Component */}
          {AssistantOrbComponent ? (
            <AssistantOrbComponent appState={appState} emotion={emotion} />
          ) : (
            <div className="w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-600 animate-pulse flex items-center justify-center shadow-[0_0_80px_rgba(0,240,255,0.5)]">
              <Mic className="w-16 h-16 text-white" />
            </div>
          )}

          {/* Interactive 3D Microphone Pulse Button */}
          <div className="mt-2 flex items-center gap-4 z-30">
            
            {/* Mute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl glass-cyber border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Main Interactive Mic Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartVoice}
              className={`px-8 py-3.5 rounded-full font-mono text-sm font-extrabold tracking-widest uppercase flex items-center gap-3 transition-all duration-300 cursor-pointer shadow-2xl ${
                appState === 'listening' || appState === 'speaking'
                  ? 'bg-gradient-to-r from-rose-500 via-purple-600 to-pink-600 text-white shadow-[0_0_30px_rgba(244,63,94,0.6)] border-2 border-rose-300'
                  : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white shadow-[0_0_30px_rgba(0,240,255,0.5)] border-2 border-cyan-300 hover:border-white'
              }`}
            >
              <Mic className="w-5 h-5 animate-pulse" />
              <span>{appState === 'listening' ? 'STOP LISTENING' : 'START VOICE AI'}</span>
            </motion.button>

            {/* Interrupt AI Button */}
            <button
              onClick={handleInterruptSpeech}
              className="p-3 rounded-2xl glass-cyber border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
              title="Interrupt AI Speech"
            >
              <Square className="w-5 h-5" />
            </button>

          </div>

          {/* Real-time Subtitle & Speech HUD Overlay Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mt-5 p-4 rounded-3xl glass-cyber border border-cyan-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col gap-2 text-center"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider px-1">
              <span className="flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-cyan-400" /> AI Transcript HUD ({selectedLang.name})
              </span>
              <span className="text-slate-500">Live Audio Stream</span>
            </div>

            {liveUserSpeech && (
              <p className="text-xs font-mono text-cyan-200 bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20 text-left">
                <strong className="text-cyan-400">You:</strong> {liveUserSpeech}
              </p>
            )}

            <p className="text-xs sm:text-sm font-sans font-medium text-slate-200 leading-relaxed italic text-left px-1">
              "{liveAiSubtitle}"
            </p>
          </motion.div>

        </div>

      </main>

      {/* QUICK COMMAND SHORTCUT PILLS */}
      <div className="w-full max-w-5xl mx-auto my-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-extrabold tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Quick Actions:
          </span>
          {[
            "Open YouTube",
            "What's the weather today?",
            "Translate to Hindi",
            "Set a reminder for 5 PM",
            "Play some music",
            "Open WhatsApp",
            "Directions to nearest restaurant",
            "Tell me a funny joke"
          ].map((action) => (
            <button
              key={action}
              onClick={() => handleQuickCommand(action)}
              className="px-3.5 py-1.5 rounded-full glass-cyber hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-400/50 text-xs font-mono text-slate-300 hover:text-cyan-200 transition-all shrink-0 cursor-pointer shadow-sm"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM COMMAND INPUT BAR */}
      <footer className="w-full max-w-5xl mx-auto pb-3 pt-1">
        <form onSubmit={handleCommandSubmit} className="relative flex items-center">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder={`Type a command in ${selectedLang.name}...`}
            className="w-full py-4 pl-6 pr-20 rounded-full glass-cyber border-2 border-cyan-500/30 focus:border-cyan-400 focus:outline-none text-slate-100 placeholder-slate-500 font-mono text-xs sm:text-sm tracking-wide shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={onStartVoice}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-cyan-300 transition-all cursor-pointer"
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,240,255,0.5)]"
              title="Send Command"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </footer>

      {/* CONVERSATION HISTORY & MEMORY DRAWER MODAL */}
      <AnimatePresence>
        {historyDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full glass-cyber border-l border-cyan-500/30 p-6 flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-extrabold uppercase text-sm tracking-wider">
                  <History className="w-5 h-5 text-cyan-400" />
                  <span>Conversation Memory</span>
                </div>
                <button
                  onClick={() => setHistoryDrawerOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Conversation Log List */}
              <div className="flex-1 my-4 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                {conversationHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl border text-xs font-mono relative flex flex-col gap-1 ${
                      msg.sender === 'user'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-100 self-end max-w-[85%]'
                        : 'bg-purple-500/10 border-purple-500/30 text-purple-100 self-start max-w-[90%]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/5 pb-1">
                      <span className="font-bold uppercase text-cyan-300">{msg.sender === 'user' ? 'You' : 'AURA 3D'}</span>
                      <div className="flex items-center gap-2">
                        <span>{msg.time}</span>
                        <button
                          onClick={() => copyToClipboard(msg.id, msg.text)}
                          className="hover:text-white transition-colors"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Drawer Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => setConversationHistory([])}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Clear History
                </button>
                <button
                  onClick={() => setHistoryDrawerOpen(false)}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-mono text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HomeTab;
