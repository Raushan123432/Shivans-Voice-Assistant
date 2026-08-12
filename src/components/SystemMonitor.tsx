import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Activity, BatteryCharging, Thermometer, ShieldCheck, Zap } from 'lucide-react';

export const SystemMonitor: React.FC = () => {
  // Live dynamic telemetry state with realistic subtle variance
  const [telemetry, setTelemetry] = useState({
    cpu: 32,
    ram: 48,
    gpu: 21,
    storage: 24, // percentage
    temp: 42,
    netSpeed: 124,
    battery: 98
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        cpu: Math.min(95, Math.max(18, prev.cpu + Math.floor(Math.random() * 7 - 3))),
        ram: Math.min(85, Math.max(35, prev.ram + Math.floor(Math.random() * 3 - 1))),
        gpu: Math.min(90, Math.max(12, prev.gpu + Math.floor(Math.random() * 5 - 2))),
        storage: 24,
        temp: Math.min(75, Math.max(38, prev.temp + Math.floor(Math.random() * 3 - 1))),
        netSpeed: Math.min(300, Math.max(80, prev.netSpeed + Math.floor(Math.random() * 15 - 7))),
        battery: 98
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-slate-950/90 border-l border-cyan-500/20 backdrop-blur-2xl p-4 flex flex-col justify-between overflow-y-auto select-none text-slate-100 font-mono text-xs custom-scrollbar">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-900">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h2 className="font-bold tracking-widest text-cyan-300 uppercase text-xs">
            SYSTEM MONITOR
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
          LIVE TELEMETRY
        </span>
      </div>

      {/* Main Gauges & Metrics Grid */}
      <div className="space-y-4 my-2">
        
        {/* CPU Gauge */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              CPU USAGE
            </span>
            <span className="font-bold text-cyan-300">{telemetry.cpu}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-cyan-500/10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              style={{ width: `${telemetry.cpu}%` }}
            />
          </div>
        </div>

        {/* RAM Usage */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              RAM USAGE
            </span>
            <span className="font-bold text-purple-300">{telemetry.ram}% (15.3 / 32 GB)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-purple-500/10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
              style={{ width: `${telemetry.ram}%` }}
            />
          </div>
        </div>

        {/* GPU Usage */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-indigo-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              GPU USAGE
            </span>
            <span className="font-bold text-indigo-300">{telemetry.gpu}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-indigo-500/10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
              style={{ width: `${telemetry.gpu}%` }}
            />
          </div>
        </div>

        {/* Storage */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              NVME STORAGE
            </span>
            <span className="font-bold text-emerald-300">240 GB / 1 TB</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-emerald-500/10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `24%` }}
            />
          </div>
        </div>

        {/* Quick Info Badges */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-0.5">
            <span className="text-slate-500 text-[10px] flex items-center gap-1">
              <Wifi className="w-3 h-3 text-cyan-400" /> NETWORK
            </span>
            <span className="font-bold text-slate-200 text-xs">{telemetry.netSpeed} Mbps</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-0.5">
            <span className="text-slate-500 text-[10px] flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-rose-400" /> TEMP
            </span>
            <span className="font-bold text-slate-200 text-xs">{telemetry.temp}°C</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-0.5">
            <span className="text-slate-500 text-[10px] flex items-center gap-1">
              <BatteryCharging className="w-3 h-3 text-emerald-400" /> BATTERY
            </span>
            <span className="font-bold text-slate-200 text-xs">{telemetry.battery}%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-0.5">
            <span className="text-slate-500 text-[10px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" /> INTERNET
            </span>
            <span className="font-bold text-emerald-400 text-xs">CONNECTED</span>
          </div>
        </div>

      </div>

      {/* Footer JARVIS Security Status */}
      <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
        <span>SECURITY FIREWALL</span>
        <span className="text-emerald-400 font-bold">ACTIVE & SECURE</span>
      </div>

    </div>
  );
};

export default SystemMonitor;
