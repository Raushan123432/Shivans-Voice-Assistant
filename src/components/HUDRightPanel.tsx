import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, HardDrive, Activity, Zap, Wifi, Gauge, Heart, Shield, Navigation, Thermometer, Battery, Car } from 'lucide-react';

interface HUDRightPanelProps {
  appState: string;
  emotion?: string;
  voiceLevel?: number;
  vehicleModel?: string;
}

export const HUDRightPanel: React.FC<HUDRightPanelProps> = ({
  appState,
  emotion = 'Focused',
  voiceLevel = 0.35,
  vehicleModel = 'SPORTS'
}) => {
  const [speed, setSpeed] = useState(128);
  const [battery, setBattery] = useState(94);
  const [temp, setTemp] = useState(23);
  const [cpuLoad, setCpuLoad] = useState(24);
  const [latency, setLatency] = useState(14);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(Math.floor(120 + Math.random() * 25));
      setBattery(Math.floor(92 + Math.random() * 4));
      setTemp(Math.floor(22 + Math.random() * 3));
      setCpuLoad(Math.floor(20 + Math.random() * 20));
      setLatency(Math.floor(12 + Math.random() * 6));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      label: 'VEHICLE MODEL',
      value: vehicleModel,
      sub: 'Autonomous Cyber Thruster',
      icon: Car,
      color: 'from-cyan-500 to-blue-500',
      progress: 100
    },
    {
      label: 'SPEED METRICS',
      value: `${speed} KM/H`,
      sub: 'Cruise Assist Active',
      icon: Gauge,
      color: 'from-blue-500 to-indigo-500',
      progress: (speed / 200) * 100
    },
    {
      label: 'BATTERY / FUEL',
      value: `${battery}%`,
      sub: '420 KM Range Remaining',
      icon: Battery,
      color: 'from-emerald-500 to-teal-500',
      progress: battery
    },
    {
      label: 'CABIN TEMP',
      value: `${temp}°C`,
      sub: 'Climate Comfort Regulated',
      icon: Thermometer,
      color: 'from-amber-500 to-orange-500',
      progress: (temp / 40) * 100
    },
    {
      label: 'GPS NAVIGATION',
      value: 'NAV ACTIVE',
      sub: '25.6140° N, 85.1376° E (India)',
      icon: Navigation,
      color: 'from-purple-500 to-pink-500',
      progress: 95
    },
    {
      label: 'NETWORK & SYSTEM',
      value: `${latency} MS`,
      sub: `CPU Core: ${cpuLoad}% | Health: 100%`,
      icon: Wifi,
      color: 'from-fuchsia-500 to-purple-600',
      progress: 100 - latency
    }
  ];

  return (
    <motion.aside 
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full lg:w-64 flex flex-col gap-2 relative z-30 shrink-0"
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)]"
      >
        <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
          VEHICLE TELEMETRY
        </span>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
        {stats.map((st, idx) => {
          const Icon = st.icon;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + idx * 0.05 }}
              whileHover={{ scale: 1.025, x: -3, boxShadow: '0 0 20px rgba(6,182,212,0.25)' }}
              className="p-3 rounded-2xl bg-slate-950/70 border border-cyan-500/15 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-400/50 transition-all shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${st.color} text-white group-hover:scale-110 transition-transform`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider group-hover:text-cyan-200 transition-colors">
                    {st.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {st.value}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden mb-1 border border-white/5">
                <motion.div
                  className={`h-full bg-gradient-to-r ${st.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${st.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>

              <div className="text-[9px] font-mono text-zinc-400 truncate">
                {st.sub}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Developer & Architecture Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(6,182,212,0.25)' }}
        className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/20 backdrop-blur-xl space-y-1.5 transition-all cursor-default"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
            DEVELOPER & IDENTITY
          </span>
        </div>
        <div className="text-[10px] font-mono text-zinc-200">
          Developed by <span className="text-cyan-300 font-bold">Roushan Kumar</span>
        </div>
        <div className="text-[9px] font-mono text-zinc-400 leading-relaxed">
          Nadiyami Darbhanga Bihar • Intelligent Gentleman AI Assistant
        </div>
      </motion.div>
    </motion.aside>
  );
};
