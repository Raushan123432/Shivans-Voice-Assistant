import React, { useState } from 'react';
import { 
  Globe, 
  MessageCircle, 
  Code2, 
  Folder, 
  Music, 
  Youtube, 
  Calculator, 
  Terminal, 
  Figma, 
  Play, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface ApplicationItem {
  id: string;
  name: string;
  icon: React.ElementType;
  status: 'Active' | 'Idle' | 'Background';
  category: string;
  voiceCommand: string;
  color: string;
}

interface ApplicationLauncherProps {
  onLaunchApp?: (appName: string) => void;
}

export const ApplicationLauncher: React.FC<ApplicationLauncherProps> = ({ onLaunchApp }) => {
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  const applications: ApplicationItem[] = [
    { id: 'chrome', name: 'Google Chrome', icon: Globe, status: 'Active', category: 'Browser', voiceCommand: 'Shivansh, open Chrome', color: 'from-amber-500 to-emerald-500' },
    { id: 'whatsapp', name: 'WhatsApp Desktop', icon: MessageCircle, status: 'Active', category: 'Messaging', voiceCommand: 'Shivansh, open WhatsApp', color: 'from-emerald-500 to-green-600' },
    { id: 'vscode', name: 'Visual Studio Code', icon: Code2, status: 'Idle', category: 'Development', voiceCommand: 'Shivansh, open VS Code', color: 'from-sky-500 to-blue-600' },
    { id: 'files', name: 'File Explorer', icon: Folder, status: 'Background', category: 'System', voiceCommand: 'Shivansh, open File Explorer', color: 'from-cyan-500 to-indigo-500' },
    { id: 'spotify', name: 'Spotify Music', icon: Music, status: 'Idle', category: 'Media', voiceCommand: 'Shivansh, open Spotify', color: 'from-green-500 to-teal-600' },
    { id: 'youtube', name: 'YouTube Pro', icon: Youtube, status: 'Background', category: 'Entertainment', voiceCommand: 'Shivansh, open YouTube', color: 'from-red-500 to-rose-600' },
    { id: 'calculator', name: 'Calculator OS', icon: Calculator, status: 'Idle', category: 'Utility', voiceCommand: 'Shivansh, open Calculator', color: 'from-purple-500 to-indigo-600' },
    { id: 'terminal', name: 'System Terminal', icon: Terminal, status: 'Active', category: 'System', voiceCommand: 'Shivansh, open Terminal', color: 'from-zinc-400 to-zinc-600' },
    { id: 'figma', name: 'Figma Design', icon: Figma, status: 'Idle', category: 'Design', voiceCommand: 'Shivansh, open Figma', color: 'from-fuchsia-500 to-purple-600' },
  ];

  const handleOpen = (app: ApplicationItem) => {
    setActiveAppId(app.id);
    if (onLaunchApp) onLaunchApp(app.name);
    setTimeout(() => setActiveAppId(null), 3000);
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6 custom-scrollbar">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-900">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight font-sans text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            Application Control & Launcher
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Launch and control desktop software seamlessly via voice or touch
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
          9 APPLICATIONS CONNECTED
        </div>
      </div>

      {/* Grid of Glass App Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {applications.map((app) => {
          const Icon = app.icon;
          const isOpening = activeAppId === app.id;

          return (
            <div
              key={app.id}
              className="group p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-purple-500/20 hover:border-cyan-400/50 backdrop-blur-xl transition-all duration-300 shadow-xl hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] flex flex-col justify-between gap-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${app.color} p-[1px] shadow-md`}>
                    <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {app.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {app.category}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                  app.status === 'Active'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : app.status === 'Background'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {app.status}
                </span>
              </div>

              {/* Voice Command Badge */}
              <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-cyan-300/90 flex items-center gap-1.5">
                <span className="text-slate-500 text-[10px]">VOICE:</span>
                <span className="truncate">"{app.voiceCommand}"</span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpen(app)}
                className={`w-full py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOpening
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                    : 'bg-slate-900 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 border border-cyan-500/30 hover:border-transparent text-cyan-300 hover:text-white'
                }`}
              >
                {isOpening ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950 animate-bounce" />
                    <span>OPENED SIR</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>LAUNCH APPLICATION</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ApplicationLauncher;
