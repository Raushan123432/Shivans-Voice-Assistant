import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Settings, 
  History, 
  Brain, 
  Volume2, 
  Globe, 
  Sliders, 
  Download, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Terminal, 
  Key,
  Flame,
  FileText,
  BadgeAlert
} from 'lucide-react';
import { AppState, VoiceType } from '../types';

interface SidebarProps {
  appState: AppState;
  assistantName: string;
  onOpenSettings: () => void;
  onOpenLogs: () => void;
  onOpenHelp: () => void;
  onDownloadHistory: () => void;
  onOpenMemory: () => void;
  onOpenHistory: () => void;
  onOpenApiSettings: () => void;
  onOpenVoiceSettings: () => void;
  onOpenLanguageSettings: () => void;
  onOpenHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  appState,
  assistantName,
  onOpenSettings,
  onOpenLogs,
  onOpenHelp,
  onDownloadHistory,
  onOpenMemory,
  onOpenHistory,
  onOpenApiSettings,
  onOpenVoiceSettings,
  onOpenLanguageSettings,
  onOpenHome
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const menuItems = [
    {
      id: 'home',
      label: 'Home & Orb',
      icon: Home,
      action: onOpenHome || (() => {}),
      badge: appState === 'listening' ? 'LIVE' : undefined,
      color: 'text-cyan-400'
    },
    {
      id: 'history',
      label: 'Chat History',
      icon: History,
      action: onOpenHistory,
      color: 'text-purple-400'
    },
    {
      id: 'memory',
      label: 'AI Core Memory',
      icon: Brain,
      action: onOpenMemory,
      color: 'text-fuchsia-400',
      badge: 'Cognitive'
    },
    {
      id: 'voice',
      label: 'Voice Settings',
      icon: Volume2,
      action: onOpenVoiceSettings,
      color: 'text-indigo-400'
    },
    {
      id: 'language',
      label: 'System Language',
      icon: Globe,
      action: onOpenLanguageSettings,
      color: 'text-emerald-400'
    },
    {
      id: 'api',
      label: 'API Keys & Secrets',
      icon: Key,
      action: onOpenApiSettings,
      color: 'text-amber-400'
    },
    {
      id: 'downloads',
      label: 'Export Data',
      icon: Download,
      action: onDownloadHistory,
      color: 'text-teal-400'
    },
    {
      id: 'logs',
      label: 'Diagnostic Logs',
      icon: Terminal,
      action: onOpenLogs,
      color: 'text-rose-400'
    },
    {
      id: 'help',
      label: 'User Help Guide',
      icon: HelpCircle,
      action: onOpenHelp,
      color: 'text-zinc-400'
    }
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? '64px' : '260px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="h-[calc(100vh-80px)] top-[70px] left-4 fixed z-40 flex flex-col glass border border-white/5 rounded-3xl bg-zinc-950/40 backdrop-blur-2xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] overflow-hidden py-4 shrink-0 hidden lg:flex"
    >
      {/* Sidebar toggle button */}
      <div className="flex items-center justify-between px-4 pb-4 border-b border-white/5">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-xs font-bold tracking-widest text-zinc-300">
                {assistantName.toUpperCase()} ACTIVE
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl glass hover:bg-white/10 text-zinc-400 hover:text-white transition-all ml-auto cursor-pointer flex items-center justify-center"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Menu Options */}
      <div className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full group flex items-center gap-3.5 px-3 py-2.5 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-left cursor-pointer relative overflow-hidden`}
              title={item.label}
            >
              <div className={`p-1.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors shrink-0 ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 flex items-center justify-between min-w-0"
                >
                  <span className="text-[11px] font-mono font-medium text-zinc-300 group-hover:text-white transition-colors truncate">
                    {item.label}
                  </span>
                  
                  {item.badge && (
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      item.badge === 'LIVE' 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status footer */}
      <div className="px-3 pt-3 border-t border-white/5">
        <div className="flex flex-col gap-1 text-[9px] font-mono text-zinc-500">
          {!isCollapsed ? (
            <>
              <div className="flex justify-between items-center">
                <span>Vocal Server:</span>
                <span className="text-emerald-400 font-bold uppercase">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Platform Port:</span>
                <span className="text-purple-400 font-bold">3000</span>
              </div>
            </>
          ) : (
            <div className="flex justify-center text-emerald-400" title="All Systems Nominal">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
