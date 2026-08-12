import React, { useState } from 'react';
import { Zap, Play, Clock, CheckCircle2, Plus, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';

interface AutomationRule {
  id: string;
  command: string;
  trigger: string;
  status: boolean;
  lastExecuted: string;
}

export const AutomationCenter: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationRule[]>([
    { id: '1', command: 'Open Chrome every morning', trigger: 'Scheduled • 08:00 AM Daily', status: true, lastExecuted: 'Today at 08:00 AM' },
    { id: '2', command: 'Launch WhatsApp when computer starts', trigger: 'System Boot Event', status: true, lastExecuted: 'Today at 07:45 AM' },
    { id: '3', command: 'Turn on dark mode', trigger: 'Sunset / Nightfall (08:00 PM)', status: true, lastExecuted: 'Yesterday at 08:00 PM' },
    { id: '4', command: 'Open my work applications suite', trigger: 'Voice Trigger ("Shivansh, start work")', status: true, lastExecuted: '2 hours ago' },
    { id: '5', command: 'Close all unnecessary background applications', trigger: 'Memory Usage > 80%', status: false, lastExecuted: '3 days ago' },
  ]);

  const [newCmd, setNewCmd] = useState('');
  const [newTrigger, setNewTrigger] = useState('Voice Trigger');

  const toggleStatus = (id: string) => {
    setAutomations(prev => prev.map(item => item.id === id ? { ...item, status: !item.status } : item));
  };

  const handleAddAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmd.trim()) return;
    const item: AutomationRule = {
      id: Date.now().toString(),
      command: newCmd.trim(),
      trigger: newTrigger,
      status: true,
      lastExecuted: 'Never'
    };
    setAutomations([item, ...automations]);
    setNewCmd('');
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6 custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-900">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight font-sans text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-fuchsia-400 animate-pulse" />
            Desktop Automation Center
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Configure automated background workflows and voice-triggered macros
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-mono font-bold">
          {automations.filter(a => a.status).length} ACTIVE AUTOMATIONS
        </div>
      </div>

      {/* Add Automation Form */}
      <form onSubmit={handleAddAutomation} className="p-4 rounded-2xl bg-slate-950/80 border border-fuchsia-500/20 backdrop-blur-xl flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newCmd}
          onChange={(e) => setNewCmd(e.target.value)}
          placeholder='e.g., "Launch Spotify when I connect headphones"'
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-fuchsia-500 text-white placeholder-slate-500 text-xs font-mono outline-none"
        />
        <select
          value={newTrigger}
          onChange={(e) => setNewTrigger(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono outline-none"
        >
          <option value="Voice Trigger">Voice Trigger</option>
          <option value="System Boot Event">System Boot Event</option>
          <option value="Scheduled Time">Scheduled Time</option>
          <option value="High Memory Event">High Memory Event</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE RULE</span>
        </button>
      </form>

      {/* Automation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 flex flex-col justify-between gap-4 shadow-xl ${
              item.status
                ? 'bg-slate-950/80 border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.15)]'
                : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${item.status ? 'text-fuchsia-400' : 'text-slate-600'}`} />
                  "{item.command}"
                </h3>
                <span className="text-[11px] font-mono text-cyan-400/90 mt-1 block">
                  TRIGGER: {item.trigger}
                </span>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleStatus(item.id)}
                className="cursor-pointer transition-transform active:scale-95"
                title={item.status ? 'Disable Automation' : 'Enable Automation'}
              >
                {item.status ? (
                  <ToggleRight className="w-8 h-8 text-fuchsia-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Last Executed: {item.lastExecuted}
              </span>

              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                item.status
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}>
                {item.status ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AutomationCenter;
