import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Settings, 
  Sun, 
  Moon, 
  Terminal, 
  Bell, 
  User, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  Volume2, 
  Power,
  Key
} from 'lucide-react';
import { AppState } from '../types';

interface HeaderProps {
  appState: AppState;
  onOpenSettings: () => void;
  onOpenLogs: () => void;
  onOpenApiKey?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  assistantName?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  appState, 
  onOpenSettings, 
  onOpenLogs, 
  onOpenApiKey,
  theme, 
  onToggleTheme, 
  assistantName = 'Shivansh AI Agent' 
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(true);

  // Dynamic live clock synchronization
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (appState) {
      case 'connected':
      case 'listening':
      case 'speaking':
      case 'idle':
        return 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
      case 'connecting':
      case 'thinking':
      case 'reconnecting':
        return 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
      case 'error':
        return 'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]';
      case 'disconnected':
      default:
        return 'bg-zinc-500';
    }
  };

  const getStatusText = () => {
    if (appState === 'reconnecting') return 'Reconnecting';
    if (appState === 'connecting') return 'Connecting';
    if (appState === 'thinking') return 'Thinking';
    if (appState === 'error') return 'Error';
    if (appState === 'disconnected') return 'Offline';
    return 'Live';
  };

  const systemAlerts = [
    { id: 1, title: 'Babu AI Online', desc: 'Secure Express proxy connection active.', time: 'Just Now', icon: CheckCircle, color: 'text-emerald-400' },
    { id: 2, title: 'Audio Calibration Complete', desc: 'Synthesizer voice Zephyr initialized successfully.', time: '2m ago', icon: Volume2, color: 'text-purple-400' },
    { id: 3, title: 'Interactive renaming active', desc: 'Change Babu name anytime in Vocal Settings.', time: '10m ago', icon: Sparkles, color: 'text-cyan-400' }
  ];

  return (
    <header className="w-full flex items-center justify-between px-6 py-5 md:px-10 md:py-6 sticky top-0 z-40 bg-transparent">
      {/* Brand Logo Group */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            scale: appState === 'speaking' || appState === 'listening' ? [1, 1.05, 1] : 1,
            rotate: appState === 'thinking' ? [0, 360] : 0
          }}
          transition={{
            duration: appState === 'thinking' ? 3 : 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-11 h-11 glass rounded-2xl flex items-center justify-center shadow-[inner_0_1px_1px_rgba(255,255,255,0.05)] border border-white/5 bg-zinc-950/40 backdrop-blur-md"
        >
          <Bot className="w-6 h-6 text-cyan-400" />
        </motion.div>
        
        <div className="flex flex-col">
          <h1 className="text-xl font-black font-display tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent uppercase flex items-center">
            {assistantName} <span className="text-cyan-400 font-medium font-mono text-[9px] align-super ml-1.5 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">OS v2</span>
          </h1>
          <p className="text-[9px] text-cyan-200/50 font-mono tracking-widest uppercase">
            Professional Voice Assistant
          </p>
        </div>
      </div>

      {/* Latency, Clock, Actions, Profiles Panel */}
      <div className="flex items-center gap-3">
        
        {/* Dynamic Running Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full glass border border-white/5 text-[11px] font-mono text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr || 'Connecting...'}</span>
        </div>

        {/* Latency Meter */}
        {appState !== 'disconnected' && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full glass border border-white/5 text-[11px] font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
            <span className="text-zinc-400">
              Latency: <span className="text-cyan-400 font-bold">{appState === 'thinking' ? '315ms' : '48ms'}</span>
            </span>
          </div>
        )}

        {/* Real-time Connection Strength Signal Bars */}
        <div 
          className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full glass border border-white/5 text-[11px] font-mono relative group"
          title={
            appState === 'connected' || appState === 'listening' || appState === 'speaking' || appState === 'idle'
              ? 'Signal strength: Excellent'
              : appState === 'thinking'
              ? 'Signal strength: Good'
              : appState === 'connecting' || appState === 'reconnecting'
              ? 'Signal strength: Weak/Connecting'
              : 'Signal strength: Disconnected'
          }
        >
          <div className="flex items-end gap-[2px] h-3">
            {[
              { bar: 1, height: 'h-1.5' },
              { bar: 2, height: 'h-2' },
              { bar: 3, height: 'h-2.5' },
              { bar: 4, height: 'h-3.5' }
            ].map((item) => {
              const activeCount = 
                appState === 'connected' || appState === 'listening' || appState === 'speaking' || appState === 'idle'
                  ? 4
                  : appState === 'thinking'
                  ? 3
                  : appState === 'connecting' || appState === 'reconnecting'
                  ? 2
                  : appState === 'error'
                  ? 1
                  : 0;

              const isActive = item.bar <= activeCount;
              const isUnstable = appState === 'connecting' || appState === 'reconnecting' || appState === 'error';

              let barColor = 'bg-zinc-700';
              if (isActive) {
                if (activeCount === 4) barColor = 'bg-emerald-400 shadow-[0_0_6px_#34d399]';
                else if (activeCount === 3) barColor = 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]';
                else if (isUnstable) barColor = 'bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse';
                else barColor = 'bg-rose-500 shadow-[0_0_6px_#f87171]';
              }

              return (
                <div 
                  key={item.bar} 
                  className={`w-[3px] ${item.height} rounded-t transition-all duration-300 ${barColor}`} 
                />
              );
            })}
          </div>
          
          <span className="text-zinc-400">
            Signal: <span className={`font-bold ${
              appState === 'connected' || appState === 'listening' || appState === 'speaking' || appState === 'idle'
                ? 'text-emerald-400'
                : appState === 'thinking'
                ? 'text-cyan-400'
                : appState === 'connecting' || appState === 'reconnecting'
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}>
              {appState === 'connected' || appState === 'listening' || appState === 'speaking' || appState === 'idle'
                ? 'Excellent'
                : appState === 'thinking'
                ? 'Good'
                : appState === 'connecting' || appState === 'reconnecting'
                ? 'Unstable'
                : 'Offline'}
            </span>
          </span>

          {/* Unstable warning float badge alert */}
          {(appState === 'connecting' || appState === 'reconnecting' || appState === 'error') && (
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-md border border-amber-400/20 shadow-lg pointer-events-none animate-bounce">
              Connection Unstable
            </span>
          )}
        </div>

        {/* Glowing Online Connection Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full glass-cyber border border-emerald-500/30 text-[11px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </span>
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
            Online
          </span>
        </div>

        {/* Theme Toggle button */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-full glass border border-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center hover:bg-white/5"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Interactive Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
              setHasNewAlert(false);
            }}
            className="p-2.5 rounded-full glass border border-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center hover:bg-white/5 relative"
            title="System alerts"
          >
            <Bell className="w-4 h-4" />
            {hasNewAlert && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-zinc-950 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  className="absolute right-0 top-12 z-50 glass border border-white/10 rounded-2xl p-4 w-72 shadow-2xl bg-zinc-950/95 backdrop-blur-2xl"
                >
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-zinc-400 border-b border-white/5 pb-2 mb-2.5">
                    <span>System Alerts</span>
                    <span className="text-cyan-400 font-bold">Active logs</span>
                  </div>
                  <div className="space-y-3">
                    {systemAlerts.map((alert) => {
                      const AlertIcon = alert.icon;
                      return (
                        <div key={alert.id} className="flex gap-2.5 items-start">
                          <div className={`p-1.5 rounded-lg bg-white/5 shrink-0 mt-0.5 ${alert.color}`}>
                            <AlertIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-zinc-200 font-bold leading-normal truncate">{alert.title}</p>
                            <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{alert.desc}</p>
                            <span className="text-[8px] font-mono text-zinc-600 block mt-1">{alert.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Logs Terminal button */}
        <button
          onClick={onOpenLogs}
          className="p-2.5 rounded-full glass border border-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center hover:bg-white/5"
          aria-label="System Logs"
          title="System Logs & Terminal"
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* API Key Configuration Button */}
        {onOpenApiKey && (
          <button
            onClick={onOpenApiKey}
            className="p-2.5 rounded-full glass border border-amber-500/25 text-amber-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer flex items-center gap-1.5 px-3 hover:bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
            aria-label="API Key"
            title="Add or manage Gemini API Key"
          >
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px] font-mono font-bold uppercase tracking-wider">API Key</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-full glass border border-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer hover:bg-white/5"
          aria-label="Settings"
          title="Vocal calibration panel"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile avatar card */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="w-9 h-9 rounded-full border border-white/15 hover:border-cyan-400/50 transition-all cursor-pointer flex items-center justify-center overflow-hidden bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 shadow-[0_0_12px_rgba(0,229,255,0.1)] ml-1"
            title="User Profile Profile"
          >
            <User className="w-4 h-4 text-cyan-300" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  className="absolute right-0 top-12 z-50 glass border border-white/10 rounded-2xl p-4 w-60 shadow-2xl bg-zinc-950/95 backdrop-blur-2xl"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full border border-cyan-400/30 bg-cyan-400/5 flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-cyan-300 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Guest Operator</h4>
                      <p className="text-[9px] font-mono text-zinc-500 mt-0.5">Developer Environment</p>
                    </div>
                    
                    <div className="w-full mt-2 pt-2 border-t border-white/5 flex flex-col gap-1.5 text-left text-[10px] font-mono text-zinc-400">
                      <div className="flex justify-between">
                        <span>Terminal node:</span>
                        <span className="text-cyan-400">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Encryption:</span>
                        <span className="text-purple-400">SSL v3</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default Header;
