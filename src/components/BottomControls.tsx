import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, MicOff, RefreshCw, Radio, Sparkles, ChevronDown } from 'lucide-react';
import { AppState, VoiceType } from '../types';
import { SUPPORTED_VOICES } from '../utils/constants';

interface BottomControlsProps {
  appState: AppState;
  muted: boolean;
  volume: number;
  currentVoice: VoiceType;
  onToggleMute: () => void;
  onChangeVolume: (val: number) => void;
  onReconnect: () => void;
  onSelectVoice: (voice: VoiceType) => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  appState,
  muted,
  volume,
  currentVoice,
  onToggleMute,
  onChangeVolume,
  onReconnect,
  onSelectVoice
}) => {
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [showVolumePopover, setShowVolumePopover] = useState(false);

  const activeVoiceName = SUPPORTED_VOICES.find((v) => v.id === currentVoice)?.name || currentVoice;

  return (
    <div className="w-full max-w-2xl px-6 py-4 rounded-3xl glass shadow-[0_8px_32px_rgba(139,92,246,0.15)] flex items-center justify-between relative">
      
      {/* 1. Mute/Unmute speaker audio button */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMute}
          className={`p-3 rounded-2xl transition-all cursor-pointer ${
            muted
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              : 'glass text-zinc-400 hover:text-white'
          }`}
          title={muted ? 'Unmute Speaker' : 'Mute Speaker'}
        >
          {muted ? <VolumeX className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
        </motion.button>

        {/* Dynamic Volume adjustment slider popover trigger */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowVolumePopover(!showVolumePopover)}
            className="p-3 rounded-2xl glass text-zinc-400 hover:text-white cursor-pointer transition-all text-xs font-mono font-bold"
          >
            {Math.round(volume * 100)}%
          </motion.button>

          <AnimatePresence>
            {showVolumePopover && (
              <>
                {/* Backdrop click shield to close */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowVolumePopover(false)} 
                />
                
                {/* Visual Volume Slider Container */}
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute bottom-16 left-0 z-50 glass rounded-2xl p-4 w-40 shadow-2xl flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                    <span>Volume</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Custom Voice Personality selection Dropdown selector */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-purple-500/15 via-fuchsia-500/5 to-indigo-500/15 border border-purple-500/25 text-zinc-200 text-xs font-mono font-medium flex items-center gap-2 cursor-pointer shadow-inner hover:border-purple-400/50 transition-all"
        >
          <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>Babu Voice: <span className="text-purple-400 font-bold">{activeVoiceName}</span></span>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${showVoiceDropdown ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {showVoiceDropdown && (
            <>
              {/* Backdrop Click Shield */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowVoiceDropdown(false)} 
              />
              
              {/* Voice Choice List Card */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute bottom-16 right-0 z-50 glass rounded-2xl p-2 w-64 shadow-2xl max-h-72 overflow-y-auto"
              >
                <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 border-b border-white/5 mb-1">
                  Select AI Vocal Model
                </div>
                {SUPPORTED_VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onSelectVoice(v.id);
                      setShowVoiceDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex flex-col gap-0.5 cursor-pointer transition-all hover:bg-white/5 ${
                      currentVoice === v.id ? 'bg-purple-500/10 text-purple-400' : 'text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{v.name}</span>
                      {currentVoice === v.id && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <span className="text-[10px] text-zinc-500 leading-tight">{v.description}</span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Session Reconnect option */}
      <div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={onReconnect}
          className={`p-3 rounded-2xl glass text-zinc-400 hover:text-white cursor-pointer transition-all flex items-center gap-2 text-xs font-mono font-bold ${
            appState === 'reconnecting' ? 'animate-spin' : ''
          }`}
          title="Reconnect Live Session"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="hidden sm:inline">Reset</span>
        </motion.button>
      </div>

    </div>
  );
};

export default BottomControls;
