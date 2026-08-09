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

  return (
    <div className="relative flex flex-col items-center justify-center my-2">
      {/* Outer Pulse Energy Rings */}
      <div className="relative flex items-center justify-center">
        {/* Animated Radial Equalizer Bars Ring */}
        <div className="absolute inset-[-24px] pointer-events-none flex items-center justify-center">
          {Array.from({ length: 32 }).map((_, i) => {
            const angle = (i / 32) * 360;
            const barHeight = isSpeaking || isListening
              ? Math.max(8, Math.sin(i * 1.5 + Date.now() * 0.01) * 28 * (voiceLevel + 0.5))
              : 6;

            return (
              <div
                key={i}
                className="absolute w-[2px] rounded-full transition-all duration-75"
                style={{
                  height: `${barHeight}px`,
                  transform: `rotate(${angle}deg) translateY(-54px)`,
                  background: isSpeaking
                    ? 'linear-gradient(to top, #c084fc, #e879f9)'
                    : isListening
                    ? 'linear-gradient(to top, #22d3ee, #38bdf8)'
                    : isThinking
                    ? 'linear-gradient(to top, #818cf8, #c084fc)'
                    : 'rgba(56, 189, 248, 0.25)'
                }}
              />
            );
          })}
        </div>

        {/* Pulse Waves */}
        {(isListening || isSpeaking || isThinking) && (
          <>
            <motion.div
              animate={{
                scale: [1, 1.45, 1],
                opacity: [0.6, 0.1, 0.6]
              }}
              transition={{
                duration: isSpeaking ? 1.2 : 2.0,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className={`absolute inset-[-12px] rounded-full blur-md ${
                isSpeaking
                  ? 'bg-gradient-to-r from-purple-500/40 to-fuchsia-500/40'
                  : 'bg-gradient-to-r from-cyan-500/40 to-blue-500/40'
              }`}
            />
            <motion.div
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 0.0, 0.3]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-[-20px] rounded-full border border-cyan-400/30"
            />
          </>
        )}

        {/* Main Voice Interactive Orb Sphere */}
        <button
          onClick={onToggleVoice}
          className={`relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center p-1 transition-all duration-300 cursor-pointer shadow-2xl focus:outline-none ${
            isSpeaking
              ? 'bg-gradient-to-br from-purple-600 via-fuchsia-500 to-indigo-600 shadow-[0_0_40px_rgba(192,132,252,0.6)]'
              : isListening
              ? 'bg-gradient-to-br from-cyan-500 via-sky-400 to-blue-600 shadow-[0_0_40px_rgba(34,211,238,0.6)]'
              : isThinking
              ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 shadow-[0_0_35px_rgba(99,102,241,0.5)] animate-pulse'
              : 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 border border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]'
          }`}
        >
          {/* Internal Holographic Glow Core */}
          <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.25)_0%,transparent_70%)]" />

            {/* Icon State */}
            {isSpeaking ? (
              <Radio className="w-9 h-9 text-purple-200 animate-pulse z-10" />
            ) : isListening ? (
              <Mic className="w-9 h-9 text-cyan-200 animate-bounce z-10" />
            ) : isThinking ? (
              <Sparkles className="w-9 h-9 text-indigo-200 animate-spin z-10" />
            ) : (
              <MicOff className="w-8 h-8 text-zinc-400 group-hover:text-cyan-300 transition-colors z-10" />
            )}

            {/* Label below icon */}
            <span className="text-[10px] font-mono tracking-widest font-bold mt-1 text-zinc-300 uppercase z-10">
              {isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING' : isThinking ? 'THINKING' : 'READY'}
            </span>
          </div>
        </button>
      </div>

      {/* State Status Tag */}
      <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-cyan-500/30 text-xs font-mono">
        <Activity className={`w-3.5 h-3.5 ${isListening ? 'text-cyan-400 animate-pulse' : isSpeaking ? 'text-purple-400 animate-bounce' : 'text-zinc-500'}`} />
        <span className="text-zinc-300">
          ZOYA STATE: <strong className={isSpeaking ? 'text-purple-300' : isListening ? 'text-cyan-300' : 'text-zinc-400'}>{appState.toUpperCase()}</strong>
        </span>
      </div>
    </div>
  );
};
