import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Youtube, 
  Chrome, 
  Sparkles, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Radio, 
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ToolExecutor } from '../services/ToolExecutor';
import { VideoPlaybackState } from '../types';

interface VideoPlayerDockProps {
  onSendVoiceCommand?: (command: string) => void;
}

export const VideoPlayerDock: React.FC<VideoPlayerDockProps> = ({ onSendVoiceCommand }) => {
  const [videoState, setVideoState] = useState<VideoPlaybackState>(ToolExecutor.getVideoState());
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = ToolExecutor.subscribeToVideoState((state) => {
      setVideoState(state);
      if (state.status === 'playing') {
        setIsMinimized(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (videoState.status === 'stopped' && !videoState.videoTitle) {
    return null;
  }

  const handlePlayPause = async () => {
    if (videoState.status === 'playing') {
      await ToolExecutor.pauseVideo();
    } else {
      await ToolExecutor.resumeVideo();
    }
  };

  const handleStop = async () => {
    await ToolExecutor.stopVideo();
  };

  const handleMuteToggle = async () => {
    if (videoState.isMuted) {
      await ToolExecutor.unmuteVideo();
    } else {
      await ToolExecutor.muteVideo();
    }
  };

  const handleOpenExternal = () => {
    if (videoState.url) {
      window.open(videoState.url, '_blank', 'noopener,noreferrer');
    } else {
      ToolExecutor.openChrome(`https://youtube.com/results?search_query=${encodeURIComponent(videoState.videoTitle || 'Bhojpuri and Hindi hit songs')}`);
    }
  };

  // Preset quick intents to verify assistant behavior
  const quickIntents = [
    { label: 'Pawan Singh Bhojpuri', query: 'Chrome par Pawan Singh ke songs chalao' },
    { label: 'Khesari Lal Blast', query: 'Chrome par Khesari Lal Yadav video chalao' },
    { label: 'Arijit Singh Hits', query: 'Chrome par Arijit Singh ke songs chalao' },
    { label: 'Hindi Romantic Songs', query: 'Chrome par Hindi romantic songs chalao' },
    { label: 'Pause Video', query: 'Video pause karo' },
    { label: 'Resume Video', query: 'Video resume karo' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 right-4 sm:right-8 z-40 w-[92vw] sm:w-[380px] md:w-[420px] rounded-2xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.15)] text-slate-100 overflow-hidden font-sans"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-cyan-500/20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <Youtube className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Chrome className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono font-bold text-cyan-300 tracking-wider uppercase truncate">
                CHROME & YOUTUBE PLAYER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleStop}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Close Player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Player Body */}
        <div className="p-3.5 flex flex-col gap-3">
          {/* Video Title & Status */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  videoState.status === 'playing' 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                    : videoState.status === 'paused'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <Radio className={`w-2.5 h-2.5 ${videoState.status === 'playing' ? 'animate-pulse' : ''}`} />
                  {videoState.status.toUpperCase()}
                </span>
                {videoState.isMuted && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    MUTED
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white truncate tracking-tight">
                {videoState.videoTitle || videoState.query || 'Hanuman Chalisa'}
              </h4>
              <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                <span className="text-cyan-300 font-semibold">Pipeline:</span> Voice → React → API → Playwright → Chrome → YouTube
              </p>
            </div>

            <button
              onClick={handleOpenExternal}
              className="p-2 rounded-xl bg-slate-900 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all shrink-0"
              title="Open video in Chrome"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Audio Visualizer Waves (when expanded and playing) */}
          {isExpanded && (
            <div className="h-10 rounded-xl bg-slate-900/80 border border-slate-800/80 p-2 flex items-center justify-between gap-1 overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => {
                const isPlaying = videoState.status === 'playing' && !videoState.isMuted;
                const minH = 15;
                const maxH = isPlaying ? 100 : 20;
                return (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-full bg-gradient-to-t from-cyan-500 via-sky-400 to-blue-500"
                    animate={{
                      height: isPlaying ? [`${20 + (i % 5) * 15}%`, `${80 - (i % 4) * 15}%`, `${30 + (i % 6) * 12}%`] : '15%'
                    }}
                    transition={{
                      duration: 0.4 + (i % 3) * 0.15,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut'
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Main Controls Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              {/* Play / Pause */}
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center transition-all shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95"
                title={videoState.status === 'playing' ? 'Pause Video' : 'Resume / Play Video'}
              >
                {videoState.status === 'playing' ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Stop */}
              <button
                onClick={handleStop}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                title="Stop Video"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Mute / Unmute */}
              <button
                onClick={handleMuteToggle}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                  videoState.isMuted
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                }`}
                title={videoState.isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {videoState.isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Spoken voice feedback pill */}
            <div className="text-right">
              <span className="text-[10px] font-mono text-cyan-400/90 font-bold block">
                "Bilkul, {videoState.videoTitle || 'video'} chala diya."
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                Voice feedback spoken
              </span>
            </div>
          </div>

          {/* Quick Voice Intent Trigger Chips */}
          {isExpanded && onSendVoiceCommand && (
            <div className="pt-2 border-t border-slate-900 flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Quick Test Voice Commands:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickIntents.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendVoiceCommand(item.query)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-sans text-slate-300 hover:text-cyan-200 transition-all text-left truncate cursor-pointer active:scale-95"
                  >
                    "{item.label}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
