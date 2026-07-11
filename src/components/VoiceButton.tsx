import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, RefreshCw, AlertCircle } from 'lucide-react';
import { AppState } from '../types';

interface VoiceButtonProps {
  appState: AppState;
  onClick: () => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ appState, onClick }) => {
  const getButtonStateConfig = () => {
    switch (appState) {
      case 'disconnected':
        return {
          icon: <Mic className="w-8 h-8 text-white" />,
          colorClass: 'from-purple-500 via-fuchsia-600 to-indigo-600 shadow-[0_4px_24px_rgba(139,92,246,0.4)]',
          label: 'Start Assistant',
          glowing: true
        };
      case 'connecting':
      case 'reconnecting':
        return {
          icon: <RefreshCw className="w-8 h-8 text-amber-100 animate-spin" />,
          colorClass: 'from-amber-500 to-orange-600 shadow-[0_4px_24px_rgba(245,158,11,0.4)]',
          label: 'Connecting...',
          glowing: false
        };
      case 'listening':
      case 'speaking':
      case 'thinking':
      case 'idle':
      case 'connected':
      case 'interrupted':
        return {
          icon: <Square className="w-6 h-6 text-white" />,
          colorClass: 'from-rose-500 to-red-600 shadow-[0_4px_24px_rgba(244,63,94,0.4)] hover:from-rose-600 hover:to-red-700',
          label: 'Disconnect',
          glowing: appState === 'speaking' || appState === 'listening'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-8 h-8 text-white" />,
          colorClass: 'from-zinc-700 to-zinc-900 border border-red-500/50 shadow-[0_4px_24px_rgba(239,68,68,0.2)]',
          label: 'Retry Connection',
          glowing: true
        };
      default:
        return {
          icon: <Mic className="w-8 h-8 text-white" />,
          colorClass: 'from-purple-500 via-fuchsia-600 to-indigo-600 shadow-[0_4px_24px_rgba(139,92,246,0.4)]',
          label: 'Start Assistant',
          glowing: false
        };
    }
  };

  const config = getButtonStateConfig();

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* 1. Behind-Button Ripple Animations (Active during voice stream) */}
      <AnimatePresence>
        {config.glowing && (
          <>
            <motion.div
              initial={{ scale: 0.85, opacity: 0.6 }}
              animate={{ scale: 1.45, opacity: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className={`absolute w-24 h-24 rounded-full bg-gradient-to-tr ${
                appState === 'listening' ? 'from-purple-500/40 to-fuchsia-500/40' : 'from-rose-500/40 to-purple-500/40'
              } -z-10`}
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0.4 }}
              animate={{ scale: 1.85, opacity: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 2.5, delay: 0.8, repeat: Infinity, ease: 'easeOut' }}
              className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500/30 via-fuchsia-500/30 to-violet-500/30 -z-10"
            />
          </>
        )}
      </AnimatePresence>

      {/* 2. Tactile Floating Action Button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94, y: 0 }}
        className={`w-20 h-20 md:w-22 md:h-22 rounded-full bg-gradient-to-tr ${config.colorClass} flex items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-300 shadow-lg border border-white/25`}
        aria-label={config.label}
      >
        {/* Soft satin glare reflection overlay */}
        <span className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
        <span className="absolute -inset-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 transform translate-y-full hover:translate-y-0 transition-transform duration-1000" />
        
        {/* Animated icon container */}
        <motion.div
          key={appState}
          initial={{ scale: 0.7, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.7, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.25, type: 'spring' }}
        >
          {config.icon}
        </motion.div>
      </motion.button>

      {/* 3. Action context sub-label */}
      <motion.p
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-[11px] font-mono tracking-widest text-zinc-400 mt-4 uppercase select-none"
      >
        {appState === 'listening' ? 'Shivansh is Listening' : appState === 'speaking' ? 'Shivansh is Speaking' : config.label}
      </motion.p>
    </div>
  );
};

export default VoiceButton;
