import React, { useEffect, useRef } from 'react';

/**
 * Particles — full-screen ambient particle canvas.
 * Sits at z-index 0, fixed position.
 * Listens for .light-mode on <html> to swap particle color.
 */
const Particles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let rafId;

    const init = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];

      // Density: one particle per ~9000px²
      const count = Math.floor((canvas.width * canvas.height) / 9000);

      for (let i = 0; i < count; i++) {
        const size = Math.random() * 1.6 + 0.5;
        particles.push({
          x:    Math.random() * canvas.width,
          y:    Math.random() * canvas.height,
          vx:   (Math.random() - 0.5) * 0.35,
          vy:   (Math.random() - 0.5) * 0.35,
          size,
          // Each particle gets a slightly randomised opacity for depth feel
          alpha: Math.random() * 0.4 + 0.25,
        });
      }
    };

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isLight = document.documentElement.classList.contains('light-mode');
      const baseColor = isLight ? '99,102,241' : '129,140,248';

      // Connection distance threshold
      const CONNECT_DIST = 100;

      // Update + draw dots
      particles.forEach(p => {
        p.x = (p.x + p.vx + canvas.width)  % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor},${p.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DIST) {
            const lineAlpha = (1 - dist / CONNECT_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${baseColor},${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    init();
    draw();

    const onResize = () => init();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        // Background gradient lives here so it transitions with theme
        background: 'linear-gradient(160deg, #060c18 0%, #0d1117 55%, #0a0e1a 100%)',
        transition: 'background 0.4s ease',
      }}
    />
  );
};

export default Particles;
