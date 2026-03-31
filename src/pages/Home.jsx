import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);
  return displayValue.toLocaleString('en-US');
};

const Home = () => {
  const heroRef = useRef(null);
  const cardRef = useRef(null);
  
  const [stats, setStats] = useState({ clicks: 128409, botLinks: 847, files: 15203 });
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Cards data for Auto-Fading
  const fadingCards = [
    { title: "TOTAL CLICKS", value: stats.clicks, sub: "Tracking Live", icon: "fa-eye", iconColor: "text-emerald-400", bgGlow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" },
    { title: "LINKS VIA BOT", value: stats.botLinks, sub: "@urlkings_bot", icon: "fa-telegram-plane", iconColor: "text-indigo-400", bgGlow: "shadow-[0_0_15px_rgba(99,102,241,0.3)]" },
    { title: "FILES UPLOADED", value: stats.files, sub: "Safe Hosting", icon: "fa-file-upload", iconColor: "text-pink-400", bgGlow: "shadow-[0_0_15px_rgba(236,72,153,0.3)]" }
  ];

  useEffect(() => {
    // Scroll Reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    // 3D Tilt for Desktop
    const container = heroRef.current;
    const card = cardRef.current;
    if (window.innerWidth > 1024 && container && card) {
      const handleMouseMove = (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 60; 
        const yAxis = (window.innerHeight / 2 - e.pageY) / 60;
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
      };
      const handleMouseLeave = () => {
        card.style.transform = `rotateY(-5deg) rotateX(5deg)`; 
      };
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        observer.disconnect();
      };
    } else if (card) {
      card.style.transform = `rotateY(0deg) rotateX(0deg)`; // Flat for mobile
    }

    // Auto-Fade Card Index (Changes every 3.5 seconds)
    const fadeInterval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % 3);
    }, 3500);

    // Dynamic Numbers Update
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        clicks: prev.clicks + Math.floor(Math.random() * 5 + 1),
        botLinks: prev.botLinks + Math.floor(Math.random() * 2),
        files: prev.files + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => {
      clearInterval(fadeInterval);
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <Header />
      
      <main>
        {/* HERO SECTION - Fixed Padding for Mobile (pt-[160px]) */}
        <section className="pt-[160px] lg:pt-[200px] pb-20 lg:pb-32 px-4 md:px-6 max-w-7xl mx-auto" ref={heroRef}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="reveal z-10">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs md:text-sm mb-6 gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> v3.0 Now Live
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-extrabold leading-tight lg:leading-[1.1] mb-6">
                Monetize Links with <br/>
                <span className="bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">Professionalism</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-lg leading-relaxed">
                Experience the industry's highest paying shortener with a fast 2-page flow and secure file hosting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-6">
                <Link to="/register" className="btn-action w-full sm:w-auto text-center px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-indigo-500/20">Start Earning</Link>
                <a href="#features" className="w-full sm:w-auto text-center px-8 py-4 rounded-full font-bold text-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">Features</a>
              </div>
            </div>

            {/* 3D VISUAL - Single Auto-Fading Card */}
            <div className="relative h-[320px] md:h-[450px] lg:h-[500px] flex items-center justify-center perspective-[2000px] w-full mt-10 lg:mt-0">
              <div ref={cardRef} className="relative w-full max-w-[400px] transition-transform duration-300 ease-out" style={{transformStyle: 'preserve-3d'}}>
                
                {/* Floating High CPM Badge */}
                <div className="absolute -top-5 -right-2 md:-top-8 md:-right-6 bg-emerald-500/90 p-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce z-20" style={{transform: 'translateZ(40px)'}}>
                   <i className="fas fa-chart-line text-white"></i>
                   <span className="font-bold text-xs md:text-sm text-white">High CPM</span>
                </div>

                {/* Main Single Card */}
                <div className="w-full p-6 md:p-8 bg-[#0f172a]/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                   
                   {/* Mac Dots */}
                   <div className="flex gap-2 mb-8 relative z-10">
                     <div className="w-3 h-3 rounded-full bg-red-500"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   </div>
                   
                   {/* Auto-Fading Content Area */}
                   <div className="relative h-[100px] mb-8 z-10">
                     {fadingCards.map((card, index) => (
                       <div 
                         key={index} 
                         className={`absolute inset-0 transition-all duration-700 ease-in-out flex items-center gap-5 ${
                           activeCardIndex === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
                         }`}
                       >
                         {/* Dynamic Icon */}
                         <div className={`w-14 h-14 rounded-2xl bg-[#1e293b] flex items-center justify-center text-2xl border border-white/5 ${card.iconColor} ${card.bgGlow}`}>
                           <i className={`fas ${card.icon}`}></i>
                         </div>
                         {/* Dynamic Text */}
                         <div>
                           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{card.title}</p>
                           <p className="text-3xl md:text-4xl font-black text-white"><AnimatedNumber value={card.value} /></p>
                           <p className={`text-xs font-medium mt-1 ${card.iconColor}`}>{card.sub}</p>
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* Static Animated Chart at Bottom */}
                   <div className="flex items-end justify-between h-16 md:h-20 gap-2 relative z-10">
                     <div className="w-full bg-indigo-500/20 rounded-t-lg h-[40%]"></div>
                     <div className="w-full bg-indigo-500/40 rounded-t-lg h-[70%]"></div>
                     <div className="w-full bg-indigo-500 rounded-t-lg h-[50%] shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                     <div className="w-full bg-pink-500 rounded-t-lg h-[90%] shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
                     <div className="w-full bg-indigo-500/60 rounded-t-lg h-[60%]"></div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* REST OF THE SECTIONS (Stats, Features, How it works) */}
        <section className="py-16 md:py-20 border-y border-white/5 bg-white/[0.02] reveal">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div><p className="text-4xl md:text-5xl font-black mb-2">$5.00</p><p className="text-indigo-400 font-bold tracking-widest text-xs md:text-sm uppercase">Global CPM</p></div>
            <div><p className="text-4xl md:text-5xl font-black mb-2">10M+</p><p className="text-indigo-400 font-bold tracking-widest text-xs md:text-sm uppercase">Links Served</p></div>
            <div><p className="text-4xl md:text-5xl font-black mb-2">Instant</p><p className="text-indigo-400 font-bold tracking-widest text-xs md:text-sm uppercase">Withdrawals</p></div>
          </div>
        </section>

        <section className="py-20 md:py-24 px-6 max-w-7xl mx-auto" id="features">
          <div className="text-center mb-12 md:mb-16 reveal">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">Enterprise <span className="text-indigo-400">Features</span></h2>
            <p className="text-slate-400 text-sm md:text-base">Everything you need to grow your traffic and earnings.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="glass-panel p-8 md:p-10 rounded-[24px] md:rounded-[30px] reveal hover:-translate-y-2 transition-all">
              <i className="fas fa-bolt text-3xl text-indigo-400 mb-6"></i>
              <h3 className="text-xl font-bold mb-3">Fast 2-Page Flow</h3>
              <p className="text-slate-400 text-sm md:text-base">Our optimized redirection ensures users reach their destination quickly while you earn maximum revenue.</p>
            </div>
            <div className="glass-panel p-8 md:p-10 rounded-[24px] md:rounded-[30px] reveal hover:-translate-y-2 transition-all">
              <i className="fab fa-telegram-plane text-3xl text-indigo-400 mb-6"></i>
              <h3 className="text-xl font-bold mb-3">Telegram Bot</h3>
              <p className="text-slate-400 text-sm md:text-base">Shorten links and upload files directly from Telegram using our powerful @urlkings_bot.</p>
            </div>
            <div className="glass-panel p-8 md:p-10 rounded-[24px] md:rounded-[30px] reveal hover:-translate-y-2 transition-all">
              <i className="fas fa-shield-alt text-3xl text-indigo-400 mb-6"></i>
              <h3 className="text-xl font-bold mb-3">Secure Storage</h3>
              <p className="text-slate-400 text-sm md:text-base">Host your files with confidence. Advanced encryption and fast download speeds for your audience.</p>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 px-6 bg-indigo-500/[0.02]" id="how-it-works">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16 reveal">
              <h2 className="text-3xl md:text-4xl font-black mb-4">How it <span className="text-indigo-400">Works</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center reveal">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 border border-white/10 text-indigo-400">1</div>
                <h3 className="text-xl font-bold mb-2">Create Account</h3>
                <p className="text-slate-400 text-sm md:text-base">Join our platform in 10 seconds.</p>
              </div>
              <div className="text-center reveal">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 border border-white/10 text-indigo-400">2</div>
                <h3 className="text-xl font-bold mb-2">Shorten Links</h3>
                <p className="text-slate-400 text-sm md:text-base">Use our dashboard or Telegram bot.</p>
              </div>
              <div className="text-center reveal">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 border border-white/10 text-indigo-400">3</div>
                <h3 className="text-xl font-bold mb-2">Get Paid</h3>
                <p className="text-slate-400 text-sm md:text-base">Withdraw your earnings instantly.</p>
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
