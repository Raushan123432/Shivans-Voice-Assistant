import React, { useEffect, useRef } from 'react';
import { AppState } from '../types';
import audioStreamer from '../services/AudioStreamer';

interface WaveformProps {
  appState: AppState;
}

export const Waveform: React.FC<WaveformProps> = ({ appState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const phasesRef = useRef<number[]>([0, 2, 4]); // Phase values for 3 layered waves

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI scaling (Retina screens)
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Main 60fps drawing loop
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Get real-time audio energy level
      let maxEnergy = 0.05; // Base noise floor amplitude
      let frequencyBins = new Uint8Array(0);

      if (appState === 'speaking') {
        frequencyBins = audioStreamer.getPlayerFrequencyData();
      } else if (appState === 'listening') {
        frequencyBins = audioStreamer.getMicFrequencyData();
      }

      if (frequencyBins.length > 0) {
        let sum = 0;
        for (let i = 0; i < frequencyBins.length; i++) {
          sum += frequencyBins[i];
        }
        maxEnergy = Math.max(0.05, sum / frequencyBins.length / 255);
      }

      // If disconnected/offline, reduce waves to flat thin lines
      if (appState === 'disconnected' || appState === 'error') {
        maxEnergy = 0.002;
      }

      // 2. Draw three layered phase-shifted waves
      const waves = [
        { color: 'rgba(167, 139, 250, 0.6)', shadow: 'rgba(167, 139, 250, 0.85)', frequency: 0.008, speed: 0.12, amp: 55 }, // Light Purple
        { color: 'rgba(124, 58, 237, 0.5)', shadow: 'rgba(124, 58, 237, 0.85)', frequency: 0.006, speed: -0.08, amp: 45 }, // Deep Violet
        { color: 'rgba(192, 132, 252, 0.4)', shadow: 'rgba(192, 132, 252, 0.7)', frequency: 0.012, speed: 0.05, amp: 35 } // Orchid/Magenta
      ];

      waves.forEach((wave, idx) => {
        // Advance phase for the wave
        phasesRef.current[idx] += wave.speed;
        const phase = phasesRef.current[idx];

        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = idx === 0 ? 3.5 : 2.0;
        ctx.shadowBlur = appState === 'speaking' || appState === 'listening' ? 18 : 4;
        ctx.shadowColor = wave.shadow;

        const centerY = height / 2;

        for (let x = 0; x < width; x++) {
          // Calculate a taper envelope (0 at borders, 1 in the center) to avoid edge clipping
          const envelope = Math.sin((x / width) * Math.PI);
          
          // Generate wave amplitude based on phase and energy multiplier
          const y = centerY + Math.sin(x * wave.frequency + phase) * wave.amp * maxEnergy * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      // Reset shadows
      ctx.shadowBlur = 0;

      animationIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [appState]);

  return (
    <div className="w-full h-36 relative flex items-center justify-center overflow-hidden">
      {/* Underlying glow layer */}
      <div className={`absolute w-1/2 h-12 bg-gradient-to-r from-purple-500/15 via-violet-500/15 to-fuchsia-500/10 blur-[30px] rounded-full bottom-1/3 opacity-50 transition-all duration-700 ${appState === 'speaking' || appState === 'listening' ? 'scale-y-150 opacity-80' : 'scale-y-50'}`} />
      
      <canvas
        ref={canvasRef}
        className="w-full h-full block relative z-10"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default Waveform;
