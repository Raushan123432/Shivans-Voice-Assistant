import React, { useState } from 'react';
import { 
  Volume2, Mic, Bot, Shield, Sliders, Check, Sparkles, Moon, Lock, Cpu, 
  UserCheck, RotateCcw, Star, Heart, Smile, Zap, Radio, BellRing, Sparkle, ShieldCheck, Play
} from 'lucide-react';
import { VoiceType } from '../types';
import { ClapSensitivity, ClapMode, clapDetector } from '../services/ClapDetector';
import audioStreamer from '../services/AudioStreamer';

interface SettingsDashboardProps {
  voice: VoiceType;
  volume: number;
  speakingRate: number;
  assistantName?: string;
  clapEnabled?: boolean;
  clapMode?: ClapMode;
  clapSensitivity?: ClapSensitivity;
  backgroundModeEnabled?: boolean;
  onChangeVoice: (v: VoiceType) => void;
  onChangeVolume: (vol: number) => void;
  onChangeRate: (rate: number) => void;
  onChangeAssistantName?: (name: string) => void;
  onToggleClap?: (enabled?: boolean) => void;
  onChangeClapMode?: (mode: ClapMode) => void;
  onChangeClapSensitivity?: (sens: ClapSensitivity) => void;
  onToggleBackgroundMode?: (enabled?: boolean) => void;
}

export interface PersonaProfile {
  id: string;
  name: string;
  title: string;
  isDefault?: boolean;
  recommendedVoice: VoiceType;
  traits: string[];
  description: string;
  samplePhrase: string;
  behaviorDetails: {
    tone: string;
    respectfulness: string;
    gentleness: string;
    formality: string;
  };
}

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({
  voice,
  volume,
  speakingRate,
  assistantName,
  clapEnabled = true,
  clapMode = 'single',
  clapSensitivity = 'medium',
  backgroundModeEnabled = true,
  onChangeVoice,
  onChangeVolume,
  onChangeRate,
  onChangeAssistantName,
  onToggleClap,
  onChangeClapMode,
  onChangeClapSensitivity,
  onToggleBackgroundMode
}) => {
  const [activeTab, setActiveTab] = useState<'persona' | 'voice' | 'clap' | 'emotional' | 'ai' | 'security'>('persona');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('shivansh');
  const [wakeWord, setWakeWord] = useState('Shivansh');
  const [responseStyle, setResponseStyle] = useState('Emotionally Attuned Companion');
  const [gentlenessLevel, setGentlenessLevel] = useState<number>(95);
  const [addressStyle, setAddressStyle] = useState<string>("Respectful Companion (Sir / Ji)");
  const [testClapSuccess, setTestClapSuccess] = useState<boolean>(false);

  // Emotional mode options
  const [emotionAwareness, setEmotionAwareness] = useState<boolean>(true);
  const [hindiHinglishFillers, setHindiHinglishFillers] = useState<boolean>(true);
  const [interruptibleBargeIn, setInterruptibleBargeIn] = useState<boolean>(true);

  // Security permissions
  const [micPerm, setMicPerm] = useState(true);
  const [appPerm, setAppPerm] = useState(true);
  const [filePerm, setFilePerm] = useState(true);

  const personaProfiles: PersonaProfile[] = [
    {
      id: 'shivansh',
      name: 'Shivansh',
      title: 'Emotionally Aware AI Voice Companion & PC Controller',
      isDefault: true,
      recommendedVoice: 'Zephyr',
      traits: ['Empathetic', 'Respectful', 'Multilingual', 'Intelligent'],
      description: 'Caring, emotionally attuned, human-like voice companion fluent in Hindi, Hinglish, and English with Windows PC control and instant Clap-to-Talk wake activation.',
      samplePhrase: '"Achha... kya hua? Agar aap baat karna chahein to bata sakte hain. Main sun raha hoon, sir."',
      behaviorDetails: {
        tone: 'Warm, Empathetic & Natural',
        respectfulness: 'Maximum High (100%)',
        gentleness: 'Soothing & Attuned (95%)',
        formality: 'Natural Human Companion'
      }
    },
    {
      id: 'zoya',
      name: 'Zoya',
      title: 'Empathetic Companion Persona',
      recommendedVoice: 'Kore',
      traits: ['Warm', 'Encouraging', 'Conversational'],
      description: 'Warm, cheerful, and empathetic AI companion focusing on supportive productivity and friendly day-to-day conversation.',
      samplePhrase: '"Hello! Everything is set up and ready. Let\'s make today productive and great!"',
      behaviorDetails: {
        tone: 'Warm & Upbeat',
        respectfulness: 'Friendly High (85%)',
        gentleness: 'Soothing (90%)',
        formality: 'Casual Professional'
      }
    },
    {
      id: 'jarvis',
      name: 'Jarvis Command',
      title: 'Tactical AI Command Persona',
      recommendedVoice: 'Fenrir',
      traits: ['Witty', 'Analytical', 'Direct'],
      description: 'Sharp, concise system administrator tone focused on tactical speed, brevity, and zero-latency command execution.',
      samplePhrase: '"Systems operational, sir. Direct tactical command channels standby."',
      behaviorDetails: {
        tone: 'Crisp Tactical',
        respectfulness: 'Formal (80%)',
        gentleness: 'Direct & Sharp (60%)',
        formality: 'High Command'
      }
    },
    {
      id: 'puck',
      name: 'Puck Classic',
      title: 'British Accent Classic Assistant',
      recommendedVoice: 'Puck',
      traits: ['Sophisticated', 'Polite', 'Articulate'],
      description: 'Polite, classic British inflection with refined vocabulary and attentive execution.',
      samplePhrase: '"Right away, sir. I have executed the task to your exact specifications."',
      behaviorDetails: {
        tone: 'Aristocratic Polite',
        respectfulness: 'High (90%)',
        gentleness: 'Polite (85%)',
        formality: 'British Traditional'
      }
    }
  ];

  const currentPersona = personaProfiles.find(p => p.id === selectedPersonaId) || personaProfiles[0];

  const handleSelectPersona = (persona: PersonaProfile) => {
    setSelectedPersonaId(persona.id);
    onChangeVoice(persona.recommendedVoice);
    if (onChangeAssistantName) {
      onChangeAssistantName(persona.name);
    }
    setWakeWord(persona.name);
  };

  const handleResetToDefaultShivansh = () => {
    const shivanshPersona = personaProfiles[0];
    setSelectedPersonaId(shivanshPersona.id);
    onChangeVoice(shivanshPersona.recommendedVoice);
    if (onChangeAssistantName) {
      onChangeAssistantName('Shivansh AI');
    }
    setWakeWord('Shivansh');
    setGentlenessLevel(95);
    setResponseStyle('Emotionally Attuned Companion');
    setAddressStyle("Respectful Companion (Sir / Ji)");
  };

  const handleTestClap = () => {
    audioStreamer.playListeningChime();
    setTestClapSuccess(true);
    setTimeout(() => setTestClapSuccess(false), 2500);
  };

  const voices: { id: VoiceType; name: string; gender: string; style: string }[] = [
    { id: 'Zephyr', name: 'Zephyr Human-Like', gender: 'Smooth Neutral', style: 'Emotionally Expressive & Fluid' },
    { id: 'Kore', name: 'Zoya AI Female', gender: 'Female', style: 'Warm, Empathetic & Natural' },
    { id: 'Puck', name: 'Shivansh British Male', gender: 'Male', style: 'Sophisticated & Polite' },
    { id: 'Charon', name: 'Shivansh Deep Male', gender: 'Male', style: 'Commanding & Deep Resonance' },
    { id: 'Fenrir', name: 'Shivansh Tactical Male', gender: 'Male', style: 'Crisp & Precise Engineering' },
  ];

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6 custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-900">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight font-sans text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400 animate-pulse" />
            SHIVANSH AI Assistant Preferences
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Emotional Voice Companion • Clap-to-Talk Activation • Background Assistant
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
          SYSTEM CONFIGURATION
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-900 pb-2 overflow-x-auto">
        {[
          { id: 'persona', label: 'Persona Profile', icon: UserCheck },
          { id: 'clap', label: '👏 Clap-to-Talk & BG Mode', icon: Zap },
          { id: 'emotional', label: '❤️ Emotional AI & Hindi', icon: Heart },
          { id: 'voice', label: 'Voice Settings', icon: Volume2 },
          { id: 'ai', label: 'AI Intelligence', icon: Bot },
          { id: 'security', label: 'Security & Permissions', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 space-y-6">
        
        {/* PERSONA CONFIGURATION TAB */}
        {activeTab === 'persona' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase block">
                  Select AI Voice Persona Profile
                </label>
                <button
                  onClick={handleResetToDefaultShivansh}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Default (Shivansh)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personaProfiles.map((p) => {
                  const isSelected = selectedPersonaId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPersona(p)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {p.isDefault && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-cyan-500 text-slate-950 text-[9px] font-mono font-black uppercase px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-slate-950" />
                          RECOMMENDED
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-extrabold text-base text-white font-sans">{p.name}</h3>
                          <span className="text-[10px] font-mono text-cyan-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                            {p.recommendedVoice}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mb-3">{p.title}</p>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {p.traits.map((trait) => (
                            <span
                              key={trait}
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                p.id === 'shivansh'
                                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40'
                                  : 'bg-slate-900 text-slate-300 border-slate-800'
                              }`}
                            >
                              • {trait}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {p.description}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] font-mono text-cyan-200 italic">
                        {p.samplePhrase}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Persona Behavior Fine-Tuning */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-900 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white font-sans">
                      Active Persona: <span className="text-cyan-300">{currentPersona.name}</span>
                    </h3>
                    <p className="text-xs font-mono text-slate-400">Behavioral Matrix Parameters</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentPersona.isDefault && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      EMOTIONAL COMPANION ACTIVE
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Tone Style</span>
                  <span className="text-xs font-mono font-bold text-cyan-300">{currentPersona.behaviorDetails.tone}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Respectfulness</span>
                  <span className="text-xs font-mono font-bold text-emerald-300">{currentPersona.behaviorDetails.respectfulness}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Gentleness</span>
                  <span className="text-xs font-mono font-bold text-cyan-300">{currentPersona.behaviorDetails.gentleness}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Formality</span>
                  <span className="text-xs font-mono font-bold text-indigo-300">{currentPersona.behaviorDetails.formality}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLAP-TO-TALK & BACKGROUND ASSISTANT TAB */}
        {activeTab === 'clap' && (
          <div className="space-y-6">
            
            {/* Clap-to-Talk Activation Card */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-lg">
                    👏
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white font-sans">Clap-to-Talk Activation</h3>
                    <p className="text-xs font-mono text-slate-400">Wake and talk to Shivansh AI instantly with hand claps</p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleClap && onToggleClap(!clapEnabled)}
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                    clapEnabled
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900 border border-slate-800 text-slate-500'
                  }`}
                >
                  {clapEnabled ? 'ENABLED (ACTIVE)' : 'DISABLED'}
                </button>
              </div>

              {/* Clap Trigger Mode (Single vs Double) */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 block">
                  Clap Trigger Pattern
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onChangeClapMode && onChangeClapMode('single')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      clapMode === 'single'
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">👏 Single Clap</span>
                      {clapMode === 'single' && <Check className="w-4 h-4 text-cyan-300" />}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">
                      Wakes up immediately on one distinct hand clap (fastest wake response).
                    </p>
                  </button>

                  <button
                    onClick={() => onChangeClapMode && onChangeClapMode('double')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      clapMode === 'double'
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">👏👏 Double Clap</span>
                      {clapMode === 'double' && <Check className="w-4 h-4 text-cyan-300" />}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">
                      Requires two consecutive claps within 800ms (maximum noise immunity).
                    </p>
                  </button>
                </div>
              </div>

              {/* Clap Sensitivity */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 block">
                  Acoustic Sensitivity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as ClapSensitivity[]).map((sens) => (
                    <button
                      key={sens}
                      onClick={() => onChangeClapSensitivity && onChangeClapSensitivity(sens)}
                      className={`py-2 px-3 rounded-xl border text-center font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                        clapSensitivity === sens
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {sens}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-2">
                  {clapSensitivity === 'low' && 'Low: Requires firm, loud claps; ignores background household noise.'}
                  {clapSensitivity === 'medium' && 'Medium (Recommended): Balanced sensitivity calibrated for standard desk environments.'}
                  {clapSensitivity === 'high' && 'High: Sensitive trigger suitable for softer hand claps at a distance.'}
                </p>
              </div>

              {/* Test Clap Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-900">
                <span className="text-xs font-mono text-slate-400">
                  {testClapSuccess ? '👏 Wake Chime Triggered!' : 'Test acoustic wake response chime:'}
                </span>
                <button
                  onClick={handleTestClap}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Test Wake Chime</span>
                </button>
              </div>
            </div>

            {/* Background Assistant Mode Card */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white font-sans">Background Assistant Mode</h3>
                    <p className="text-xs font-mono text-slate-400">Keep voice listener active when minimized or switching tabs</p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleBackgroundMode && onToggleBackgroundMode(!backgroundModeEnabled)}
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                    backgroundModeEnabled
                      ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-900 border border-slate-800 text-slate-500'
                  }`}
                >
                  {backgroundModeEnabled ? 'ACTIVE (STANDBY)' : 'DISABLED'}
                </button>
              </div>

              <div className="text-xs font-mono text-slate-300 space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Audio streams and Web Audio context persist seamlessly when window loses focus.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Wake phrases ("Shivansh", "Hey Shivansh") and Clap triggers wake the assistant in background.</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* EMOTIONAL AI & HINDI / HINGLISH TAB */}
        {activeTab === 'emotional' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-sans">Emotional AI Conversational Companion</h3>
                  <p className="text-xs font-mono text-slate-400">Dynamic human-like empathy, vocal inflection & multilingual fluency</p>
                </div>
              </div>

              {/* Emotion Modes List */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-white block">Conversational Emotion Detection</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Detects moods (Happy, Sad, Angry, Excited, Confused, Tired, Joking, Serious) & adjusts tone
                    </span>
                  </div>
                  <button
                    onClick={() => setEmotionAwareness(!emotionAwareness)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold ${
                      emotionAwareness ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {emotionAwareness ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-white block">Hindi + Hinglish Conversational Fillers</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Uses natural expressions: "Hmm...", "Achha...", "Bilkul.", "Samajh gaya.", "Main sun raha hoon."
                    </span>
                  </div>
                  <button
                    onClick={() => setHindiHinglishFillers(!hindiHinglishFillers)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold ${
                      hindiHinglishFillers ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {hindiHinglishFillers ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-white block">Interruptible Speech (Barge-In)</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Immediately halts AI voice synthesis when you begin speaking
                    </span>
                  </div>
                  <button
                    onClick={() => setInterruptibleBargeIn(!interruptibleBargeIn)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold ${
                      interruptibleBargeIn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {interruptibleBargeIn ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>

              {/* Conversational Sample Dialog */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                  Hindi / Hinglish Empathy Example
                </span>
                <p className="text-xs text-slate-300 font-mono italic">
                  <b>User:</b> "Aaj mera mood thoda kharab hai."
                </p>
                <p className="text-xs text-cyan-200 font-mono italic">
                  <b>Shivansh:</b> "Achha... kya hua? Agar aap baat karna chahein to bata sakte hain. Main sun raha hoon, sir."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VOICE SETTINGS TAB */}
        {activeTab === 'voice' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 block">
                Select SHIVANSH Voice Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {voices.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => onChangeVoice(v.id)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      voice === v.id
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{v.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                        {v.gender}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400">{v.style}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Speaking Speed & Volume */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300 font-bold">Voice Output Volume</span>
                  <span className="text-cyan-400 font-bold">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300 font-bold">Speaking Speed</span>
                  <span className="text-cyan-400 font-bold">{speakingRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={speakingRate}
                  onChange={(e) => onChangeRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* AI INTELLIGENCE TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 block">
                  AI Model Engine
                </label>
                <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold">Gemini 2.5 Flash Real-Time Direct Voice Engine</span>
                  </div>
                  <span className="text-emerald-400 font-bold">LATENCY ~120ms</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 block">
                  Response Tone & Personality Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Emotionally Attuned Companion', 'Respectful Executive', 'Concise Technical', 'Friendly Conversational'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setResponseStyle(style)}
                      className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        responseStyle === style
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY & ACCESS TAB */}
        {activeTab === 'security' && (
          <div className="space-y-3 font-mono text-xs">
            {[
              { label: 'Microphone Continuous Access Permission', state: micPerm, toggle: () => setMicPerm(!micPerm) },
              { label: 'Desktop Application Launch & Automation', state: appPerm, toggle: () => setAppPerm(!appPerm) },
              { label: 'File Search & PC Management Permission', state: filePerm, toggle: () => setFilePerm(!filePerm) },
            ].map((p) => (
              <div key={p.label} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <span className="text-white font-bold">{p.label}</span>
                <button
                  onClick={p.toggle}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all cursor-pointer ${
                    p.state ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {p.state ? 'GRANTED' : 'DENIED'}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default SettingsDashboard;
