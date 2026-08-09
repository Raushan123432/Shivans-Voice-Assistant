import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ appState, emotion, voiceLevel });

  useEffect(() => {
    stateRef.current = { appState, emotion, voiceLevel };
  }, [appState, emotion, voiceLevel]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.2, 7.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0x382bf0, 1.2);
    scene.add(ambientLight);

    // Key Light (Cyan)
    const keyLight = new THREE.DirectionalLight(0x06b6d4, 3.5);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    // Fill Light (Magenta/Purple)
    const fillLight = new THREE.DirectionalLight(0xd946ef, 3.0);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    // Rim/Hologram Light (Cyan / Blue)
    const rimLight = new THREE.PointLight(0x38bdf8, 4, 15);
    rimLight.position.set(0, -2, 2);
    scene.add(rimLight);

    // ZOYA MAIN GROUP
    const zoyaGroup = new THREE.Group();
    scene.add(zoyaGroup);

    // MATERIALS
    const cyberSkinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111827,
      metalness: 0.35,
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.08
    });

    const armorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.2
    });

    const neonCyanMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: false
    });

    const neonPurpleMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc
    });

    const glassVisorMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      transmission: 0.8,
      ior: 1.5
    });

    // --- 1. HEAD & FACE STRUCTURE ---
    const headGroup = new THREE.Group();
    zoyaGroup.add(headGroup);

    // Head Base (Smooth Cybernetic Feminine Shape)
    const headGeo = new THREE.SphereGeometry(1.0, 32, 32);
    headGeo.scale(0.85, 1.15, 0.95);
    const headMesh = new THREE.Mesh(headGeo, cyberSkinMaterial);
    headGroup.add(headMesh);

    // Cheekbone / Jaw Contour Plates
    const cheekGeo = new THREE.CylinderGeometry(0.88, 0.72, 0.5, 16);
    const cheekMesh = new THREE.Mesh(cheekGeo, armorMaterial);
    cheekMesh.position.set(0, -0.35, 0.05);
    headGroup.add(cheekMesh);

    // Jaw / Lip Node (for lip-sync animation)
    const jawGeo = new THREE.BoxGeometry(0.45, 0.12, 0.25);
    const jawMesh = new THREE.Mesh(jawGeo, cyberSkinMaterial);
    jawMesh.position.set(0, -0.65, 0.72);
    headGroup.add(jawMesh);

    // Glowing Cybernetic Mouth Line
    const mouthLineGeo = new THREE.PlaneGeometry(0.35, 0.04);
    const mouthLineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const mouthMesh = new THREE.Mesh(mouthLineGeo, mouthLineMat);
    mouthMesh.position.set(0, -0.62, 0.86);
    headGroup.add(mouthMesh);

    // --- 2. EYES & VISOR ---
    const eyeGroup = new THREE.Group();
    headGroup.add(eyeGroup);

    // Left Eye Socket & Iris
    const eyeSocketGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1
    });

    const leftEye = new THREE.Mesh(eyeSocketGeo, irisMat);
    leftEye.position.set(-0.34, 0.12, 0.76);
    eyeGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeSocketGeo, irisMat);
    rightEye.position.set(0.34, 0.12, 0.76);
    eyeGroup.add(rightEye);

    // Glowing Pupils
    const pupilGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.34, 0.12, 0.88);
    eyeGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.34, 0.12, 0.88);
    eyeGroup.add(rightPupil);

    // Eyelids (for blinking animation)
    const eyelidGeo = new THREE.BoxGeometry(0.4, 0.15, 0.1);
    const eyelidMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    
    const leftEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    leftEyelid.position.set(-0.34, 0.22, 0.86);
    eyeGroup.add(leftEyelid);

    const rightEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    rightEyelid.position.set(0.34, 0.22, 0.86);
    eyeGroup.add(rightEyelid);

    // Holographic Visor Crown / Headband
    const visorGeo = new THREE.TorusGeometry(0.92, 0.08, 8, 32, Math.PI * 0.9);
    const visorMesh = new THREE.Mesh(visorGeo, glassVisorMat);
    visorMesh.rotation.x = Math.PI / 2.2;
    visorMesh.position.set(0, 0.18, 0.1);
    headGroup.add(visorMesh);

    // --- 3. CYBERNETIC EAR IMPLANTS & CROWN CIRCUIT LINES ---
    const leftEarGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.3, 12);
    const earMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    
    const leftEar = new THREE.Mesh(leftEarGeo, earMat);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-0.85, 0.0, 0.0);
    headGroup.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.set(0.85, 0.0, 0.0);
    headGroup.add(rightEar);

    // Glowing Temple Accents
    const templeRingGeo = new THREE.TorusGeometry(0.18, 0.03, 8, 24);
    const templeLeft = new THREE.Mesh(templeRingGeo, neonCyanMat);
    templeLeft.rotation.y = Math.PI / 2;
    templeLeft.position.set(-0.92, 0.0, 0.0);
    headGroup.add(templeLeft);

    const templeRight = templeLeft.clone();
    templeRight.position.set(0.92, 0.0, 0.0);
    headGroup.add(templeRight);

    // --- 4. FLOWING CYBER HAIR BRAIDS / STRANDS ---
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    const hairStrands: THREE.Mesh[] = [];
    const strandMatCyan = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.5
    });
    const strandMatPurple = new THREE.MeshStandardMaterial({
      color: 0x7e22ce,
      emissive: 0xa855f7,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.5
    });

    // Create 18 flowing hair strand curves around the head
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 1.4 - Math.PI * 0.2; // Back and sides
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(Math.cos(angle) * 0.8, 0.8, Math.sin(angle) * 0.8),
        new THREE.Vector3(Math.cos(angle) * 1.1, 0.2, Math.sin(angle) * 1.1),
        new THREE.Vector3(Math.cos(angle) * 1.3, -0.6, Math.sin(angle) * 1.3 + 0.2),
        new THREE.Vector3(Math.cos(angle) * 1.4, -1.6, Math.sin(angle) * 1.4 + 0.4)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
      const strand = new THREE.Mesh(tubeGeo, i % 2 === 0 ? strandMatCyan : strandMatPurple);
      strand.userData = { angle, index: i };
      hairGroup.add(strand);
      hairStrands.push(strand);
    }

    // --- 5. NECK & CYBERNETIC COLLAR / SHOULDER ARMOR ---
    const neckGeo = new THREE.CylinderGeometry(0.35, 0.42, 0.8, 16);
    const neckMesh = new THREE.Mesh(neckGeo, armorMaterial);
    neckMesh.position.set(0, -1.1, -0.05);
    zoyaGroup.add(neckMesh);

    // Glowing Collar Ring
    const collarGeo = new THREE.TorusGeometry(0.52, 0.06, 8, 32);
    const collarMesh = new THREE.Mesh(collarGeo, neonCyanMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, -1.2, -0.05);
    zoyaGroup.add(collarMesh);

    // Shoulder Armor Plates
    const shoulderGeo = new THREE.BoxGeometry(2.4, 0.35, 0.9);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, armorMaterial);
    shoulderMesh.position.set(0, -1.5, -0.1);
    zoyaGroup.add(shoulderMesh);

    // Shoulder Neon Strips
    const stripGeo = new THREE.BoxGeometry(0.8, 0.06, 0.92);
    const stripLeft = new THREE.Mesh(stripGeo, neonCyanMat);
    stripLeft.position.set(-0.8, -1.45, -0.08);
    zoyaGroup.add(stripLeft);

    const stripRight = new THREE.Mesh(stripGeo, neonPurpleMat);
    stripRight.position.set(0.8, -1.45, -0.08);
    zoyaGroup.add(stripRight);

    // --- 6. HOLOGRAM PLATFORM (ROTATING RINGS & ENERGY RAYS) ---
    const hologramGroup = new THREE.Group();
    hologramGroup.position.set(0, -2.2, 0);
    zoyaGroup.add(hologramGroup);

    // Ring 1 (Outer Neon Ring)
    const ring1Geo = new THREE.TorusGeometry(2.2, 0.04, 8, 64);
    const ring1Mesh = new THREE.Mesh(ring1Geo, neonCyanMat);
    ring1Mesh.rotation.x = Math.PI / 2;
    hologramGroup.add(ring1Mesh);

    // Ring 2 (Inner Rotating Glyph Ring)
    const ring2Geo = new THREE.RingGeometry(1.4, 1.8, 32);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      side: THREE.DoubleSide,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = Math.PI / 2;
    hologramGroup.add(ring2Mesh);

    // Ring 3 (Core Pulse Ring)
    const ring3Geo = new THREE.TorusGeometry(1.0, 0.03, 8, 48);
    const ring3Mesh = new THREE.Mesh(ring3Geo, neonCyanMat);
    ring3Mesh.rotation.x = Math.PI / 2;
    hologramGroup.add(ring3Mesh);

    // Vertical Laser Pillar Particles
    const pCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const pAngle = Math.random() * Math.PI * 2;
      const pRadius = Math.random() * 1.8;
      pPos[i * 3] = Math.cos(pAngle) * pRadius;
      pPos[i * 3 + 1] = Math.random() * 3.5;
      pPos[i * 3 + 2] = Math.sin(pAngle) * pRadius;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const holoParticles = new THREE.Points(pGeo, pMat);
    hologramGroup.add(holoParticles);

    // --- MOUSE & ANIMATION CONTROLS ---
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / container.clientWidth - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / container.clientHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // BLINKING LOGIC
    let blinkTimer = 0;
    let isBlinking = false;

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const { appState: currentAppState, voiceLevel: currentVoiceLevel } = stateRef.current;

      // 1. Floating Idle Body Motion
      const floatY = Math.sin(time * 1.8) * 0.12;
      zoyaGroup.position.y = floatY;

      // 2. Head Mouse Tracking & Breathing
      const targetHeadRotY = mouseX * 0.45;
      const targetHeadRotX = -mouseY * 0.35;
      headGroup.rotation.y += (targetHeadRotY - headGroup.rotation.y) * 0.06;
      headGroup.rotation.x += (targetHeadRotX - headGroup.rotation.x) * 0.06;

      // Eye Pupil Tracking
      leftPupil.position.x = -0.34 + mouseX * 0.04;
      rightPupil.position.x = 0.34 + mouseX * 0.04;
      leftPupil.position.y = 0.12 + mouseY * 0.04;
      rightPupil.position.y = 0.12 + mouseY * 0.04;

      // 3. Eyelid Blinking
      blinkTimer += delta;
      if (blinkTimer > 3.5 && !isBlinking) {
        isBlinking = true;
        blinkTimer = 0;
      }
      if (isBlinking) {
        leftEyelid.scale.y = 2.5;
        rightEyelid.scale.y = 2.5;
        if (blinkTimer > 0.18) {
          isBlinking = false;
          leftEyelid.scale.y = 1.0;
          rightEyelid.scale.y = 1.0;
          blinkTimer = 0;
        }
      }

      // 4. Lip / Jaw Speech Sync Animation
      if (currentAppState === 'speaking') {
        const speakScale = 1.0 + Math.sin(time * 24) * 0.4 * (currentVoiceLevel + 0.3);
        jawMesh.position.y = -0.65 - (speakScale - 1.0) * 0.08;
        mouthMesh.scale.x = 1.0 + (speakScale - 1.0) * 0.8;
      } else if (currentAppState === 'listening') {
        mouthMesh.scale.x = 0.9 + Math.sin(time * 6) * 0.1;
        jawMesh.position.y = -0.65;
      } else {
        jawMesh.position.y = -0.65;
        mouthMesh.scale.x = 1.0;
      }

      // 5. Hair Physics Sway
      hairStrands.forEach((strand) => {
        const idx = strand.userData.index;
        strand.rotation.z = Math.sin(time * 2 + idx) * 0.08;
        strand.rotation.x = Math.cos(time * 1.5 + idx) * 0.06;
      });

      // 6. Hologram Platform Animations
      ring1Mesh.rotation.z = time * 0.4;
      ring2Mesh.rotation.z = -time * 0.8;
      ring3Mesh.rotation.z = time * 1.2;

      // Hologram Particles Vertical Ascent
      const positions = holoParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        positions[i * 3 + 1] += 0.02;
        if (positions[i * 3 + 1] > 3.5) {
          positions[i * 3 + 1] = 0;
        }
      }
      holoParticles.geometry.attributes.position.needsUpdate = true;

      // State Based Light Glow
      if (currentAppState === 'speaking') {
        rimLight.color.setHex(0xc084fc);
        rimLight.intensity = 5.0 + Math.sin(time * 12) * 2;
      } else if (currentAppState === 'listening') {
        rimLight.color.setHex(0x22d3ee);
        rimLight.intensity = 4.0 + Math.sin(time * 8) * 1.5;
      } else if (currentAppState === 'thinking') {
        rimLight.color.setHex(0x38bdf8);
        rimLight.intensity = 3.5 + Math.sin(time * 16) * 2;
      } else {
        rimLight.color.setHex(0x38bdf8);
        rimLight.intensity = 3.0;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[460px] md:h-[520px] flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Holographic HUD Ring Base Glow Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-12 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none animate-pulse" />
    </div>
  );
};
