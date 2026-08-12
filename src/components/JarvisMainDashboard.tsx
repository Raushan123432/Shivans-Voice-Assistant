import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Play, Search, ShieldCheck, Zap } from 'lucide-react';
import { JarvisCore } from './3d/JarvisCore';
import { AppState } from '../types';

interface JarvisMainDashboardProps {
  appState: AppState;
  transcript?: string;
  onStartSession: () => void;
  onStopSession: () => void;
  muted: boolean;
  onToggleMute: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  onExecuteVoiceCommand?: (cmd: string) => void;
}

export const JarvisMainDashboard: React.FC<JarvisMainDashboardProps> = ({
  appState,
  transcript,
  onStartSession,
  onStopSession,
  muted,
  onToggleMute,
  volume,
  onChangeVolume,
  onExecuteVoiceCommand
}) => {
  const [isHolding, setIsHolding] = useState(false);

  const getStatusText = () => {
    switch (appState) {
      case 'listening': return 'LISTENING...';
      case 'thinking': return 'THINKING...';
      case 'speaking': return 'SPEAKING...';
      case 'error': return 'SYSTEM WARNING';
      default: return 'ONLINE • READY';
    }
  };

  const getStatusSubtext = () => {
    switch (appState) {
      case 'listening': return 'Capturing acoustic input, sir...';
      case 'thinking': return 'Processing cognitive reasoning...';
      case 'speaking': return 'Shivansh vocal synthesis active...';
      default: return 'Awaiting your voice command, sir.';
    }
  };

  const quickCommands = [
    'Shivansh, open WhatsApp',
    "Shivansh, search today's weather",
    'Shivansh, open Chrome',
    'Shivansh, find my resume',
    'Shivansh, open VS Code',
    'Shivansh, launch Spotify'
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between items-center relative overflow-hidden select-none p-4 sm:p-6 font-sans">
      
      {/* Top Center Status Banner */}
      <div className="flex flex-col items-center gap-1 z-20 mt-2">
        <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <span className={`w-2 h-2 rounded-full ${
            appState === 'listening' ? 'bg-cyan-400 animate-ping' :
            appState === 'thinking' ? 'bg-amber-400 animate-pulse' :
            appState === 'speaking' ? 'bg-fuchsia-400 animate-ping' :
            'bg-emerald-400'
          }`} />
          <span>{getStatusText()}</span>
        </div>
      </div>

      {/* CENTER HOLOGRAPHIC AI CORE */}
      <div className="relative w-full max-w-xl h-[360px] sm:h-[420px] flex items-center justify-center z-10 my-auto">
        <JarvisCore appState={appState} voiceLevel={appState === 'listening' || appState === 'speaking' ? 0.7 : 0.3} />

        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-white font-mono bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]">
            SHIVANSH
          </h1>
          <p className="text-xs sm:text-sm font-mono text-cyan-300 tracking-wider uppercase mt-1 drop-shadow-md">
            {getStatusText()}
          </p>
          <p className="text-[11px] font-mono text-slate-400 max-w-xs mt-2 transition-all">
            {transcript ? `"${transcript}"` : getStatusSubtext()}
          </p>
        </div>
      </div>

      {/* BOTTOM CENTER VOICE CONTROLS & QUICK COMMAND CHIPS */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-4 z-20 mb-2">
        
        {/* Quick Voice Command Chips */}
        <div className="w-full flex items-center justify-center gap-2 flex-wrap">
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => onExecuteVoiceCommand && onExecuteVoiceCommand(cmd)}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/20 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 font-mono text-[11px] transition-all cursor-pointer backdrop-blur-md shadow-md flex items-center gap-1.5 group"
            >
              <Sparkles className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>"{cmd}"</span>
            </button>
          ))}
        </div>

        {/* Primary Microphone Core Control */}
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl">
          
          {/* Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              muted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={muted ? 'Unmute Audio Output' : 'Mute Audio Output'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Main Voice Activation Button */}
          <button
            onClick={appState === 'listening' || appState === 'speaking' ? onStopSession : onStartSession}
            onMouseDown={() => { setIsHolding(true); if (appState === 'idle') onStartSession(); }}
            onMouseUp={() => setIsHolding(false)}
            className={`px-8 py-3.5 rounded-xl font-mono text-xs font-extrabold tracking-widest uppercase flex items-center gap-3 transition-all cursor-pointer shadow-2xl ${
              appState === 'listening' || appState === 'speaking'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white border border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.8)]'
            }`}
          >
            <Mic className="w-5 h-5 animate-bounce" />
            <span>{appState === 'listening' ? 'STOP LISTENING' : 'CLICK OR HOLD TO SPEAK'}</span>
          </button>

          {/* Volume Slider */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-20 accent-cyan-400 cursor-pointer"
              title="Voice Volume"
            />
          </div>

        </div>

      </div>

    </div>
  );
};

export default JarvisMainDashboard;
