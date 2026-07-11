import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  UploadCloud, 
  Download, 
  Settings,
  Sparkles,
  Radio,
  ChevronDown
} from 'lucide-react';
import { AppState, VoiceType } from '../types';
import { SUPPORTED_VOICES } from '../utils/constants';

interface BottomControlsProps {
  appState: AppState;
  muted: boolean;
  volume: number;
  currentVoice: VoiceType;
  onToggleMute: () => void;
  onChangeVolume: (val: number) => void;
  onSelectVoice: (voice: VoiceType) => void;
  onStartListening: () => void;
  onStopSession: () => void;
  onToggleKeyboard: () => void;
  onUploadAudio: () => void;
  onDownloadConversation: () => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  appState,
  muted,
  volume,
  currentVoice,
  onToggleMute,
  onChangeVolume,
  onSelectVoice,
  onStartListening,
  onStopSession,
  onToggleKeyboard,
  onUploadAudio,
  onDownloadConversation
}) => {
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [showVolumePopover, setShowVolumePopover] = useState(false);

  const activeVoiceName = SUPPORTED_VOICES.find((v) => v.id === currentVoice)?.name || currentVoice;
  const isActive = appState === 'listening' || appState === 'speaking' || appState === 'thinking';

  return (
    <div className="w-full max-w-3xl px-6 py-4 rounded-3xl glass shadow-[0_24px_64px_rgba(34,229,255,0.1)] flex flex-wrap items-center justify-between gap-4 border border-white/10 relative bg-zinc-950/80 backdrop-blur-2xl">
      {/* 1. Play / Stop Connection Trigger Buttons */}
      <div className="flex items-center gap-2">
        {/* Start Listening */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartListening}
          disabled={isActive}
          className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            isActive
              ? 'bg-zinc-900 text-zinc-600 border border-white/5 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]'
          }`}
          title="Start Live Voice Connection"
        >
          <Play className="w-3.5 h-3.5 fill-black" />
          <span>Listen</span>
        </motion.button>

        {/* Stop Connection */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStopSession}
          disabled={appState === 'disconnected'}
          className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            appState === 'disconnected'
              ? 'bg-zinc-900 text-zinc-600 border border-white/5 cursor-not-allowed'
              : 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
          }`}
          title="Stop Live Session"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop</span>
        </motion.button>
      </div>

      {/* 2. Interactive Audio Mute and Slider Controls */}
      <div className="flex items-center gap-2.5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMute}
          className={`p-3 rounded-2xl transition-all cursor-pointer border ${
            muted
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'glass border-white/5 text-zinc-300 hover:text-white hover:bg-white/5'
          }`}
          title={muted ? 'Unmute Synthesis Audio' : 'Mute Synthesis Audio'}
        >
          {muted ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
        </motion.button>

        {/* Volume popover trigger */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowVolumePopover(!showVolumePopover)}
            className="px-3 py-2.5 rounded-2xl glass border border-white/5 text-zinc-300 hover:text-white cursor-pointer text-xs font-mono font-bold"
          >
            {Math.round(volume * 100)}%
          </motion.button>

          <AnimatePresence>
            {showVolumePopover && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowVolumePopover(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  className="absolute bottom-14 left-0 z-50 glass rounded-2xl p-4 w-40 shadow-2xl flex flex-col gap-2 border border-white/10 bg-zinc-950"
                >
                  <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                    <span>SYNTH VOL</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-zinc-800 h-1 rounded-lg cursor-pointer"
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Utility Tools: Keyboard, Upload Audio, Download Markdown */}
      <div className="flex items-center gap-2">
        {/* Keyboard Input Trigger */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleKeyboard}
          className="p-3 rounded-2xl glass border border-white/5 text-zinc-300 hover:text-white hover:border-cyan-500/20 cursor-pointer transition-all"
          title="Open Text Terminal Keyboard"
        >
          <Keyboard className="w-4 h-4" />
        </motion.button>

        {/* Upload Audio Analysis */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onUploadAudio}
          className="p-3 rounded-2xl glass border border-white/5 text-zinc-300 hover:text-white hover:border-cyan-500/20 cursor-pointer transition-all"
          title="Analyze Custom Audio File"
        >
          <UploadCloud className="w-4 h-4" />
        </motion.button>

        {/* Download Conversation */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDownloadConversation}
          className="p-3 rounded-2xl glass border border-white/5 text-zinc-300 hover:text-white hover:border-cyan-500/20 cursor-pointer transition-all"
          title="Download Markdown Conversation"
        >
          <Download className="w-4 h-4" />
        </motion.button>
      </div>

      {/* 4. Voice selection dropdown inside floating glass controls */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
          className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/25 text-zinc-300 text-xs font-mono font-medium flex items-center gap-2 cursor-pointer hover:border-purple-400/40 transition-all"
        >
          <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>Voice: <span className="text-purple-300 font-bold">{activeVoiceName}</span></span>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${showVoiceDropdown ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {showVoiceDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowVoiceDropdown(false)} />
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="absolute bottom-14 right-0 z-50 glass border border-white/10 rounded-2xl p-2 w-64 shadow-2xl max-h-72 overflow-y-auto bg-zinc-950/95"
              >
                <div className="px-3 py-2 text-[9px] font-mono uppercase tracking-wider text-zinc-500 border-b border-white/5 mb-1.5">
                  Select AI Vocal Profile
                </div>
                {SUPPORTED_VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onSelectVoice(v.id);
                      setShowVoiceDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex flex-col gap-0.5 cursor-pointer transition-all hover:bg-white/5 ${
                      currentVoice === v.id ? 'bg-purple-500/10 text-purple-300' : 'text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{v.name}</span>
                      {currentVoice === v.id && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <span className="text-[9px] text-zinc-500 leading-tight">{v.description}</span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BottomControls;
