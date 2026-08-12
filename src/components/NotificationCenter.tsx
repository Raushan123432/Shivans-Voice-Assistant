import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, Download, Zap, X, Trash2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'security' | 'download' | 'automation';
  timestamp: string;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', title: 'WhatsApp opened successfully', description: 'Application launched via voice command.', type: 'success', timestamp: '2 mins ago' },
    { id: '2', title: 'Resume found', description: 'Roushan_Kumar_Resume_2026.pdf located in Documents.', type: 'success', timestamp: '12 mins ago' },
    { id: '3', title: 'Download completed', description: 'SHIVANSH_System_Kernel_Patch.zip downloaded.', type: 'download', timestamp: '1 hour ago' },
    { id: '4', title: 'Storage usage normal', description: 'NVME storage at 24% capacity.', type: 'security', timestamp: '3 hours ago' },
    { id: '5', title: 'Morning Automation Executed', description: 'Chrome & Workspace launched automatically.', type: 'automation', timestamp: 'Today at 08:00 AM' },
  ]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => setNotifications([]);

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'security': return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
      case 'download': return <Download className="w-4 h-4 text-cyan-400" />;
      case 'automation': return <Zap className="w-4 h-4 text-fuchsia-400" />;
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6 custom-scrollbar">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-900">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h2 className="text-xl font-extrabold tracking-tight font-sans text-white">
            System Notification Center
          </h2>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR ALL</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-400 font-mono text-xs">
            No active system notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 backdrop-blur-xl transition-all duration-300 shadow-lg flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  {getNotificationIcon(n.type)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    {n.title}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {n.description}
                  </p>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                    {n.timestamp}
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeNotification(n.id)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default NotificationCenter;
