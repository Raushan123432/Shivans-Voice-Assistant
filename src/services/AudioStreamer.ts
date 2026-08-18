import { float32ToInt16, int16ToBase64, base64ToFloat32 } from '../utils/audio';

export class AudioStreamer {
  private outputCtx: AudioContext | null = null;
  private inputCtx: AudioContext | null = null;
  
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  
  // Analysers for reactive UI animations
  private playerAnalyser: AnalyserNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micProcessor: ScriptProcessorNode | null = null;
  
  private volumeNode: GainNode | null = null;
  private currentVolume = 1.0;
  private isMuted = false;
  private currentSpeakingRate = 1.0;

  private onAudioInputCallback: ((base64Pcm: string) => void) | null = null;

  constructor() {}

  /**
   * Initialize standard output context for playing speaker audio at 24000Hz
   */
  public initPlayer() {
    if (!this.outputCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      // Setup Analyser
      this.playerAnalyser = this.outputCtx.createAnalyser();
      this.playerAnalyser.fftSize = 256;
      this.playerAnalyser.smoothingTimeConstant = 0.4;
      
      // Setup Gain node for volume control
      this.volumeNode = this.outputCtx.createGain();
      this.volumeNode.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.outputCtx.currentTime);
      
      // Connect: Source -> Volume -> Analyser -> Destination
      this.volumeNode.connect(this.playerAnalyser);
      this.playerAnalyser.connect(this.outputCtx.destination);
    }
    
    if (this.outputCtx.state === 'suspended') {
      this.outputCtx.resume();
    }
  }

  /**
   * Set speaker volume (0.0 to 1.0)
   */
  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.volumeNode && this.outputCtx) {
      this.volumeNode.gain.setValueAtTime(
        this.isMuted ? 0 : this.currentVolume,
        this.outputCtx.currentTime
      );
    }
  }

  /**
   * Set voice speaking rate (0.5 to 2.0)
   */
  public setSpeakingRate(rate: number) {
    this.currentSpeakingRate = Math.max(0.5, Math.min(2.0, rate));
  }

  /**
   * Mute or unmute speaker output
   */
  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.volumeNode && this.outputCtx) {
      this.volumeNode.gain.setValueAtTime(
        muted ? 0 : this.currentVolume,
        this.outputCtx.currentTime
      );
    }
  }

  /**
   * Schedules and plays a base64 PCM 24kHz audio chunk with gapless scheduling
   */
  public playChunk(base64Data: string) {
    try {
      this.initPlayer();
      if (!this.outputCtx || !this.volumeNode) return;

      const float32Data = base64ToFloat32(base64Data);
      const audioBuffer = this.outputCtx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = this.outputCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = this.currentSpeakingRate;
      
      // Connect to volumeNode so it can go through volume -> analyser -> destination
      source.connect(this.volumeNode);

      const currentTime = this.outputCtx.currentTime;
      // If our scheduled start is in the past, reset it to current time with a small padding
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime + 0.05;
      }

      source.start(this.nextStartTime);
      this.activeSources.push(source);

      // Advance our next scheduled start time by buffer duration adjusted for speaking rate
      const duration = audioBuffer.duration;
      this.nextStartTime += duration / this.currentSpeakingRate;

      source.onended = () => {
        this.activeSources = this.activeSources.filter((s) => s !== source);
      };
    } catch (e) {
      console.error('[AudioStreamer] Error playing chunk:', e);
    }
  }

  /**
   * Interrupt player immediately (silence speaker, clear scheduling queue)
   */
  public interrupt() {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (err) {
        // Source already stopped/not started
      }
    });
    this.activeSources = [];
    this.nextStartTime = 0;
  }

  /**
   * Start recording microphone at 16000Hz and call callback with base64 PCM
   */
  public async startRecording(onAudioInput: (base64Pcm: string) => void) {
    this.onAudioInputCallback = onAudioInput;
    
    try {
      // 1. Get audio stream
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // 2. Initialize input AudioContext with sampleRate = 16000 for Gemini Live compatibility
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.inputCtx = new AudioContextClass({ sampleRate: 16000 });
      
      this.micAnalyser = this.inputCtx.createAnalyser();
      this.micAnalyser.fftSize = 256;
      this.micAnalyser.smoothingTimeConstant = 0.4;

      this.micSource = this.inputCtx.createMediaStreamSource(this.micStream);
      this.micSource.connect(this.micAnalyser);

      // Use a standard ScriptProcessorNode to batch audio buffers
      this.micProcessor = this.inputCtx.createScriptProcessor(2048, 1, 1);
      
      this.micSource.connect(this.micProcessor);
      this.micProcessor.connect(this.inputCtx.destination); // Required for processing

      this.micProcessor.onaudioprocess = (e) => {
        if (!this.onAudioInputCallback) return;
        
        const float32 = e.inputBuffer.getChannelData(0);
        const int16 = float32ToInt16(float32);
        const base64 = int16ToBase64(int16);
        
        if (base64) {
          this.onAudioInputCallback(base64);
        }
      };
    } catch (e: any) {
      this.stopRecording();
      const isPermDenied = e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError' || String(e?.message).includes('Permission denied');
      if (isPermDenied) {
        console.warn('[AudioStreamer] Microphone permission denied by browser or environment settings.');
      } else {
        console.warn('[AudioStreamer] Failed to initialize microphone input:', e);
      }
      throw e;
    }
  }

  /**
   * Stop capturing microphone input
   */
  public stopRecording() {
    this.onAudioInputCallback = null;

    if (this.micProcessor) {
      try {
        this.micProcessor.disconnect();
      } catch (e) {}
      this.micProcessor = null;
    }

    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch (e) {}
      this.micSource = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.inputCtx) {
      this.inputCtx.close();
      this.inputCtx = null;
    }

    this.micAnalyser = null;
  }

  /**
   * Returns current speaker real-time frequency data
   */
  public getPlayerFrequencyData(): Uint8Array {
    if (!this.playerAnalyser) return new Uint8Array(128).fill(0);
    const dataArray = new Uint8Array(this.playerAnalyser.frequencyBinCount);
    this.playerAnalyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Returns current microphone real-time frequency data
   */
  public getMicFrequencyData(): Uint8Array {
    if (!this.micAnalyser) return new Uint8Array(128).fill(0);
    const dataArray = new Uint8Array(this.micAnalyser.frequencyBinCount);
    this.micAnalyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Cleans up all system resources
   */
  public destroy() {
    this.interrupt();
    this.stopRecording();
    
    if (this.outputCtx) {
      this.outputCtx.close();
      this.outputCtx = null;
    }
    this.playerAnalyser = null;
    this.volumeNode = null;
  }

  /**
   * Plays a beautiful synthesized startup bell sound using Web Audio oscillators
   */
  public playStartupChime() {
    try {
      this.initPlayer();
      if (!this.outputCtx) return;
      const now = this.outputCtx.currentTime;
      
      const osc1 = this.outputCtx.createOscillator();
      const osc2 = this.outputCtx.createOscillator();
      const gainNode = this.outputCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // Chime-like bell arpeggio C4 -> G4 -> C5 -> E5
      osc1.frequency.setValueAtTime(261.63, now); // C4
      osc1.frequency.exponentialRampToValueAtTime(392.00, now + 0.15); // G4
      osc1.frequency.exponentialRampToValueAtTime(523.25, now + 0.35); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.6); // E5

      osc2.frequency.setValueAtTime(329.63, now + 0.1); // E4
      osc2.frequency.exponentialRampToValueAtTime(493.88, now + 0.25); // B4
      osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.45); // E5
      osc2.frequency.exponentialRampToValueAtTime(987.77, now + 0.7); // B5

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.currentVolume * 0.18, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      
      // Route through main volumeNode to respect general mute/volume settings
      if (this.volumeNode) {
        gainNode.connect(this.volumeNode);
      } else {
        gainNode.connect(this.outputCtx.destination);
      }

      osc1.start(now);
      osc2.start(now + 0.1);
      
      osc1.stop(now + 1.6);
      osc2.stop(now + 1.6);
    } catch (e) {
      console.warn('[AudioStreamer] Could not play startup chime:', e);
    }
  }

  /**
   * Plays a beautiful synthesized shutdown descend sound using Web Audio oscillators
   */
  public playShutdownChime() {
    try {
      this.initPlayer();
      if (!this.outputCtx) return;
      const now = this.outputCtx.currentTime;

      const osc = this.outputCtx.createOscillator();
      const gainNode = this.outputCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(220.00, now + 0.5); // A3

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.currentVolume * 0.15, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gainNode);
      
      if (this.volumeNode) {
        gainNode.connect(this.volumeNode);
      } else {
        gainNode.connect(this.outputCtx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.warn('[AudioStreamer] Could not play shutdown chime:', e);
    }
  }
}

// Export singleton instance for easy app-wide sharing
export const audioStreamer = new AudioStreamer();
export default audioStreamer;
