import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Cpu, ShieldCheck, Zap, Disc } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing Jarvis Core Network...');

  const steps = [
    { threshold: 10, text: 'Resolving Secure OAuth Ingress Gateway...' },
    { threshold: 25, text: 'Opening Unified Express Port Binding (3000)...' },
    { threshold: 45, text: 'Spinning Up Real-time Gemini Live vocal engine...' },
    { threshold: 65, text: 'Calibrating PCM 16-bit 16000Hz frequency multipliers...' },
    { threshold: 80, text: 'Establishing secure background IndexedDB chat sync...' },
    { threshold: 95, text: 'Loading 60 FPS Three.js liquid-matter neural mesh...' },
    { threshold: 100, text: 'Babu System Calibration Complete. Welcoming User.' }
  ];

  useEffect(() => {
    // Elegant incremental countdown load simulating hardware boot sequences
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }
        
        // Random incremental values
        const nextValue = prev + Math.floor(Math.random() * 8) + 3;
        const boundedValue = Math.min(nextValue, 100);
        
        // Pick corresponding calibration logs text
        const step = steps.find(s => boundedValue <= s.threshold);
        if (step) {
          setCurrentStep(step.text);
        }

        return boundedValue;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] bg-[#02040a] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
    >
      {/* 1. Starfield background inside loader */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.8),rgba(2,4,10,1))] opacity-90" />
      
      {/* Animated Scan Line Sweep */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-cyan-500/10 to-transparent animate-sweep pointer-events-none" />
      
      {/* 2. Interactive holographic neon rings */}
      <div className="relative flex flex-col items-center max-w-lg w-full text-center z-10">
        
        {/* Core rotating hardware loader logo */}
        <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/25"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-2 border-dotted border-purple-500/30"
          />
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400/10 to-purple-500/10 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.15)]"
          >
            <Bot className="w-8 h-8 text-cyan-400" />
          </motion.div>
        </div>

        {/* Brand Display Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1.5"
        >
          <h1 className="text-3xl font-extrabold font-mono tracking-[0.25em] text-white flex items-center justify-center gap-2">
            BABU<span className="text-cyan-400 font-light">AI</span>
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500">
            Professional Voice-to-Voice Assist Terminal
          </p>
        </motion.div>

        {/* Loading progress bars & stats */}
        <div className="w-full mt-12 space-y-6">
          {/* Progress Percent */}
          <div className="flex justify-between items-end font-mono text-xs">
            <span className="text-[10px] text-zinc-500 tracking-wider flex items-center gap-1.5 uppercase">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> Hardware Self-Test
            </span>
            <span className="text-cyan-400 font-extrabold tracking-widest text-sm">
              {progress}%
            </span>
          </div>

          {/* Glowing bar track */}
          <div className="h-1.5 w-full bg-zinc-950 border border-white/5 rounded-full overflow-hidden p-[1px] relative">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)]"
            />
          </div>

          {/* Current action logger */}
          <div className="h-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest leading-relaxed text-center"
              >
                &gt; {currentStep}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Mini diagnostics checklist */}
        <div className="flex items-center justify-center gap-6 mt-10 text-[9px] font-mono text-zinc-600 border-t border-white/5 pt-6 w-full max-w-xs">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SECURE SSL
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> LATENCY &lt; 85MS
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-cyan-400 animate-pulse">
            <Disc className="w-3.5 h-3.5 animate-spin" /> PROXY STABLE
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
