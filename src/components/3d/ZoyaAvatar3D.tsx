import React, { useEffect, useRef } from 'react';

interface ZoyaAvatar3DProps {
  appState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  emotion?: 'neutral' | 'happy' | 'focused' | 'thinking' | 'energetic';
  voiceLevel?: number; // 0 to 1
}

export const ZoyaAvatar3D: React.FC<ZoyaAvatar3DProps> = ({
  appState = 'idle',
  emotion = 'neutral',
  voiceLevel = 0.2
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ appState, emotion, voiceLevel });

  useEffect(() => {
    stateRef.current = { appState, emotion, voiceLevel };
  }, [appState, emotion, voiceLevel]);

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
      // Normalize cursor across full viewport window from -1 to 1
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // Blinking timer state
    let blinkTimer = 0;
    let blinkValue = 0; // 0 = open, 1 = closed

    // Speech morph state
    let mouthOpen = 0;

    let startTime = performance.now();

    const render = (now: number) => {
      const time = (now - startTime) * 0.001;
      const { appState: currentAppState, voiceLevel: currentVoiceLevel } = stateRef.current;

      const width = canvas.parentElement?.clientWidth || 600;
      const height = canvas.parentElement?.clientHeight || 480;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Center coordinates & scaling
      const cx = width / 2;
      const cy = height / 2 - 10;
      const scale = Math.min(width, height) / 480;

      // Smooth lerp towards target mouse coordinates (exponential easing)
      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      // Human eye micro-saccade simulation (subtle natural eye focus movements)
      const saccadeTime = time * 2.5;
      const saccadeX = (Math.sin(saccadeTime * 1.7) * 0.03 + Math.cos(saccadeTime * 3.1) * 0.02);
      const saccadeY = (Math.cos(saccadeTime * 2.3) * 0.02 + Math.sin(saccadeTime * 4.2) * 0.015);

      const gazeX = currentMouseX + saccadeX;
      const gazeY = currentMouseY + saccadeY;

      // 1. Organic Breathing & Head Sway (with realistic gaze neck tilt)
      const breath = Math.sin(time * 1.8) * 3 * scale;
      const headSwayX = Math.sin(time * 1.2) * 2 * scale + gazeX * 10 * scale;
      const headSwayY = Math.cos(time * 1.5) * 2 * scale + gazeY * 7 * scale;

      const headX = cx + headSwayX;
      const headY = cy + breath + headSwayY - 15 * scale;

      // 2. Blinking Physics
      blinkTimer += 0.016;
      if (blinkTimer > 3.8) {
        blinkValue = Math.sin((blinkTimer - 3.8) * Math.PI / 0.25);
        if (blinkTimer > 4.05) {
          blinkTimer = 0;
          blinkValue = 0;
        }
      }
      blinkValue = Math.max(0, Math.min(1, blinkValue));

      // 3. Speech Lip-Sync Morphing
      let targetMouthOpen = 0;
      if (currentAppState === 'speaking') {
        targetMouthOpen = 0.15 + Math.abs(Math.sin(time * 18)) * 0.65 * (currentVoiceLevel + 0.3);
      } else if (currentAppState === 'listening') {
        targetMouthOpen = 0.05 + Math.sin(time * 4) * 0.04;
      }
      mouthOpen += (targetMouthOpen - mouthOpen) * 0.2;

      // 4. Volumetric Rim Lighting & Ambient Studio Glow
      let rimColorCyan = 'rgba(34, 211, 238, 0.4)';
      let rimColorPurple = 'rgba(192, 132, 252, 0.4)';
      if (currentAppState === 'speaking') {
        rimColorPurple = `rgba(217, 70, 239, ${0.5 + Math.sin(time * 10) * 0.3})`;
      } else if (currentAppState === 'listening') {
        rimColorCyan = `rgba(6, 182, 212, ${0.6 + Math.sin(time * 8) * 0.3})`;
      }

      // Background Soft Studio Halo
      const bgGrad = ctx.createRadialGradient(headX, headY, 40 * scale, headX, headY, 200 * scale);
      bgGrad.addColorStop(0, rimColorCyan);
      bgGrad.addColorStop(0.5, rimColorPurple);
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(headX, headY, 200 * scale, 0, Math.PI * 2);
      ctx.fill();

      // --- 5. SHOULDERS & NECK (ELEGANT FUTURISTIC SUIT) ---
      ctx.save();
      ctx.translate(headX, headY);

      // Shoulders
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 150 * scale, 120 * scale, 60 * scale, 0, Math.PI, 0, true);
      ctx.fill();

      // Shoulder Suit Collar Trim
      ctx.strokeStyle = currentAppState === 'listening' ? '#22d3ee' : '#c084fc';
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(-60 * scale, 120 * scale);
      ctx.lineTo(0, 145 * scale);
      ctx.lineTo(60 * scale, 120 * scale);
      ctx.stroke();

      // Neck
      const neckGrad = ctx.createLinearGradient(-25 * scale, 40 * scale, 25 * scale, 110 * scale);
      neckGrad.addColorStop(0, '#e8b08b');
      neckGrad.addColorStop(0.5, '#d49872');
      neckGrad.addColorStop(1, '#a86c47');
      ctx.fillStyle = neckGrad;
      ctx.beginPath();
      ctx.ellipse(0, 85 * scale, 22 * scale, 35 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- 6. PHOTOREALISTIC FEMALE FACE SHAPE ---
      // Jaw and Chin
      const faceGrad = ctx.createRadialGradient(0, -10 * scale, 10 * scale, 0, 0, 85 * scale);
      faceGrad.addColorStop(0, '#f9ccac');
      faceGrad.addColorStop(0.6, '#e2a882');
      faceGrad.addColorStop(0.9, '#c98a62');
      faceGrad.addColorStop(1, '#a66a45');

      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.moveTo(0, -80 * scale); // Top forehead
      ctx.bezierCurveTo(65 * scale, -80 * scale, 60 * scale, 10 * scale, 42 * scale, 45 * scale); // Right cheek
      ctx.bezierCurveTo(25 * scale, 70 * scale, 12 * scale, 75 * scale, 0, 76 * scale); // Chin
      ctx.bezierCurveTo(-12 * scale, 75 * scale, -25 * scale, 70 * scale, -42 * scale, 45 * scale); // Left chin
      ctx.bezierCurveTo(-60 * scale, 10 * scale, -65 * scale, -80 * scale, 0, -80 * scale); // Left cheek to forehead
      ctx.fill();

      // Soft Cheek Blush / Subsurface Scattering
      const blushGradLeft = ctx.createRadialGradient(-28 * scale, 18 * scale, 2 * scale, -28 * scale, 18 * scale, 25 * scale);
      blushGradLeft.addColorStop(0, 'rgba(225, 112, 85, 0.25)');
      blushGradLeft.addColorStop(1, 'rgba(225, 112, 85, 0)');
      ctx.fillStyle = blushGradLeft;
      ctx.beginPath();
      ctx.arc(-28 * scale, 18 * scale, 25 * scale, 0, Math.PI * 2);
      ctx.fill();

      const blushGradRight = ctx.createRadialGradient(28 * scale, 18 * scale, 2 * scale, 28 * scale, 18 * scale, 25 * scale);
      blushGradRight.addColorStop(0, 'rgba(225, 112, 85, 0.25)');
      blushGradRight.addColorStop(1, 'rgba(225, 112, 85, 0)');
      ctx.fillStyle = blushGradRight;
      ctx.beginPath();
      ctx.arc(28 * scale, 18 * scale, 25 * scale, 0, Math.PI * 2);
      ctx.fill();

      // --- 7. NOSE BRIDGE & CONTOUR ---
      ctx.strokeStyle = 'rgba(168, 106, 69, 0.35)';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(-5 * scale, -10 * scale);
      ctx.lineTo(-3 * scale, 22 * scale);
      ctx.bezierCurveTo(-8 * scale, 28 * scale, 0, 30 * scale, 0, 30 * scale);
      ctx.stroke();

      // Nose Tip Specular Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 26 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // --- 8. PHOTOREALISTIC HUMAN EYES ---
      const renderEye = (eyeX: number, eyeY: number) => {
        ctx.save();
        ctx.translate(eyeX, eyeY);

        // Eye Socket Shadow
        ctx.fillStyle = 'rgba(120, 70, 45, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, -2 * scale, 18 * scale, 12 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye Sclera (White)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(0, 0, 15 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Iris & Pupil gaze panning toward cursor
        const eyeOffsetMouseX = gazeX * 5.5 * scale;
        const eyeOffsetMouseY = gazeY * 3.8 * scale;

        const irisGrad = ctx.createRadialGradient(eyeOffsetMouseX, eyeOffsetMouseY, 1 * scale, eyeOffsetMouseX, eyeOffsetMouseY, 6.5 * scale);
        irisGrad.addColorStop(0, '#1c1008');
        irisGrad.addColorStop(0.5, '#5c3a21');
        irisGrad.addColorStop(0.9, '#8c5832');
        irisGrad.addColorStop(1, '#2a1a0e');

        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(eyeOffsetMouseX, eyeOffsetMouseY, 6.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(eyeOffsetMouseX, eyeOffsetMouseY, 2.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dual Catchlights (Studio Specular Light Reflections)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeOffsetMouseX - 2 * scale, eyeOffsetMouseY - 2 * scale, 1.4 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = currentAppState === 'listening' ? '#22d3ee' : '#e0e7ff';
        ctx.beginPath();
        ctx.arc(eyeOffsetMouseX + 2.2 * scale, eyeOffsetMouseY + 1.8 * scale, 0.9 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Upper Eyelid & Eyelashes
        ctx.strokeStyle = '#1e1b18';
        ctx.lineWidth = 2.2 * scale;
        ctx.beginPath();
        ctx.moveTo(-16 * scale, 1 * scale);
        ctx.bezierCurveTo(-8 * scale, -10 * scale, 8 * scale, -10 * scale, 16 * scale, 1 * scale);
        ctx.stroke();

        // Eyelid Blink Cover
        if (blinkValue > 0) {
          ctx.fillStyle = '#d49872';
          ctx.beginPath();
          ctx.rect(-16 * scale, -10 * scale, 32 * scale, 18 * scale * blinkValue);
          ctx.fill();
        }

        ctx.restore();
      };

      // Left Eye & Right Eye
      renderEye(-24 * scale, -5 * scale);
      renderEye(24 * scale, -5 * scale);

      // --- 9. REALISTIC EYEBROWS ---
      const renderEyebrow = (browX: number, isLeft: boolean) => {
        ctx.strokeStyle = '#231812';
        ctx.lineWidth = 2.2 * scale;
        ctx.beginPath();
        if (isLeft) {
          ctx.moveTo(browX - 16 * scale, -20 * scale);
          ctx.bezierCurveTo(browX - 5 * scale, -26 * scale, browX + 10 * scale, -24 * scale, browX + 16 * scale, -18 * scale);
        } else {
          ctx.moveTo(browX - 16 * scale, -18 * scale);
          ctx.bezierCurveTo(browX - 10 * scale, -24 * scale, browX + 5 * scale, -26 * scale, browX + 16 * scale, -20 * scale);
        }
        ctx.stroke();
      };
      renderEyebrow(-24 * scale, true);
      renderEyebrow(24 * scale, false);

      // --- 10. REALISTIC LIPS & LIP-SYNC MOUTH MORPH ---
      ctx.save();
      ctx.translate(0, 48 * scale);

      const lipWidth = 22 * scale;
      const lipHeight = (6 + mouthOpen * 14) * scale;

      // Oral Cavity & Pearly Teeth (when mouth opens)
      if (mouthOpen > 0.1) {
        ctx.fillStyle = '#2d0c0c';
        ctx.beginPath();
        ctx.ellipse(0, 0, lipWidth * 0.75, lipHeight * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Teeth
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.rect(-8 * scale, -lipHeight * 0.3, 16 * scale, 3.5 * scale);
        ctx.fill();
      }

      // Upper Lip (Rosy Nude with Cupid's Bow)
      const upperLipGrad = ctx.createLinearGradient(0, -6 * scale, 0, 0);
      upperLipGrad.addColorStop(0, '#be615d');
      upperLipGrad.addColorStop(1, '#9b423f');

      ctx.fillStyle = upperLipGrad;
      ctx.beginPath();
      ctx.moveTo(-lipWidth, 0);
      ctx.bezierCurveTo(-lipWidth * 0.5, -lipHeight * 0.8, -lipWidth * 0.2, -lipHeight * 1.1, 0, -lipHeight * 0.6);
      ctx.bezierCurveTo(lipWidth * 0.2, -lipHeight * 1.1, lipWidth * 0.5, -lipHeight * 0.8, lipWidth, 0);
      ctx.bezierCurveTo(lipWidth * 0.5, -lipHeight * 0.2, -lipWidth * 0.5, -lipHeight * 0.2, -lipWidth, 0);
      ctx.fill();

      // Lower Lip
      const lowerLipGrad = ctx.createLinearGradient(0, 0, 0, lipHeight);
      lowerLipGrad.addColorStop(0, '#c96a66');
      lowerLipGrad.addColorStop(1, '#8e3835');

      ctx.fillStyle = lowerLipGrad;
      ctx.beginPath();
      ctx.moveTo(-lipWidth, 0);
      ctx.bezierCurveTo(-lipWidth * 0.6, lipHeight * 1.2, lipWidth * 0.6, lipHeight * 1.2, lipWidth, 0);
      ctx.bezierCurveTo(lipWidth * 0.4, lipHeight * 0.2, -lipWidth * 0.4, lipHeight * 0.2, -lipWidth, 0);
      ctx.fill();

      // Lip Specular Shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, lipHeight * 0.4, 6 * scale, 2 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // --- 11. ELEGANT REALISTIC HAIR STRANDS ---
      ctx.strokeStyle = '#18120e';
      ctx.lineWidth = 1.8 * scale;

      // Draw 30 layered flowing hair strands around shoulders and face
      for (let i = 0; i < 30; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const offset = (i / 30) * 50 * scale;

        const hairGrad = ctx.createLinearGradient(0, -90 * scale, side * (50 * scale + offset), 120 * scale);
        hairGrad.addColorStop(0, '#0f0b08');
        hairGrad.addColorStop(0.5, '#2c1e16');
        hairGrad.addColorStop(1, '#18120e');

        ctx.strokeStyle = hairGrad;
        ctx.beginPath();
        ctx.moveTo(side * (15 * scale + offset * 0.3), -82 * scale);
        ctx.bezierCurveTo(
          side * (65 * scale + offset),
          -40 * scale,
          side * (75 * scale + offset + Math.sin(time * 2 + i) * 3 * scale),
          40 * scale,
          side * (50 * scale + offset * 0.8),
          130 * scale
        );
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-auto" />
      {/* Subtle Bottom Hologram Base Reflection */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-8 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 blur-2xl rounded-full pointer-events-none animate-pulse" />
    </div>
  );
};

export const ShivanshAvatar3D = ZoyaAvatar3D;

