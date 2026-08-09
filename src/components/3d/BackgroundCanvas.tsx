import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const BackgroundCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 25);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Starfield particles
    const starCount = 1200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorCyan = new THREE.Color('#06b6d4');
    const colorPurple = new THREE.Color('#8b5cf6');
    const colorWhite = new THREE.Color('#e0f2fe');

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 120;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 80 + 10;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const pickColor = Math.random() > 0.6 ? colorCyan : Math.random() > 0.3 ? colorPurple : colorWhite;
      starColors[i * 3] = pickColor.r;
      starColors[i * 3 + 1] = pickColor.g;
      starColors[i * 3 + 2] = pickColor.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Floating Low-Poly Cyber Wireframe Polygons
    const polyGroup = new THREE.Group();
    const geoms = [
      new THREE.IcosahedronGeometry(1.2, 0),
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.TetrahedronGeometry(1.4, 0),
      new THREE.DodecahedronGeometry(1.1, 0)
    ];

    const polyMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 16; i++) {
      const g = geoms[i % geoms.length];
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x06b6d4 : 0xa855f7,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      const mesh = new THREE.Mesh(g, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 60,
        Math.random() * 25 - 5,
        (Math.random() - 0.5) * 40 - 10
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        floatSpeed: Math.random() * 0.02 + 0.005,
        offset: Math.random() * Math.PI * 2,
        baseY: mesh.position.y
      };
      polyGroup.add(mesh);
      polyMeshes.push(mesh);
    }
    scene.add(polyGroup);

    // Holographic Floor Grid
    const gridHelper = new THREE.GridHelper(100, 50, 0x06b6d4, 0x4c1d95);
    gridHelper.position.set(0, -6, 0);
    if (gridHelper.material instanceof THREE.Material) {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.25;
    }
    scene.add(gridHelper);

    // Moving Laser Lights / Ambient Lights
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.5);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 3, 50);
    cyanPointLight.position.set(-15, 10, 10);
    scene.add(cyanPointLight);

    const purplePointLight = new THREE.PointLight(0xc084fc, 3, 50);
    purplePointLight.position.set(15, -5, -5);
    scene.add(purplePointLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const time = clock.getElapsedTime();

      // Rotate starfield
      starField.rotation.y = time * 0.02;
      starField.rotation.x = Math.sin(time * 0.01) * 0.05;

      // Rotate poly meshes
      polyMeshes.forEach((mesh) => {
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;
        mesh.position.y = mesh.userData.baseY + Math.sin(time * mesh.userData.floatSpeed * 2 + mesh.userData.offset) * 1.5;
      });

      // Shift grid
      gridHelper.position.z = (time * 2) % 2;

      // Camera gentle sway with mouse
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.03;
      camera.position.y += (mouseY * 2 + 5 - camera.position.y) * 0.03;
      camera.lookAt(0, 2, 0);

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

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />;
};
