import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, BatteryCharging, Wifi, Sparkles, Volume2, Settings, Terminal, Zap } from 'lucide-react';

interface HUDTopBarProps {
  appState: string;
  onOpenSettings: () => void;
  onOpenLogs: () => void;
  onOpenApiKey: () => void;
}

export const HUDTopBar: React.FC<HUDTopBarProps> = ({
  appState,
  onOpenSettings,
  onOpenLogs,
  onOpenApiKey
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: '2-digit' }) + ' (IST)');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full h-16 px-4 sm:px-6 flex items-center justify-between bg-zinc-950/70 border-b border-cyan-500/20 backdrop-blur-xl relative z-40 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      {/* Left: AI Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="relative group flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-indigo-600 p-[1px] shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <div className="w-full h-full rounded-[11px] bg-zinc-950 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute -inset-1 rounded-xl bg-cyan-400/20 blur-md group-hover:bg-cyan-400/40 transition-all pointer-events-none" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider text-white font-mono bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              SHIVANS AI
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300">
              GENTLEMAN 3D
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ● ONLINE
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-cyan-300 font-medium">DEV: ROUSHAN KUMAR</span>
          </div>
        </div>
      </div>

      {/* Middle: Live Clock & Date HUD display */}
      <div className="hidden md:flex flex-col items-center justify-center px-4 py-1.5 rounded-xl bg-zinc-900/60 border border-cyan-500/20 shadow-inner">
        <div className="text-sm font-mono font-bold text-cyan-300 tracking-widest">
          {timeStr || '12:00:00'}
        </div>
        <div className="text-[10px] font-mono text-zinc-400 tracking-wider uppercase">
          {dateStr || 'MON JAN 01'}
        </div>
      </div>

      {/* Right: Telemetry Indicators & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Battery & System Health Widget */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-purple-500/30 text-xs font-mono">
          <div className="flex items-center gap-1 text-emerald-400">
            <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-bold">98%</span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-1 text-cyan-400">
            <Wifi className="w-3.5 h-3.5" />
            <span>5G</span>
          </div>
        </div>

        {/* API Key Button */}
        <button
          onClick={onOpenApiKey}
          className="p-2.5 rounded-xl bg-zinc-900/80 border border-amber-500/30 text-amber-300 hover:border-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer flex items-center gap-1 text-xs font-mono font-bold"
          title="Configure API Keys"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="hidden lg:inline">API</span>
        </button>

        {/* Terminal Logs */}
        <button
          onClick={onOpenLogs}
          className="p-2.5 rounded-xl bg-zinc-900/80 border border-purple-500/30 text-purple-300 hover:border-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer flex items-center gap-1 text-xs font-mono font-bold"
          title="System Logs"
        >
          <Terminal className="w-4 h-4 text-purple-400" />
          <span className="hidden lg:inline">LOGS</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl bg-zinc-900/80 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all cursor-pointer flex items-center gap-1 text-xs font-mono font-bold"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="hidden lg:inline">SETTINGS</span>
        </button>
      </div>
    </header>
  );
};
