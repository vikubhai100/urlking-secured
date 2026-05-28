import React, { useEffect, useRef } from 'react';

const Particles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let animationFrameId;
    let isVisible = true; // 🚀 PERFORMANCE: Track tab visibility

    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesArray = [];
      // 🚀 PERFORMANCE: Reduce particle count on mobile
      const area = canvas.height * canvas.width;
      const isMobile = window.innerWidth < 768;
      const divisor = isMobile ? 18000 : 10000;
      const numberOfParticles = Math.min(Math.floor(area / divisor), isMobile ? 40 : 120);

      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2);
        let dx = (Math.random() * 0.4) - 0.2;
        let dy = (Math.random() * 0.4) - 0.2;
        particlesArray.push({ x, y, dx, dy, size });
      }
    };

    const animateParticles = () => {
      // 🚀 PERFORMANCE: Skip rendering when tab is hidden
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(animateParticles);
        return;
      }
      animationFrameId = requestAnimationFrame(animateParticles);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isLight = document.documentElement.classList.contains('light-mode');
      ctx.fillStyle = isLight ? 'rgba(99, 102, 241, 0.6)' : 'rgba(129, 140, 248, 0.6)';

      particlesArray.forEach(p => {
        if (p.x > canvas.width || p.x < 0) p.dx = -p.dx;
        if (p.y > canvas.height || p.y < 0) p.dy = -p.dy;
        p.x += p.dx;
        p.y += p.dy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
        ctx.globalAlpha = 0.6;
        ctx.fill();
      });
    };

    initParticles();
    animateParticles();

    // 🚀 PERFORMANCE: Pause animation when tab is hidden
    const handleVisibility = () => { isVisible = !document.hidden; };
    document.addEventListener('visibilitychange', handleVisibility);

    // 🚀 PERFORMANCE: Debounce resize handler
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initParticles, 200);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
        zIndex: 0, 
        background: 'linear-gradient(to bottom, var(--bg-gradient-start), var(--bg-gradient-end))',
        transition: 'background 0.3s ease'
      }} 
    />
  );
};

export default Particles;