import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ExternalLink,
  Youtube,
  Globe,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  X,
  Minimize2,
  Maximize2,
  ShieldCheck,
  Radio,
  Tv,
  Search,
  Sparkles,
  RefreshCw,
  Monitor
} from 'lucide-react';
import { SecondScreenManager, YOUTUBE_PRESETS } from '../services/SecondScreenManager';
import { SecondScreenState } from '../types';

interface SecondScreenWindowProps {
  onVoiceCommandTrigger?: (cmd: string) => void;
}

export const SecondScreenWindow: React.FC<SecondScreenWindowProps> = ({ onVoiceCommandTrigger }) => {
  const [state, setState] = useState<SecondScreenState>(SecondScreenManager.getState());
  const [customInput, setCustomInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const unsubscribe = SecondScreenManager.subscribe((newState) => {
      setState(newState);
      setIsMinimized(newState.isMinimized);
      setIsMaximized(newState.isMaximized);
    });
    return () => unsubscribe();
  }, []);

  if (!state.isOpen) {
    return null;
  }

  const handlePlayPause = async () => {
    if (state.playbackStatus === 'playing') {
      await SecondScreenManager.pauseVideo();
    } else {
      await SecondScreenManager.resumeVideo();
    }
  };

  const handleMuteToggle = async () => {
    if (state.isMuted) {
      await SecondScreenManager.unmuteVideo();
    } else {
      await SecondScreenManager.muteVideo();
    }
  };

  const handleNext = async () => {
    await SecondScreenManager.nextVideo();
  };

  const handleClose = async () => {
    await SecondScreenManager.closeSecondScreen();
  };

  const handlePopout = () => {
    SecondScreenManager.popoutExternalWindow();
  };

  const handleCustomNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    SecondScreenManager.openWhitelistedWebsite(customInput.trim());
    setCustomInput('');
  };

  const quickVoiceButtons = [
    { label: 'Bhojpuri Hits (Pawan Singh)', cmd: 'YouTube par Pawan Singh ka gana chalao' },
    { label: 'Khesari Lal Blast', cmd: 'YouTube par Khesari Lal Yadav video chalao' },
    { label: 'Shilpi Raj Songs', cmd: 'YouTube par Shilpi Raj ka gana chalao' },
    { label: 'Arijit Singh Hits', cmd: 'Shivans AI, YouTube par Arijit Singh ka song chalao' },
    { label: 'Hindi Romantic Hits', cmd: 'YouTube par Hindi romantic song chalao' },
    { label: 'Bhojpuri DJ Remix', cmd: 'YouTube par Bhojpuri DJ gana chalao' },
    { label: 'Google Search', cmd: 'Chrome par Google kholo' },
    { label: 'Pause Video', cmd: 'Video pause karo' },
    { label: 'Resume Video', cmd: 'Video chalu karo' },
    { label: 'Mute', cmd: 'Video mute karo' },
    { label: 'Unmute', cmd: 'Video ki awaaz on karo' },
    { label: 'Next Track', cmd: 'Agla video chalao' },
    { label: 'Close Screen', cmd: 'YouTube band karo' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        id="shivans-second-screen-window"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          height: isMinimized ? '48px' : isMaximized ? '90vh' : '440px',
          width: isMaximized ? '92vw' : '460px'
        }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className={`fixed ${
          isMaximized 
            ? 'top-8 left-1/2 -translate-x-1/2 z-50' 
            : 'bottom-20 right-4 sm:right-8 z-50'
        } max-w-[96vw] rounded-2xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.2)] text-slate-100 flex flex-col overflow-hidden font-sans`}
      >
        {/* Window Titlebar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-cyan-500/30 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded-lg border ${
              state.mode === 'youtube' 
                ? 'bg-red-500/15 border-red-500/30 text-red-400' 
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
            }`}>
              {state.mode === 'youtube' ? <Youtube className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            </div>
            
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider truncate">
                  {state.mode === 'youtube' ? 'SECOND SCREEN — YOUTUBE' : 'SECOND SCREEN — BROWSER'}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Radio className={`w-2 h-2 ${state.playbackStatus === 'playing' ? 'animate-ping' : ''}`} />
                  SYNCED
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-[260px]">
                {state.title || state.url}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-second-screen-popout"
              onClick={handlePopout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
              title="Open on Second Monitor Window"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-second-screen-minimize"
              onClick={() => {
                const next = !isMinimized;
                setIsMinimized(next);
                if (next) SecondScreenManager.minimizeWindow();
                else SecondScreenManager.restoreWindow();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMinimized ? 'Restore' : 'Minimize'}
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-second-screen-maximize"
              onClick={() => {
                const next = !isMaximized;
                setIsMaximized(next);
                if (next) SecondScreenManager.maximizeWindow();
                else SecondScreenManager.restoreWindow();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMaximized ? 'Restore Size' : 'Maximize'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-second-screen-close"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Close Second Screen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Window Content */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col min-h-0 p-3 gap-2.5 overflow-hidden">
            {/* Embedded Display or Safe Sandbox Frame */}
            <div className="relative flex-1 min-h-[160px] bg-slate-900/90 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {state.mode === 'youtube' && state.videoId ? (
                <iframe
                  id="second-screen-youtube-player"
                  src={`https://www.youtube-nocookie.com/embed/${state.videoId}?autoplay=1&enablejsapi=1&mute=${state.isMuted ? 1 : 0}`}
                  title={state.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Globe className="w-10 h-10 text-cyan-400/60 mb-2 animate-pulse" />
                  <p className="text-sm font-semibold text-slate-200">{state.title || 'Browsing Destination'}</p>
                  <p className="text-xs font-mono text-cyan-400/80 mt-1 max-w-[320px] truncate">{state.url}</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => window.open(state.url, '_blank', 'noopener,noreferrer')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-medium border border-cyan-500/40 flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Full Tab
                    </button>
                  </div>
                </div>
              )}

              {/* Live Overlay Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700/80 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 backdrop-blur-md">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Domain Whitelisted</span>
              </div>
            </div>

            {/* Playback Controls & Status Strip */}
            <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-second-screen-play-pause"
                  onClick={handlePlayPause}
                  className={`p-2 rounded-lg transition-all ${
                    state.playbackStatus === 'playing'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                  title={state.playbackStatus === 'playing' ? 'Pause (Video pause karo)' : 'Play (Video chalu karo)'}
                >
                  {state.playbackStatus === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  id="btn-second-screen-mute"
                  onClick={handleMuteToggle}
                  className={`p-2 rounded-lg border transition-all ${
                    state.isMuted
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title={state.isMuted ? 'Unmute (Video ki awaaz on karo)' : 'Mute (Video mute karo)'}
                >
                  {state.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  id="btn-second-screen-next"
                  onClick={handleNext}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
                  title="Next Video (Agla video chalao)"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right min-w-0 flex-1 px-2">
                <p className="text-[11px] font-medium text-slate-200 truncate">{state.title}</p>
                <p className="text-[9px] font-mono text-cyan-400 uppercase">
                  Status: {state.playbackStatus} {state.isMuted ? '| MUTED' : ''}
                </p>
              </div>
            </div>

            {/* Interactive Voice Command Trigger Pills */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Voice Control Testing Bar:
                </span>
                <span>Click pill to simulate voice command</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {quickVoiceButtons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => {
                      if (onVoiceCommandTrigger) {
                        onVoiceCommandTrigger(btn.cmd);
                      } else {
                        // Direct action fallback
                        if (btn.cmd.includes('Pawan')) SecondScreenManager.playYouTubeVideo('Pawan Singh Bhojpuri song');
                        else if (btn.cmd.includes('Khesari')) SecondScreenManager.playYouTubeVideo('Khesari Lal Yadav video');
                        else if (btn.cmd.includes('Shilpi')) SecondScreenManager.playYouTubeVideo('Shilpi Raj Bhojpuri song');
                        else if (btn.cmd.includes('Arijit')) SecondScreenManager.playYouTubeVideo('Arijit Singh song');
                        else if (btn.cmd.includes('romantic')) SecondScreenManager.playYouTubeVideo('Hindi romantic song');
                        else if (btn.cmd.includes('DJ')) SecondScreenManager.playYouTubeVideo('Bhojpuri DJ gana');
                        else if (btn.cmd.includes('Google')) SecondScreenManager.openWhitelistedWebsite('https://www.google.com');
                        else if (btn.cmd.includes('pause')) SecondScreenManager.pauseVideo();
                        else if (btn.cmd.includes('chalu')) SecondScreenManager.resumeVideo();
                        else if (btn.cmd.includes('mute karo')) SecondScreenManager.muteVideo();
                        else if (btn.cmd.includes('awaaz on')) SecondScreenManager.unmuteVideo();
                        else if (btn.cmd.includes('Agla')) SecondScreenManager.nextVideo();
                        else if (btn.cmd.includes('band')) SecondScreenManager.closeSecondScreen();
                      }
                    }}
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium whitespace-nowrap bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-all flex-shrink-0"
                  >
                    "{btn.label}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
