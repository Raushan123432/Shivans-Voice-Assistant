import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Image, Folder, Calculator, Clock, Settings, Play, 
  Search, Sparkles, X, Download, Trash, RotateCcw, CameraOff, 
  FileText, Music, Info, HardDrive, Globe, Calendar, Plus, Equal, AlertCircle,
  Laptop, Wifi, Bluetooth, Cpu, Terminal, Activity, Power, Lock, Sliders,
  Volume2, VolumeX, Sun, RefreshCw, Key, ShieldAlert, Bell, Users, MessageSquare, Phone, Flashlight
} from 'lucide-react';

interface AndroidOverlayManagerProps {
  activeOverlay: string | null;
  launchedAppName?: string;
  overlayArgs?: any;
  onClose: () => void;
  onOpenSettings: () => void;
}

// Pre-filled mockup photos for gallery
const MOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=60', // Vibrant fluid gradient
  'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&auto=format&fit=crop&q=60', // Futuristic tech city
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60', // Digital deep cosmos
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60'  // Glowing microchip circuit
];

export function AndroidOverlayManager({
  activeOverlay,
  launchedAppName = '',
  overlayArgs,
  onClose,
  onOpenSettings
}: AndroidOverlayManagerProps) {
  const [photos, setPhotos] = useState<string[]>(MOCK_PHOTOS);
  const [selectedFullPhoto, setSelectedFullPhoto] = useState<string | null>(null);
  
  // Flashlight state
  const [flashlightOn, setFlashlightOn] = useState<boolean>(false);
  
  // Camera specific states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [cameraFlash, setCameraFlash] = useState<boolean>(false);

  // Calculator states
  const [calcInput, setCalcInput] = useState<string>('0');
  const [calcFormula, setCalcFormula] = useState<string>('');

  // Clock / Stopwatch states
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [stopwatchRunning, setStopwatchRunning] = useState<boolean>(false);
  const stopwatchInterval = useRef<any>(null);
  const [stopwatchLaps, setStopwatchLaps] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Alarm state
  const [alarms, setAlarms] = useState([
    { id: 1, time: '06:30 AM', active: true, label: 'Morning Sadhana' },
    { id: 2, time: '09:00 AM', active: false, label: 'Work standup' },
    { id: 3, time: '10:00 PM', active: true, label: 'Read & Sleep' }
  ]);

  // Jarvis-specific HUD States
  const [jarvisCpu, setJarvisCpu] = useState<number>(24);
  const [jarvisRam, setJarvisRam] = useState<number>(51);
  const [jarvisWifi, setJarvisWifi] = useState<boolean>(true);
  const [jarvisBluetooth, setJarvisBluetooth] = useState<boolean>(true);
  const [jarvisVolume, setJarvisVolume] = useState<number>(70);
  const [jarvisBrightness, setJarvisBrightness] = useState<number>(80);
  const [jarvisMediaPlaying, setJarvisMediaPlaying] = useState<boolean>(true);
  const [jarvisLogs, setJarvisLogs] = useState<string[]>([
    'SYSTEM: Jarvis core online.',
    'HOST_LINK: Connected to remote Windows workstation.',
    'DIAGNOSTICS: Secure sandbox link active over standard secure port.'
  ]);

  // Sync Jarvis CPU/RAM load simulation
  useEffect(() => {
    const loadTimer = setInterval(() => {
      setJarvisCpu((prev) => {
        const jitter = Math.floor(Math.random() * 9) - 4; // -4 to +4
        return Math.max(12, Math.min(85, prev + jitter));
      });
      setJarvisRam((prev) => {
        const jitter = Math.floor(Math.random() * 3) - 1; // -1 to +1
        return Math.max(45, Math.min(62, prev + jitter));
      });
    }, 1500);
    return () => clearInterval(loadTimer);
  }, []);

  // Sync Flashlight & Device Settings triggers from ToolExecutor
  useEffect(() => {
    if (activeOverlay === 'controlComputer' && overlayArgs?.action === 'flashlight') {
      const state = overlayArgs?.value === 'off' ? false : true;
      setFlashlightOn(state);
      const timeStr = new Date().toLocaleTimeString();
      setJarvisLogs(prev => [...prev, `[${timeStr}] TORCH: Phone flashlight state is now ${state ? 'ENABLED' : 'DISABLED'}.`]);
    } else if (activeOverlay === 'controlDeviceSettings') {
      const setting = overlayArgs?.setting;
      const action = overlayArgs?.action;
      const val = overlayArgs?.value;
      const timeStr = new Date().toLocaleTimeString();

      if (setting === 'wifi') {
        setJarvisWifi(action === 'turn_on' || action === 'enable');
      } else if (setting === 'bluetooth') {
        setJarvisBluetooth(action === 'turn_on' || action === 'enable');
      } else if (setting === 'flashlight') {
        setFlashlightOn(action === 'turn_on' || action === 'enable' || action === 'toggle');
      } else if (setting === 'volume') {
        if (action === 'increase') setJarvisVolume(v => Math.min(100, v + 15));
        else if (action === 'decrease') setJarvisVolume(v => Math.max(0, v - 15));
        else if (action === 'mute' || action === 'silent') setJarvisVolume(0);
        else if (val) setJarvisVolume(parseInt(val) || 70);
      } else if (setting === 'brightness') {
        if (action === 'increase') setJarvisBrightness(b => Math.min(100, b + 15));
        else if (action === 'decrease') setJarvisBrightness(b => Math.max(10, b - 15));
        else if (val) setJarvisBrightness(parseInt(val) || 80);
      }

      setJarvisLogs(prev => [...prev, `[${timeStr}] INTENT: Android Device Setting [${setting}] -> ${action}${val ? ' (' + val + ')' : ''}`]);
    }
  }, [activeOverlay, overlayArgs]);

  // Sync auto-logger for active overlay
  useEffect(() => {
    if (activeOverlay) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      let logMsg = '';
      if (activeOverlay === 'controlComputer') {
        logMsg = `[${timeStr}] CMD: controlComputer executed successfully.`;
      } else if (activeOverlay === 'closeApplication') {
        logMsg = `[${timeStr}] CMD: closeApplication executed. App: ${launchedAppName || 'Target'}`;
      } else if (activeOverlay === 'manageFile') {
        logMsg = `[${timeStr}] CMD: manageFile executed. File system updated.`;
      } else if (activeOverlay === 'automateBrowser') {
        logMsg = `[${timeStr}] CMD: automateBrowser executed successfully.`;
      } else if (activeOverlay === 'controlMedia') {
        logMsg = `[${timeStr}] CMD: controlMedia signal sent to media subsystem.`;
      } else if (activeOverlay === 'productivityAction') {
        logMsg = `[${timeStr}] CMD: productivityAction triggered. Action complete.`;
      } else if (activeOverlay === 'executeWindowsAutomation') {
        logMsg = `[${timeStr}] CMD: executeWindowsAutomation - Hotkeys emulation complete.`;
      }
      
      if (logMsg) {
        setJarvisLogs((prev) => [...prev, logMsg]);
      }
    }
  }, [activeOverlay, launchedAppName]);

  // Sync clock time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio synth shutter click
  const playShutterSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  };

  // Manage Camera Life Cycle
  useEffect(() => {
    if (activeOverlay === 'openCamera') {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          setCameraStream(stream);
          setCameraError(false);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('[Camera] Failed to initialize device webcam:', err);
          setCameraError(true);
        });
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeOverlay]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const takeSnapshot = () => {
    playShutterSound();
    setCameraFlash(true);
    setTimeout(() => setCameraFlash(false), 200);

    if (videoRef.current && cameraStream) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Flip horizontally for user-facing camera
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          setPhotos(prev => [dataUrl, ...prev]);
        }
      } catch (err) {
        console.error('Failed to capture snapshot from webcam:', err);
      }
    } else {
      // Offline fallback snapshot simulation
      const randomGradient = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 100000) + 150000}?w=500&auto=format&fit=crop&q=60`;
      setPhotos(prev => [randomGradient, ...prev]);
    }
  };

  // Stopwatch controls
  const handleStopwatchStart = () => {
    if (stopwatchRunning) {
      clearInterval(stopwatchInterval.current);
      setStopwatchRunning(false);
    } else {
      setStopwatchRunning(true);
      const startTime = Date.now() - stopwatchTime;
      stopwatchInterval.current = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 10);
    }
  };

  const handleStopwatchReset = () => {
    clearInterval(stopwatchInterval.current);
    setStopwatchRunning(false);
    setStopwatchTime(0);
    setStopwatchLaps([]);
  };

  const handleStopwatchLap = () => {
    setStopwatchLaps(prev => [formatStopwatch(stopwatchTime), ...prev]);
  };

  const formatStopwatch = (timeMs: number) => {
    const mins = Math.floor(timeMs / 60000);
    const secs = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor((timeMs % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Calculator Keypad
  const handleCalcKey = (key: string) => {
    if (key === 'C') {
      setCalcInput('0');
      setCalcFormula('');
    } else if (key === '=') {
      try {
        // Sanitize calculations safely
        const sanitized = calcFormula + calcInput;
        const cleanExpression = sanitized.replace(/[^-()\d/*+.]/g, '');
        const result = new Function(`return ${cleanExpression}`)();
        setCalcInput(String(Number(result.toFixed(8))));
        setCalcFormula('');
      } catch (e) {
        setCalcInput('Error');
      }
    } else if (['+', '-', '*', '/'].includes(key)) {
      setCalcFormula(`${calcInput} ${key} `);
      setCalcInput('0');
    } else if (key === '.') {
      if (!calcInput.includes('.')) {
        setCalcInput(prev => prev + '.');
      }
    } else {
      setCalcInput(prev => (prev === '0' || prev === 'Error' ? key : prev + key));
    }
  };

  if (!activeOverlay) return null;

  return (
    <AnimatePresence>
      <div id="android-overlay-barrier" className="fixed inset-0 z-40 flex items-center justify-center p-4">
        {/* Backdrop glassmorphism overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl"
        />

        {/* Central UI panel shell simulating an elegant Android device */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className={`bg-zinc-900 border ${flashlightOn ? 'border-amber-500/40 shadow-[0_0_80px_rgba(245,158,11,0.55)]' : 'border-zinc-800 shadow-[0_32px_96px_rgba(0,0,0,0.8)]'} rounded-[38px] w-full max-w-lg h-[80vh] flex flex-col relative overflow-hidden transition-all duration-500 z-10`}
        >
          {/* Top Notch & Camera Hole indicator */}
          <div className="absolute top-0 inset-x-0 h-7 flex items-center justify-between px-6 z-30 pointer-events-none select-none">
            <span className="text-[11px] font-mono text-zinc-400 font-bold">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="w-24 h-4 rounded-full bg-zinc-950 border border-zinc-800 mx-auto absolute left-1/2 -translate-x-1/2 top-1.5 flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500/80 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono font-bold">
              <span>5G</span>
              <span>100%🔋</span>
            </div>
          </div>

          {/* Overlay Core Screen Content (with top padding for notch safety) */}
          <div className="flex-1 mt-7 flex flex-col relative overflow-hidden">
            
            {/* 1. CAMERA APP */}
            {activeOverlay === 'openCamera' && (
              <div className="flex-1 flex flex-col justify-between bg-black p-4 relative">
                {/* Header controls */}
                <div className="flex justify-between items-center text-zinc-400 text-xs font-mono z-10 px-2 mt-2">
                  <span className="bg-zinc-900/80 px-2.5 py-1 rounded-full border border-white/5 flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Lens
                  </span>
                  <button onClick={onClose} className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 transition-colors">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Viewfinder Stage */}
                <div className="flex-1 my-4 rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden relative flex items-center justify-center">
                  {!cameraError ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover scale-x-[-1]" 
                    />
                  ) : (
                    <div className="text-center p-6 flex flex-col items-center gap-3">
                      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <CameraOff className="w-8 h-8" />
                      </div>
                      <div className="text-xs font-mono font-bold text-zinc-300">Virtual Camera lens active</div>
                      <div className="text-[10px] text-zinc-500 leading-relaxed max-w-xs">
                        Physical camera blocked or denied. Babu AI has connected a simulated digital particle lens! Click take photo below.
                      </div>
                    </div>
                  )}

                  {/* Shutter flash animation overlay */}
                  <AnimatePresence>
                    {cameraFlash && (
                      <motion.div 
                        initial={{ opacity: 1 }} 
                        animate={{ opacity: 0 }} 
                        className="absolute inset-0 bg-white z-20"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer shutter controller */}
                <div className="flex items-center justify-between px-6 pb-2 z-10">
                  {/* Gallery snapshot preview thumbnail */}
                  <button 
                    onClick={() => {
                      stopCamera();
                      onOpenSettings();
                    }}
                    className="w-11 h-11 rounded-full border border-white/10 overflow-hidden bg-zinc-900 flex items-center justify-center group"
                  >
                    <img 
                      src={photos[0]} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </button>

                  {/* Primary click trigger */}
                  <button 
                    onClick={takeSnapshot}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-full bg-white hover:bg-zinc-200 transition-colors" />
                  </button>

                  <button 
                    onClick={onClose}
                    className="w-11 h-11 rounded-full bg-zinc-900/80 border border-white/5 flex items-center justify-center hover:bg-zinc-800"
                  >
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. GALLERY APP */}
            {activeOverlay === 'openGallery' && (
              <div className="flex-1 flex flex-col bg-zinc-950 p-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 px-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Android Gallery</span>
                  </div>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 transition-colors">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pr-1">
                  {photos.map((src, index) => (
                    <div 
                      key={index}
                      onClick={() => setSelectedFullPhoto(src)}
                      className="aspect-square rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 cursor-pointer group relative"
                    >
                      <img 
                        src={src} 
                        alt={`Photo ${index}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white/80" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full screen photo inspection overlay */}
                <AnimatePresence>
                  {selectedFullPhoto && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/95 z-40 flex flex-col justify-between p-4"
                    >
                      <div className="flex justify-between items-center text-white z-10">
                        <span className="text-xs font-mono font-bold">Image Inspector</span>
                        <button onClick={() => setSelectedFullPhoto(null)} className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 flex items-center justify-center p-2">
                        <img 
                          src={selectedFullPhoto} 
                          alt="Full display" 
                          className="max-h-[50vh] max-w-full rounded-2xl object-contain shadow-2xl"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex items-center justify-center gap-3 pb-4">
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = selectedFullPhoto;
                            link.download = `babu_ai_photo_${Date.now()}.jpg`;
                            link.click();
                          }}
                          className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 text-[10px] font-mono font-bold flex items-center gap-1.5 hover:bg-zinc-800"
                        >
                          <Download className="w-3.5 h-3.5 text-purple-400" /> Download
                        </button>
                        <button 
                          onClick={() => {
                            setPhotos(prev => prev.filter(p => p !== selectedFullPhoto));
                            setSelectedFullPhoto(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-[10px] font-mono font-bold flex items-center gap-1.5 hover:bg-red-900/20"
                        >
                          <Trash className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 3. FILES EXPLORER APP */}
            {activeOverlay === 'openFiles' && (
              <div className="flex-1 flex flex-col bg-zinc-950 p-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 px-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">File Manager</span>
                  </div>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 transition-colors">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                {/* Storage diagnostic bar */}
                <div className="p-3 rounded-2xl bg-zinc-900/50 border border-white/5 mb-4 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-400 font-bold flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> Internal Storage</span>
                    <span className="text-blue-400">72.4 GB / 128 GB</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '56.5%' }} />
                  </div>
                </div>

                {/* File list */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
                  {[
                    { name: 'DCIM_CameraSnap_001.jpg', size: '1.2 MB', time: 'Just now', icon: Image, color: 'text-purple-400' },
                    { name: 'voice_recording_babu_ai.wav', size: '240 KB', time: '10 mins ago', icon: Music, color: 'text-emerald-400' },
                    { name: 'Download_AndroidIntentConfig.pdf', size: '4.8 MB', time: 'Yesterday', icon: FileText, color: 'text-blue-400' },
                    { name: 'BabuAI_AAB_Release_v2.apk', size: '42.1 MB', time: '2 days ago', icon: Sparkles, color: 'text-amber-400' }
                  ].map((f, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-2xl border border-white/5 bg-zinc-900/30 flex items-center justify-between hover:bg-zinc-900/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <f.icon className={`w-4 h-4 ${f.color} shrink-0`} />
                        <div className="overflow-hidden">
                          <div className="text-xs font-mono text-zinc-300 truncate font-bold">{f.name}</div>
                          <div className="text-[9px] font-mono text-zinc-500">{f.size} • {f.time}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert(`Initiating mock download for: ${f.name}`)}
                        className="p-1.5 rounded-lg border border-white/5 hover:border-blue-500/30 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. CALCULATOR APP */}
            {activeOverlay === 'openCalculator' && (
              <div className="flex-1 flex flex-col bg-zinc-950 p-4 justify-between">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 px-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Bento Calc</span>
                  </div>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 transition-colors">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                {/* Screen / Readout */}
                <div className="flex flex-col items-end px-3 py-4 rounded-2xl bg-zinc-900/40 border border-white/5 mb-4 select-all">
                  <span className="text-xs font-mono text-zinc-500 min-h-[1.5rem] tracking-wider">{calcFormula}</span>
                  <span className="text-3xl font-mono text-zinc-200 font-bold overflow-x-auto w-full text-right mt-1 scrollbar-none">{calcInput}</span>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-4 gap-2 pb-2">
                  {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((key, i) => (
                    <button
                      key={i}
                      onClick={() => handleCalcKey(key)}
                      className={`h-12 rounded-xl font-mono font-bold text-sm transition-all active:scale-95 cursor-pointer border ${
                        key === 'C'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : key === '='
                          ? 'col-span-2 bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white'
                          : ['/', '*', '-', '+'].includes(key)
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-900/50 border-white/5 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. CLOCK APP */}
            {activeOverlay === 'openClock' && (
              <div className="flex-1 flex flex-col bg-zinc-950 p-4 overflow-y-auto">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 px-2 mt-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Android Clock</span>
                  </div>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 transition-colors">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                {/* Analog clock dial face / digital timezone grids */}
                <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-zinc-900/30 border border-white/5 mb-4 shrink-0">
                  <div className="text-4xl font-mono font-bold text-amber-400 tracking-wider">
                    {currentTime.toLocaleTimeString([], { hour12: true })}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest font-bold">
                    Local Timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                  </div>
                </div>

                {/* Dual Layout: Stopwatch vs Alarm Schedule */}
                <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
                  {/* Alarm section */}
                  <div className="p-3 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col gap-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Active Alarms</span>
                    <div className="flex flex-col gap-1.5">
                      {alarms.map(alarm => (
                        <div key={alarm.id} className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className={`text-[11px] font-mono font-bold ${alarm.active ? 'text-zinc-200' : 'text-zinc-600'}`}>{alarm.time}</span>
                            <span className="text-[8px] text-zinc-600 truncate max-w-[70px] leading-tight">{alarm.label}</span>
                          </div>
                          <button 
                            onClick={() => setAlarms(prev => prev.map(a => a.id === alarm.id ? { ...a, active: !a.active } : a))}
                            className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${alarm.active ? 'bg-amber-400' : 'bg-zinc-800'}`}
                          >
                            <div className={`w-3 h-3 rounded-full bg-zinc-950 transition-transform ${alarm.active ? 'translate-x-3' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stopwatch bento */}
                  <div className="p-3 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                      <span>Stopwatch</span>
                      {stopwatchRunning && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                    </div>
                    
                    <div className="text-sm font-mono text-center font-bold text-zinc-200 my-1">
                      {formatStopwatch(stopwatchTime)}
                    </div>

                    <div className="flex justify-center gap-1.5">
                      <button 
                        onClick={handleStopwatchStart}
                        className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold flex items-center gap-0.5 ${
                          stopwatchRunning ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {stopwatchRunning ? 'Pause' : 'Start'}
                      </button>
                      {stopwatchRunning ? (
                        <button 
                          onClick={handleStopwatchLap}
                          className="px-2 py-1 rounded-lg bg-zinc-800 border border-white/5 text-[9px] font-mono font-bold text-zinc-400"
                        >
                          Lap
                        </button>
                      ) : (
                        <button 
                          onClick={handleStopwatchReset}
                          className="px-2 py-1 rounded-lg bg-zinc-800 border border-white/5 text-[9px] font-mono font-bold text-zinc-400"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stopwatch Laps Display */}
                {stopwatchLaps.length > 0 && (
                  <div className="flex-1 min-h-[100px] border border-white/5 rounded-2xl p-3 bg-zinc-900/10 flex flex-col gap-1 overflow-y-auto">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold">Lap History</span>
                    {stopwatchLaps.slice(0, 4).map((lap, idx) => (
                      <div key={idx} className="flex justify-between items-center font-mono text-[10px] border-b border-white/5 pb-1">
                        <span className="text-zinc-600">Lap {stopwatchLaps.length - idx}</span>
                        <span className="text-zinc-400 font-bold">{lap}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. GOOGLE PLAY STORE APP */}
            {activeOverlay === 'openPlayStore' && (
              <div className="flex-1 flex flex-col bg-zinc-950 p-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 px-2 mt-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Play Store</span>
                  </div>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 transition-colors">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                {/* Interactive search mockup bar */}
                <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 mb-4 flex items-center gap-2.5 shrink-0">
                  <Search className="w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search apps & games..." 
                    className="flex-1 bg-transparent text-xs font-mono text-zinc-300 outline-none placeholder-zinc-500"
                    disabled
                  />
                  <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                </div>

                {/* App list cards */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold mb-1">Featured Apps</span>
                  
                  {[
                    { name: 'Babu AI Companion Pro', category: 'Personalization & AI', downloaded: true, rating: '5.0 ★', size: '12 MB', icon: Sparkles, color: 'text-purple-400' },
                    { name: 'Retro Video Filters Studio', category: 'Video Editors', downloaded: false, rating: '4.8 ★', size: '34 MB', icon: Camera, color: 'text-rose-400' },
                    { name: 'Global Maps & Hiking Trails', category: 'Navigation', downloaded: false, rating: '4.7 ★', size: '18 MB', icon: Globe, color: 'text-emerald-400' },
                    { name: 'Bento Calendar & Planner', category: 'Productivity', downloaded: false, rating: '4.9 ★', size: '8 MB', icon: Calendar, color: 'text-amber-400' }
                  ].map((app, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-2xl border border-white/5 bg-zinc-900/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-zinc-950 border border-white/5">
                          <app.icon className={`w-5 h-5 ${app.color}`} />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-mono font-bold text-zinc-300 truncate max-w-[150px]">{app.name}</div>
                          <div className="text-[8px] font-mono text-zinc-500 truncate leading-relaxed">{app.category} • {app.rating}</div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => alert(`Simulated package manager downloading: ${app.name}`)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-mono font-bold transition-all ${
                          app.downloaded 
                            ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' 
                            : 'bg-zinc-800 border border-white/5 text-zinc-300 hover:border-blue-500/30'
                        }`}
                      >
                        {app.downloaded ? 'Installed' : 'Install'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. NOTIFICATION PANEL OVERLAY */}
            {activeOverlay === 'readNotifications' && (
              <div className="flex-1 flex flex-col bg-zinc-950 p-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 px-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-400 animate-bounce" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Android Notification Tray</span>
                  </div>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 transition-colors">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
                  {[
                    { id: 1, app: 'WhatsApp', sender: 'Vikram', message: "Hey, let's meet at 5 PM today!", time: '2 mins ago', iconColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                    { id: 2, app: 'Gmail', sender: 'Google Devs', message: 'Your API billing statement is ready.', time: '15 mins ago', iconColor: 'bg-red-500/10 text-red-400 border-red-500/20' },
                    { id: 3, app: 'Calendar', sender: 'System', message: 'Upcoming Event: Work Standup in 10 minutes', time: '10 mins ago', iconColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' }
                  ].map((notif) => (
                    <div 
                      key={notif.id}
                      className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-all flex items-start gap-3 shadow-md"
                    >
                      <div className={`p-2 rounded-xl border ${notif.iconColor} shrink-0`}>
                        {notif.app === 'WhatsApp' ? <MessageSquare className="w-4 h-4" /> :
                         notif.app === 'Gmail' ? <FileText className="w-4 h-4" /> :
                         <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-xs font-bold text-white truncate">{notif.sender}</span>
                          <span className="text-[8px] font-mono text-zinc-500 uppercase shrink-0">{notif.time}</span>
                        </div>
                        <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block font-bold leading-none mb-1">{notif.app}</span>
                        <p className="text-[11px] font-sans text-zinc-400 leading-relaxed truncate">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. CONTACTS LIST OVERLAY */}
            {activeOverlay === 'readContacts' && (
              <div className="flex-1 flex flex-col bg-zinc-950 p-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 px-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Android Contacts Address Book</span>
                  </div>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 transition-colors">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
                  {[
                    { name: 'Rahul', phone: '+919876543210', email: 'rahul@example.com', color: 'from-blue-500 to-indigo-600' },
                    { name: 'Mom', phone: '+919999999999', email: 'mom@example.com', color: 'from-pink-500 to-rose-600' },
                    { name: 'Dad', phone: '+918888888888', email: 'dad@example.com', color: 'from-emerald-500 to-teal-600' },
                    { name: 'HR', phone: '+15550199', email: 'hr@yourcompany.com', color: 'from-amber-500 to-orange-600' },
                    { name: 'Aayan', phone: '+919111222333', email: 'aayan@example.com', color: 'from-purple-500 to-fuchsia-600' }
                  ].map((contact, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-all flex items-center gap-3 shadow-md"
                    >
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${contact.color} text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-inner`}>
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{contact.name}</div>
                        <div className="text-[10px] font-mono text-zinc-500 truncate">{contact.phone}</div>
                        <div className="text-[9px] font-mono text-zinc-600 truncate">{contact.email}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <a href={`tel:${contact.phone}`} className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:opacity-80">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a href={`sms:${contact.phone}`} className="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:opacity-80">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* 8. JARVIS CONNECTED HOST SYSTEM CONTROL HUD */}
            {[
              'controlComputer',
              'closeApplication',
              'manageFile',
              'automateBrowser',
              'controlMedia',
              'productivityAction',
              'executeWindowsAutomation'
            ].includes(activeOverlay || '') && (
              <div className="flex-1 flex flex-col bg-zinc-950 p-4 overflow-y-auto scrollbar-thin">
                {/* Header */}
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 px-2 mt-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">Jarvis Connected PC Host Console</span>
                  </div>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 transition-colors">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                {/* PC Resource Gauges */}
                <div className="grid grid-cols-3 gap-2.5 mb-4 shrink-0">
                  <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col items-center">
                    <Cpu className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">CPU Load</span>
                    <span className="text-sm font-mono font-bold text-cyan-300 mt-0.5">{jarvisCpu}%</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col items-center">
                    <Activity className="w-4 h-4 text-purple-400 mb-1" />
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">RAM Used</span>
                    <span className="text-sm font-mono font-bold text-purple-300 mt-0.5">{jarvisRam}%</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col items-center">
                    <RefreshCw className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">Ping Link</span>
                    <span className="text-sm font-mono font-bold text-emerald-300 mt-0.5">14ms</span>
                  </div>
                </div>

                {/* Live Command Logger */}
                <div className="mb-4 shrink-0">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 px-1">Jarvis Live Commands Executed</span>
                  <div className="rounded-2xl border border-white/5 bg-black/70 p-3 h-28 overflow-y-auto font-mono text-[10px] leading-relaxed text-emerald-400/90 flex flex-col gap-1 shadow-inner">
                    {jarvisLogs.map((log, idx) => (
                      <div key={idx} className="border-l border-emerald-500/20 pl-2">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Controls Desk */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/30 border border-white/5 mb-4 flex flex-col gap-3 shrink-0">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Hardware Level Controllers</span>
                  
                  {/* Volume Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-300 flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Host PC Volume</span>
                      <span className="text-cyan-400 font-bold">{jarvisVolume}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={jarvisVolume}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setJarvisVolume(val);
                        if (val % 10 === 0) {
                          setJarvisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] VOL: Adjusted host volume to ${val}%`]);
                        }
                      }}
                      className="w-full accent-cyan-400 bg-zinc-800 h-1 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Brightness Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-300 flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-400" /> Host PC Brightness</span>
                      <span className="text-amber-400 font-bold">{jarvisBrightness}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={jarvisBrightness}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setJarvisBrightness(val);
                        if (val % 10 === 0) {
                          setJarvisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] DISP: Host panel brightness configured at ${val}%`]);
                        }
                      }}
                      className="w-full accent-amber-400 bg-zinc-800 h-1 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Networking Switches & Sleep Toggles */}
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <button 
                      onClick={() => {
                        setJarvisWifi(!jarvisWifi);
                        setJarvisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] NET: Host Wifi toggled to ${!jarvisWifi ? 'ACTIVE' : 'INACTIVE'}`]);
                      }}
                      className={`p-2 rounded-xl border text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        jarvisWifi 
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.1)]' 
                          : 'bg-zinc-950/40 border-white/5 text-zinc-500'
                      }`}
                    >
                      <Wifi className="w-3.5 h-3.5" /> Wi-Fi: {jarvisWifi ? 'ON' : 'OFF'}
                    </button>

                    <button 
                      onClick={() => {
                        setJarvisBluetooth(!jarvisBluetooth);
                        setJarvisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] NET: Bluetooth adapter state: ${!jarvisBluetooth ? 'ACTIVE' : 'OFF'}`]);
                      }}
                      className={`p-2 rounded-xl border text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        jarvisBluetooth 
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
                          : 'bg-zinc-950/40 border-white/5 text-zinc-500'
                      }`}
                    >
                      <Bluetooth className="w-3.5 h-3.5" /> Bluetooth: {jarvisBluetooth ? 'ON' : 'OFF'}
                    </button>

                    <button 
                      onClick={() => {
                        setFlashlightOn(!flashlightOn);
                        setJarvisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] TORCH: Flashlight toggled manually to ${!flashlightOn ? 'ACTIVE' : 'OFF'}`]);
                      }}
                      className={`p-2 rounded-xl border text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        flashlightOn 
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
                          : 'bg-zinc-950/40 border-white/5 text-zinc-500'
                      }`}
                    >
                      <Flashlight className={`w-3.5 h-3.5 ${flashlightOn ? 'animate-bounce text-amber-400' : ''}`} /> Torch: {flashlightOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Quick Power Administration Dashboard */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/30 border border-white/5 mb-4 flex flex-col gap-2 shrink-0">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Secure Power Console</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => {
                        if (confirm('Verify: Put connected PC into low-power SLEEP mode?')) {
                          setJarvisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SYS: Host sleeping.`]);
                        }
                      }}
                      className="py-2.5 rounded-xl bg-zinc-950/80 border border-amber-500/10 hover:border-amber-500/20 text-[10px] font-mono font-bold text-amber-400 flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Power className="w-4 h-4 text-amber-500" /> Sleep
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Verify: LOCK the remote PC desktop secure interface?')) {
                          setJarvisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SYS: Lock triggered.`]);
                        }
                      }}
                      className="py-2.5 rounded-xl bg-zinc-950/80 border border-purple-500/10 hover:border-purple-500/20 text-[10px] font-mono font-bold text-purple-400 flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-purple-400" /> Lock PC
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('CRITICAL: Shutdown the remote PC host machine?')) {
                          setJarvisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SYS: Shutdown signal dispatched.`]);
                        }
                      }}
                      className="py-2.5 rounded-xl bg-red-950/10 border border-red-500/20 text-[10px] font-mono font-bold text-red-400 flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Power className="w-4 h-4 text-red-500 animate-pulse" /> Shutdown
                    </button>
                  </div>
                </div>

                {/* PC App Quick Launcher Tray */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/30 border border-white/5 mb-4 flex flex-col gap-2 shrink-0">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Fast-Path App Shortcuts</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Chrome', icon: Globe, color: 'text-blue-400' },
                      { name: 'VS Code', icon: Terminal, color: 'text-cyan-400' },
                      { name: 'Notepad', icon: FileText, color: 'text-amber-400' },
                      { name: 'Calc', icon: Calculator, color: 'text-emerald-400' }
                    ].map((app, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          setJarvisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] EXEC: Launching application ${app.name}...`]);
                        }}
                        className="p-2 bg-zinc-950/60 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-white/10"
                      >
                        <app.icon className={`w-4 h-4 ${app.color}`} />
                        <span className="text-[8px] font-mono text-zinc-400 font-bold">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PC Media Playback remote */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/30 border border-white/5 flex flex-col gap-2 shrink-0">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Media Playback Bridge</span>
                  <div className="flex items-center justify-between bg-zinc-950/60 p-2 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 max-w-[150px] overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4 text-cyan-400 animate-pulse" />
                      </div>
                      <div className="overflow-hidden leading-tight">
                        <div className="text-[10px] font-mono text-zinc-300 font-bold truncate">Jarvis Ambience</div>
                        <div className="text-[8px] font-mono text-zinc-500 truncate">Synthesizer Stream</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => {
                          setJarvisMediaPlaying(!jarvisMediaPlaying);
                          setJarvisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] MEDIA: Playback state changed to ${!jarvisMediaPlaying ? 'PLAYING' : 'PAUSED'}`]);
                        }}
                        className="px-2.5 py-1 rounded bg-zinc-800 border border-white/5 text-[9px] font-mono font-bold text-zinc-300 cursor-pointer"
                      >
                        {jarvisMediaPlaying ? 'Pause' : 'Play'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 11. LOCK SCREEN APP / SECURE DEVICE LOCK */}
            {activeOverlay === 'lockDevice' && (
              <div className="flex-1 flex flex-col bg-zinc-950 p-6 relative justify-between overflow-hidden">
                {/* Ambient glow backdrop */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-zinc-950 to-zinc-950 z-0 pointer-events-none" />
                
                {/* Stylized Floating Particles */}
                <div className="absolute top-1/4 left-1/3 w-48 h-48 rounded-full bg-cyan-500/10 blur-[60px] animate-pulse z-0 pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full bg-purple-500/10 blur-[60px] animate-pulse delay-1000 z-0 pointer-events-none" />

                <div className="z-10 flex flex-col items-center text-center pt-8">
                  {/* Lock Indicator icon */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  >
                    <Lock className="w-5 h-5" />
                  </motion.div>

                  {/* Big Sleek Lock Clock */}
                  <h2 className="text-5xl font-extrabold tracking-tight font-display text-white">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </h2>
                  <p className="text-xs font-mono font-medium text-zinc-400 mt-1 uppercase tracking-widest">
                    {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  
                  {/* Secure status */}
                  <div className="mt-3 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[9px] font-mono font-bold text-rose-400/90 tracking-wider flex items-center gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Device Locked via Babu AI
                  </div>
                </div>

                {/* Babu AI Notification Card on Lock Screen */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="z-10 mx-2 p-3.5 rounded-2xl bg-zinc-900/90 border border-white/5 shadow-xl flex items-start gap-3 text-left mt-4 backdrop-blur-md"
                >
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-xs font-bold text-zinc-200">Babu AI Assistant</span>
                      <span className="text-[8px] font-mono text-zinc-500">Just Now</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                      Device locked instantly via secure voice command. Android security protocols fully active.
                    </p>
                  </div>
                </motion.div>

                {/* Unlock Controls Area */}
                <div className="z-10 flex flex-col items-center gap-4 pb-4">
                  {/* Keypad and PIN Entry Simulation */}
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                      Enter PIN or Scan Finger
                    </span>
                    
                    {/* Glowing Fingerprint scanner button as primary trigger */}
                    <button 
                      onClick={onClose}
                      className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.45)] border border-cyan-300/40 relative group cursor-pointer"
                    >
                      <span className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-25" />
                      <Key className="w-6 h-6 animate-pulse" />
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 text-[10px] font-mono font-bold text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      Tap to Unlock
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Android Bottom Navigation Pill Handle */}
          <div className="h-6 flex items-center justify-center pb-2 pointer-events-none select-none shrink-0">
            <button 
              onClick={onClose}
              className="w-28 h-1 rounded-full bg-zinc-800 border border-zinc-700 pointer-events-auto cursor-pointer active:bg-zinc-600"
            />
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
