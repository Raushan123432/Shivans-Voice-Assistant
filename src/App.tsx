import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Mic, ShieldAlert, Sparkles, X, Heart, HelpCircle, AlertTriangle, Trash2, Key } from 'lucide-react';
import ApiKeyModal from './components/ApiKeyModal';

import { useLiveSession } from './hooks/useLiveSession';
import { useAudio } from './hooks/useAudio';
import { useKeepAwake } from './hooks/useKeepAwake';
import Header from './components/Header';
import AssistantOrb from './components/AssistantOrb';
import Starfield from './components/Starfield';
import Waveform from './components/Waveform';
import VoiceButton from './components/VoiceButton';
import StatusBar from './components/StatusBar';
import BottomControls from './components/BottomControls';
import { SUPPORTED_VOICES } from './utils/constants';
import { PendingConfirmation, ChatMessage } from './types';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import ToolExecutor from './services/ToolExecutor';
import { AndroidOverlayManager } from './components/AndroidOverlayManager';
import ChatInterface from './components/ChatInterface';
import LogsModal from './components/LogsModal';

import Sidebar from './components/Sidebar';
import MemoryModal from './components/MemoryModal';
import HistoryPanelModal from './components/HistoryPanelModal';
import AudioUploadModal from './components/AudioUploadModal';
import BottomNavigation from './components/BottomNavigation';
import MusicTab from './components/MusicTab';

// Futuristic 3D Zoya AI Assistant Components
import { BackgroundCanvas } from './components/3d/BackgroundCanvas';
import { ZoyaAvatar3D } from './components/3d/ZoyaAvatar3D';
import { VehicleReactor3D, VehicleType } from './components/3d/VehicleReactor3D';
import { VoiceOrb } from './components/VoiceOrb';
import { HUDTopBar } from './components/HUDTopBar';
import { HUDLeftPanel } from './components/HUDLeftPanel';
import { HUDRightPanel } from './components/HUDRightPanel';
import { HUDBottomDock } from './components/HUDBottomDock';
import { CursorFX } from './components/CursorFX';
import { VisionCameraModal } from './components/VisionCameraModal';
import { DesktopHUDModal } from './components/DesktopHUDModal';
import { FilesModal } from './components/FilesModal';
import { KeyboardModal } from './components/KeyboardModal';

export default function App() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('SPORTS');
  const {
    appState,
    errorMessage,
    transcript,
    voice,
    language,
    sensitivity,
    speakingRate,
    assistantName,
    emotion,
    isConnected,
    startSession,
    stopSession,
    changeVoice,
    changeLanguage,
    changeSensitivity,
    changeSpeakingRate,
    changeAssistantName,
    changeEmotion,
    sendTextMessage
  } = useLiveSession();

  const {
    muted,
    volume,
    toggleMute,
    changeVolume
  } = useAudio();

  // Keep screen awake using Expo Keep Awake & Web Wake Lock during active sessions
  useKeepAwake(appState);

  const [showSettings, setShowSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAudioUpload, setShowAudioUpload] = useState(false);
  const [showKeyboardInput, setShowKeyboardInput] = useState(false);
  const [showVision, setShowVision] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [keyboardText, setKeyboardText] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [layoutMode, setLayoutMode] = useState<'focused' | 'dashboard'>('dashboard');
  const [activeTab, setActiveTab] = useState<'voice' | 'music' | 'history' | 'settings'>('voice');

  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [launchedAppName, setLaunchedAppName] = useState<string>('');
  const [overlayArgs, setOverlayArgs] = useState<any>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState<{ text: string; isUser: boolean } | null>(null);
  const chatWorkerRef = useRef<Worker | null>(null);

  // Initialize Web Worker and request initial chat history load on mount
  useEffect(() => {
    // Instantiate background chat worker natively using Vite URL support
    const worker = new Worker(
      new URL('./workers/chat.worker.ts', import.meta.url),
      { type: 'module' }
    );
    chatWorkerRef.current = worker;

    // Listen for processed chat history or text concatenation updates
    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'HISTORY_LOADED' || type === 'MESSAGES_UPDATED') {
        setChatMessages(payload);
      } else if (type === 'HISTORY_CLEARED') {
        setChatMessages([]);
      }
    };

    // Request loaded messages from background IndexedDB
    worker.postMessage({ type: 'LOAD_HISTORY' });

    // Trigger startSession on load if microphone permission is granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((status) => {
        if (status.state === 'granted') {
          startSession();
        }
      });
    }

    return () => {
      worker.terminate();
    };
  }, [startSession]);

  // Sync voice transcript stream to chat messages history with high performance
  useEffect(() => {
    if (!transcript || !transcript.text.trim()) return;

    // Update accumulated subtitles text
    setAccumulatedTranscript((prev) => {
      if (prev && prev.isUser === transcript.isUser) {
        return {
          isUser: transcript.isUser,
          text: prev.text + transcript.text
        };
      } else {
        return {
          isUser: transcript.isUser,
          text: transcript.text
        };
      }
    });

    // Auto-clear accumulated subtitles after 5 seconds of silence
    const clearSubtitleTimer = setTimeout(() => {
      setAccumulatedTranscript(null);
    }, 5000);

    // Offload chunk parsing and database writes to Web Worker
    if (chatWorkerRef.current) {
      chatWorkerRef.current.postMessage({
        type: 'ADD_TRANSCRIPT',
        payload: { transcript }
      });
    }

    return () => {
      clearTimeout(clearSubtitleTimer);
    };
  }, [transcript]);

  const handleSendTextMessage = (text: string) => {
    const now = Date.now();
    const messageId = `msg-user-type-${now}`;

    // Delegate message addition to Web Worker
    if (chatWorkerRef.current) {
      chatWorkerRef.current.postMessage({
        type: 'ADD_TEXT_MESSAGE',
        payload: { text, messageId }
      });
    }

    if (appState === 'disconnected' || appState === 'error') {
      startSession();
    }
    
    sendTextMessage(text);
    
    if (chatWorkerRef.current) {
      chatWorkerRef.current.postMessage({
        type: 'UPDATE_MESSAGE_STATUS',
        payload: { id: messageId, status: 'sent' }
      });
    }
  };

  const handleClearChat = async () => {
    if (chatWorkerRef.current) {
      chatWorkerRef.current.postMessage({
        type: 'CLEAR_HISTORY'
      });
    }
  };

  // Auto-dismiss transient action status notifications
  useEffect(() => {
    if (pendingConfirmation) {
      const timer = setTimeout(() => {
        setPendingConfirmation(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [pendingConfirmation]);

  // Register ToolExecutor callbacks
  useEffect(() => {
    ToolExecutor.registerConfirmationCallback((request) => {
      setPendingConfirmation(request);
    });

    ToolExecutor.registerActionCallback((action, args) => {
      console.log('[App] Action received from ToolExecutor:', action, args);
      if (action === 'openSettings') {
        setShowSettings(true);
      } else if (action === 'renameAssistant') {
        if (args && args.newName) {
          changeAssistantName(args.newName);
          // If the session is connected, hot reconnect to apply new system instruction name
          if (isConnected) {
            stopSession();
            setTimeout(() => {
              startSession();
            }, 600);
          }
        }
      } else {
        setActiveOverlay(action);
        setOverlayArgs(args || null);
        if (args && args.appName) {
          setLaunchedAppName(args.appName);
        }
      }
    });
  }, [changeAssistantName, isConnected, startSession, stopSession]);

  // Check for microphone permissions on load to display custom permission screen
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((permissionStatus) => {
        setMicPermissionGranted(permissionStatus.state === 'granted');
        permissionStatus.onchange = () => {
          setMicPermissionGranted(permissionStatus.state === 'granted');
        };
      });
    }
  }, []);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop stream immediately, just checking / requesting permission
      stream.getTracks().forEach((track) => track.stop());
      setMicPermissionGranted(true);
      // Automatically connect after permission is given
      startSession();
    } catch (err) {
      console.warn('[App] Microphone permission denied:', err);
      setMicPermissionGranted(false);
    }
  };

  const handleMainButtonClick = () => {
    if (appState === 'disconnected' || appState === 'error') {
      if (micPermissionGranted === false) {
        requestMicPermission();
      } else {
        startSession();
      }
    } else {
      stopSession();
    }
  };

  const handleDownloadConversation = () => {
    if (chatMessages.length === 0) {
      alert("No database transcripts to export yet. Please start chatting first!");
      return;
    }
    const markdownContent = chatMessages.map((msg) => {
      const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Just Now';
      const speaker = msg.isUser ? 'USER' : assistantName.toUpperCase();
      return `### [${time}] **${speaker}**:\n${msg.text}\n\n---\n`;
    }).join('\n');
    
    const blob = new Blob([`# ${assistantName.toUpperCase()} FULL CONVERSATION DATABASE\n\nGenerated on: ${new Date().toLocaleString()}\n\n${markdownContent}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${assistantName.toLowerCase()}-conversation-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAudioUploadComplete = (analysisResult: string) => {
    if (chatWorkerRef.current) {
      chatWorkerRef.current.postMessage({
        type: 'APPEND_CHAT',
        message: { text: analysisResult, isUser: true }
      });
    }
    sendTextMessage(analysisResult);
  };

  const handleSendKeyboardMessage = () => {
    if (!keyboardText.trim()) return;
    const text = keyboardText.trim();
    setKeyboardText('');
    
    if (chatWorkerRef.current) {
      chatWorkerRef.current.postMessage({
        type: 'APPEND_CHAT',
        message: { text, isUser: true }
      });
    }
    sendTextMessage(text);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div 
      id="app-container" 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-black text-zinc-100 relative overflow-x-hidden font-sans select-none flex flex-col justify-between"
    >
      {/* 1. 3D WebGL Background Canvas & Starfield */}
      <BackgroundCanvas />

      {/* 2. Interactive Neon Cursor Glow & Trailing Particles */}
      <CursorFX />

      {/* Direct Main UI Startup - Loading Screen Removed */}

      {/* 4. Top Header HUD Bar */}
      <HUDTopBar
        appState={appState}
        onOpenSettings={() => setShowSettings(true)}
        onOpenLogs={() => setShowLogs(true)}
        onOpenApiKey={() => setShowApiKey(true)}
      />

      {/* 5. Main Center Stage 3-Column Sci-Fi Grid */}
      <main className="w-full max-w-7xl mx-auto px-4 py-4 relative z-20 flex flex-col lg:flex-row gap-6 items-start justify-between flex-1">
        
        {/* Left Column: Quick Action Glass Cards */}
        <HUDLeftPanel
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab as any)}
          onOpenChat={() => setShowChat(true)}
          onOpenFiles={() => setShowFiles(true)}
          onOpenDesktop={() => setShowDesktop(true)}
          onOpenVision={() => setShowVision(true)}
          onOpenHistory={() => setShowHistory(true)}
          onOpenMemory={() => setShowMemory(true)}
          onOpenSettings={() => setShowSettings(true)}
          onTriggerCommand={(cmd) => handleSendTextMessage(cmd)}
        />

        {/* Center Stage Arena: 3D Holographic Vehicle Reactor & Shivans AI Voice Controls */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[480px]">
          
          {/* Permission request overlay (if microphone is denied) */}
          {micPermissionGranted === false && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-6 rounded-3xl bg-zinc-950/80 border border-red-500/20 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center gap-4 mb-6 relative overflow-hidden z-30"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-600" />
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Microphone Access Needed</h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-mono">
                Shivans AI is a real-time Voice-to-Voice assistant. Without microphone permissions, he cannot hear your commands.
              </p>
              <button
                onClick={requestMicPermission}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-lg text-white"
              >
                <Mic className="w-4 h-4" /> Grant Microphone Access
              </button>
            </motion.div>
          )}

          {/* Global Connection / WebSocket Error Display Box */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 text-xs mb-6 font-mono relative overflow-hidden z-30"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold uppercase tracking-wider mb-0.5">Vocal Engine Error</div>
                <div>{errorMessage}</div>
              </div>
            </motion.div>
          )}

          {/* 3D Holographic Vehicle Reactor Core */}
          <VehicleReactor3D
            appState={(['listening', 'thinking', 'speaking', 'error'].includes(appState) ? appState : 'idle') as any}
            voiceLevel={volume || 0.3}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            onSelectHoloRing={(label) => handleSendTextMessage(`Activate ${label}`)}
          />

          <VoiceOrb
            appState={(['listening', 'thinking', 'speaking', 'error'].includes(appState) ? appState : 'idle') as any}
            voiceLevel={volume || 0.3}
            onToggleVoice={handleMainButtonClick}
          />

          {/* Real-time Subtitle / Transcript Banner */}
          {accumulatedTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-3 px-5 py-2.5 rounded-2xl bg-zinc-950/90 border border-cyan-500/30 backdrop-blur-xl text-xs font-mono text-cyan-200 max-w-xl text-center shadow-[0_0_20px_rgba(6,182,212,0.2)] z-30"
            >
              <span className="font-bold text-cyan-400 mr-2">
                {accumulatedTranscript.isUser ? 'YOU:' : 'SHIVANS AI:'}
              </span>
              <span>{accumulatedTranscript.text}</span>
            </motion.div>
          )}

          {/* Quick Voice Command Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-lg z-30">
            {[
              'Hey Shivans, introduce yourself',
              'Who developed you?',
              'Switch vehicle to SPORTS',
              'What time is it right now?',
              'Set climate temp to 22°C'
            ].map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => handleSendTextMessage(cmd)}
                className="px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-cyan-500/10 text-[11px] font-mono text-cyan-200 transition-all cursor-pointer shadow-sm"
              >
                💬 "{cmd}"
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Live AI Telemetry & Vehicle Stats */}
        <HUDRightPanel
          appState={appState}
          emotion={emotion}
          voiceLevel={volume || 0.35}
          vehicleModel={selectedVehicle}
        />
      </main>

      {/* Floating Bottom Sci-Fi Glass Dock */}
      <HUDBottomDock
        appState={appState}
        muted={muted}
        onToggleMute={toggleMute}
        onToggleVoice={handleMainButtonClick}
        onOpenKeyboard={() => setShowKeyboardInput(true)}
        onOpenVision={() => setShowVision(true)}
        onOpenFiles={() => setShowFiles(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenMemory={() => setShowMemory(true)}
      />

      {/* 5. Custom Slide-in Glassmorphic Settings Dialog Overlay */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop click barrier */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            
            {/* Settings Overlay Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass rounded-3xl p-6 w-full max-w-md shadow-[0_24px_64px_rgba(139,92,246,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-500" />
                         <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h2 className="text-base font-bold font-mono uppercase tracking-wider text-theme-primary">Vocal Settings</h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 rounded-full glass text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Assistant Name Customizer */}
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-purple-950/10 border border-purple-500/10 shadow-[inner_0_1px_1px_rgba(255,255,255,0.05)]">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">Assistant Name (AI Identity)</span>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">Interactive rename active</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={assistantName}
                      onChange={(e) => changeAssistantName(e.target.value)}
                      placeholder="Enter custom female name..."
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-950/80 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      onClick={() => {
                        changeAssistantName('BABU AI');
                        if (isConnected) {
                          stopSession();
                          setTimeout(() => startSession(), 600);
                        }
                      }}
                      className="px-3 py-2 rounded-xl glass border border-white/5 text-zinc-400 hover:text-white transition-all text-[10px] font-mono font-bold uppercase cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  
                  {/* Preset Suggestions */}
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Quick Female Suggestions</span>
                    <div className="flex flex-wrap gap-1">
                      {['Zoya', 'Priya', 'Zara', 'Simran', 'Riya', 'Sneha', 'Neha', 'Kavya'].map((nameSuggestion) => (
                        <button
                          key={nameSuggestion}
                          onClick={() => {
                            changeAssistantName(nameSuggestion);
                            // If connected, automatically reconnect with new system instruction context
                            if (isConnected) {
                              stopSession();
                              setTimeout(() => startSession(), 600);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                            assistantName.toLowerCase() === nameSuggestion.toLowerCase()
                              ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                              : 'bg-zinc-950/40 text-zinc-400 hover:text-white border border-white/5 hover:border-purple-500/30'
                          }`}
                        >
                          {nameSuggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Voice Selection Panel */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Selected Personality</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SUPPORTED_VOICES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => changeVoice(v.id)}
                        className={`px-3 py-2 rounded-xl border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                          voice === v.id
                            ? 'bg-purple-500/15 border-purple-400/50 text-purple-400 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                            : 'glass border-white/5 hover:border-purple-500/30 text-zinc-300'
                        }`}
                      >
                        <span className="text-xs font-bold">{v.name}</span>
                        <span className="text-[9px] text-zinc-400 truncate leading-tight">{v.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Selection */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Multilingual Voice Support</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { code: 'English', label: 'English' },
                      { code: 'Hindi', label: 'हिन्दी' },
                      { code: 'Hinglish', label: 'Hinglish' },
                      { code: 'Maithili', label: 'मैथिली' },
                      { code: 'Bhojpuri', label: 'भोजपुरी' },
                      { code: 'Urdu', label: 'اردو' },
                      { code: 'Bengali', label: 'বাংলা' },
                      { code: 'Marathi', label: 'मराठी' },
                      { code: 'Gujarati', label: 'ગુજરાતી' },
                      { code: 'Punjabi', label: 'ਪੰਜਾਬੀ' },
                      { code: 'Tamil', label: 'தமிழ்' },
                      { code: 'Telugu', label: 'తెలుగు' },
                      { code: 'Kannada', label: 'ಕನ್ನಡ' },
                      { code: 'Malayalam', label: 'മലയാളം' },
                      { code: 'Odia', label: 'ଓଡ଼ିଆ' },
                      { code: 'Assamese', label: 'অসমীয়া' }
                    ].map((langItem) => (
                      <button
                        key={langItem.code}
                        onClick={() => changeLanguage(langItem.code)}
                        className={`px-2 py-1.5 rounded-lg border text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                          language === langItem.code
                            ? 'bg-purple-500/15 border-purple-400/50 text-purple-400 font-bold'
                            : 'glass border-white/5 hover:border-purple-500/30 text-zinc-300'
                        }`}
                      >
                        <span className="text-[11px] leading-tight font-medium">{langItem.label}</span>
                        {langItem.code !== langItem.label && (
                          <span className="text-[8px] opacity-50 font-mono mt-0.5">{langItem.code}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Microphone Sensitivity */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Microphone Sensitivity</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { value: 'low', label: 'Low', desc: 'Noisy rooms' },
                      { value: 'medium', label: 'Medium', desc: 'Normal' },
                      { value: 'high', label: 'High', desc: 'Quiet space' }
                    ].map((sensItem) => (
                      <button
                        key={sensItem.value}
                        onClick={() => changeSensitivity(sensItem.value)}
                        className={`px-2 py-1.5 rounded-lg border text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                          sensitivity === sensItem.value
                            ? 'bg-purple-500/15 border-purple-400/50 text-purple-400 font-bold'
                            : 'glass border-white/5 hover:border-purple-500/30 text-zinc-300'
                        }`}
                      >
                        <span className="text-xs font-bold">{sensItem.label}</span>
                        <span className="text-[8px] opacity-40 mt-0.5 leading-none">{sensItem.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speaker Volume Slider Control */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    <span>Synthesizer Volume</span>
                    <span className="text-purple-400 font-bold">{Math.round(volume * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="flex-1 accent-purple-500 bg-zinc-800 h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* AI Speaking Rate Slider Control */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    <span>AI Voice Speaking Rate</span>
                    <span className="text-purple-400 font-bold">{speakingRate.toFixed(2)}x</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={speakingRate}
                      onChange={(e) => changeSpeakingRate(parseFloat(e.target.value))}
                      className="flex-1 accent-purple-500 bg-zinc-800 h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Gemini API Key Configuration Section */}
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" /> Gemini API Key Section
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400">
                      {typeof localStorage !== 'undefined' && localStorage.getItem('babu_custom_api_key') ? 'Custom Key Set' : 'Default Key'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      setShowApiKey(true);
                    }}
                    className="w-full py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all text-xs font-mono flex items-center justify-center gap-2 cursor-pointer font-bold"
                  >
                    <Key className="w-3.5 h-3.5" /> Add / Configure API Key
                  </button>
                </div>

                {/* Storage & Memory Settings */}
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-rose-950/10 border border-rose-500/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-bold">Memory & Storage</span>
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to clear your entire chat history? This cannot be undone.')) {
                        await handleClearChat();
                        setShowSettings(false);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-300 hover:bg-rose-500/10 transition-all text-xs font-sans flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Chat History
                  </button>
                </div>

                {/* Diagnostic Details */}
                <div className="p-3 rounded-2xl glass font-mono text-[9px] leading-relaxed text-zinc-400 flex flex-col gap-1">
                  <div className="text-zinc-300 font-bold uppercase mb-1">Session Diagnostics</div>
                  <div className="flex justify-between">
                    <span>Engine Mode:</span>
                    <span className="text-purple-400 font-bold">PCM 16-bit 16000Hz (In)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Playback Output:</span>
                    <span className="text-purple-400 font-bold">PCM 16-bit 24000Hz (Out)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Barge-in / Interruption:</span>
                    <span className="text-emerald-400 font-bold">ENABLED (Auto)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Host API Proxy:</span>
                    <span className="text-fuchsia-400 font-bold">Express unified WS</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowSettings(false);
                    // If connected, automatically restart the session with the new query configs
                    if (isConnected) {
                      stopSession();
                      setTimeout(() => {
                        startSession();
                      }, 400);
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-xs font-mono font-bold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-lg mt-1"
                >
                  Apply Settings & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Quick Help Guide Modal */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-400 to-indigo-500" />
              
              <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-fuchsia-400 animate-pulse" />
                  <h2 className="text-base font-bold font-mono uppercase tracking-wider">Babu AI Guide</h2>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1.5 rounded-full glass text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4 font-mono text-xs leading-relaxed text-zinc-400">
                <p>
                  Welcome to <span className="text-white font-bold">Babu AI v2</span>, a premium next-generation Voice-to-Voice AI.
                </p>
                <div className="flex flex-col gap-2 glass p-3.5 rounded-2xl border-white/5 text-[11px]">
                  <div className="text-white font-bold uppercase mb-1">Key Features:</div>
                  <div className="flex items-start gap-2">
                    <span className="text-fuchsia-400">•</span>
                    <span><strong className="text-zinc-300">Continuous Stream:</strong> Talk naturally without holding buttons.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-fuchsia-400">•</span>
                    <span><strong className="text-zinc-300">Barge-In (Interruption):</strong> Speak while Babu AI is responding to interrupt and guide her.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-fuchsia-400">•</span>
                    <span><strong className="text-zinc-300">Function Calls:</strong> Ask Babu to open websites, maps, YouTube, compose emails, WhatsApp, and more.</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-white font-bold uppercase">Try Speaking:</div>
                  <blockquote className="border-l-2 border-fuchsia-500 pl-3 italic text-zinc-300 text-[11px] flex flex-col gap-1.5">
                    <div>"Open maps for Tokyo, Japan."</div>
                    <div>"Search YouTube for cooking recipes."</div>
                    <div>"Tell me a joke but make it teasing!"</div>
                  </blockquote>
                </div>

                <button
                  onClick={() => setShowHelp(false)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-xs font-mono font-bold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-lg mt-2"
                >
                  Let's Begin!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Custom Slide-in Confirmation Dialog Overlay */}
      <AnimatePresence>
        {pendingConfirmation && (
          <ConfirmationDialog
            pending={pendingConfirmation}
            onConfirm={() => {
              const resolve = pendingConfirmation.resolve;
              setPendingConfirmation(null);
              resolve({ confirmed: true });
            }}
            onCancel={() => {
              const resolve = pendingConfirmation.resolve;
              setPendingConfirmation(null);
              resolve({ confirmed: false });
            }}
          />
        )}
      </AnimatePresence>

      {/* Simulated Android App Interfaces Overlay Manager */}
      <AndroidOverlayManager
        activeOverlay={activeOverlay}
        launchedAppName={launchedAppName}
        overlayArgs={overlayArgs}
        onClose={() => {
          setActiveOverlay(null);
          setOverlayArgs(null);
        }}
        onOpenSettings={() => {
          setActiveOverlay(null);
          setOverlayArgs(null);
          setShowSettings(true);
        }}
      />

      {/* 7. Persistent Diagnostics Live Logs Terminal Overlay */}
      <AnimatePresence>
        {showLogs && (
          <LogsModal onClose={() => setShowLogs(false)} />
        )}
      </AnimatePresence>

      {/* 8. Cognitive Memories Overlay */}
      <AnimatePresence>
        {showMemory && (
          <MemoryModal 
            onClose={() => setShowMemory(false)} 
            assistantName={assistantName}
          />
        )}
      </AnimatePresence>

      {/* 9. Historical Transcripts Database Overlay */}
      <AnimatePresence>
        {showHistory && (
          <HistoryPanelModal
            onClose={() => setShowHistory(false)}
            chatMessages={chatMessages}
            onClearHistory={() => {
              if (chatWorkerRef.current) {
                chatWorkerRef.current.postMessage({ type: 'CLEAR_HISTORY' });
              }
              setChatMessages([]);
            }}
          />
        )}
      </AnimatePresence>

      {/* 10. Drag-and-Drop Audio Upload Analyzer */}
      <AnimatePresence>
        {showAudioUpload && (
          <AudioUploadModal
            onClose={() => setShowAudioUpload(false)}
            onAnalyzeComplete={handleAudioUploadComplete}
          />
        )}
      </AnimatePresence>

      {/* 11. API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={showApiKey}
        onClose={() => setShowApiKey(false)}
        onApiKeySaved={() => {
          if (isConnected) {
            stopSession();
            setTimeout(() => startSession(), 400);
          }
        }}
      />

      {/* 12. Futuristic Sci-Fi HUD Modals */}
      <AnimatePresence>
        {showVision && (
          <VisionCameraModal onClose={() => setShowVision(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDesktop && (
          <DesktopHUDModal onClose={() => setShowDesktop(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFiles && (
          <FilesModal onClose={() => setShowFiles(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showKeyboardInput && (
          <KeyboardModal
            onClose={() => setShowKeyboardInput(false)}
            onSendText={(text) => {
              handleSendTextMessage(text);
              setShowKeyboardInput(false);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
