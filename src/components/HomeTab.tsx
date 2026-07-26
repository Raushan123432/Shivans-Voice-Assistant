import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Play, 
  Phone, 
  Send, 
  Shield, 
  Sparkles,
  ArrowRight,
  Tv,
  MessageCircle,
  Lock
} from 'lucide-react';
import { AppState } from '../types';

interface HomeTabProps {
  appState: AppState;
  emotion: string;
  onStartVoice: () => void;
  onTriggerAction: (command: string) => void;
  onTriggerDirectLock: () => void;
  assistantName: string;
  AssistantOrbComponent: React.ComponentType<{ appState: AppState; emotion: string }>;
  VoiceButtonComponent: React.ComponentType<{ appState: AppState; onClick: () => void }>;
}

const TypewriterText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 100 }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, delay);

    return () => clearInterval(timer);
  }, [text, delay]);

  return (
    <span className="relative inline-block">
      <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.25)]">
        {displayed}
      </span>
      {displayed.length < text.length && (
        <span className="animate-pulse text-cyan-400 absolute ml-0.5 font-light">|</span>
      )}
    </span>
  );
};

export const HomeTab: React.FC<HomeTabProps> = ({
  appState,
  emotion,
  onStartVoice,
  onTriggerAction,
  onTriggerDirectLock,
  assistantName,
  AssistantOrbComponent,
  VoiceButtonComponent
}) => {
  const greetings = [
    "Hello!",
    "How can I help you today?",
    "Ready to listen...",
    "Ask me anything.",
    "Connecting lives, voice to voice.",
    "Need to open an app or lock your screen?"
  ];

  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [greetings.length]);

  const cards = [
    {
      title: 'Open WhatsApp',
      description: 'Instant launch, no extra prompts',
      icon: MessageCircle,
      command: 'Open WhatsApp',
      color: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/20 text-emerald-400 shadow-emerald-950/20 hover:border-emerald-400/40'
    },
    {
      title: 'Play YouTube',
      description: 'Stream any request instantly',
      icon: Play,
      command: 'Play Kesariya on YouTube',
      color: 'from-red-500/20 via-rose-500/10 to-transparent border-red-500/20 text-red-400 shadow-red-950/20 hover:border-red-400/40'
    },
    {
      title: 'Call Contact',
      description: 'Hands-free voice dialer',
      icon: Phone,
      command: 'Call Rahul',
      color: 'from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/20 text-cyan-400 shadow-cyan-950/20 hover:border-cyan-400/40'
    },
    {
      title: 'Send Message',
      description: 'Dictate custom chat threads',
      icon: Send,
      command: "Send WhatsApp message to Rahul saying I'm reaching soon",
      color: 'from-purple-500/20 via-indigo-500/10 to-transparent border-purple-500/20 text-purple-400 shadow-purple-950/20 hover:border-purple-400/40'
    },
    {
      title: 'Lock Screen',
      description: 'Secure overlay lockdown instantly',
      icon: Lock,
      command: 'Lock screen',
      isDirectLock: true,
      color: 'from-pink-500/20 via-fuchsia-500/10 to-transparent border-pink-500/20 text-pink-400 shadow-pink-950/20 hover:border-pink-400/40'
    }
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 py-2 relative z-10 select-none">
      
      {/* 1. Hero Section */}
      <div className="text-center flex flex-col items-center gap-3">
        {/* Soft neon pulsing badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Advanced Neural System
        </motion.div>

        {/* Shimmering, Typewritten Core Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight select-none flex flex-col items-center gap-1">
          <TypewriterText text={assistantName} />
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="absolute h-12 w-80 bg-cyan-400/10 blur-2xl rounded-full pointer-events-none"
          />
        </h1>

        {/* Subtitle with smooth delayed fade-in */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-xs md:text-sm text-zinc-400 max-w-md font-sans tracking-wide leading-relaxed font-medium"
        >
          Your Intelligent Voice Assistant for Everyday Tasks
        </motion.p>
      </div>

      {/* 2. AI Orb Stage in Center */}
      <div className="relative w-full flex flex-col items-center justify-center py-2 max-w-sm">
        {/* Rotating ring glow effect around the orb */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
            className="w-72 h-72 rounded-full border border-dashed border-cyan-500/10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="w-64 h-64 rounded-full border border-dotted border-purple-500/10 absolute"
          />
          <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-500/5 via-purple-500/5 to-transparent blur-[50px] absolute" />
        </div>

        {/* Orb component */}
        <div className="relative z-10 transform scale-100 sm:scale-105">
          <AssistantOrbComponent appState={appState} emotion={emotion} />
        </div>

        {/* Dynamic sliding vertical greetings */}
        <div className="absolute -bottom-2 inset-x-0 h-10 flex items-center justify-center overflow-hidden pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.p
              key={greetingIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="text-xs md:text-sm font-mono text-cyan-300 font-extrabold tracking-widest text-center"
            >
              {greetings[greetingIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Direct Quick Voice Button Activator */}
      <div className="mt-2 relative z-20">
        <VoiceButtonComponent appState={appState} onClick={onStartVoice} />
      </div>

      {/* 4. Quick Action Cards (Slight lift and glow on hover / touch) */}
      <div className="w-full max-w-4xl px-4 mt-2">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-1">
            <span>•</span> Interactive Shortcuts
          </h3>
          <span className="text-[9px] font-mono text-cyan-400 font-semibold uppercase tracking-wider animate-pulse">Touch to execute</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <motion.button
                key={card.title}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (card.isDirectLock) {
                    onTriggerDirectLock();
                  } else {
                    onTriggerAction(card.command);
                  }
                }}
                className={`p-4 rounded-2xl glass border bg-zinc-950/40 flex flex-col items-start gap-2.5 text-left cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-[0_4px_12px_rgba(0,0,0,0.3)] bg-gradient-to-b ${card.color}`}
                id={`card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {/* Micro shine lines */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl pointer-events-none transform translate-x-4 -translate-y-4" />

                {/* Top Icon with accent */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-current flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-black/60 shadow-md">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Card labels */}
                <div className="flex flex-col gap-0.5 mt-1">
                  <h4 className="text-xs font-mono font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1 select-none">
                    {card.title}
                  </h4>
                  <p className="text-[9px] text-zinc-500 font-sans leading-relaxed select-none">
                    {card.description}
                  </p>
                </div>

                {/* Miniature slide in arrow */}
                <div className="absolute bottom-3 right-3 text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:text-cyan-400 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
