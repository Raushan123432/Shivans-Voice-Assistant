import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Settings, 
  Keyboard, 
  HelpCircle, 
  Maximize2, 
  Minimize2, 
  Radio, 
  Globe, 
  Youtube, 
  MessageCircle, 
  Search, 
  Music, 
  Calculator, 
  Volume2, 
  Bot 
} from 'lucide-react';
import { AppState } from '../types';
import { ShivanshAvatar3D } from './3d/ZoyaAvatar3D';
import { VoiceOrb } from './VoiceOrb';

interface HomeTabProps {
  appState: AppState;
  emotion: string;
  onStartVoice: () => void;
  onTriggerAction: (command: string) => void;
  assistantName: string;
  onOpenChat?: () => void;
  onOpenSettings?: () => void;
  onOpenKeyboard?: () => void;
  onOpenHelp?: () => void;
  onOpenHistory?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  appState,
  emotion,
  onStartVoice,
  onTriggerAction,
  assistantName,
  onOpenSettings,
  onOpenKeyboard,
  onOpenHelp
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quickCommandExecuted, setQuickCommandExecuted] = useState<string | null>(null);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handleCommandClick = (cmd: string) => {
    setQuickCommandExecuted(cmd);
    onTriggerAction(cmd);
    setTimeout(() => setQuickCommandExecuted(null), 2500);
  };

  const isListening = appState === 'listening';
  const isSpeaking = appState === 'speaking';
  const isThinking = appState === 'thinking';

  // Normalize appState for 3D components
  const normalized3DState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error' = 
    appState === 'listening' ? 'listening' :
    appState === 'speaking' ? 'speaking' :
    appState === 'thinking' ? 'thinking' :
    appState === 'error' ? 'error' : 'idle';

  // Format assistant name for greeting
  const displayName = assistantName || 'Shivansh AI';

  return (
    <div className="w-full min-h-screen bg-[#030712] text-slate-100 font-sans relative overflow-hidden flex flex-col justify-between p-3 sm:p-6 select-none border border-purple-500/20 shadow-[0_0_90px_rgba(139,92,246,0.2)] rounded-3xl">
      
      {/* BACKGROUND FLOWING WAVES & VOLUMETRIC GLOW (MATCHING MOCKUP IMAGE) */}
      <div className="fixed top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[160px] pointer-events-none z-0 animate-pulse" />
      <div className="fixed top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[160px] pointer-events-none z-0 animate-pulse" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-r from-purple-600/10 via-cyan-500/15 to-blue-600/10 blur-[120px] pointer-events-none z-0" />

      {/* 1. ULTRA-MINIMAL DESKTOP FRAMELESS WINDOW HEADER */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 px-4 rounded-2xl bg-slate-950/70 border border-purple-500/20 backdrop-blur-2xl shadow-2xl z-30">
        {/* Left: Desktop Window Title & AI Core Emblem */}
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-300/30">
            <Bot className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-extrabold tracking-widest font-mono bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent uppercase">
              {displayName} — VOICE ASSISTANT OS
            </h1>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
              isSpeaking
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 animate-pulse'
                : isListening
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                : isThinking
                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 animate-pulse'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {appState}
            </span>
          </div>
        </div>

        {/* Right: Desktop Window Controls & Settings */}
        <div className="flex items-center gap-2">
          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="AI Settings & Identity"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Minimal Window Decorative Buttons (_ □ ✕) */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10 text-slate-400 text-xs font-mono">
            <button className="hover:text-white transition-colors px-1" title="Minimize">—</button>
            <button className="hover:text-white transition-colors px-1" title="Maximize">□</button>
            <button className="hover:text-rose-400 transition-colors px-1" title="Close">✕</button>
          </div>
        </div>
      </header>

      {/* 2. PURE 3D AI CHARACTER & VOICE CORE HERO STAGE */}
      <main className="w-full max-w-5xl mx-auto flex-1 flex flex-col items-center justify-center relative z-20 py-2 sm:py-4 gap-2">
        
        {/* CENTER 3D FEMALE AI CHARACTER */}
        <div className="relative w-full max-w-lg flex flex-col items-center justify-center">
          
          {/* Ambient Particle Halo behind Character */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

          {/* 3D Character Canvas Component */}
          <div className="w-full h-[280px] sm:h-[360px] md:h-[400px] relative flex items-center justify-center">
            <ShivanshAvatar3D 
              appState={normalized3DState} 
              emotion={emotion === 'neutral' ? 'focused' : (emotion as any)} 
              voiceLevel={isSpeaking || isListening ? 0.7 : 0.2} 
            />
          </div>

        </div>

        {/* 3D HOLOGRAPHIC VOICE CORE ORB WITH FLANKING WAVEFORMS */}
        <div className="flex flex-col items-center justify-center -mt-6 sm:-mt-8 z-30 w-full">
          <VoiceOrb 
            appState={normalized3DState} 
            voiceLevel={isSpeaking || isListening ? 0.8 : 0.25} 
            onToggleVoice={onStartVoice} 
          />
        </div>

        {/* ESSENTIAL MINIMAL TEXT & SUBTITLE DISPLAY (MATCHING MOCKUP IMAGE) */}
        <div className="flex flex-col items-center text-center gap-1.5 z-30 max-w-lg px-4 mt-1">
          
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-1"
              >
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-purple-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center gap-2">
                  <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
                  Listening...
                </h2>
                <p className="text-sm text-slate-300/80 font-medium tracking-wide">
                  How can I help you today?
                </p>
              </motion.div>
            ) : isThinking ? (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-1"
              >
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-indigo-300 via-purple-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
                  Thinking...
                </h2>
                <p className="text-sm text-slate-300/80 font-medium tracking-wide">
                  How can I help you today?
                </p>
              </motion.div>
            ) : isSpeaking ? (
              <motion.div
                key="speaking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-1"
              >
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-purple-300 via-fuchsia-200 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(192,132,252,0.5)] flex items-center gap-2">
                  <Volume2 className="w-6 h-6 text-fuchsia-400 animate-bounce" />
                  Speaking...
                </h2>
                <p className="text-sm text-purple-200/90 font-medium italic bg-purple-950/60 border border-purple-500/30 px-4 py-1 rounded-full shadow-lg backdrop-blur-md max-w-md truncate">
                  Responding to Roushan Sir...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-1"
              >
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                  Hello <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">Roushan Sir</span>
                </h2>
                <p className="text-sm text-slate-300/80 font-medium tracking-wide">
                  How can I help you today?
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback for executed quick action */}
          {quickCommandExecuted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono mt-1"
            >
              Executing: "{quickCommandExecuted}"
            </motion.div>
          )}

        </div>

      </main>

      {/* 3. SLEEK FLOATING VOICE ACTION CONTROLS & COMMAND CHIPS */}
      <footer className="w-full max-w-3xl mx-auto flex flex-col items-center gap-3 z-30 pb-2">
        
        {/* Minimal Floating Quick Voice Command Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl px-2">
          {[
            { label: 'Open Chrome', icon: Globe, cmd: 'Open Chrome' },
            { label: 'Open YouTube', icon: Youtube, cmd: 'Open YouTube' },
            { label: 'Open WhatsApp', icon: MessageCircle, cmd: 'Open WhatsApp' },
            { label: 'Search Google', icon: Search, cmd: 'Search Google' },
            { label: 'Play Music', icon: Music, cmd: 'Play music' },
            { label: 'Calculator', icon: Calculator, cmd: 'Open calculator' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => handleCommandClick(item.cmd)}
                className="px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-purple-500/20 hover:border-cyan-400/50 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Minimal Floating Voice Bar */}
        <div className="w-full max-w-md p-2 rounded-2xl bg-slate-950/80 border border-purple-500/30 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-between gap-2">
          
          {/* Keyboard Dialog Trigger */}
          <button
            onClick={onOpenKeyboard}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/20 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-mono"
            title="Type command (Ctrl+K)"
          >
            <Keyboard className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Type command...</span>
          </button>

          {/* Central Glowing Mic Orb Button */}
          <button
            onClick={onStartVoice}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isListening
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(34,211,238,0.6)] animate-pulse'
                : isSpeaking
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_25px_rgba(192,132,252,0.6)]'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isListening ? 'Stop Mic' : 'Voice Activate'}</span>
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Voice Commands Guide"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>

        </div>

      </footer>

    </div>
  );
};

export default HomeTab;
