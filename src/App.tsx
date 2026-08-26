import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Sparkles, AlertTriangle } from 'lucide-react';

import { useLiveSession } from './hooks/useLiveSession';
import { useAudio } from './hooks/useAudio';
import { useKeepAwake } from './hooks/useKeepAwake';

import { HUDTopBar } from './components/HUDTopBar';
import { Sidebar, ActiveNavTab } from './components/Sidebar';
import { JarvisMainDashboard } from './components/JarvisMainDashboard';
import { SystemMonitor } from './components/SystemMonitor';
import { ApplicationLauncher } from './components/ApplicationLauncher';
import { AIConversationPanel } from './components/AIConversationPanel';
import { AutomationCenter } from './components/AutomationCenter';
import { FileAssistant } from './components/FileAssistant';
import { BrowserControl } from './components/BrowserControl';
import { NotificationCenter } from './components/NotificationCenter';
import { SettingsDashboard } from './components/SettingsDashboard';
import { BackgroundCanvas } from './components/3d/BackgroundCanvas';
import { CursorFX } from './components/CursorFX';
import { VideoPlayerDock } from './components/VideoPlayerDock';
import { SecondScreenWindow } from './components/SecondScreenWindow';
import ApiKeyModal from './components/ApiKeyModal';
import LogsModal from './components/LogsModal';

import { ChatMessage } from './types';
import ToolExecutor from './services/ToolExecutor';

export default function App() {
  const {
    appState,
    errorMessage,
    transcript,
    voice,
    speakingRate,
    assistantName,
    emotion,
    clapEnabled,
    clapMode,
    clapSensitivity,
    clapNotice,
    backgroundModeEnabled,
    startSession,
    stopSession,
    toggleClapEnabled,
    changeClapMode,
    changeClapSensitivity,
    toggleBackgroundMode,
    changeVoice,
    changeSpeakingRate,
    changeAssistantName,
    sendTextMessage,
    clearError,
    retryMic
  } = useLiveSession();

  const {
    muted,
    volume,
    toggleMute,
    changeVolume
  } = useAudio();

  useKeepAwake(appState);

  // UI Navigation & Modal States
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatWorkerRef = useRef<Worker | null>(null);

  // Initialize Worker for background IndexedDB Chat History
  useEffect(() => {
    const worker = new Worker(
      new URL('./workers/chat.worker.ts', import.meta.url),
      { type: 'module' }
    );
    chatWorkerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'HISTORY_LOADED' || type === 'MESSAGES_UPDATED') {
        setChatMessages(payload);
      }
    };

    worker.postMessage({ type: 'LOAD_HISTORY' });

    return () => {
      worker.terminate();
    };
  }, []);

  // Sync Live Voice Transcript Stream to Chat History
  useEffect(() => {
    if (!transcript || !transcript.text.trim()) return;

    if (chatWorkerRef.current) {
      chatWorkerRef.current.postMessage({
        type: 'ADD_TRANSCRIPT',
        payload: { transcript }
      });
    }
  }, [transcript]);

  // Handle Text Message Submission
  const handleSendTextMessage = (text: string) => {
    const messageId = `msg-${Date.now()}`;
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
  };

  // Tool Executor Callbacks
  useEffect(() => {
    ToolExecutor.registerActionCallback((action, args) => {
      if (action === 'openSettings') {
        setShowSettingsModal(true);
      } else if (action === 'openAnyApplication') {
        if (args && args.appName) {
          const nameLower = args.appName.toLowerCase();
          if (nameLower.includes('youtube')) {
            window.open('https://youtube.com', '_blank');
          } else if (nameLower.includes('chrome') || nameLower.includes('google')) {
            window.open('https://google.com', '_blank');
          } else if (nameLower.includes('whatsapp')) {
            window.open('https://web.whatsapp.com', '_blank');
          }
        }
      }
    });
  }, []);

  // Voice command execution helper
  const handleExecuteVoiceCommand = (cmd: string) => {
    if (appState === 'disconnected' || appState === 'error') {
      startSession();
    }
    sendTextMessage(cmd);
  };

  const handleToggleVoiceSession = () => {
    if (appState === 'disconnected' || appState === 'error') {
      startSession();
    } else {
      stopSession();
    }
  };

  return (
    <div className="w-screen h-screen bg-[#020617] text-slate-100 flex flex-col justify-between overflow-hidden relative font-sans select-none">
      
      {/* 3D Dynamic Ambient Starfield / Particle Background */}
      <BackgroundCanvas />

      {/* Futuristic Cursor Glow */}
      <CursorFX />

      {/* TOP BAR STATUS HEADER */}
      <HUDTopBar
        appState={appState}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenLogs={() => setShowLogsModal(true)}
        onOpenApiKey={() => setShowApiKeyModal(true)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleMic={handleToggleVoiceSession}
      />

      {/* MAIN DESKTOP THREE-COLUMN WORKSPACE */}
      <div className="flex-1 flex w-full h-[calc(100vh-3.5rem)] overflow-hidden relative z-20">
        
        {/* 1. LEFT COLLAPSIBLE NAVIGATION SIDEBAR */}
        <Sidebar
          appState={appState}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* 2. CENTER WORKSPACE STAGE */}
        <main className="flex-1 h-full overflow-hidden relative flex flex-col">
          {activeTab === 'home' || activeTab === 'voice' ? (
            <JarvisMainDashboard
              appState={appState}
              transcript={transcript?.text}
              errorMessage={errorMessage}
              emotion={emotion}
              clapEnabled={clapEnabled}
              clapNotice={clapNotice}
              onStartSession={startSession}
              onStopSession={stopSession}
              onClearError={clearError}
              onRetryMic={retryMic}
              muted={muted}
              onToggleMute={toggleMute}
              volume={volume}
              onChangeVolume={changeVolume}
              onExecuteVoiceCommand={handleExecuteVoiceCommand}
            />
          ) : activeTab === 'chat' ? (
            <div className="p-4 sm:p-6 w-full h-full">
              <AIConversationPanel
                messages={chatMessages}
                onSendMessage={handleSendTextMessage}
                onStartVoice={handleToggleVoiceSession}
                isListening={appState === 'listening'}
                onSpeakText={(text) => sendTextMessage(text)}
              />
            </div>
          ) : activeTab === 'applications' || activeTab === 'whatsapp' || activeTab === 'youtube' || activeTab === 'gmail' ? (
            <ApplicationLauncher
              onLaunchApp={(appName) => handleExecuteVoiceCommand(`Shivansh, open ${appName}`)}
            />
          ) : activeTab === 'files' ? (
            <FileAssistant />
          ) : activeTab === 'browser' ? (
            <BrowserControl />
          ) : activeTab === 'system' ? (
            <div className="p-4 sm:p-6 w-full h-full">
              <SystemMonitor />
            </div>
          ) : activeTab === 'automation' ? (
            <AutomationCenter />
          ) : activeTab === 'tasks' || activeTab === 'history' ? (
            <NotificationCenter />
          ) : activeTab === 'settings' ? (
            <SettingsDashboard
              voice={voice}
              volume={volume}
              speakingRate={speakingRate}
              assistantName={assistantName}
              clapEnabled={clapEnabled}
              clapMode={clapMode}
              clapSensitivity={clapSensitivity}
              backgroundModeEnabled={backgroundModeEnabled}
              onChangeVoice={changeVoice}
              onChangeVolume={changeVolume}
              onChangeRate={changeSpeakingRate}
              onChangeAssistantName={changeAssistantName}
              onToggleClap={toggleClapEnabled}
              onChangeClapMode={changeClapMode}
              onChangeClapSensitivity={changeClapSensitivity}
              onToggleBackgroundMode={toggleBackgroundMode}
            />
          ) : (
            <JarvisMainDashboard
              appState={appState}
              transcript={transcript?.text}
              errorMessage={errorMessage}
              emotion={emotion}
              clapEnabled={clapEnabled}
              clapNotice={clapNotice}
              onStartSession={startSession}
              onStopSession={stopSession}
              onClearError={clearError}
              onRetryMic={retryMic}
              muted={muted}
              onToggleMute={toggleMute}
              volume={volume}
              onChangeVolume={changeVolume}
              onExecuteVoiceCommand={handleExecuteVoiceCommand}
            />
          )}
        </main>

        {/* 3. RIGHT INFORMATION PANEL (LIVE SYSTEM MONITORING) */}
        <aside className="hidden lg:block w-80 h-full shrink-0">
          <SystemMonitor />
        </aside>

      </div>

      {/* SETTINGS OVERLAY MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl h-[80vh] bg-slate-950 border border-cyan-500/30 rounded-3xl p-4 shadow-2xl z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-2">
                <span className="font-mono font-bold text-cyan-300 text-sm uppercase tracking-wider">
                  SHIVANSH CONFIGURATION
                </span>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SettingsDashboard
                voice={voice}
                volume={volume}
                speakingRate={speakingRate}
                assistantName={assistantName}
                clapEnabled={clapEnabled}
                clapMode={clapMode}
                clapSensitivity={clapSensitivity}
                backgroundModeEnabled={backgroundModeEnabled}
                onChangeVoice={changeVoice}
                onChangeVolume={changeVolume}
                onChangeRate={changeSpeakingRate}
                onChangeAssistantName={changeAssistantName}
                onToggleClap={toggleClapEnabled}
                onChangeClapMode={changeClapMode}
                onChangeClapSensitivity={changeClapSensitivity}
                onToggleBackgroundMode={toggleBackgroundMode}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIDEO / YOUTUBE / CHROME PLAYBACK DOCK */}
      <VideoPlayerDock onSendVoiceCommand={sendTextMessage} />

      {/* SHIVANS AI DEDICATED SECOND SCREEN WINDOW CONTROLLER */}
      <SecondScreenWindow onVoiceCommandTrigger={handleExecuteVoiceCommand} />

      {/* API KEY MODAL */}
      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />

      {/* LOGS MODAL */}
      {showLogsModal && <LogsModal onClose={() => setShowLogsModal(false)} />}

    </div>
  );
}
