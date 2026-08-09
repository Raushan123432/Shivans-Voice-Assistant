import React, { useEffect, useRef } from 'react';

export const CursorFX: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;
      }
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${x - 20}px, ${y - 20}px, 0)`;
      }

      // Add trail particle
      if (Math.random() < 0.6) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          size: Math.random() * 2.5 + 1,
          color: Math.random() > 0.5 ? '#06b6d4' : '#a855f7',
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 20 + 20
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      // Burst explosion on click
      for (let i = 0; i < 18; i++) {
        const angle = (Math.PI * 2 * i) / 18;
        const speed = Math.random() * 4 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.5 + 1.5,
          color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#c084fc' : '#22d3ee',
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 25 + 25
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9998]" />
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] pointer-events-none z-[9999] transition-transform duration-75 ease-out"
      />
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] pointer-events-none z-[9999] transition-transform duration-150 ease-out"
      />
    </>
  );
};
