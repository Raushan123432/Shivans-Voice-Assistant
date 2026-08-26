import React, { useState } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, Play, Search, ShieldCheck, 
  Zap, AlertTriangle, X, RotateCcw, Info, Heart, Smile, Activity
} from 'lucide-react';
import { JarvisCore } from './3d/JarvisCore';
import { AppState } from '../types';
import { UserEmotion } from '../utils/emotionDetector';

interface JarvisMainDashboardProps {
  appState: AppState;
  transcript?: string;
  errorMessage?: string | null;
  emotion?: UserEmotion;
  clapEnabled?: boolean;
  clapNotice?: string | null;
  onStartSession: () => void;
  onStopSession: () => void;
  onClearError?: () => void;
  onRetryMic?: () => void;
  muted: boolean;
  onToggleMute: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  onExecuteVoiceCommand?: (cmd: string) => void;
}

export const JarvisMainDashboard: React.FC<JarvisMainDashboardProps> = ({
  appState,
  transcript,
  errorMessage,
  emotion = 'Calm',
  clapEnabled = true,
  clapNotice,
  onStartSession,
  onStopSession,
  onClearError,
  onRetryMic,
  muted,
  onToggleMute,
  volume,
  onChangeVolume,
  onExecuteVoiceCommand
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [showMicHelp, setShowMicHelp] = useState(false);

  const getStatusText = () => {
    switch (appState) {
      case 'clap_detected': return '👏 CLAP DETECTED!';
      case 'listening': return 'LISTENING...';
      case 'thinking': return 'THINKING...';
      case 'speaking': return 'SPEAKING...';
      case 'sleeping': return 'STANDBY • SLEEPING';
      case 'error': return 'SYSTEM WARNING';
      default: return 'ONLINE • READY';
    }
  };

  const getStatusSubtext = () => {
    switch (appState) {
      case 'clap_detected': return 'Acoustic transient verified. Waking Shivansh...';
      case 'listening': return 'Capturing acoustic input, sir...';
      case 'thinking': return 'Processing cognitive reasoning...';
      case 'speaking': return 'Shivansh emotional voice synthesis active...';
      case 'sleeping': return 'Clap your hands or speak "Shivansh" to wake.';
      default: return clapEnabled 
        ? 'Awaiting your voice command or 👏 clap...' 
        : 'Awaiting your voice command, sir.';
    }
  };

  const getEmotionColor = () => {
    switch (emotion) {
      case 'Happy': return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40';
      case 'Sad': return 'text-sky-300 bg-sky-500/15 border-sky-500/40';
      case 'Angry': return 'text-rose-300 bg-rose-500/15 border-rose-500/40';
      case 'Excited': return 'text-amber-300 bg-amber-500/15 border-amber-500/40';
      case 'Confused': return 'text-violet-300 bg-violet-500/15 border-violet-500/40';
      case 'Tired': return 'text-indigo-300 bg-indigo-500/15 border-indigo-500/40';
      case 'Joking': return 'text-pink-300 bg-pink-500/15 border-pink-500/40';
      case 'Serious': return 'text-cyan-300 bg-cyan-500/15 border-cyan-500/40';
      default: return 'text-teal-300 bg-teal-500/15 border-teal-500/40';
    }
  };

  const quickCommands = [
    'Shivans AI, Chrome par Hanuman Chalisa chalao',
    'Shivansh, time batao',
    'Aaj mera mood thoda kharab hai',
    'Chrome me YouTube par Arijit Singh ka song chalao',
    'Video pause karo',
    'Video resume karo',
    'Set a timer for 10 minutes',
    'Take a screenshot',
    'Show PC system info',
    'Open VS Code'
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between items-center relative overflow-hidden select-none p-4 sm:p-6 font-sans">
      
      {/* Top Center Status Banner, Emotion Badge & Notice Alert */}
      <div className="flex flex-col items-center gap-2 z-20 mt-1 max-w-lg w-full">
        
        <div className="flex items-center gap-2">
          {/* Main State Pill */}
          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className={`w-2 h-2 rounded-full ${
              appState === 'clap_detected' ? 'bg-amber-300 animate-ping' :
              appState === 'listening' ? 'bg-cyan-400 animate-ping' :
              appState === 'thinking' ? 'bg-amber-400 animate-pulse' :
              appState === 'speaking' ? 'bg-fuchsia-400 animate-ping' :
              'bg-emerald-400'
            }`} />
            <span>{getStatusText()}</span>
          </div>

          {/* Emotion Badge */}
          <div className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md transition-all ${getEmotionColor()}`}>
            <Heart className="w-3 h-3 animate-pulse" />
            <span>Mood: {emotion}</span>
          </div>

          {/* Clap-to-talk indicator */}
          {clapEnabled && (
            <div className="px-2 py-1 rounded-full bg-slate-900 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1">
              <span>👏 Clap Wake ON</span>
            </div>
          )}
        </div>

        {/* Transient Clap Trigger Notice */}
        {clapNotice && (
          <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 font-mono text-xs font-bold animate-bounce shadow-2xl flex items-center gap-2">
            <span>👏</span>
            <span>{clapNotice}</span>
          </div>
        )}

        {/* Microphone / Connection Error Warning Banner */}
        {errorMessage && (
          <div className="w-full p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-mono shadow-xl backdrop-blur-md flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                <span>AUDIO NOTICE</span>
              </div>
              {onClearError && (
                <button
                  onClick={onClearError}
                  className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-[11px] leading-relaxed text-amber-100/90">
              {errorMessage}
            </p>

            <div className="flex items-center gap-2 pt-1">
              {onRetryMic && (
                <button
                  onClick={onRetryMic}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry Microphone</span>
                </button>
              )}
              <button
                onClick={() => setShowMicHelp(!showMicHelp)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Info className="w-3 h-3 text-cyan-400" />
                <span>Mic Help</span>
              </button>
            </div>

            {showMicHelp && (
              <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[10px] font-sans text-slate-300 space-y-1 mt-1">
                <p className="font-bold text-cyan-300 font-mono uppercase">How to enable Microphone access:</p>
                <p>1. Click the lock / settings icon on the browser address bar.</p>
                <p>2. Set <b>Microphone</b> permission to <b>Allow</b>.</p>
                <p>3. Click "Retry Microphone" above or refresh the page.</p>
                <p className="text-slate-400 italic mt-1">Note: You can still click any quick command or use text chat even if microphone is disabled!</p>
              </div>
            )}
          </div>
        )}
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
          <p className="text-[11px] font-mono text-slate-300 max-w-xs mt-2 transition-all">
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
