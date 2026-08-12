import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  MessageSquare, 
  Mic, 
  AppWindow, 
  Folder, 
  Globe, 
  MessageCircle, 
  Mail, 
  Youtube, 
  Activity, 
  Zap, 
  CheckSquare, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { AppState } from '../types';

export type ActiveNavTab = 
  | 'home' 
  | 'chat' 
  | 'voice' 
  | 'applications' 
  | 'files' 
  | 'browser' 
  | 'whatsapp' 
  | 'gmail' 
  | 'youtube' 
  | 'system' 
  | 'automation' 
  | 'tasks' 
  | 'history' 
  | 'settings';

interface SidebarProps {
  appState: AppState;
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  appState,
  activeTab,
  onSelectTab,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) onToggleCollapse();
    else setInternalCollapsed(!internalCollapsed);
  };

  const navItems: { id: ActiveNavTab; label: string; icon: React.ElementType; color: string; badge?: string }[] = [
    { id: 'home', label: 'Home Dashboard', icon: Home, color: 'text-cyan-400' },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, color: 'text-blue-400', badge: 'AI' },
    { id: 'voice', label: 'Voice Assistant', icon: Mic, color: 'text-purple-400', badge: appState === 'listening' ? 'LIVE' : undefined },
    { id: 'applications', label: 'Applications', icon: AppWindow, color: 'text-indigo-400' },
    { id: 'files', label: 'File Assistant', icon: Folder, color: 'text-emerald-400' },
    { id: 'browser', label: 'Browser Control', icon: Globe, color: 'text-sky-400' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-400' },
    { id: 'gmail', label: 'Gmail', icon: Mail, color: 'text-rose-400' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500' },
    { id: 'system', label: 'System Control', icon: Activity, color: 'text-amber-400' },
    { id: 'automation', label: 'Automation', icon: Zap, color: 'text-fuchsia-400', badge: 'NEW' },
    { id: 'tasks', label: 'Tasks & Reminders', icon: CheckSquare, color: 'text-teal-400' },
    { id: 'history', label: 'History Logs', icon: History, color: 'text-slate-400' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-zinc-400' },
  ];

  return (
    <aside className={`h-full bg-slate-950/90 border-r border-cyan-500/20 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 relative z-30 select-none ${
      isCollapsed ? 'w-16' : 'w-60'
    }`}>
      
      {/* Top Header & Collapse Toggle */}
      <div className="p-3 flex items-center justify-between border-b border-slate-900">
        {!isCollapsed && (
          <div className="flex items-center gap-2 pl-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
              NAVIGATION
            </span>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/20 text-slate-300 hover:text-white transition-colors cursor-pointer mx-auto"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-cyan-400" /> : <ChevronLeft className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer relative group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-transparent border border-cyan-500/40 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300' : item.color}`} />
              
              {!isCollapsed && (
                <span className="truncate flex-1 text-left tracking-wide">
                  {item.label}
                </span>
              )}

              {!isCollapsed && item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                  item.badge === 'LIVE'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                    : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900 border border-cyan-500/30 text-white text-[11px] font-mono px-2.5 py-1 rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Status Badge */}
      <div className="p-3 border-t border-slate-900 flex items-center justify-center">
        {!isCollapsed ? (
          <div className="w-full p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SHIVANSH OS
            </span>
            <span className="text-cyan-300">v4.0 PRO</span>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="SHIVANSH System Online" />
        )}
      </div>

    </aside>
  );
};

export default Sidebar;
