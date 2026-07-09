import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { AppState } from '../types';
import audioStreamer from '../services/AudioStreamer';

interface AssistantOrbProps {
  appState: AppState;
  emotion?: string;
}

export const AssistantOrb: React.FC<AssistantOrbProps> = ({ appState, emotion = 'Calm' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const webglCanvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Three.js References
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  
  // Animation/Reactivity State
  const animationFrameId = useRef<number | null>(null);
  const audioLevelSmoothed = useRef<number>(0);
  
  // Track emotion state via ref for smooth real-time animation loop access without restarts
  const emotionRef = useRef<string>(emotion);
  useEffect(() => {
    emotionRef.current = emotion;
  }, [emotion]);

  // Dynamic color interpolation targets (RGB 0-1)
  const currentColors = useRef<{ c1: THREE.Color; c2: THREE.Color }>({
    c1: new THREE.Color('#6C63FF'),
    c2: new THREE.Color('#0A0F2C'),
  });

  const getTargetColors = (state: AppState, currentEmotion: string) => {
    let c1 = new THREE.Color('#6C63FF');
    let c2 = new THREE.Color('#0A0F2C');

    switch (state) {
      case 'listening':
        c1 = new THREE.Color('#00E5FF');
        c2 = new THREE.Color('#8B5CF6');
        break;
      case 'speaking':
        c1 = new THREE.Color('#8B5CF6');
        c2 = new THREE.Color('#FF007F');
        break;
      case 'thinking':
        c1 = new THREE.Color('#F59E0B');
        c2 = new THREE.Color('#8B5CF6');
        break;
      case 'connecting':
      case 'reconnecting':
        c1 = new THREE.Color('#3B82F6');
        c2 = new THREE.Color('#6366F1');
        break;
      case 'error':
        c1 = new THREE.Color('#EF4444');
        c2 = new THREE.Color('#4C1D95');
        break;
      case 'idle':
      default:
        c1 = new THREE.Color('#6C63FF');
        c2 = new THREE.Color('#0A0F2C');
        break;
    }

    // Blend / shift the target colors smoothly based on user's current detected emotion
    switch (currentEmotion.toLowerCase()) {
      case 'happy':
        // Warm emerald and glowing golden sunrise vibes
        c1.lerp(new THREE.Color('#10B981'), 0.5);
        c2.lerp(new THREE.Color('#F59E0B'), 0.35);
        break;
      case 'sad':
        // Soft blue and dark melancholy indigo sea shades
        c1.lerp(new THREE.Color('#3B82F6'), 0.5);
        c2.lerp(new THREE.Color('#1E1B4B'), 0.45);
        break;
      case 'stressed':
        // Warm neon rose, tense amber-orange and violet
        c1.lerp(new THREE.Color('#F43F5E'), 0.5);
        c2.lerp(new THREE.Color('#D97706'), 0.4);
        break;
      case 'excited':
        // Rapid bright magenta and neon turquoise energy sparks
        c1.lerp(new THREE.Color('#EC4899'), 0.5);
        c2.lerp(new THREE.Color('#06B6D4'), 0.4);
        break;
      case 'angry':
        // Intense fiery crimson red and dark charcoal-slate
        c1.lerp(new THREE.Color('#EF4444'), 0.65);
        c2.lerp(new THREE.Color('#1E0808'), 0.6);
        break;
      case 'calm':
      default:
        // Maintains standard beautifully crafted state colors
        break;
    }

    return { c1, c2 };
  };

  // Initialize Three.js 3D WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = webglCanvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Create Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10);
    camera.position.z = 4.5;
    cameraRef.current = camera;

    // 2. Create Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 3. Create Custom Shader Material for Liquid Orb
    const vertexShader = `
      uniform float uTime;
      uniform float uAudioLevel;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vNoise;

      // Mathematical Fractional Brownian Motion sum-of-sines 3D displacement
      float getDisplacement(vec3 p) {
        float d = sin(p.x * 2.2 + uTime * 1.2) * cos(p.y * 2.2 + uTime * 1.0);
        d += sin(p.y * 4.5 - uTime * 1.8) * cos(p.z * 4.5 + uTime * 1.4) * 0.4;
        d += sin(p.z * 9.0 + uTime * 2.8) * cos(p.x * 9.0 - uTime * 2.2) * 0.2;
        
        // Inject real-time audio reactivity into the displacement amplitude and high frequency
        float audioForce = uAudioLevel * 2.5;
        d += sin(p.x * 14.0 + uTime * 6.0) * cos(p.y * 14.0) * 0.08 * audioForce;
        d += sin(p.y * 22.0 - uTime * 8.0) * cos(p.z * 22.0) * 0.04 * audioForce;
        
        return d;
      }

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        
        // Displace along surface normal
        float disp = getDisplacement(position);
        vNoise = disp;
        
        // Breathing scale + audio reactive morphing scale
        float baseScale = 1.0 + sin(uTime * 1.2) * 0.03;
        float audioScale = uAudioLevel * 0.5;
        vec3 displacedPosition = position + normal * disp * (0.35 + audioScale) * baseScale;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uAudioLevel;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vNoise;

      void main() {
        // Fresnel holographic outer rim glow effect
        vec3 viewDirection = normalize(vec3(0.0, 0.0, 1.0));
        float fresnel = 1.0 - dot(vNormal, viewDirection);
        fresnel = pow(clamp(fresnel, 0.0, 1.0), 2.2);
        
        // Dynamic blending gradient colors
        float blend = vNoise * 1.5 + 0.5;
        blend = clamp(blend, 0.0, 1.0);
        vec3 baseColor = mix(uColor1, uColor2, blend);
        
        // Interactive energy glow on audio pulse
        vec3 glowColor = vec3(0.0, 0.9, 1.0) * uAudioLevel * 0.35;
        
        // Dynamic glare reflecting the visual core
        vec3 reflexHighlight = vec3(1.0) * smoothstep(0.35, 0.65, vNormal.y * vNormal.x) * 0.18;
        
        // Combine composite colors
        vec3 finalColor = mix(baseColor, vec3(1.0), fresnel * 0.4) + glowColor + reflexHighlight;
        
        // Elegant glasslike alpha
        float alpha = 0.35 + fresnel * 0.55 + uAudioLevel * 0.4;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uAudioLevel: { value: 0 },
        uColor1: { value: currentColors.current.c1 },
        uColor2: { value: currentColors.current.c2 },
      },
    });
    materialRef.current = material;

    // 4. Create Sphere Mesh with High Poly count
    const geometry = new THREE.IcosahedronGeometry(1.4, 6);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // 5. Setup ResizeObserver to monitor container sizing
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      const newWidth = width || 320;
      const newHeight = height || 320;

      if (rendererRef.current) {
        rendererRef.current.setSize(newWidth, newHeight);
      }
      if (cameraRef.current) {
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Main high-performance 60FPS animation & rendering loop
  useEffect(() => {
    let lastTime = performance.now();
    let ringAngle = 0;

    const animateLoop = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // 1. Gather real-time audio frequency data from speaker or microphone
      let audioLevel = 0;
      let frequencies = new Uint8Array(128).fill(0);

      if (appState === 'speaking') {
        frequencies = audioStreamer.getPlayerFrequencyData();
        const sum = frequencies.reduce((a, b) => a + b, 0);
        audioLevel = frequencies.length > 0 ? sum / frequencies.length / 255 : 0;
      } else if (appState === 'listening') {
        frequencies = audioStreamer.getMicFrequencyData();
        const sum = frequencies.reduce((a, b) => a + b, 0);
        audioLevel = frequencies.length > 0 ? sum / frequencies.length / 255 : 0;
      }

      // Smooth audio levels to prevent jagged jumps
      audioLevelSmoothed.current += (audioLevel - audioLevelSmoothed.current) * 0.15;

      // 2. Interpolate custom color states smoothly
      const targets = getTargetColors(appState, emotionRef.current);
      currentColors.current.c1.lerp(targets.c1, 0.08);
      currentColors.current.c2.lerp(targets.c2, 0.08);

      // 3. Update Three.js 3D WebGL properties
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = now * 0.001;
        materialRef.current.uniforms.uAudioLevel.value = audioLevelSmoothed.current;
        materialRef.current.uniforms.uColor1.value = currentColors.current.c1;
        materialRef.current.uniforms.uColor2.value = currentColors.current.c2;
      }

      if (meshRef.current) {
        // Slow organic rotation
        meshRef.current.rotation.y += 0.005 + audioLevelSmoothed.current * 0.025;
        meshRef.current.rotation.x += 0.003 + audioLevelSmoothed.current * 0.015;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      // 4. Render Dynamic 2D Circular Audio Spectrum & Concentric Ripples
      const visualizerCanvas = visualizerCanvasRef.current;
      if (visualizerCanvas) {
        const ctx = visualizerCanvas.getContext('2d');
        if (ctx) {
          const width = visualizerCanvas.width = visualizerCanvas.clientWidth || 320;
          const height = visualizerCanvas.height = visualizerCanvas.clientHeight || 320;
          ctx.clearRect(0, 0, width, height);

          const cx = width / 2;
          const cy = height / 2;
          const baseRadius = width * 0.28; // Fits perfectly around the 3D orb

          // Draw voice volume ring glow animation in the background
          if (appState === 'listening' || appState === 'speaking') {
            const glowRadius = baseRadius + audioLevelSmoothed.current * 42;
            const gradGlow = ctx.createRadialGradient(cx, cy, baseRadius, cx, cy, glowRadius * 1.2);
            const colorStr = appState === 'listening' ? '0, 229, 255' : '139, 92, 246';
            
            gradGlow.addColorStop(0, `rgba(${colorStr}, 0.12)`);
            gradGlow.addColorStop(0.6, `rgba(${colorStr}, 0.04)`);
            gradGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradGlow;
            ctx.beginPath();
            ctx.arc(cx, cy, glowRadius * 1.25, 0, Math.PI * 2);
            ctx.fill();
          }

          // Render circular spectrum ring bars
          ringAngle += 0.002 + audioLevelSmoothed.current * 0.01;
          const barCount = 72;
          const maxBarHeight = 35;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(ringAngle);

          for (let i = 0; i < barCount; i++) {
            // Read spectrum from frequency buffer
            const freqIdx = Math.floor((i / barCount) * (frequencies.length * 0.6));
            const freqVal = frequencies[freqIdx] || 0;
            
            // Calculate dynamic height based on audio frequencies
            let barHeight = (freqVal / 255) * maxBarHeight;
            if (appState !== 'speaking' && appState !== 'listening') {
              // Soft breathing idle amplitude
              barHeight = Math.abs(Math.sin((i * 0.1) + now * 0.0015)) * 3;
            }

            const angle = (i / barCount) * Math.PI * 2;
            
            const startX = Math.cos(angle) * baseRadius;
            const startY = Math.sin(angle) * baseRadius;
            const endX = Math.cos(angle) * (baseRadius + barHeight);
            const endY = Math.sin(angle) * (baseRadius + barHeight);

            // Artistic gradient matching color state
            const c1Str = currentColors.current.c1.getHexString();
            const c2Str = currentColors.current.c2.getHexString();
            const strokeGrad = ctx.createLinearGradient(startX, startY, endX, endY);
            strokeGrad.addColorStop(0, `#${c1Str}`);
            strokeGrad.addColorStop(1, `#${c2Str}`);

            ctx.strokeStyle = strokeGrad;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }
          ctx.restore();

          // Render secondary outer particle orbits
          if (appState === 'speaking' || appState === 'listening') {
            ctx.strokeStyle = appState === 'listening' ? 'rgba(0, 229, 255, 0.12)' : 'rgba(139, 92, 246, 0.12)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, baseRadius + 45 + audioLevelSmoothed.current * 15, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(animateLoop);
    };

    animateLoop();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [appState]);

  return (
    <div 
      ref={containerRef} 
      className="relative flex items-center justify-center w-80 h-80 md:w-96 md:h-96 mx-auto select-none"
    >
      {/* Cinematic J.A.R.V.I.S. Concentric Outer Rings */}
      <div className="absolute w-[440px] h-[440px] md:w-[500px] md:h-[500px] orb-ring rounded-full opacity-10 pointer-events-none" />
      <div className="absolute w-[330px] h-[330px] md:w-[380px] md:h-[380px] orb-ring rounded-full opacity-20 border-dashed pointer-events-none animate-[spin_50s_linear_infinite]" />

      {/* 1. Underlying 3D WebGL Canvas Rendering of the liquid AI orb */}
      <canvas
        ref={webglCanvasRef}
        className="absolute inset-0 w-full h-full block z-10"
      />

      {/* 2. Interactive 2D Canvas Audio Spectrum overlaying the core */}
      <canvas
        ref={visualizerCanvasRef}
        className="absolute inset-0 w-full h-full block z-20 pointer-events-none"
      />

      {/* 3. Central Status Core Overlay inside the glass sphere */}
      <div className="absolute w-24 h-24 rounded-full bg-black/60 border border-white/5 flex items-center justify-center backdrop-blur-3xl z-30 pointer-events-none">
        <AnimatePresence mode="wait">
          {appState === 'listening' && (
            <motion.span
              key="listening-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.9, 1.15, 0.9], opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-2.5 h-2.5 bg-[#00E5FF] rounded-full shadow-[0_0_12px_#00E5FF]"
            />
          )}
          {appState === 'speaking' && (
            <motion.span
              key="speaking-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.95, 1.25, 0.95], opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-3.5 h-3.5 bg-[#8B5CF6] rounded-full shadow-[0_0_15px_#8B5CF6]"
            />
          )}
          {appState === 'thinking' && (
            <motion.span
              key="thinking-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ rotate: 360, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 rounded-full border-t border-b border-[#F59E0B] border-l border-r-0"
            />
          )}
          {appState === 'connecting' || appState === 'reconnecting' ? (
            <motion.span
              key="connecting-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.85, 1.1, 0.85], opacity: 0.7 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase animate-pulse"
            >
              SYNC
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AssistantOrb;
