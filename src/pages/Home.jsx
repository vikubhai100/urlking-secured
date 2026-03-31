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
        const xAxis = (window.innerWidth / 2 - e.pageX) / 50; 
        const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
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
    <div className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <Header />
      
      <main>
        {/* HERO SECTION */}
        <section className="pt-48 pb-32 px-6 max-w-7xl mx-auto" ref={heroRef}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm mb-6 gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> v3.0 Now Live
              </div>
              <h1 className="text-5xl lg:text-[4.5rem] font-extrabold leading-[1.1] mb-6">
                Monetize Links with <br/>
                <span className="bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">Professionalism</span>
              </h1>
              <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
                Experience the industry's highest paying shortener with a fast 2-page flow and secure file hosting.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-action px-10 py-4 rounded-full font-bold text-lg shadow-lg shadow-indigo-500/20">Start Earning</Link>
                <a href="#features" className="px-10 py-4 rounded-full font-bold text-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">Features</a>
              </div>
            </div>

            {/* 3D VISUAL */}
            <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center perspective-[2000px]">
              <div ref={cardRef} className="relative w-full max-w-[420px] transition-transform duration-200 ease-out" style={{transformStyle: 'preserve-3d', transform: 'rotateX(10deg) rotateY(-10deg)'}}>
                <div className="absolute -top-10 -right-5 bg-emerald-500/90 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce" style={{transform: 'translateZ(50px)'}}>
                   <i className="fas fa-chart-line text-white"></i>
                   <span className="font-bold text-sm text-white">High CPM</span>
                </div>
                <div className="w-full p-8 bg-[#0f172a]/90 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl">
                   <div className="flex gap-2 mb-8"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
                   <div className="mb-8">
                     <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Payouts</p>
                     <p className="text-4xl font-black">$128,409.00</p>
                   </div>
                   <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-4 text-indigo-400 text-sm mb-6">
                     <i className="fab fa-telegram text-xl"></i>
                     <span>Bot API Connected</span>
                   </div>
                   <div className="flex items-end justify-between h-20 gap-2">
                     <div className="w-full bg-indigo-500/30 rounded-t-lg h-[40%]"></div>
                     <div className="w-full bg-indigo-500/50 rounded-t-lg h-[70%]"></div>
                     <div className="w-full bg-indigo-500 rounded-t-lg h-[50%] shadow-[0_0_15px_rgba(99,102,241,0.4)]"></div>
                     <div className="w-full bg-pink-500 rounded-t-lg h-[90%] shadow-[0_0_15px_rgba(236,72,153,0.4)]"></div>
                     <div className="w-full bg-indigo-400 rounded-t-lg h-[60%]"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-20 border-y border-white/5 bg-white/[0.02] reveal">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div><p className="text-5xl font-black mb-2">$5.00</p><p className="text-indigo-400 font-bold tracking-widest text-sm uppercase">Global CPM</p></div>
            <div><p className="text-5xl font-black mb-2">10M+</p><p className="text-indigo-400 font-bold tracking-widest text-sm uppercase">Links Served</p></div>
            <div><p className="text-5xl font-black mb-2">Instant</p><p className="text-indigo-400 font-bold tracking-widest text-sm uppercase">Withdrawals</p></div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-24 px-6 max-w-7xl mx-auto" id="features">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">Enterprise <span className="text-indigo-400">Features</span></h2>
            <p className="text-slate-400">Everything you need to grow your traffic and earnings.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-10 rounded-[30px] reveal hover:-translate-y-2 transition-all">
              <i className="fas fa-bolt text-3xl text-indigo-400 mb-6"></i>
              <h3 className="text-xl font-bold mb-3">Fast 2-Page Flow</h3>
              <p className="text-slate-400">Our optimized redirection ensures users reach their destination quickly while you earn maximum revenue.</p>
            </div>
            <div className="glass-panel p-10 rounded-[30px] reveal hover:-translate-y-2 transition-all">
              <i className="fab fa-telegram-plane text-3xl text-indigo-400 mb-6"></i>
              <h3 className="text-xl font-bold mb-3">Telegram Bot</h3>
              <p className="text-slate-400">Shorten links and upload files directly from Telegram using our powerful @urlkings_bot.</p>
            </div>
            <div className="glass-panel p-10 rounded-[30px] reveal hover:-translate-y-2 transition-all">
              <i className="fas fa-shield-alt text-3xl text-indigo-400 mb-6"></i>
              <h3 className="text-xl font-bold mb-3">Secure Storage</h3>
              <p className="text-slate-400">Host your files with confidence. Advanced encryption and fast download speeds for your audience.</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 px-6 bg-indigo-500/[0.02]" id="how-it-works">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 reveal">
              <h2 className="text-4xl font-black mb-4">How it <span className="text-indigo-400">Works</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center reveal">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 border border-white/10 text-indigo-400">1</div>
                <h3 className="text-xl font-bold mb-2">Create Account</h3>
                <p className="text-slate-400">Join our platform in 10 seconds.</p>
              </div>
              <div className="text-center reveal">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 border border-white/10 text-indigo-400">2</div>
                <h3 className="text-xl font-bold mb-2">Shorten Links</h3>
                <p className="text-slate-400">Use our dashboard or Telegram bot.</p>
              </div>
              <div className="text-center reveal">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 border border-white/10 text-indigo-400">3</div>
                <h3 className="text-xl font-bold mb-2">Get Paid</h3>
                <p className="text-slate-400">Withdraw your earnings instantly.</p>
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
