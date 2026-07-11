import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  Image as ImageIcon, 
  X, 
  Info, 
  Disc, 
  Volume2, 
  Clock, 
  History,
  HelpCircle,
  VolumeX,
  AlertCircle
} from 'lucide-react';

interface MusicTrack {
  id: string;
  prompt: string;
  model: string;
  duration: 'short' | 'long';
  audioUrl: string;
  lyrics: string | null;
  timestamp: string;
  hasImage: boolean;
}

export const MusicTab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<'short' | 'long'>('short');
  const [image, setImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio playback state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved tracks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lyria_generated_tracks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTracks(parsed);
        if (parsed.length > 0) {
          setActiveTrack(parsed[0]);
        }
      } catch (e) {
        console.error('Failed to load tracks:', e);
      }
    }
  }, []);

  // Sync tracks to localStorage
  const saveTracks = (newTracks: MusicTrack[]) => {
    setTracks(newTracks);
    localStorage.setItem('lyria_generated_tracks', JSON.stringify(newTracks));
  };

  // Generation status text steps
  const generationSteps = [
    'Initializing connection to Lyria...',
    'Analyzing musical prompt and style...',
    'Arranging harmonies and melodic motifs...',
    'Synthesizing multi-instrument layers...',
    'Generating lyrics and vocal paths...',
    'Mixing and mastering high-fidelity wav...',
    'Finalizing audio buffer render...'
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationStep(0);
      interval = setInterval(() => {
        setGenerationStep((prev) => (prev < generationSteps.length - 1 ? prev + 1 : prev));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Handle Preset Selection
  const presets = [
    { text: 'Cinematic orchestral fantasy journey', label: '🎻 Orchestral' },
    { text: 'Chilled lo-fi hip hop beats for late night coding', label: '☕ Study Lo-Fi' },
    { text: 'High energy 80s synthwave theme for racing', label: '🚗 Synthwave' },
    { text: 'Ambient space drone with celestial modular synths', label: '🌌 Space Ambient' },
    { text: 'Upbeat modern Bollywood dance party track', label: '💃 Bollywood' }
  ];

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError('Image file must be under 4MB');
        return;
      }
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate Music API Call
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a prompt describing your music.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setIsPlaying(false);

    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration: duration,
          image: image,
          imageMimeType: imageMimeType
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Server error generating music.');
      }

      // Convert base64 audio response to a local Blob URL
      const binary = atob(result.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: result.mimeType || 'audio/wav' });
      const localAudioUrl = URL.createObjectURL(blob);

      const newTrack: MusicTrack = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        model: result.model,
        duration: duration,
        audioUrl: localAudioUrl,
        lyrics: result.lyrics,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
        hasImage: !!image
      };

      const updatedTracks = [newTrack, ...tracks];
      saveTracks(updatedTracks);
      setActiveTrack(newTrack);

      // Trigger automatic play after generation
      setTimeout(() => {
        setIsPlaying(true);
      }, 500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Verify your Gemini API key has paid access tier for Lyria models.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio Playback Listeners
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, activeTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const seekAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const toggleMuteState = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const downloadTrack = (track: MusicTrack) => {
    const a = document.createElement('a');
    a.href = track.audioUrl;
    a.download = `babu-music-${track.id}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 py-2 relative z-10 select-none">
      
      {/* Hidden Audio element for player */}
      {activeTrack && (
        <audio
          ref={audioRef}
          src={activeTrack.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
      )}

      {/* Hero Badge */}
      <div className="text-center flex flex-col items-center gap-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-3 py-1 rounded-full bg-pink-950/40 border border-pink-500/20 text-[9px] font-mono font-bold text-pink-300 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> AI Lyria Composer
        </motion.div>

        <h1 className="text-3xl font-extrabold font-mono tracking-tight text-white flex items-center gap-2">
          <Music className="w-7 h-7 text-pink-400 animate-bounce" /> Music Studio
        </h1>
        <p className="text-xs text-zinc-400 max-w-md font-sans">
          Synthesize high-fidelity melodies, vocals, and lyrics directly from text or image concepts.
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
        
        {/* Left Input Console: 7 Columns */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-5 rounded-3xl border border-white/5 bg-zinc-950/20 glass flex flex-col gap-4 shadow-xl">
            
            {/* Prompt Label & Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono uppercase tracking-wider text-pink-300 font-bold flex items-center gap-1">
                  <span>Describe your song idea</span>
                </label>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">Input text prompt</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Compose a beautiful acoustic guitar track with soft female vocals about travel and finding oneself..."
                className="w-full h-24 px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500 font-sans leading-relaxed resize-none transition-all"
                disabled={isGenerating}
              />
            </div>

            {/* Presets Chips */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Preset Prompts</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(preset.text)}
                    disabled={isGenerating}
                    className="text-[9px] font-sans px-2.5 py-1 rounded-full border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-pink-300 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid for duration and optional image input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              {/* Duration choice */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-fuchsia-300 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Select Track Duration
                </label>
                <div className="flex gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setDuration('short')}
                    disabled={isGenerating}
                    className={`flex-1 text-[10px] font-mono py-2 rounded-lg transition-all cursor-pointer text-center ${
                      duration === 'short'
                        ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 font-bold'
                        : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300'
                    }`}
                  >
                    Short Clip (30s)
                  </button>
                  <button
                    onClick={() => setDuration('long')}
                    disabled={isGenerating}
                    className={`flex-1 text-[10px] font-mono py-2 rounded-lg transition-all cursor-pointer text-center ${
                      duration === 'long'
                        ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 font-bold'
                        : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300'
                    }`}
                  >
                    Full Track
                  </button>
                </div>
              </div>

              {/* Optional Image input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Image Inspiration (Optional)
                </label>
                <div className="relative">
                  {image ? (
                    <div className="relative w-full h-[38px] rounded-xl overflow-hidden border border-cyan-500/20 bg-black/40 flex items-center justify-between px-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={image} alt="Inspiration" className="w-6 h-6 object-cover rounded-md border border-white/10" />
                        <span className="text-[9px] font-mono text-cyan-300 truncate">Image selected</span>
                      </div>
                      <button
                        onClick={clearImage}
                        disabled={isGenerating}
                        className="p-1 rounded-md bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 cursor-pointer transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isGenerating}
                      className="w-full h-[38px] rounded-xl border border-white/10 bg-black/40 hover:bg-white/[0.02] hover:border-cyan-500/20 text-[10px] font-sans font-bold text-zinc-500 hover:text-cyan-300 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Upload Cover or Inspiration
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Error messaging inside workspace */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono text-rose-300 flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Composer Error: </span>{error}
                </div>
              </div>
            )}

            {/* Action Composer Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-3.5 rounded-2xl font-mono uppercase tracking-widest text-[11px] font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isGenerating
                  ? 'bg-zinc-800 text-zinc-500 border border-white/5'
                  : 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-pink-950/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <Disc className="w-4 h-4 animate-spin text-pink-400" />
                  Generating Track...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  Synthesize Music
                </>
              )}
            </button>

          </div>

          {/* Model info banner helper */}
          <div className="flex items-start gap-2.5 px-3 py-1 text-zinc-500">
            <Info className="w-3.5 h-3.5 text-zinc-600 mt-0.5" />
            <p className="text-[10px] leading-relaxed">
              Music is synthesized on server-side using <span className="text-zinc-400 font-mono font-bold">lyria-3-clip-preview</span> (up to 30s clips) and <span className="text-zinc-400 font-mono font-bold">lyria-3-pro-preview</span> (full tracks). Replays and track metadata are stored in your browser's persistent cache.
            </p>
          </div>
        </div>

        {/* Right Active Player & Library: 5 Columns */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              /* Loading Screen Bento */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-6 rounded-3xl border border-white/5 bg-zinc-950/20 glass flex flex-col items-center justify-center min-h-[340px] text-center gap-6 shadow-xl relative overflow-hidden"
              >
                {/* Custom animated vinyl record */}
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                    className="w-24 h-24 rounded-full border-4 border-zinc-900 bg-gradient-to-tr from-black via-zinc-800 to-black shadow-lg flex items-center justify-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 border-2 border-pink-400/30 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    </div>
                  </motion.div>
                  {/* Glowing pulse rings */}
                  <div className="absolute inset-0 border border-pink-500/20 rounded-full scale-110 animate-ping pointer-events-none" />
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-mono uppercase font-bold text-pink-300 tracking-wider">
                    {generationSteps[generationStep]}
                  </h3>
                  <div className="w-48 h-1 bg-zinc-800 rounded-full mx-auto overflow-hidden">
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                      className="w-1/2 h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">Wait about 10-15 seconds for synthesis...</span>
                </div>
              </motion.div>
            ) : activeTrack ? (
              /* High fidelity active player console */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-6 rounded-3xl border border-white/5 bg-zinc-950/20 glass flex flex-col gap-5 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/[0.03] blur-3xl pointer-events-none" />

                {/* Track Album Core */}
                <div className="flex gap-4 items-center">
                  {/* Rotating Vinyl when playing */}
                  <motion.div
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-800 via-black to-zinc-900 border-2 border-zinc-800 shrink-0 shadow-md flex items-center justify-center relative"
                  >
                    <div className="w-5 h-5 rounded-full bg-pink-500/30 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    </div>
                  </motion.div>

                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[8px] font-mono uppercase font-bold tracking-widest text-pink-400">Now Playing</span>
                    <h3 className="text-xs font-sans text-white font-bold truncate leading-snug">{activeTrack.prompt}</h3>
                    <div className="flex gap-1.5 items-center">
                      <span className="text-[9px] font-mono text-zinc-500">Model: {activeTrack.model}</span>
                      <span className="text-zinc-600 text-[8px]">•</span>
                      <span className="text-[9px] font-mono text-zinc-500">{activeTrack.duration === 'short' ? '30s Clip' : 'Full Track'}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Audio Waveform Visualizer */}
                <div className="h-12 bg-black/40 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center gap-0.5 px-3">
                  {Array.from({ length: 28 }).map((_, idx) => {
                    const hFactor = idx % 2 === 0 ? 0.3 : idx % 3 === 0 ? 0.6 : 0.8;
                    const playingHeight = isPlaying ? [10, Math.floor(hFactor * 32), 10] : [Math.floor(hFactor * 20)];
                    return (
                      <motion.div
                        key={idx}
                        animate={{ height: playingHeight }}
                        transition={{
                          repeat: Infinity,
                          duration: isPlaying ? 0.5 + Math.random() * 0.4 : 0,
                          ease: 'easeInOut'
                        }}
                        className={`w-1 rounded-full ${
                          isPlaying 
                            ? 'bg-gradient-to-t from-pink-500 to-fuchsia-400 shadow-[0_0_4px_rgba(236,72,153,0.3)]' 
                            : 'bg-zinc-700'
                        }`}
                        style={{ height: `${Math.floor(hFactor * 20)}px` }}
                      />
                    );
                  })}
                </div>

                {/* Progress bar and time indicators */}
                <div className="flex flex-col gap-1">
                  <input
                    type="range"
                    min="0"
                    max={audioDuration || 0}
                    step="0.1"
                    value={currentTime}
                    onChange={seekAudio}
                    className="w-full accent-pink-500 h-1 rounded-lg bg-zinc-800 cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>

                {/* Player Controls Panel */}
                <div className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-xl border border-white/5">
                  <button
                    onClick={toggleMuteState}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-400 text-white flex items-center justify-center shadow-md cursor-pointer transform hover:scale-105 transition-all"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white text-white" /> : <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />}
                  </button>

                  <button
                    onClick={() => downloadTrack(activeTrack)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-white/5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {/* Lyrics / Transcription segment if available */}
                {activeTrack.lyrics && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-pink-300 font-bold">Composition Lyrics / Metadata</span>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 max-h-24 overflow-y-auto text-[10px] font-sans text-zinc-400 leading-relaxed whitespace-pre-wrap select-text">
                      {activeTrack.lyrics}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* No Track State placeholder */
              <div className="p-6 rounded-3xl border border-white/5 bg-zinc-950/20 glass flex flex-col items-center justify-center min-h-[300px] text-center gap-4 shadow-xl">
                <Music className="w-10 h-10 text-zinc-600 animate-pulse" />
                <div className="flex flex-col gap-1">
                  <h3 className="text-xs font-mono uppercase font-bold text-zinc-400">No generated tracks</h3>
                  <p className="text-[10px] text-zinc-500 max-w-[200px] leading-relaxed mx-auto">
                    Type a prompt and hit "Synthesize" to generate your first AI music masterwork!
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Recently generated tracks segment */}
          {tracks.length > 0 && (
            <div className="p-5 rounded-3xl border border-white/5 bg-zinc-950/20 glass flex flex-col gap-3 shadow-xl max-h-[220px] overflow-hidden">
              <div className="flex items-center gap-1.5 pb-2 border-b border-white/5 justify-between">
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-pink-400" />
                  <h3 className="text-[10px] font-mono font-bold uppercase text-white tracking-wider">Music Library</h3>
                </div>
                <span className="text-[9px] font-mono text-zinc-500">{tracks.length} track(s)</span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[150px] pr-1">
                {tracks.map((track) => {
                  const isActive = activeTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        setActiveTrack(track);
                        setIsPlaying(true);
                      }}
                      className={`p-2.5 rounded-xl border flex justify-between items-center gap-3 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-pink-500/10 border-pink-500/30 text-white'
                          : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Music className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-pink-400 animate-pulse' : 'text-zinc-600'}`} />
                        <div className="flex flex-col truncate">
                          <span className="text-[10px] font-sans font-bold truncate leading-tight">{track.prompt}</span>
                          <span className="text-[8px] font-mono text-zinc-500">{track.timestamp}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = tracks.filter((t) => t.id !== track.id);
                          saveTracks(updated);
                          if (activeTrack?.id === track.id) {
                            setIsPlaying(false);
                            setActiveTrack(updated.length > 0 ? updated[0] : null);
                          }
                        }}
                        className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-300 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default MusicTab;
