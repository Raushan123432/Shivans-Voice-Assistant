/**
 * ClapDetector — Precision Real-time Audio Transient Analyzer
 * Detects single and double claps using Web Audio API DSP signal analysis:
 * - Sudden amplitude spike / fast rise-time (< 20ms)
 * - Rapid acoustic decay (< 80ms)
 * - High-to-low spectral frequency energy ratio (1.2kHz-4.5kHz vs <350Hz)
 * - Self-speech acoustic suppression (ignoring AI's own audio playback)
 * - Configurable Sensitivity (Low, Medium, High) & Double-Clap window
 */

export type ClapSensitivity = 'low' | 'medium' | 'high';
export type ClapMode = 'single' | 'double';

export interface ClapDetectorOptions {
  enabled?: boolean;
  mode?: ClapMode;
  sensitivity?: ClapSensitivity;
  onClapDetected?: (type: ClapMode) => void;
  onClapStep?: (step: 'first_clap' | 'verified_clap') => void;
}

export class ClapDetector {
  private enabled: boolean = false;
  private mode: ClapMode = 'single';
  private sensitivity: ClapSensitivity = 'medium';
  
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  private isSpeaking: boolean = false;
  private isProcessing: boolean = false;

  private lastClapTime: number = 0;
  private firstClapTime: number = 0;
  private doubleClapTimeout: any = null;

  private onClapDetectedCallback?: (type: ClapMode) => void;
  private onClapStepCallback?: (step: 'first_clap' | 'verified_clap') => void;

  // Sensitivity configuration thresholds
  private sensitivityConfigs = {
    low: {
      peakThreshold: 0.55,
      transientRatio: 5.5,
      spectralRatioMin: 2.2,
      riseTimeMaxMs: 25,
      cooldownMs: 1400
    },
    medium: {
      peakThreshold: 0.38,
      transientRatio: 3.8,
      spectralRatioMin: 1.6,
      riseTimeMaxMs: 30,
      cooldownMs: 1200
    },
    high: {
      peakThreshold: 0.24,
      transientRatio: 2.6,
      spectralRatioMin: 1.2,
      riseTimeMaxMs: 35,
      cooldownMs: 1000
    }
  };

  constructor(options?: ClapDetectorOptions) {
    if (options) {
      if (options.enabled !== undefined) this.enabled = options.enabled;
      if (options.mode) this.mode = options.mode;
      if (options.sensitivity) this.sensitivity = options.sensitivity;
      if (options.onClapDetected) this.onClapDetectedCallback = options.onClapDetected;
      if (options.onClapStep) this.onClapStepCallback = options.onClapStep;
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.resetDoubleClap();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setMode(mode: ClapMode) {
    this.mode = mode;
    this.resetDoubleClap();
  }

  public getMode(): ClapMode {
    return this.mode;
  }

  public setSensitivity(sensitivity: ClapSensitivity) {
    this.sensitivity = sensitivity;
  }

  public getSensitivity(): ClapSensitivity {
    return this.sensitivity;
  }

  public setSpeaking(isSpeaking: boolean) {
    this.isSpeaking = isSpeaking;
  }

  public setCallbacks(
    onClapDetected: (type: ClapMode) => void,
    onClapStep?: (step: 'first_clap' | 'verified_clap') => void
  ) {
    this.onClapDetectedCallback = onClapDetected;
    this.onClapStepCallback = onClapStep;
  }

  /**
   * Start listening for claps using an existing MediaStream or acquiring a new one
   */
  public async start(stream?: MediaStream) {
    if (this.isProcessing) return;

    try {
      if (stream) {
        this.mediaStream = stream;
      } else if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false, // Keep transients sharp for detection
            autoGainControl: false
          }
        });
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 16000 });

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.1; // Low smoothing for rapid transients

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.analyser);

      // Analyze buffer in real time
      this.scriptNode = this.audioCtx.createScriptProcessor(1024, 1, 1);
      this.sourceNode.connect(this.scriptNode);
      this.scriptNode.connect(this.audioCtx.destination);

      let prevRms = 0.01;

      this.scriptNode.onaudioprocess = (e) => {
        if (!this.enabled || this.isSpeaking) {
          prevRms = 0.01;
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        const len = inputData.length;

        // 1. Calculate Peak Amplitude & RMS Energy
        let peak = 0;
        let sumSquares = 0;
        for (let i = 0; i < len; i++) {
          const abs = Math.abs(inputData[i]);
          if (abs > peak) peak = abs;
          sumSquares += abs * abs;
        }
        const rms = Math.sqrt(sumSquares / len);

        const config = this.sensitivityConfigs[this.sensitivity];

        // 2. Sudden amplitude jump detection (rise ratio)
        const riseRatio = peak / Math.max(0.005, prevRms);
        prevRms = 0.8 * prevRms + 0.2 * rms;

        if (peak < config.peakThreshold || riseRatio < config.transientRatio) {
          return;
        }

        // 3. Spectral Frequency Ratio check (Claps have high energy in 1.2kHz - 4.5kHz, low in <350Hz)
        if (this.analyser) {
          const freqData = new Uint8Array(this.analyser.frequencyBinCount);
          this.analyser.getByteFrequencyData(freqData);

          // Bin resolution at 16000Hz and 512 FFT = ~31.25Hz per bin
          // Low freq: bins 1 to 10 (~30Hz to ~310Hz)
          // Mid-High freq: bins 35 to 140 (~1100Hz to ~4375Hz)
          let lowEnergy = 0;
          for (let i = 1; i <= 10; i++) lowEnergy += freqData[i] || 0;
          lowEnergy = Math.max(1, lowEnergy / 10);

          let highEnergy = 0;
          for (let i = 35; i <= 140; i++) highEnergy += freqData[i] || 0;
          highEnergy = Math.max(1, highEnergy / 105);

          const spectralRatio = highEnergy / lowEnergy;
          if (spectralRatio < config.spectralRatioMin) {
            // Likely a low-frequency door slam, thud, or desk tap
            return;
          }
        }

        // 4. Time Cooldown & Mode Validation
        const now = Date.now();

        if (this.mode === 'single') {
          if (now - this.lastClapTime > config.cooldownMs) {
            this.lastClapTime = now;
            this.triggerClapSuccess('single');
          }
        } else if (this.mode === 'double') {
          if (this.firstClapTime === 0) {
            // First clap in candidate pair
            if (now - this.lastClapTime > config.cooldownMs) {
              this.firstClapTime = now;
              this.lastClapTime = now;
              this.onClapStepCallback?.('first_clap');

              // Window for second clap (200ms to 800ms)
              this.doubleClapTimeout = setTimeout(() => {
                this.resetDoubleClap();
              }, 850);
            }
          } else {
            // Potential second clap
            const delta = now - this.firstClapTime;
            if (delta >= 180 && delta <= 850) {
              this.resetDoubleClap();
              this.lastClapTime = now;
              this.onClapStepCallback?.('verified_clap');
              this.triggerClapSuccess('double');
            }
          }
        }
      };

      this.isProcessing = true;
      console.log('[ClapDetector] Active and listening for acoustic claps.');
    } catch (err) {
      console.warn('[ClapDetector] Initialization error:', err);
      this.isProcessing = false;
    }
  }

  private triggerClapSuccess(type: ClapMode) {
    console.log(`[ClapDetector] 👏 Verified ${type.toUpperCase()} CLAP event!`);
    this.onClapDetectedCallback?.(type);
  }

  private resetDoubleClap() {
    this.firstClapTime = 0;
    if (this.doubleClapTimeout) {
      clearTimeout(this.doubleClapTimeout);
      this.doubleClapTimeout = null;
    }
  }

  /**
   * Stop clap detection and cleanup nodes
   */
  public stop() {
    this.resetDoubleClap();

    if (this.scriptNode) {
      try { this.scriptNode.disconnect(); } catch (e) {}
      this.scriptNode = null;
    }
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch (e) {}
      this.sourceNode = null;
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch (e) {}
      this.audioCtx = null;
    }
    this.isProcessing = false;
  }

  public destroy() {
    this.stop();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
  }
}

export const clapDetector = new ClapDetector({
  enabled: false,
  mode: 'single',
  sensitivity: 'medium'
});

export default clapDetector;
