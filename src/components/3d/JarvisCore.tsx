import React, { useEffect, useRef } from 'react';
import { AppState } from '../../types';

interface JarvisCoreProps {
  appState: AppState;
  voiceLevel?: number;
  size?: number;
}

export const JarvisCore: React.FC<JarvisCoreProps> = ({
  appState,
  voiceLevel = 0.35,
  size = 480
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ appState, voiceLevel });

  useEffect(() => {
    stateRef.current = { appState, voiceLevel };
  }, [appState, voiceLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let startTime = performance.now();

    const render = (now: number) => {
      const time = (now - startTime) * 0.001;
      const { appState: currentAppState, voiceLevel: currentVoiceLevel } = stateRef.current;

      const width = canvas.parentElement?.clientWidth || size;
      const height = canvas.parentElement?.clientHeight || size;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      const cx = width / 2 + currentMouseX * 15;
      const cy = height / 2 + currentMouseY * 12;
      const baseRadius = Math.min(width, height) * 0.28;

      // Determine palette based on state
      let mainHue = 190; // Cyan default
      let accentHue = 210; // Electric Blue
      let pulseSpeed = 1.5;
      let particleEnergy = 1.0;

      if (currentAppState === 'speaking') {
        mainHue = 270; // Purple / Fuchsia
        accentHue = 190;
        pulseSpeed = 3.5;
        particleEnergy = 2.2;
      } else if (currentAppState === 'listening') {
        mainHue = 180; // Bright Cyan / Aqua
        accentHue = 160;
        pulseSpeed = 2.5;
        particleEnergy = 1.8;
      } else if (currentAppState === 'thinking') {
        mainHue = 38; // Gold / Amber
        accentHue = 190;
        pulseSpeed = 4.0;
        particleEnergy = 2.0;
      } else if (currentAppState === 'error') {
        mainHue = 0; // Crimson Red
        accentHue = 20;
        pulseSpeed = 2.0;
        particleEnergy = 1.2;
      }

      // --- 1. OUTER HOLOGRAPHIC AMBIENT GLOW ---
      const pulse = Math.sin(time * pulseSpeed) * 0.08 + (currentVoiceLevel * 0.15);
      const bgGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.2, cx, cy, baseRadius * 1.8);
      bgGrad.addColorStop(0, `hsla(${mainHue}, 100%, 60%, 0.25)`);
      bgGrad.addColorStop(0.5, `hsla(${accentHue}, 90%, 50%, 0.1)`);
      bgGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');

      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // --- 2. CONCENTRIC ROTATING HOLOGRAPHIC RINGS ---
      ctx.save();
      ctx.translate(cx, cy);

      // Ring 1: Outer Hexagon / Tech Dashed Ring
      ctx.save();
      ctx.rotate(time * 0.3);
      ctx.strokeStyle = `hsla(${mainHue}, 90%, 65%, 0.4)`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12, 2, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * (1.3 + pulse * 0.5), 0, Math.PI * 2);
      ctx.stroke();

      // Outer Ring Nodes / Tick Marks
      const outerTicks = 24;
      for (let i = 0; i < outerTicks; i++) {
        const angle = (i / outerTicks) * Math.PI * 2;
        const tx = Math.cos(angle) * baseRadius * 1.3;
        const ty = Math.sin(angle) * baseRadius * 1.3;
        ctx.fillStyle = i % 4 === 0 ? `hsla(${mainHue}, 100%, 75%, 0.9)` : `hsla(${accentHue}, 80%, 60%, 0.3)`;
        ctx.beginPath();
        ctx.arc(tx, ty, i % 4 === 0 ? 2.5 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Ring 2: Counter-Rotating Arc Segment Ring
      ctx.save();
      ctx.rotate(-time * 0.5);
      ctx.strokeStyle = `hsla(${accentHue}, 95%, 60%, 0.6)`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([Math.PI * baseRadius * 0.3, Math.PI * baseRadius * 0.15]);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Ring 3: Tilted Diagonal Orbital Ring
      ctx.save();
      ctx.rotate(time * 0.8 + Math.PI / 4);
      ctx.scale(1, 0.35); // Perspective tilt
      ctx.strokeStyle = `hsla(${mainHue}, 100%, 70%, 0.5)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.25, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting Satellite Energy Bead
      const beadAngle = time * 2.5;
      const bx = Math.cos(beadAngle) * baseRadius * 1.25;
      const by = Math.sin(beadAngle) * baseRadius * 1.25;
      ctx.fillStyle = `#ffffff`;
      ctx.shadowColor = `hsla(${mainHue}, 100%, 70%, 1)`;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Ring 4: Inner Waveform Audio Spectrum Arc Rings
      const spectrumBars = 48;
      ctx.save();
      ctx.rotate(time * 0.2);
      for (let i = 0; i < spectrumBars; i++) {
        const angle = (i / spectrumBars) * Math.PI * 2;
        const barFreq = Math.sin(angle * 4 + time * 6) * 0.5 + 0.5;
        const dynamicLength = (12 + barFreq * 24 * (currentVoiceLevel + 0.3)) * particleEnergy;

        const innerR = baseRadius * 0.85;
        const outerR = innerR + dynamicLength;

        const x1 = Math.cos(angle) * innerR;
        const y1 = Math.sin(angle) * innerR;
        const x2 = Math.cos(angle) * outerR;
        const y2 = Math.sin(angle) * outerR;

        ctx.strokeStyle = `hsla(${mainHue + (i * 3) % 40}, 95%, 65%, ${0.5 + barFreq * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // --- 3. CENTRAL JARVIS CORE SPHERE & REACTOR PULSE ---
      const coreR = baseRadius * (0.65 + Math.sin(time * 2.5) * 0.04 + currentVoiceLevel * 0.1);

      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
      coreGrad.addColorStop(0, `hsla(${mainHue}, 100%, 92%, 0.95)`);
      coreGrad.addColorStop(0.35, `hsla(${mainHue}, 100%, 65%, 0.8)`);
      coreGrad.addColorStop(0.75, `hsla(${accentHue}, 90%, 45%, 0.5)`);
      coreGrad.addColorStop(1, `hsla(${mainHue}, 100%, 30%, 0.05)`);

      ctx.fillStyle = coreGrad;
      ctx.shadowColor = `hsla(${mainHue}, 100%, 70%, 0.8)`;
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner Core Triangular / Hexagonal Vector Glyph
      ctx.save();
      ctx.rotate(-time * 1.2);
      ctx.strokeStyle = `rgba(255, 255, 255, 0.85)`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const sides = 3;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2;
        const gx = Math.cos(a) * coreR * 0.5;
        const gy = Math.sin(a) * coreR * 0.5;
        if (i === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Floating Particle Field around Core
      const particleCount = 36;
      for (let i = 0; i < particleCount; i++) {
        const pAngle = (i / particleCount) * Math.PI * 2 + time * 0.4;
        const pDist = baseRadius * (0.4 + (Math.sin(time * 2 + i * 1.5) + 1) * 0.45);
        const px = Math.cos(pAngle) * pDist;
        const py = Math.sin(pAngle) * pDist;

        ctx.fillStyle = `hsla(${mainHue}, 100%, 80%, ${0.3 + Math.sin(time * 3 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5 + Math.sin(i) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [size]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-auto" />
      {/* Soft Ambient Ground Lens Flare */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-cyan-500/20 via-blue-500/30 to-purple-500/20 blur-2xl rounded-full pointer-events-none" />
    </div>
  );
};

export default JarvisCore;
