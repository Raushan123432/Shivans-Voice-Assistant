import React from 'react';
import { motion } from 'motion/react';
import { 
  Mic, 
  Keyboard, 
  Camera, 
  Folder, 
  Settings, 
  User, 
  Volume2, 
  VolumeX, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface HUDBottomDockProps {
  appState: string;
  muted: boolean;
  onToggleMute: () => void;
  onToggleVoice: () => void;
  onOpenKeyboard: () => void;
  onOpenVision: () => void;
  onOpenFiles: () => void;
  onOpenSettings: () => void;
  onOpenMemory: () => void;
}

export const HUDBottomDock: React.FC<HUDBottomDockProps> = ({
  appState,
  muted,
  onToggleMute,
  onToggleVoice,
  onOpenKeyboard,
  onOpenVision,
  onOpenFiles,
  onOpenSettings,
  onOpenMemory
}) => {
  const isListening = appState === 'listening';

  const dockButtons = [
    {
      id: 'mic',
      label: isListening ? 'Stop Mic' : 'Voice Mic',
      icon: Mic,
      color: isListening ? 'from-rose-500 to-red-600' : 'from-cyan-500 to-blue-600',
      active: isListening,
      onClick: onToggleVoice
    },
    {
      id: 'keyboard',
      label: 'Type Text',
      icon: Keyboard,
      color: 'from-purple-500 to-indigo-600',
      onClick: onOpenKeyboard
    },
    {
      id: 'camera',
      label: 'Vision Cam',
      icon: Camera,
      color: 'from-fuchsia-500 to-pink-600',
      onClick: onOpenVision
    },
    {
      id: 'files',
      label: 'Files FS',
      icon: Folder,
      color: 'from-emerald-500 to-teal-600',
      onClick: onOpenFiles
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: 'from-amber-500 to-orange-600',
      onClick: onOpenSettings
    },
    {
      id: 'profile',
      label: 'AI Profile',
      icon: User,
      color: 'from-violet-500 to-purple-600',
      onClick: onOpenMemory
    },
    {
      id: 'mute',
      label: muted ? 'Unmute' : 'Mute Sound',
      icon: muted ? VolumeX : Volume2,
      color: muted ? 'from-rose-600 to-red-700' : 'from-cyan-600 to-teal-600',
      active: muted,
      onClick: onToggleMute
    }
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-full px-2">
      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-3xl bg-zinc-950/80 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
        {dockButtons.map((btn) => {
          const Icon = btn.icon;

          return (
            <motion.button
              key={btn.id}
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.92 }}
              onClick={btn.onClick}
              className={`relative group p-3 sm:p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                btn.active
                  ? 'bg-gradient-to-br ' + btn.color + ' text-white shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 hover:border-cyan-400/50'
              }`}
            >
              <Icon className="w-5 h-5 sm:w-5 sm:h-5" />

              {/* Tooltip on hover */}
              <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-150 px-2 py-1 rounded-lg bg-zinc-900 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 whitespace-nowrap shadow-xl pointer-events-none">
                {btn.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
