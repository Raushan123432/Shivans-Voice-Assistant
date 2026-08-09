import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Monitor, X, Play, Square, Volume2, ShieldCheck, Cpu, Power, RefreshCw, Lock } from 'lucide-react';

interface DesktopHUDModalProps {
  onClose: () => void;
}

export const DesktopHUDModal: React.FC<DesktopHUDModalProps> = ({ onClose }) => {
  const [runningApps, setRunningApps] = useState([
    { name: 'Google Chrome', cpu: '4.2%', ram: '1.2 GB', active: true },
    { name: 'File Explorer', cpu: '1.1%', ram: '420 MB', active: true },
    { name: 'Spotify Music', cpu: '0.8%', ram: '320 MB', active: true },
    { name: 'Terminal / PowerShell', cpu: '0.2%', ram: '110 MB', active: true }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleAction = (cmd: string) => {
    setNotification(`EXECUTED COMMAND: "${cmd}"`);
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-3xl bg-zinc-950 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-amber-500/20 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="font-mono font-bold text-sm text-amber-200 tracking-wider">
              DESKTOP AUTOMATION HUD
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {notification && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300">
              {notification}
            </div>
          )}

          {/* Quick PC Actions */}
          <div>
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">
              QUICK SYSTEM SHORTCUTS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Open Chrome', action: 'Open Chrome' },
                { label: 'Open Explorer', action: 'Open File Explorer' },
                { label: 'Take Screenshot', action: 'Take Screenshot' },
                { label: 'Lock PC', action: 'Lock Computer' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(item.action)}
                  className="p-3 rounded-xl bg-zinc-900 border border-amber-500/20 hover:border-amber-400 hover:bg-amber-500/10 text-xs font-mono text-zinc-200 font-bold transition-all cursor-pointer text-left"
                >
                  ⚡ {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Process List */}
          <div>
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">
              ACTIVE DESKTOP PROCESSES
            </h3>
            <div className="space-y-2">
              {runningApps.map((app, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-zinc-200 font-bold">{app.name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
                    <span>CPU: {app.cpu}</span>
                    <span>RAM: {app.ram}</span>
                    <button
                      onClick={() => handleAction(`Focus ${app.name}`)}
                      className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer"
                    >
                      Focus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
