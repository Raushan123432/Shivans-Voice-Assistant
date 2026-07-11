import React from 'react';
import { motion } from 'motion/react';
import { Home, Mic, History, Settings, Sparkles, Music } from 'lucide-react';
import { AppState } from '../types';

interface BottomNavigationProps {
  activeTab: 'home' | 'voice' | 'music' | 'history' | 'settings';
  onChangeTab: (tab: 'home' | 'voice' | 'music' | 'history' | 'settings') => void;
  appState: AppState;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab,
  appState
}) => {
  interface TabItem {
    id: 'home' | 'voice' | 'music' | 'history' | 'settings';
    label: string;
    icon: typeof Home;
    color: string;
    isVoice?: boolean;
  }

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: Home, color: 'from-cyan-400 to-blue-500' },
    { id: 'voice', label: 'Voice', icon: Mic, color: 'from-purple-400 to-indigo-500', isVoice: true },
    { id: 'music', label: 'Music', icon: Music, color: 'from-fuchsia-400 to-pink-500' },
    { id: 'history', label: 'History', icon: History, color: 'from-pink-400 to-rose-500' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'from-amber-400 to-orange-500' }
  ];

  const isLive = appState === 'listening' || appState === 'speaking' || appState === 'thinking';

  return (
    <div className="w-full max-w-md px-4 mt-2">
      <div className="glass rounded-2xl p-1.5 bg-zinc-950/85 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center justify-between relative overflow-hidden backdrop-blur-2xl">
        {/* Decorative backdrop glow for selected tab */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none" />

        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="flex-1 relative py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 group transition-all duration-300 cursor-pointer outline-none focus:outline-none"
              id={`nav-tab-${tab.id}`}
            >
              {/* Glowing active indicator background sliding */}
              {isSelected && (
                <motion.div
                  layoutId="activeTabBackground"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl z-0"
                >
                  {/* Neon top-edge or bottom-edge indicator strip */}
                  <div className={`absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r ${tab.color} rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]`} />
                  {/* Core glowing dot */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400 opacity-60 animate-pulse" />
                </motion.div>
              )}

              {/* Dynamic status pulse for Voice tab when connected */}
              {tab.isVoice && isLive && (
                <span className="absolute top-2 right-4 flex h-2.5 w-2.5 z-10">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500 shadow-[0_0_8px_#c084fc]" />
                </span>
              )}

              {/* Tab Icon and Label with Micro-Interaction hover/active animations */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon 
                  className={`w-5 h-5 transition-all duration-300 ${
                    isSelected 
                      ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' 
                      : 'text-zinc-500 group-hover:text-zinc-300 group-hover:scale-105'
                  }`} 
                />
                <span 
                  className={`text-[9px] font-mono tracking-wider transition-all duration-300 uppercase font-bold ${
                    isSelected 
                      ? 'text-white' 
                      : 'text-zinc-500 group-hover:text-zinc-400'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
