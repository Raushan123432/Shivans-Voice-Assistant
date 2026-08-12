import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mic, 
  MessageSquare, 
  Folder, 
  Monitor, 
  Camera, 
  Settings, 
  History, 
  Brain,
  Sparkles,
  ChevronRight,
  Clock,
  Timer,
  FileText,
  Zap,
  Globe,
  CheckCircle2
} from 'lucide-react';

interface HUDLeftPanelProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenChat: () => void;
  onOpenFiles: () => void;
  onOpenDesktop: () => void;
  onOpenVision: () => void;
  onOpenHistory: () => void;
  onOpenMemory: () => void;
  onOpenSettings: () => void;
  onTriggerCommand?: (command: string) => void;
}

export const HUDLeftPanel: React.FC<HUDLeftPanelProps> = ({
  activeTab,
  onSelectTab,
  onOpenChat,
  onOpenFiles,
  onOpenDesktop,
  onOpenVision,
  onOpenHistory,
  onOpenMemory,
  onOpenSettings,
  onTriggerCommand
}) => {
  const [executedId, setExecutedId] = useState<string | null>(null);

  const modules = [
    { id: 'voice', label: 'Voice Control', icon: Mic, color: 'from-cyan-500 to-blue-600', onClick: () => onSelectTab('voice'), badge: 'LIVE' },
    { id: 'chat', label: 'Chat Interface', icon: MessageSquare, color: 'from-purple-500 to-indigo-600', onClick: onOpenChat, badge: 'AI' },
    { id: 'files', label: 'Files Explorer', icon: Folder, color: 'from-emerald-500 to-teal-600', onClick: onOpenFiles, badge: 'FS' },
    { id: 'desktop', label: 'Desktop Control', icon: Monitor, color: 'from-amber-500 to-orange-600', onClick: onOpenDesktop, badge: 'HUD' },
    { id: 'vision', label: 'Vision Analyzer', icon: Camera, color: 'from-fuchsia-500 to-rose-600', onClick: onOpenVision, badge: 'CAM' },
    { id: 'history', label: 'History & Logs', icon: History, color: 'from-sky-500 to-cyan-600', onClick: onOpenHistory },
    { id: 'memory', label: 'Neural Memory', icon: Brain, color: 'from-violet-500 to-purple-600', onClick: onOpenMemory },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'from-zinc-500 to-zinc-700', onClick: onOpenSettings }
  ];

  const quickActions = [
    {
      id: 'time',
      label: 'What time is it?',
      sub: 'Check current time',
      command: 'What time is it right now?',
      icon: Clock,
      color: 'from-cyan-400 to-blue-500',
      badge: 'TIME'
    },
    {
      id: 'timer',
      label: 'Set a 10m timer',
      sub: 'Quick 10-min countdown',
      command: 'Set a timer for 10 minutes',
      icon: Timer,
      color: 'from-amber-400 to-orange-500',
      badge: 'TIMER'
    },
    {
      id: 'note',
      label: 'Create a note',
      sub: 'Quick memo entry',
      command: 'Create a new note for today',
      icon: FileText,
      color: 'from-emerald-400 to-teal-500',
      badge: 'NOTE'
    },
    {
      id: 'screen',
      label: "What's on screen?",
      sub: 'Visual context scan',
      command: 'What is on my screen right now?',
      icon: Monitor,
      color: 'from-purple-400 to-indigo-500',
      badge: 'SCAN'
    },
    {
      id: 'lang',
      label: 'Switch to Hindi',
      sub: 'Multilingual mode',
      command: 'Switch to Hindi mode and greet me in Hindi',
      icon: Globe,
      color: 'from-fuchsia-400 to-rose-500',
      badge: 'LANG'
    },
    {
      id: 'fact',
      label: 'Tell an AI fact',
      sub: 'Trivia & insights',
      command: 'Tell me a fascinating fact about AI technology',
      icon: Sparkles,
      color: 'from-pink-400 to-purple-500',
      badge: 'FACT'
    }
  ];

  const handleActionClick = (id: string, command: string) => {
    setExecutedId(id);
    setTimeout(() => setExecutedId(null), 1800);
    if (onTriggerCommand) {
      onTriggerCommand(command);
    }
  };

  return (
    <motion.aside 
      initial={{ opacity: 0, x: -25 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full lg:w-64 flex flex-col gap-4 relative z-30 shrink-0"
    >
      {/* 1. System Modules Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-cyan-500/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
              SYSTEM MODULES
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500">v2.4</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          {modules.map((act) => {
            const Icon = act.icon;
            const isActive = activeTab === act.id;

            return (
              <motion.button
                key={act.id}
                whileHover={{ scale: 1.02, x: 5, boxShadow: '0 0 20px rgba(6,182,212,0.25)' }}
                whileTap={{ scale: 0.97 }}
                onClick={act.onClick}
                className={`relative group w-full p-2.5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer overflow-hidden backdrop-blur-xl ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 via-zinc-900/90 to-purple-950/80 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'bg-zinc-950/60 border-cyan-500/15 hover:border-cyan-400/50 hover:bg-zinc-900/80'
                }`}
              >
                {/* Left Accent Glow Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${act.color} opacity-80 group-hover:opacity-100 transition-opacity`} />

                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-xl bg-gradient-to-br ${act.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-zinc-100 group-hover:text-cyan-200 transition-colors">
                      {act.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {act.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/30 text-[9px] font-mono font-bold text-cyan-300">
                      {act.badge}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* 2. Quick Voice Actions Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex flex-col gap-2 pt-2 border-t border-cyan-500/20"
      >
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-purple-500/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-purple-300 uppercase">
              QUICK ACTIONS
            </span>
          </div>
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            TAP COMMAND
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            const isJustExecuted = executedId === qa.id;

            return (
              <motion.button
                key={qa.id}
                whileHover={{ scale: 1.02, x: 4, boxShadow: '0 0 20px rgba(168,85,247,0.25)' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleActionClick(qa.id, qa.command)}
                className={`relative group w-full p-2.5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer overflow-hidden backdrop-blur-2xl ${
                  isJustExecuted
                    ? 'bg-emerald-950/80 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                    : 'bg-zinc-950/40 hover:bg-zinc-900/60 border-purple-500/20 hover:border-purple-400/60 shadow-lg shadow-purple-950/20'
                }`}
              >
                {/* Glass reflection gradient highlight */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Left Accent Color bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${qa.color} opacity-80 group-hover:opacity-100 transition-opacity`} />

                <div className="flex items-center gap-2.5 relative z-10 min-w-0">
                  <div className={`p-1.5 rounded-xl bg-gradient-to-br ${qa.color} text-white shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
                    {isJustExecuted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-mono font-bold text-zinc-100 group-hover:text-purple-200 transition-colors truncate">
                      {qa.label}
                    </span>
                    <span className="text-[9.5px] font-mono text-zinc-400 truncate">
                      {isJustExecuted ? 'Command Sent!' : qa.sub}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 relative z-10">
                  <span className={`px-1.5 py-0.5 rounded-md text-[8.5px] font-mono font-bold transition-colors ${
                    isJustExecuted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-purple-500/10 border border-purple-500/20 text-purple-300 group-hover:border-purple-400/40'
                  }`}>
                    {isJustExecuted ? 'SENT' : qa.badge}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.aside>
  );
};

