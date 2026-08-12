import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Sparkles, Radio, Activity } from 'lucide-react';

interface VoiceOrbProps {
  appState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  voiceLevel?: number;
  onToggleVoice: () => void;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  appState,
  voiceLevel = 0.3,
  onToggleVoice
}) => {
  const isListening = appState === 'listening';
  const isSpeaking = appState === 'speaking';
  const isThinking = appState === 'thinking';

  // Number of equalizer bars on each side (left & right)
  const flankBarCount = 20;

  return (
    <div className="relative flex flex-col items-center justify-center my-4 w-full max-w-2xl px-4">
      
      {/* CENTRAL VOICE CORE WITH FLANKING WAVEFORM BARS (MATCHING MOCKUP IMAGE) */}
      <div className="relative flex items-center justify-center w-full">
        
        {/* LEFT WAVEFORM FLANK BARS */}
        <div className="flex-1 flex items-center justify-end gap-1 sm:gap-1.5 pr-3 sm:pr-6 overflow-hidden">
          {Array.from({ length: flankBarCount }).map((_, i) => {
            // Distance index from center (0 closest to center, 19 furthest)
            const idxFromCenter = flankBarCount - 1 - i;
            const factor = Math.max(0.2, 1 - idxFromCenter / flankBarCount);
            
            // Dynamic bar height calculation based on state and voiceLevel
            let barHeight = 6;
            if (isSpeaking || isListening) {
              const sineVal = Math.sin((i * 0.8) + (Date.now() * 0.015));
              barHeight = Math.max(4, Math.abs(sineVal) * 42 * (voiceLevel + 0.4) * factor);
            } else if (isThinking) {
              barHeight = Math.max(4, (Math.sin(i * 0.5 + Date.now() * 0.01) + 1) * 15 * factor);
            } else {
              barHeight = Math.max(3, (Math.sin(i * 0.4) + 1.2) * 6 * factor);
            }

            return (
              <div
                key={`left-bar-${i}`}
                className="w-[2px] sm:w-[3px] rounded-full transition-all duration-75"
                style={{
                  height: `${barHeight}px`,
                  background: isSpeaking
                    ? 'linear-gradient(to top, #c084fc, #e879f9)'
                    : isListening
                    ? 'linear-gradient(to top, #818cf8, #38bdf8)'
                    : 'linear-gradient(to top, rgba(168,85,247,0.4), rgba(56,189,248,0.7))',
                  boxShadow: isListening || isSpeaking ? '0 0 8px rgba(168,85,247,0.6)' : 'none'
                }}
              />
            );
          })}
        </div>

        {/* CENTER GLOWING HOLOGRAPHIC VOICE ORB */}
        <div className="relative flex items-center justify-center shrink-0">
          
          {/* Radial Pulse Energy Field */}
          {(isListening || isSpeaking || isThinking) && (
            <>
              <motion.div
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.7, 0.2, 0.7]
                }}
                transition={{
                  duration: isSpeaking ? 1.0 : 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className={`absolute inset-[-14px] rounded-full blur-md ${
                  isSpeaking
                    ? 'bg-gradient-to-r from-purple-500/50 to-fuchsia-500/50'
                    : 'bg-gradient-to-r from-cyan-500/50 to-indigo-500/50'
                }`}
              />
              <motion.div
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [0.4, 0.0, 0.4]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute inset-[-24px] rounded-full border border-cyan-400/40"
              />
            </>
          )}

          {/* Interactive Mic Orb Circle */}
          <button
            onClick={onToggleVoice}
            className={`relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center p-1 transition-all duration-300 cursor-pointer shadow-2xl focus:outline-none ${
              isSpeaking
                ? 'bg-gradient-to-br from-purple-600 via-fuchsia-500 to-indigo-600 shadow-[0_0_45px_rgba(192,132,252,0.8)]'
                : isListening
                ? 'bg-gradient-to-br from-cyan-500 via-sky-400 to-indigo-600 shadow-[0_0_45px_rgba(34,211,238,0.8)]'
                : isThinking
                ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 shadow-[0_0_35px_rgba(99,102,241,0.6)] animate-pulse'
                : 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-cyan-400/50 hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]'
            }`}
          >
            {/* Inner Glow Sphere & Microphone Icon */}
            <div className="w-full h-full rounded-full bg-black/60 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.3)_0%,transparent_75%)]" />

              {isSpeaking ? (
                <Radio className="w-8 h-8 text-purple-200 animate-pulse z-10" />
              ) : isListening ? (
                <Mic className="w-8 h-8 text-cyan-200 animate-bounce z-10" />
              ) : isThinking ? (
                <Sparkles className="w-8 h-8 text-indigo-200 animate-spin z-10" />
              ) : (
                <MicOff className="w-7 h-7 text-zinc-400 group-hover:text-cyan-300 transition-colors z-10" />
              )}
            </div>
          </button>
        </div>

        {/* RIGHT WAVEFORM FLANK BARS */}
        <div className="flex-1 flex items-center justify-start gap-1 sm:gap-1.5 pl-3 sm:pl-6 overflow-hidden">
          {Array.from({ length: flankBarCount }).map((_, i) => {
            // Distance index from center (0 closest to center, 19 furthest)
            const idxFromCenter = i;
            const factor = Math.max(0.2, 1 - idxFromCenter / flankBarCount);

            // Dynamic bar height calculation based on state and voiceLevel
            let barHeight = 6;
            if (isSpeaking || isListening) {
              const sineVal = Math.sin((i * 0.8) + (Date.now() * 0.015) + 1.5);
              barHeight = Math.max(4, Math.abs(sineVal) * 42 * (voiceLevel + 0.4) * factor);
            } else if (isThinking) {
              barHeight = Math.max(4, (Math.sin(i * 0.5 + Date.now() * 0.01 + 1.2) + 1) * 15 * factor);
            } else {
              barHeight = Math.max(3, (Math.sin(i * 0.4 + 1.0) + 1.2) * 6 * factor);
            }

            return (
              <div
                key={`right-bar-${i}`}
                className="w-[2px] sm:w-[3px] rounded-full transition-all duration-75"
                style={{
                  height: `${barHeight}px`,
                  background: isSpeaking
                    ? 'linear-gradient(to top, #c084fc, #e879f9)'
                    : isListening
                    ? 'linear-gradient(to top, #38bdf8, #818cf8)'
                    : 'linear-gradient(to top, rgba(56,189,248,0.7), rgba(168,85,247,0.4))',
                  boxShadow: isListening || isSpeaking ? '0 0 8px rgba(56,189,248,0.6)' : 'none'
                }}
              />
            );
          })}
        </div>

      </div>

    </div>
  );
};

export default VoiceOrb;
