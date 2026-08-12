import React, { useState } from 'react';
import { Volume2, Mic, Bot, Shield, Sliders, Check, Sparkles, Moon, Lock, Cpu, UserCheck, RotateCcw, Star, Heart, Smile } from 'lucide-react';
import { VoiceType } from '../types';

interface SettingsDashboardProps {
  voice: VoiceType;
  volume: number;
  speakingRate: number;
  assistantName?: string;
  onChangeVoice: (v: VoiceType) => void;
  onChangeVolume: (vol: number) => void;
  onChangeRate: (rate: number) => void;
  onChangeAssistantName?: (name: string) => void;
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
  onChangeVoice,
  onChangeVolume,
  onChangeRate,
  onChangeAssistantName
}) => {
  const [activeTab, setActiveTab] = useState<'persona' | 'voice' | 'ai' | 'system' | 'security'>('persona');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('shivansh');
  const [wakeWord, setWakeWord] = useState('Shivansh');
  const [responseStyle, setResponseStyle] = useState('Respectful Executive');
  const [gentlenessLevel, setGentlenessLevel] = useState<number>(95);
  const [addressStyle, setAddressStyle] = useState<string>("Executive (Sir / Ma'am)");
  const [transparency, setTransparency] = useState(85);
  const [micPerm, setMicPerm] = useState(true);
  const [appPerm, setAppPerm] = useState(true);
  const [filePerm, setFilePerm] = useState(true);

  const personaProfiles: PersonaProfile[] = [
    {
      id: 'shivansh',
      name: 'Shivansh',
      title: 'Default Executive Assistant Persona',
      isDefault: true,
      recommendedVoice: 'Puck',
      traits: ['Professional', 'Gentle', 'Respectful'],
      description: 'Polite, respectful, and highly disciplined AI companion. Addresses the user with utmost deference, gentle vocal modulation, and executive precision.',
      samplePhrase: '"At your service, sir. All desktop parameters and system telemetries are running smoothly. How may I assist you today?"',
      behaviorDetails: {
        tone: 'Gentle Executive',
        respectfulness: 'Maximum High (100%)',
        gentleness: 'Soft & Calming (95%)',
        formality: 'Polite Professional'
      }
    },
    {
      id: 'zoya',
      name: 'Zoya Executive',
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
      id: 'zephyr',
      name: 'Zephyr Minimal',
      title: 'Ultra-Compact Notification Persona',
      recommendedVoice: 'Zephyr',
      traits: ['Quiet', 'Minimalist', 'Efficient'],
      description: 'Ultra-brief, quiet notification voice profile designed for minimal disturbance during deep focus work hours.',
      samplePhrase: '"Task completed. Status nominal."',
      behaviorDetails: {
        tone: 'Monotone Minimal',
        respectfulness: 'Neutral (75%)',
        gentleness: 'Neutral (70%)',
        formality: 'Compact'
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
    setResponseStyle('Respectful Executive');
    setAddressStyle("Executive (Sir / Ma'am)");
  };

  const voices: { id: VoiceType; name: string; gender: string; style: string }[] = [
    { id: 'Puck', name: 'SHIVANSH Classic Male', gender: 'Male', style: 'Sophisticated & British Accent' },
    { id: 'Charon', name: 'SHIVANSH Deep Male', gender: 'Male', style: 'Commanding & Deep Resonance' },
    { id: 'Kore', name: 'Zoya AI Female', gender: 'Female', style: 'Warm & Professional Executive' },
    { id: 'Fenrir', name: 'SHIVANSH Tactical Male', gender: 'Male', style: 'Crisp & Precise Engineering' },
    { id: 'Zephyr', name: 'Zephyr Smooth Female', gender: 'Female', style: 'Clear & Minimalist Tone' },
  ];

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans text-slate-100 flex flex-col gap-6 custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-900">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight font-sans text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400 animate-pulse" />
            SHIVANSH System Settings & Preferences
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Configure AI persona behavior, voice profiles, model behavior, and security
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
          { id: 'voice', label: 'Voice Settings', icon: Volume2 },
          { id: 'ai', label: 'AI Intelligence', icon: Bot },
          { id: 'system', label: 'System & Theme', icon: Moon },
          { id: 'security', label: 'Security & Access', icon: Lock },
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
            
            {/* Persona Switcher Cards */}
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
                          DEFAULT PERSONA
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

                        {/* Behavior Trait Tags */}
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
                      DEFAULT PERSONA ACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Behavior Grid Specs */}
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

              {/* Custom Sliders for Gentleness & Respectful Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-slate-300 font-bold">Gentleness & Softness Index</span>
                    <span className="text-cyan-400 font-bold">{gentlenessLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={gentlenessLevel}
                    onChange={(e) => setGentlenessLevel(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 block">
                    Address Deference Style
                  </label>
                  <div className="flex gap-2">
                    {["Executive (Sir / Ma'am)", "Polite Formal", "Friendly"].map((style) => (
                      <button
                        key={style}
                        onClick={() => setAddressStyle(style)}
                        className={`flex-1 py-1.5 px-2 rounded-xl border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          addressStyle === style
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

          </div>
        )}

        {/* VOICE SETTINGS TAB */}
        {activeTab === 'voice' && (
          <div className="space-y-6">
            {/* Voice Selection Cards */}
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

            {/* Wake Word */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-white">Voice Wake Word Activation</h4>
                <p className="text-xs font-mono text-slate-400 mt-0.5">Custom phrase to wake up assistant without clicking</p>
              </div>
              <input
                type="text"
                value={wakeWord}
                onChange={(e) => setWakeWord(e.target.value)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs outline-none"
              />
            </div>
          </div>
        )}

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
                  {['Respectful Executive', 'Concise Technical', 'Friendly Conversational'].map((style) => (
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

        {activeTab === 'system' && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Glassmorphism UI Opacity</span>
                <span className="text-slate-400 text-[11px]">Adjust background panel transparency level</span>
              </div>
              <span className="font-bold text-cyan-300">{transparency}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={transparency}
              onChange={(e) => setTransparency(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-3 font-mono text-xs">
            {[
              { label: 'Microphone Access Permission', state: micPerm, toggle: () => setMicPerm(!micPerm) },
              { label: 'Desktop Application Launch Permission', state: appPerm, toggle: () => setAppPerm(!appPerm) },
              { label: 'File System Search Permission', state: filePerm, toggle: () => setFilePerm(!filePerm) },
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
