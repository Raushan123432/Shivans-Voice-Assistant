import React from 'react';
import { motion } from 'motion/react';
import { Bot, Settings, Sun, Moon } from 'lucide-react';
import { AppState } from '../types';

interface HeaderProps {
  appState: AppState;
  onOpenSettings: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  assistantName?: string;
}

export const Header: React.FC<HeaderProps> = ({ appState, onOpenSettings, theme, onToggleTheme, assistantName = 'BABU AI' }) => {
  const getStatusColor = () => {
    switch (appState) {
      case 'connected':
      case 'listening':
      case 'speaking':
      case 'idle':
        return 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
      case 'connecting':
      case 'thinking':
      case 'reconnecting':
        return 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
      case 'error':
        return 'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]';
      case 'disconnected':
      default:
        return 'bg-zinc-500';
    }
  };

  const getStatusText = () => {
    if (appState === 'reconnecting') return 'Reconnecting';
    if (appState === 'connecting') return 'Connecting';
    if (appState === 'error') return 'Error';
    if (appState === 'disconnected') return 'Offline';
    return 'Live';
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-5 md:px-10 md:py-8 sticky top-0 z-40 bg-transparent">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            scale: appState === 'speaking' || appState === 'listening' ? [1, 1.05, 1] : 1,
            rotate: appState === 'thinking' ? [0, 360] : 0
          }}
          transition={{
            duration: appState === 'thinking' ? 3 : 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-11 h-11 glass rounded-xl flex items-center justify-center shadow-inner"
        >
          <Bot className="w-6 h-6 text-purple-400" />
        </motion.div>
        
        <div className="flex flex-col">
          <h1 className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent uppercase flex items-center">
            {assistantName} <span className="text-purple-400 font-medium font-mono text-xs align-super ml-1.5 bg-purple-500/10 px-1 py-0.5 rounded">v2</span>
          </h1>
          <p className="text-[9px] text-purple-200/50 font-mono tracking-widest uppercase">
            Artistic Voice Assistant
          </p>
        </div>
      </div>

      {/* Latency and Connection Panel */}
      <div className="flex items-center gap-4">
        {/* Latency meter */}
        {appState !== 'disconnected' && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
            <span className="text-xs font-medium text-cyan-100/70 uppercase tracking-widest font-mono">
              {appState === 'thinking' ? '320ms' : '42ms'} Latency
            </span>
          </motion.div>
        )}

        {/* Connection status badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full glass">
          <span className={`w-2 h-2 rounded-full ${getStatusColor()}`}></span>
          <span className="text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider">
            {getStatusText()}
          </span>
        </div>

        {/* Theme Toggle button */}
        <button
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
            onToggleTheme();
          }}
          className="p-2.5 rounded-full glass hover:bg-white/10 transition-colors text-zinc-300 hover:text-white cursor-pointer flex items-center justify-center"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-full glass hover:bg-white/10 transition-colors text-zinc-300 hover:text-white cursor-pointer"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
