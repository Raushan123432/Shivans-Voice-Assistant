import React, { useEffect, useRef } from 'react';
import { AppState } from '../types';
import audioStreamer from '../services/AudioStreamer';

interface StarfieldProps {
  appState: AppState;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  speed: number;
}

export const Starfield: React.FC<StarfieldProps> = ({ appState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameId = useRef<number | null>(null);

  // Initialize star data
  const initStars = (width: number, height: number) => {
    const starCount = Math.min(250, Math.floor((width * height) / 4000));
    const stars: Star[] = [];
    
    // Purple, Cyan, Fuchsia, and Pure White tones
    const colors = [
      'rgba(167, 139, 250, 0.65)', // Purple-400
      'rgba(34, 211, 238, 0.65)',  // Cyan-400
      'rgba(244, 63, 94, 0.55)',   // Rose-500
      'rgba(217, 70, 239, 0.65)',  // Fuchsia-500
      'rgba(255, 255, 255, 0.85)', // White
    ];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * width,
        size: Math.random() * 1.8 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.4 + 0.1,
      });
    }
    starsRef.current = stars;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let angle = 0;

    const animate = () => {
      if (!ctx || !canvas) return;

      // Real-time audio analysis for reactive warp speed
      let audioLevel = 0;
      if (appState === 'speaking') {
        const frequencies = audioStreamer.getPlayerFrequencyData();
        const sum = frequencies.reduce((a, b) => a + b, 0);
        audioLevel = frequencies.length > 0 ? sum / frequencies.length / 255 : 0;
      } else if (appState === 'listening') {
        const frequencies = audioStreamer.getMicFrequencyData();
        const sum = frequencies.reduce((a, b) => a + b, 0);
        audioLevel = frequencies.length > 0 ? sum / frequencies.length / 255 : 0;
      }

      // Smooth background fade to create beautiful particle trailers
      const fadeAlpha = appState === 'speaking' || appState === 'listening' ? 0.22 : 0.12;
      ctx.fillStyle = `rgba(5, 8, 22, ${fadeAlpha})`; // Space background (#050816 equivalent)
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Starfield movement scaling
      const baseWarp = appState === 'speaking' || appState === 'listening' ? 4 : 1;
      const warpFactor = baseWarp + audioLevel * 18;

      // Update and render stars
      starsRef.current.forEach((star) => {
        // Hyperspace-like forward drift
        star.z -= star.speed * warpFactor * 3;

        // Reset stars that fly past the camera or are too close
        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = (Math.random() - 0.5) * canvas.width * 1.5;
          star.y = (Math.random() - 0.5) * canvas.height * 1.5;
        }

        // Perspective projection
        const k = 120.0 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        // Filter out stars out of canvas boundaries
        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const projectedSize = Math.max(0.1, star.size * k * 1.2);
          
          // Outer glow for audio reactive stars
          if (audioLevel > 0.1 && Math.random() > 0.6) {
            ctx.shadowColor = star.color;
            ctx.shadowBlur = 10;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(px, py, projectedSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Clear shadows for downstream performance
      ctx.shadowBlur = 0;

      // Draw optional slow rotating nebulae effect
      angle += 0.0004 + audioLevel * 0.002;
      
      const gradient = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(cx, cy) * 0.85);
      gradient.addColorStop(0, 'rgba(108, 99, 255, 0.025)'); // #6C63FF
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.015)'); // #8B5CF6
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.fillStyle = gradient;
      ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
      ctx.restore();

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [appState]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none -z-30 block"
    />
  );
};

export default Starfield;
