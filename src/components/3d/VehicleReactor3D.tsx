import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { Car, Zap, Activity, Radio, Cpu, Sparkles, Navigation, Disc } from 'lucide-react';

export type VehicleType = 'SEDAN' | 'SPORTS' | 'SUV';

interface VehicleReactor3DProps {
  appState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  voiceLevel?: number;
  selectedVehicle: VehicleType;
  onSelectVehicle: (v: VehicleType) => void;
  onSelectHoloRing?: (label: string) => void;
}

export const VehicleReactor3D: React.FC<VehicleReactor3DProps> = ({
  appState = 'idle',
  voiceLevel = 0.2,
  selectedVehicle = 'SPORTS',
  onSelectVehicle,
  onSelectHoloRing
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ appState, voiceLevel, selectedVehicle });

  useEffect(() => {
    stateRef.current = { appState, voiceLevel, selectedVehicle };
  }, [appState, voiceLevel, selectedVehicle]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.8, 8.5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. LIGHTING SETUP
    const ambientLight = new THREE.AmbientLight(0x0284c7, 1.5);
    scene.add(ambientLight);

    // Key Overhead Cyan Spot
    const spotLight = new THREE.SpotLight(0x38bdf8, 5, 20, Math.PI / 4, 0.5);
    spotLight.position.set(0, 8, 2);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Side Accent Lights (Cyan & Purple/Blue)
    const rimCyan = new THREE.PointLight(0x06b6d4, 4, 15);
    rimCyan.position.set(-5, 2, -2);
    scene.add(rimCyan);

    const rimBlue = new THREE.PointLight(0x3b82f6, 4, 15);
    rimBlue.position.set(5, 2, 2);
    scene.add(rimBlue);

    // Under-car neon glow light
    const underGlow = new THREE.PointLight(0x00f0ff, 6, 6);
    underGlow.position.set(0, 0.2, 0);
    scene.add(underGlow);

    // 3. HOLOGRAPHIC CONCENTRIC REACTOR RINGS
    const reactorGroup = new THREE.Group();
    scene.add(reactorGroup);

    // Outer Grid Base
    const grid = new THREE.GridHelper(16, 32, 0x06b6d4, 0x1e293b);
    grid.position.y = -0.01;
    reactorGroup.add(grid);

    // Concentric Ring 1 (Inner Glowing Radar Ring)
    const ringGeo1 = new THREE.RingGeometry(2.2, 2.35, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      wireframe: false
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 0.02;
    reactorGroup.add(ring1);

    // Concentric Ring 2 (Dashed/Segmented Middle Ring)
    const ringGeo2 = new THREE.RingGeometry(3.2, 3.32, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      wireframe: true
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = 0.04;
    reactorGroup.add(ring2);

    // Concentric Ring 3 (Outer Radar Sweep Ring)
    const ringGeo3 = new THREE.RingGeometry(4.3, 4.4, 64);
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.x = Math.PI / 2;
    ring3.position.y = 0.05;
    reactorGroup.add(ring3);

    // Floating Holographic Particles Halo
    const partCount = 200;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 2.8;
      partPos[i * 3] = Math.cos(angle) * radius;
      partPos[i * 3 + 1] = Math.random() * 1.5;
      partPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(partGeo, partMat);
    reactorGroup.add(particles);

    // 4. VEHICLE MODEL BUILDER
    const vehicleGroup = new THREE.Group();
    scene.add(vehicleGroup);

    // Helper Materials
    const bodyMatMetal = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7
    });

    const wheelRubber = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.8
    });

    const rimCyanGlow = new THREE.MeshBasicMaterial({
      color: 0x06b6d4
    });

    const headLightGlow = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe
    });

    const tailLightGlow = new THREE.MeshBasicMaterial({
      color: 0xf43f5e
    });

    // Function to build Sedan, Sports, or SUV procedural 3D model
    const buildVehicleMesh = (type: VehicleType) => {
      // Clear old vehicle children
      while (vehicleGroup.children.length > 0) {
        const obj = vehicleGroup.children[0];
        vehicleGroup.remove(obj);
      }

      const root = new THREE.Group();

      if (type === 'SPORTS') {
        // --- HYPERCAR / SPORTS MODEL ---
        // Lower body chassis
        const chassisGeo = new THREE.BoxGeometry(1.8, 0.45, 3.8);
        const chassis = new THREE.Mesh(chassisGeo, bodyMatMetal);
        chassis.position.y = 0.45;
        chassis.castShadow = true;
        root.add(chassis);

        // Aerodynamic cabin / canopy
        const cabinGeo = new THREE.ConeGeometry(1.1, 1.2, 4);
        const cabin = new THREE.Mesh(cabinGeo, glassMat);
        cabin.rotation.y = Math.PI / 4;
        cabin.rotation.x = -Math.PI / 12;
        cabin.scale.set(1, 0.6, 1.8);
        cabin.position.set(0, 0.85, -0.2);
        root.add(cabin);

        // Front splitter
        const splitterGeo = new THREE.BoxGeometry(1.9, 0.08, 0.6);
        const splitter = new THREE.Mesh(splitterGeo, rimCyanGlow);
        splitter.position.set(0, 0.22, 1.95);
        root.add(splitter);

        // Rear Spoiler Wing
        const wingGeo = new THREE.BoxGeometry(1.9, 0.08, 0.4);
        const wing = new THREE.Mesh(wingGeo, bodyMatMetal);
        wing.position.set(0, 1.1, -1.8);

        const strutGeo = new THREE.BoxGeometry(0.1, 0.35, 0.2);
        const strutL = new THREE.Mesh(strutGeo, bodyMatMetal);
        strutL.position.set(-0.6, 0.9, -1.8);
        const strutR = strutL.clone();
        strutR.position.x = 0.6;

        root.add(wing);
        root.add(strutL);
        root.add(strutR);

        // Headlights
        const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.1), headLightGlow);
        hl1.position.set(-0.65, 0.5, 1.88);
        const hl2 = hl1.clone();
        hl2.position.x = 0.65;
        root.add(hl1);
        root.add(hl2);

        // Taillight Strip
        const tl = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 0.08), tailLightGlow);
        tl.position.set(0, 0.52, -1.88);
        root.add(tl);

        // Wheels (4)
        const wheelPositions = [
          [-0.95, 0.35, 1.2],
          [0.95, 0.35, 1.2],
          [-0.95, 0.35, -1.2],
          [0.95, 0.35, -1.2]
        ];

        wheelPositions.forEach(([x, y, z]) => {
          const wGroup = new THREE.Group();
          wGroup.position.set(x, y, z);

          const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
          const tire = new THREE.Mesh(tireGeo, wheelRubber);
          tire.rotation.z = Math.PI / 2;
          wGroup.add(tire);

          const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.26, 12);
          const rim = new THREE.Mesh(rimGeo, rimCyanGlow);
          rim.rotation.z = Math.PI / 2;
          wGroup.add(rim);

          root.add(wGroup);
        });
      } else if (type === 'SEDAN') {
        // --- LUXURY CYBER SEDAN ---
        const mainBodyGeo = new THREE.BoxGeometry(1.75, 0.55, 4.0);
        const mainBody = new THREE.Mesh(mainBodyGeo, bodyMatMetal);
        mainBody.position.y = 0.52;
        mainBody.castShadow = true;
        root.add(mainBody);

        // Curved Roof Cabin
        const roofGeo = new THREE.BoxGeometry(1.5, 0.5, 2.2);
        const roof = new THREE.Mesh(roofGeo, glassMat);
        roof.position.set(0, 0.98, -0.1);
        root.add(roof);

        // LED Headlight Bar
        const hl = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.1), headLightGlow);
        hl.position.set(0, 0.58, 2.0);
        root.add(hl);

        // Rear LED Bar
        const tl = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.1), tailLightGlow);
        tl.position.set(0, 0.6, -2.0);
        root.add(tl);

        // Under-door Neon Strips
        const neonL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 2.8), rimCyanGlow);
        neonL.position.set(-0.88, 0.26, 0);
        const neonR = neonL.clone();
        neonR.position.x = 0.88;
        root.add(neonL);
        root.add(neonR);

        // Wheels (4)
        const wheelPositions = [
          [-0.92, 0.38, 1.3],
          [0.92, 0.38, 1.3],
          [-0.92, 0.38, -1.3],
          [0.92, 0.38, -1.3]
        ];

        wheelPositions.forEach(([x, y, z]) => {
          const wGroup = new THREE.Group();
          wGroup.position.set(x, y, z);

          const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 24), wheelRubber);
          tire.rotation.z = Math.PI / 2;
          wGroup.add(tire);

          const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.23, 12), rimCyanGlow);
          rim.rotation.z = Math.PI / 2;
          wGroup.add(rim);

          root.add(wGroup);
        });
      } else {
        // --- CYBER SUV / TRUCK ---
        const suvBodyGeo = new THREE.BoxGeometry(2.0, 0.75, 4.1);
        const suvBody = new THREE.Mesh(suvBodyGeo, bodyMatMetal);
        suvBody.position.y = 0.75;
        suvBody.castShadow = true;
        root.add(suvBody);

        // High Roof Top Box
        const roofGeo = new THREE.BoxGeometry(1.75, 0.65, 2.4);
        const roof = new THREE.Mesh(roofGeo, glassMat);
        roof.position.set(0, 1.38, -0.2);
        root.add(roof);

        // Roof rack LED bar
        const rackHL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.15), headLightGlow);
        rackHL.position.set(0, 1.72, 0.9);
        root.add(rackHL);

        // Front Grille Lightbar
        const hl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.1), headLightGlow);
        hl.position.set(0, 0.8, 2.05);
        root.add(hl);

        // Rear Tail Lightbar
        const tl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.1), tailLightGlow);
        tl.position.set(0, 0.85, -2.05);
        root.add(tl);

        // Heavy Duty Wheels (4)
        const wheelPositions = [
          [-1.05, 0.45, 1.3],
          [1.05, 0.45, 1.3],
          [-1.05, 0.45, -1.3],
          [1.05, 0.45, -1.3]
        ];

        wheelPositions.forEach(([x, y, z]) => {
          const wGroup = new THREE.Group();
          wGroup.position.set(x, y, z);

          const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 24), wheelRubber);
          tire.rotation.z = Math.PI / 2;
          wGroup.add(tire);

          const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.31, 12), rimCyanGlow);
          rim.rotation.z = Math.PI / 2;
          wGroup.add(rim);

          root.add(wGroup);
        });
      }

      vehicleGroup.add(root);
    };

    // Initial Build
    buildVehicleMesh(selectedVehicle);

    // 5. ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const { appState, voiceLevel } = stateRef.current;

      // Base smooth rotation of vehicle
      const rotSpeed = appState === 'speaking' ? 0.015 + voiceLevel * 0.03 : appState === 'listening' ? 0.012 : 0.006;
      vehicleGroup.rotation.y += rotSpeed;

      // Gentle floating bobbing effect
      vehicleGroup.position.y = Math.sin(elapsedTime * 2) * 0.08;

      // Ring rotations in alternating directions
      ring1.rotation.z += 0.008;
      ring2.rotation.z -= 0.012;
      ring3.rotation.z += 0.004;

      // Particles rotation
      particles.rotation.y += 0.003;

      // Voice reactive light pulsing
      const pulseIntensity = appState === 'speaking'
        ? 4 + Math.sin(elapsedTime * 12) * voiceLevel * 6
        : appState === 'listening'
        ? 3 + Math.sin(elapsedTime * 8) * 2
        : 2.5;

      underGlow.intensity = pulseIntensity;
      spotLight.intensity = pulseIntensity + 1;

      // Pulse ring opacity
      ringMat1.opacity = 0.5 + Math.sin(elapsedTime * 4) * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Re-build vehicle mesh when selectedVehicle changes
  useEffect(() => {
    // Triggers full procedural model swap seamlessly
  }, [selectedVehicle]);

  return (
    <div className="relative w-full h-full min-h-[460px] flex flex-col items-center justify-center overflow-hidden">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* 2D Holographic Interactive Nodes Ring Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div className="relative w-[340px] sm:w-[440px] md:w-[500px] h-[340px] sm:h-[440px] md:h-[500px] rounded-full border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] animate-pulse">
          
          {/* Animated Sweeping Radar Scanner */}
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/30 animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border border-blue-500/20 animate-[spin_20s_linear_infinite_reverse]" />

          {/* 6 Holographic Radial Node Labels (Clickable / Interactive) */}
          {[
            { id: 'voice', label: 'VOICE COMMAND', angle: 0, icon: Radio },
            { id: 'ai', label: 'AI CONTROL', angle: 60, icon: Cpu },
            { id: 'pc', label: 'PC CONTROL', angle: 120, icon: Activity },
            { id: 'system', label: 'SYSTEM STATUS', angle: 180, icon: Zap },
            { id: 'car', label: 'CAR CONTROL', angle: 240, icon: Car },
            { id: 'interactions', label: 'INTERACTIONS', angle: 300, icon: Sparkles }
          ].map((node) => {
            const rad = (node.angle * Math.PI) / 180;
            const radiusPercent = 46; // percentage from center
            const x = 50 + radiusPercent * Math.cos(rad);
            const y = 50 + radiusPercent * Math.sin(rad);
            const Icon = node.icon;

            return (
              <motion.button
                key={node.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectHoloRing?.(node.label)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-cyan-500/40 hover:border-cyan-300 hover:bg-cyan-950/90 text-[9.5px] font-mono font-bold text-cyan-200 hover:text-white backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5 cursor-pointer transition-all z-20 group"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 group-hover:bg-cyan-200 animate-ping" />
                <Icon className="w-3 h-3 text-cyan-300 group-hover:text-cyan-100" />
                <span className="hidden sm:inline uppercase tracking-wider">{node.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Top Floating Vehicle Selector Controls: SEDAN | SPORTS | SUV */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_25px_rgba(6,182,212,0.25)]">
        <div className="px-2 py-1 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1 border-r border-cyan-500/20 pr-3">
          <Car className="w-3.5 h-3.5" />
          <span>Vehicle Model:</span>
        </div>
        {(['SEDAN', 'SPORTS', 'SUV'] as VehicleType[]).map((type) => (
          <button
            key={type}
            onClick={() => onSelectVehicle(type)}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedVehicle === type
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-300'
                : 'bg-slate-900/60 text-slate-400 hover:text-cyan-200 hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Bottom Center State Status Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/30 backdrop-blur-xl text-xs font-mono text-cyan-300 shadow-lg">
        <Disc className={`w-3.5 h-3.5 text-cyan-400 ${appState === 'speaking' || appState === 'listening' ? 'animate-spin' : ''}`} />
        <span className="font-bold uppercase tracking-wider">
          {appState === 'speaking' ? 'SHIVANS AI SPEAKING...' : appState === 'listening' ? 'LISTENING TO COMMAND...' : 'AI REACTOR STABLE'}
        </span>
      </div>
    </div>
  );
};
