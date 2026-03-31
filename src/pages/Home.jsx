import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Helper component to display simulated animated numbers
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    // Initial animation to target value
    let start = value > 1000 ? value - 1000 : 0;
    const duration = 1500; // 1.5 seconds animation
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function (easeOutExpo)
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentVal = Math.floor(start + (value - start) * easedProgress);
      setDisplayValue(currentVal);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, []); // Only animate on mount
  
  // Update local display if parent prop changes later (though not used in setInterval below)
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);
  
  return displayValue.toLocaleString('en-US');
};

const Home = () => {
  const heroRef = useRef(null);
  const cardRef = useRef(null);
  const statContainerRef = useRef(null); // Ref for the whole scene

  // State for simulated dynamic numbers
  const [stats, setStats] = useState({
    clicks: 128409,
    botLinks: 842,
    files: 15201
  });

  useEffect(() => {
    // 1. Scroll Reveal Animation Logic
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    // 2. 3D Tilt Animation Logic (Applying to statContainerRef for better scene control)
    const container = heroRef.current;
    const statScene = statContainerRef.current; // The perspective container

    if (window.innerWidth > 1024 && container && statScene) {
      const handleMouseMove = (e) => {
        // Smoothing the movement (higher divisor = less tilt)
        const xAxis = (window.innerWidth / 2 - e.pageX) / 70; 
        const yAxis = (window.innerHeight / 2 - e.pageY) / 70;
        
        // Tilt the main main scene lightly
        statScene.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
      };
      
      const handleMouseLeave = () => {
        // Snap back to slight initial tilt for better appearance
        statScene.style.transform = `rotateY(-8deg) rotateX(8deg)`; 
      };

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        observer.disconnect();
      };
    } else if(statScene) {
        // Default tilt for mobile/tablet where mouse move is not present
        statScene.style.transform = `rotateY(-5deg) rotateX(5deg)`;
    }

    // 3. Simulated Number Updates (Exactly like original JS script)
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        clicks: prev.clicks + Math.floor(Math.random() * 5 + 1), // Increases randomly by 1-5
        botLinks: prev.botLinks + Math.floor(Math.random() * 2),     // Increases randomly by 0-1
        files: prev.files + Math.floor(Math.random() * 2)          // Increases randomly by 0-1
      }));
    }, Math.floor(Math.random() * 3000 + 5000)); // Every 5-8 seconds randomly

    return () => clearInterval(statsInterval);

  }, []);

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <Header />
      
      <main>
        {/* HERO SECTION - MOBILE RESPONSIVE FIX */}
        <section className="pt-[160px] lg:pt-48 pb-20 lg:pb-32 px-4 md:px-6 max-w-7xl mx-auto" ref={heroRef}>
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
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/register" className="btn-action w-full sm:w-auto text-center px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-indigo-500/20">Start Earning</Link>
                <a href="#features" className="w-full sm:w-auto text-center px-8 py-4 rounded-full font-bold text-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">Features</a>
              </div>
            </div>

            {/* 3D VISUAL - ALL 3 ORIGINAL CARDS ARE BACK & RESPONSIVE */}
            <div className="relative h-[480px] md:h-[550px] lg:h-[600px] flex items-center justify-center perspective-[3000px] w-full max-w-[100vw] mt-10 lg:mt-0">
              {/* Perspective container that rotates with mouse */}
              <div ref={statContainerRef} className="relative w-full h-full transition-transform duration-200 ease-out" style={{transformStyle: 'preserve-3d', transform: 'rotateY(-8deg) rotateX(8deg)'}}>
                
                {/* 1. Total Clicks Card (Desktop: Top Left | Mobile: Top Center) */}
                <div className="absolute top-[2%] left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 w-[90%] sm:w-auto sm:min-w-[280px] lg:min-w-[240px] p-6 lg:p-5 bg-[#0f172a]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl reveal hover:-translate-y-2 transition-transform z-30" style={{transform: 'translateZ(100px)'}}>
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                       <i className="fas fa-eye"></i>
                     </div>
                     <div>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Clicks</p>
                       <p className="text-3xl font-black text-white"><AnimatedNumber value={stats.clicks} /></p>
                       <p className="text-xs text-emerald-400 font-medium">Tracking Live</p>
                     </div>
                   </div>
                </div>

                {/* 2. Bot Links Card (Desktop: Mid Right | Mobile: Center) */}
                <div className="absolute top-[35%] left-1/2 -translate-x-1/2 lg:top-[30%] lg:right-0 lg:left-auto lg:translate-x-0 w-[90%] sm:w-auto sm:min-w-[280px] lg:min-w-[240px] p-6 lg:p-5 bg-[#0f172a]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl reveal hover:-translate-y-2 transition-transform z-20" style={{transform: 'translateZ(150px)'}}>
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xl shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                       <i className="fab fa-telegram-plane"></i>
                     </div>
                     <div>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Links via Bot</p>
                       <p className="text-3xl font-black text-white"><AnimatedNumber value={stats.botLinks} /></p>
                       <p className="text-xs text-indigo-400 font-medium">@urlkings_bot</p>
                     </div>
                   </div>
                </div>

                {/* 3. Uploaded Files Card (Desktop: Bottom Left | Mobile: Bottom Center) */}
                <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 lg:bottom-[5%] lg:left-0 lg:translate-x-0 w-[90%] sm:w-auto sm:min-w-[280px] lg:min-w-[240px] p-6 lg:p-5 bg-[#0f172a]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl reveal hover:-translate-y-2 transition-transform z-10" style={{transform: 'translateZ(120px)'}}>
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xl shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                       <i className="fas fa-file-upload"></i>
                     </div>
                     <div>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Files Uploaded</p>
                       <p className="text-3xl font-black text-white"><AnimatedNumber value={stats.files} /></p>
                       <p className="text-xs text-pink-400 font-medium">Safe Hosting</p>
                     </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION (Static rate info below hero) */}
        <section className="py-16 md:py-20 border-y border-white/5 bg-white/[0.02] reveal">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div><p className="text-4xl md:text-5xl font-black mb-2">$5.00</p><p className="text-indigo-400 font-bold tracking-widest text-xs md:text-sm uppercase">Global CPM</p></div>
            <div><p className="text-4xl md:text-5xl font-black mb-2">10M+</p><p className="text-indigo-400 font-bold tracking-widest text-xs md:text-sm uppercase">Links Served</p></div>
            <div><p className="text-4xl md:text-5xl font-black mb-2">Instant</p><p className="text-indigo-400 font-bold tracking-widest text-xs md:text-sm uppercase">Withdrawals</p></div>
          </div>
        </section>

        {/* FEATURES */}
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

        {/* HOW IT WORKS */}
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
