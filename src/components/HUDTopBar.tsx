import React, { useState, useEffect } from 'react';
import { ShieldCheck, Wifi, Mic, Zap, Cpu, Maximize2, Minimize2, Terminal, Settings } from 'lucide-react';

interface HUDTopBarProps {
  appState: string;
  onOpenSettings: () => void;
  onOpenLogs?: () => void;
  onOpenApiKey?: () => void;
  onToggleSidebar?: () => void;
  onToggleMic?: () => void;
}

export const HUDTopBar: React.FC<HUDTopBarProps> = ({
  appState,
  onOpenSettings,
  onOpenLogs,
  onOpenApiKey,
  onToggleSidebar,
  onToggleMic
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <header className="w-full h-14 px-4 sm:px-6 flex items-center justify-between bg-slate-950/80 border-b border-cyan-500/20 backdrop-blur-2xl relative z-40 shadow-[0_4px_30px_rgba(0,0,0,0.9)] select-none">
      
      {/* LEFT: BRANDING & SYSTEM OPERATING SYSTEM IDENTITY */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
            title="Toggle Sidebar Navigation"
          >
            <Cpu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <div className="w-full h-full rounded-[7px] bg-slate-950 flex items-center justify-center font-mono font-black text-cyan-300 text-xs tracking-tighter">
              S
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-widest text-white font-mono bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                SHIVANSH
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-mono font-bold text-cyan-300 tracking-wider uppercase">
                SYSTEM OS 4.0
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400/90 font-medium">SIR COMMAND CENTER</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER: LIVE DYNAMIC COMPUTER SYSTEM CLOCK & DATE */}
      <div className="hidden md:flex items-center gap-4 px-4 py-1 rounded-xl bg-slate-900/80 border border-cyan-500/20 shadow-inner font-mono">
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-cyan-300 tracking-widest">
            {timeStr || '00:00:00'}
          </span>
          <span className="text-[9px] text-slate-400 tracking-wider uppercase">
            {dateStr || 'LOCAL SYSTEM TIME'}
          </span>
        </div>
      </div>

      {/* RIGHT: REAL-TIME TELEMETRY STATUS & WINDOW CONTROLS */}
      <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
        
        {/* Network & Security Status */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 text-emerald-400" title="Internet Status">
            <Wifi className="w-3.5 h-3.5" />
            <span>Connected</span>
          </div>
          <span className="text-slate-700">|</span>
          <button
            onClick={onToggleMic}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
              appState === 'listening' 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse'
                : appState === 'speaking'
                ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300'
                : appState === 'thinking'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-cyan-400 hover:border-cyan-500/50'
            }`}
            title="Click to Toggle Microphone Listening"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="font-bold">
              {appState === 'listening' ? 'Mic ON (Listening)' : appState === 'speaking' ? 'Mic ON (Speaking)' : 'Mic Enabled'}
            </span>
          </button>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-indigo-400" title="Security Status">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure</span>
          </div>
        </div>

        {/* API Settings Trigger */}
        {onOpenApiKey && (
          <button
            onClick={onOpenApiKey}
            className="p-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            title="Configure API Credentials"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">API</span>
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/20 text-slate-300 hover:text-white hover:bg-cyan-500/10 transition-colors cursor-pointer"
          title="SHIVANSH Settings"
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/20 text-slate-300 hover:text-white hover:bg-cyan-500/10 transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Minimal Desktop Window Decorative Controls (_ □ ✕) */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-slate-400 font-mono text-xs">
          <button className="hover:text-white px-1 transition-colors" title="Minimize">—</button>
          <button className="hover:text-white px-1 transition-colors" title="Maximize">□</button>
          <button className="hover:text-rose-400 px-1 transition-colors" title="Close">✕</button>
        </div>

      </div>

    </header>
  );
};

export default HUDTopBar;
