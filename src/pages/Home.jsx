import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const heroRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    const container = heroRef.current;
    const card = cardRef.current;

    if (window.innerWidth > 1024 && container && card) {
      const handleMouseMove = (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 60; // TILT SMOOTHED (30 -> 60)
        const yAxis = (window.innerHeight / 2 - e.pageY) / 60;
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
      };
      
      const handleMouseLeave = () => {
        card.style.transform = `rotateY(-10deg) rotateX(10deg)`; 
      };

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[#020617]">
      <Header />
      <main>
        {/* HERO */}
        <section className="pt-48 pb-32 px-6 max-w-7xl mx-auto overflow-hidden" ref={heroRef}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <h1 className="text-5xl lg:text-[4.5rem] font-extrabold leading-[1.1] text-white mb-6">
                Professional links for <br/>
                <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Growth</span>
              </h1>
              <p className="text-xl text-slate-400 mb-10 max-w-lg">Scale your audience reach with the most powerful link management platform.</p>
              <Link to="/register" className="btn-action px-10 py-4 rounded-full font-bold text-lg text-white">Start for Free</Link>
            </div>

            {/* 3D CARD + ANIMATED FLOATING CARDS */}
            <div className="relative h-[400px] lg:h-[550px] flex items-center justify-center perspective-[2000px]">
              <div ref={cardRef} className="relative w-full max-w-[400px] transition-transform duration-200 ease-out" style={{transformStyle: 'preserve-3d', transform: 'rotateX(10deg) rotateY(-10deg)'}}>
                
                {/* Floating Stat 1 (Top Right) */}
                <div className="absolute -top-10 -right-10 bg-[#1e293b]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 animate-bounce" style={{transform: 'translateZ(80px)'}}>
                   <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center"><i className="fas fa-chart-line text-white"></i></div>
                   <div className="text-white"><div className="text-[10px] opacity-60 uppercase">Conversion</div><div className="font-bold">+24%</div></div>
                </div>

                {/* Main 3D Card */}
                <div className="w-full p-8 bg-[#0f172a]/80 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl">
                   <div className="flex gap-2 mb-8">
                     <div className="w-3 h-3 rounded-full bg-red-500"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   </div>
                   <div className="text-white mb-8">
                     <p className="text-sm opacity-50 mb-1 font-bold">Total Clicks</p>
                     <p className="text-4xl font-black tracking-tight">128,409</p>
                   </div>
                   <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-4 text-indigo-400 text-sm mb-6">
                     <i className="fab fa-telegram text-xl"></i>
                     <span><b>@urlkings_bot</b> is active</span>
                   </div>
                   <div className="flex items-end justify-between h-20 gap-2">
                     <div className="w-full bg-indigo-500/20 rounded-t-lg h-[40%]"></div>
                     <div className="w-full bg-indigo-500/40 rounded-t-lg h-[70%]"></div>
                     <div className="w-full bg-indigo-500 rounded-t-lg h-[50%] shadow-[0_0_15px_#6366f1]"></div>
                     <div className="w-full bg-pink-500 rounded-t-lg h-[90%] shadow-[0_0_15px_#ec4899]"></div>
                     <div className="w-full bg-indigo-500/60 rounded-t-lg h-[60%]"></div>
                   </div>
                </div>

                {/* Floating Stat 2 (Bottom Left) */}
                <div className="absolute -bottom-8 -left-8 bg-[#1e293b]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 animate-pulse" style={{transform: 'translateZ(100px)'}}>
                   <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center"><i className="fas fa-shield-alt text-white"></i></div>
                   <div className="text-white font-bold">Secure</div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
