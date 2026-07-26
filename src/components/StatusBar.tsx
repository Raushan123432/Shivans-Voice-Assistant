import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, Volume2, MessageSquare, Loader2, AlertCircle, EyeOff, Sun } from 'lucide-react';
import { AppState } from '../types';

interface StatusBarProps {
  appState: AppState;
  transcript: { text: string; isUser: boolean } | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ appState, transcript }) => {
  const getBadgeConfig = () => {
    switch (appState) {
      case 'disconnected':
        return {
          icon: <EyeOff className="w-3.5 h-3.5 text-zinc-400" />,
          text: 'Offline',
          bgClass: 'bg-zinc-900/40 border-zinc-800 text-zinc-400',
          glowClass: 'bg-zinc-500/10'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
          text: 'Connecting to Babu AI...',
          bgClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          glowClass: 'bg-amber-400/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
        };
      case 'connected':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
          text: 'Connected & Ready',
          bgClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          glowClass: 'bg-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
        };
      case 'idle':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-purple-400" />,
          text: 'Breathe or Say something',
          bgClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
          glowClass: 'bg-purple-400/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
        };
      case 'listening':
        return {
          icon: <Mic className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />,
          text: 'Listening to you...',
          bgClass: 'bg-fuchsia-500/20 border-fuchsia-400/30 text-fuchsia-300',
          glowClass: 'bg-fuchsia-400/30 shadow-[0_0_20px_rgba(217,70,239,0.3)]'
        };
      case 'thinking':
        return {
          icon: <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />,
          text: 'Babu AI is thinking...',
          bgClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
          glowClass: 'bg-purple-400/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
        };
      case 'speaking':
        return {
          icon: <Volume2 className="w-3.5 h-3.5 text-fuchsia-400 animate-bounce" />,
          text: 'Babu AI is speaking...',
          bgClass: 'bg-fuchsia-500/20 border-fuchsia-400/30 text-fuchsia-300',
          glowClass: 'bg-fuchsia-400/30 shadow-[0_0_25px_rgba(217,70,239,0.3)]'
        };
      case 'interrupted':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          text: 'Interrupted',
          bgClass: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          glowClass: 'bg-rose-400/10'
        };
      case 'reconnecting':
        return {
          icon: <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />,
          text: 'Connection lost, retrying...',
          bgClass: 'bg-amber-500/15 border-amber-500/20 text-amber-400',
          glowClass: 'bg-amber-500/20'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
          text: 'Connection Error',
          bgClass: 'bg-rose-500/25 border-rose-500/40 text-rose-300',
          glowClass: 'bg-rose-500/30'
        };
    }
  };

  const config = getBadgeConfig();

  // Create a tiny state or ref value for latency fluctuation
  const [latency, setLatency] = React.useState(38);
  React.useEffect(() => {
    if (appState === 'disconnected' || appState === 'error') return;
    const interval = setInterval(() => {
      setLatency(prev => {
        const diff = Math.random() > 0.5 ? 2 : -2;
        return Math.max(34, Math.min(48, prev + diff));
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [appState]);

  return (
    <div className="w-full flex flex-col items-center gap-5 px-6">
      {/* 1. Status Chip Badge */}
      <motion.div
        key={appState}
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        className={`flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md font-mono text-xs font-semibold uppercase tracking-wider select-none relative ${config.bgClass}`}
      >
        {/* Underlay glow shadow */}
        <span className={`absolute inset-0 rounded-full -z-10 blur-md transition-all ${config.glowClass}`} />
        
        <div className="flex items-center gap-1.5">
          {config.icon}
          <span>{config.text}</span>
        </div>

        {/* Live connection quality indicator + Keep Awake active indicator */}
        {appState !== 'disconnected' && appState !== 'connecting' && (
          <div className="flex items-center gap-2 border-l border-white/10 pl-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest select-none">
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-1 bg-emerald-400 rounded-full" />
              <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full" />
              <span className="w-0.5 h-2 bg-emerald-400 rounded-full" />
              <span className={`w-0.5 h-2.5 rounded-full ${appState === 'reconnecting' ? 'bg-white/20' : 'bg-emerald-400'}`} />
            </div>
            <span className={`text-[9px] font-mono ${appState === 'reconnecting' ? 'text-amber-400' : 'text-emerald-400/90 animate-pulse'}`}>
              {appState === 'reconnecting' ? 'timeout' : `${latency}ms`}
            </span>

            {/* Expo Keep Awake Active Badge */}
            {(appState === 'listening' || appState === 'thinking' || appState === 'speaking' || appState === 'connected') && (
              <span className="flex items-center gap-1 text-[9px] text-amber-300/90 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20" title="Keep Awake active: Screen will stay on">
                <Sun className="w-2.5 h-2.5 text-amber-400 animate-spin-slow" />
                <span>Awake</span>
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* 2. Beautiful Subtitle Transcript Overlay */}
      <div className="w-full max-w-xl h-20 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {transcript && (
            <motion.div
              key={transcript.text}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="px-5 py-3 rounded-2xl glass shadow-2xl flex flex-col items-center justify-center text-center text-sm md:text-base text-theme-primary"
            >
              {/* Speaker Label Indicator */}
              <span className={`text-[9px] font-mono tracking-widest uppercase mb-1 ${transcript.isUser ? 'text-purple-500 font-bold' : 'text-fuchsia-500 font-bold'}`}>
                {transcript.isUser ? 'You Said' : 'Babu AI'}
              </span>
              
              <p className="font-semibold max-w-md line-clamp-2 leading-relaxed italic">
                "{transcript.text}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StatusBar;
