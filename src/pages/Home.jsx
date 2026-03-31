import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const heroRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    // 1. Scroll Reveal Animation Logic
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    // 2. 3D Tilt Animation Logic (Exactly like original HTML)
    const container = heroRef.current;
    const card = cardRef.current;

    if (window.innerWidth > 1024 && container && card) {
      const handleMouseMove = (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 30;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 30;
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
      };
      
      const handleMouseLeave = () => {
        card.style.transform = `rotateY(-15deg) rotateX(15deg)`; 
      };

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        observer.disconnect();
      };
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Ambient Orbs Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[var(--bg-body)]">
        <div className="absolute rounded-full blur-[100px] opacity-25 w-[400px] h-[400px] bg-indigo-500 top-[-10%] left-[-10%] animate-[float_20s_infinite_alternate_ease-in-out]"></div>
        <div className="absolute rounded-full blur-[100px] opacity-25 w-[300px] h-[300px] bg-pink-500 bottom-[10%] right-[-5%] animate-[float_20s_infinite_alternate-reverse_ease-in-out]" style={{animationDelay: '-5s'}}></div>
      </div>

      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-48 pb-32 px-6 max-w-7xl mx-auto overflow-hidden" ref={heroRef}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <div className="inline-flex items-center px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold text-sm mb-6 gap-3">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_#6366f1]"></span> v3.0 Enterprise Live
              </div>
              <h1 className="text-5xl lg:text-[4.5rem] font-extrabold leading-[1.1] tracking-tight mb-6 text-[var(--text-primary)]">
                Professional links & files for <br/>
                <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Professional Growth</span>
              </h1>
              <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
                Experience the most powerful link management platform. Built for modern brands to track, optimize, and scale their audience reach with zero compromise.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-action px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 text-white shadow-[0_8px_25px_var(--primary-glow)] hover:shadow-[0_12px_35px_var(--primary-glow)]">
                  Start for Free <i className="fas fa-arrow-right"></i>
                </Link>
                <a href="#features" className="px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 bg-white/5 border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-indigo-500/10 hover:border-indigo-500 hover:text-indigo-500 transition-all backdrop-blur-md">
                  Learn More
                </a>
              </div>
            </div>

            {/* 3D Visual - MOBILE RESPONSIVE FIX */}
            <div className="relative h-[350px] lg:h-[550px] flex items-center justify-center perspective-[2000px] w-full mt-10 lg:mt-0">
              <div ref={cardRef} className="relative w-full max-w-[340px] md:max-w-[450px] h-full transition-transform duration-100 ease-out" style={{transformStyle: 'preserve-3d', transform: 'rotateX(15deg) rotateY(-15deg)'}}>
                
                {/* Floating Stat 1 - Hidden on mobile */}
                <div className="hidden lg:flex absolute top-[10%] -right-8 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--glass-border)] shadow-2xl items-center gap-3 text-[var(--text-primary)] backdrop-blur-xl animate-[float_5s_infinite_alternate_ease-in-out]" style={{transform: 'translateZ(60px)'}}>
                   <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center"><i className="fas fa-chart-line text-white"></i></div>
                   <div><div className="text-xs text-slate-400">Conversion</div><div className="font-extrabold text-lg">+24.5%</div></div>
                </div>

                {/* Main 3D Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full p-5 lg:p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--glass-border)] shadow-[20px_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                   <div className="flex gap-2 mb-4 lg:mb-6">
                     <div className="w-3 h-3 rounded-full bg-red-500"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   </div>
                   <div className="flex justify-between mb-4 lg:mb-6 text-[var(--text-primary)]">
                     <div>
                       <p className="text-xs lg:text-sm text-slate-400 font-semibold">Total Clicks</p>
                       <p className="text-2xl lg:text-[2rem] font-extrabold leading-tight">128,409</p>
                     </div>
                     <div className="text-right">
                       <p className="text-xs lg:text-sm text-slate-400 font-semibold">Active Links</p>
                       <p className="text-2xl lg:text-[2rem] font-extrabold text-indigo-500 leading-tight">842</p>
                     </div>
                   </div>
                   <div className="p-3 bg-indigo-500/10 border border-indigo-500/50 rounded-xl flex items-center gap-3 mb-6">
                     <i className="fab fa-telegram text-lg lg:text-xl text-indigo-500"></i>
                     <p className="text-xs lg:text-sm font-medium text-[var(--text-primary)]"><b>@urlkings_bot</b> generated 45 links today!</p>
                   </div>
                   <div className="flex items-end justify-between h-[60px] lg:h-[80px] border-b border-[var(--glass-border)] pb-2">
                     <div className="w-[12%] bg-gradient-to-t from-[#4f46e5] to-[#6366f1] rounded-t-md h-[40%]"></div>
                     <div className="w-[12%] bg-gradient-to-t from-[#4f46e5] to-[#6366f1] rounded-t-md h-[70%]"></div>
                     <div className="w-[12%] bg-gradient-to-t from-[#4f46e5] to-[#6366f1] rounded-t-md h-[50%]"></div>
                     <div className="w-[12%] bg-gradient-to-t from-[#ec4899] to-[#f472b6] rounded-t-md h-[90%]"></div>
                     <div className="w-[12%] bg-gradient-to-t from-[#4f46e5] to-[#6366f1] rounded-t-md h-[60%]"></div>
                   </div>
                </div>

                {/* Floating Stat 2 - Hidden on mobile */}
                <div className="hidden lg:flex absolute bottom-10 -left-10 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--glass-border)] shadow-2xl items-center gap-3 text-[var(--text-primary)] backdrop-blur-xl animate-[float_4s_infinite_alternate-reverse_ease-in-out]" style={{transform: 'translateZ(80px)'}}>
                   <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center"><i className="fas fa-file-upload text-white"></i></div>
                   <div><div className="text-xs text-slate-400">Secure Upload</div><div className="font-extrabold text-lg">Active</div></div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="border-y border-[var(--glass-border)] bg-[var(--bg-card)] backdrop-blur-xl reveal">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-wrap justify-around gap-10 text-center">
            <div><p className="text-[3rem] font-extrabold text-[var(--text-primary)]">10M+</p><p className="text-indigo-500 font-bold uppercase tracking-widest text-sm">Links Created</p></div>
            <div><p className="text-[3rem] font-extrabold text-[var(--text-primary)]">99.9%</p><p className="text-indigo-500 font-bold uppercase tracking-widest text-sm">Uptime</p></div>
            <div><p className="text-[3rem] font-extrabold text-[var(--text-primary)]">500K</p><p className="text-indigo-500 font-bold uppercase tracking-widest text-sm">Happy Users</p></div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 px-6 max-w-7xl mx-auto" id="features">
            <div className="text-center max-w-3xl mx-auto mb-16 reveal">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[var(--text-primary)]">Designed for <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Performance</span></h2>
                <p className="text-lg text-slate-400">Everything you need to manage your links, track your audience, and grow your brand in one unified platform.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="glass-panel p-10 rounded-[24px] reveal hover:-translate-y-2 hover:border-indigo-500 transition-all duration-400 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-[1.5rem] mb-6"><i className="fas fa-cloud-upload-alt"></i></div>
                    <h3 className="text-[1.4rem] font-bold mb-3 text-[var(--text-primary)]">Secure File Uploader</h3>
                    <p className="text-slate-400">Host your files securely. Upload images, ZIPs, or documents, and instantly get a monetized shortlink to share with your users.</p>
                </div>
                <div className="glass-panel p-10 rounded-[24px] reveal hover:-translate-y-2 hover:border-indigo-500 transition-all duration-400 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-[1.5rem] mb-6"><i className="fab fa-telegram-plane"></i></div>
                    <h3 className="text-[1.4rem] font-bold mb-3 text-[var(--text-primary)]">Telegram Bot Sync</h3>
                    <p className="text-slate-400">Link your account to <b>@urlkings_bot</b>. Send any long URL or file to the bot, and get a monetized link instantly right inside Telegram.</p>
                </div>
                <div className="glass-panel p-10 rounded-[24px] reveal hover:-translate-y-2 hover:border-indigo-500 transition-all duration-400 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-[1.5rem] mb-6"><i className="fas fa-pencil-alt"></i></div>
                    <h3 className="text-[1.4rem] font-bold mb-3 text-[var(--text-primary)]">Custom Aliases</h3>
                    <p className="text-slate-400">Ditch the random characters. Create meaningful, branded links that users trust and click more often.</p>
                </div>
                <div className="glass-panel p-10 rounded-[24px] reveal hover:-translate-y-2 hover:border-indigo-500 transition-all duration-400 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-[1.5rem] mb-6"><i className="fas fa-globe-americas"></i></div>
                    <h3 className="text-[1.4rem] font-bold mb-3 text-[var(--text-primary)]">Geo-Targeting</h3>
                    <p className="text-slate-400">Route users to different destinations based on their country or region to maximize conversion rates.</p>
                </div>
                <div className="glass-panel p-10 rounded-[24px] reveal hover:-translate-y-2 hover:border-indigo-500 transition-all duration-400 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-[1.5rem] mb-6"><i className="fas fa-chart-bar"></i></div>
                    <h3 className="text-[1.4rem] font-bold mb-3 text-[var(--text-primary)]">Real-time Analytics</h3>
                    <p className="text-slate-400">Watch clicks happen live. Get detailed reports on device types, referrers, and peak activity times.</p>
                </div>
                <div className="glass-panel p-10 rounded-[24px] reveal hover:-translate-y-2 hover:border-indigo-500 transition-all duration-400 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-[1.5rem] mb-6"><i className="fas fa-shield-alt"></i></div>
                    <h3 className="text-[1.4rem] font-bold mb-3 text-[var(--text-primary)]">Enterprise Security</h3>
                    <p className="text-slate-400">SSO, 2FA, and link expiration controls ensure your data and your users remain secure at all times.</p>
                </div>
            </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-24 px-6 border-t border-[var(--glass-border)] bg-[rgba(128,128,128,0.02)]" id="pricing">
            <div className="max-w-[900px] mx-auto">
                <div className="text-center mb-16 reveal">
                    <h2 className="text-[3rem] font-extrabold mb-5 text-[var(--text-primary)]">Publisher <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Rates</span></h2>
                    <p className="text-lg text-slate-400">Monetize your content. Use our 2-page shortener and we pay you for every download.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="glass-panel p-12 rounded-[30px] text-center reveal hover:-translate-y-2 transition-all">
                        <h3 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">Link Type</h3>
                        <div className="text-[3.5rem] font-extrabold mb-1 text-[var(--text-primary)] leading-tight">2 Pages</div>
                        <p className="text-slate-400 mb-8 font-medium">Shortener Structure</p>
                        <ul className="text-left space-y-4 mb-10 text-[var(--text-primary)] font-medium">
                            <li className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-3"><i className="fas fa-check text-indigo-500"></i> Free to Create Links</li>
                            <li className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-3"><i className="fas fa-check text-indigo-500"></i> 2 Page Redirect Flow</li>
                            <li className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-3"><i className="fas fa-check text-indigo-500"></i> User Friendly</li>
                        </ul>
                        <Link to="/login" className="block w-full py-4 rounded-full bg-white/5 border border-[var(--glass-border)] hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors font-bold text-[var(--text-primary)]">Create Link</Link>
                    </div>
                    <div className="glass-panel p-12 rounded-[30px] text-center border-2 border-indigo-500 relative reveal shadow-[0_0_40px_rgba(99,102,241,0.2)] hover:-translate-y-2 transition-all bg-gradient-to-br from-[var(--bg-card)] to-indigo-500/5">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> High Payout</div>
                        <h3 className="text-2xl font-bold mb-3 text-[var(--text-primary)] mt-2">You Earn</h3>
                        <div className="text-[3rem] font-extrabold mb-1 text-[var(--text-primary)] leading-tight">Up to $5.00</div>
                        <p className="text-slate-400 mb-8 font-medium">Per 1000 downloads</p>
                        <ul className="text-left space-y-4 mb-10 text-[var(--text-primary)] font-medium">
                            <li className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-3"><i className="fas fa-check text-indigo-500"></i> Fixed Payout Rate</li>
                            <li className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-3"><i className="fas fa-check text-indigo-500"></i> Monetized Views</li>
                            <li className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-3"><i className="fas fa-check text-indigo-500"></i> Fast Withdrawals</li>
                        </ul>
                        <Link to="/register" className="btn-action block w-full py-4 rounded-full font-bold text-white shadow-lg shadow-indigo-500/30">Start Earning</Link>
                    </div>
                </div>
            </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-24 px-6 max-w-7xl mx-auto" id="how-it-works">
            <div className="text-center max-w-[700px] mx-auto mb-16 reveal">
                <h2 className="text-[3rem] font-extrabold mb-5 text-[var(--text-primary)]">How It <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Works</span></h2>
                <p className="text-lg text-slate-400">Three simple steps to start managing your links and earning rewards.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
                <div className="text-center relative p-10 glass-panel rounded-3xl reveal hover:-translate-y-2 transition-transform duration-300">
                    <div className="text-[5rem] font-extrabold text-[var(--glass-border)] absolute -top-10 left-1/2 -translate-x-1/2 z-0 leading-none">01</div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4 text-[var(--text-primary)] mt-4">Create Account</h3>
                        <p className="text-slate-400 text-lg">Sign up in seconds and get instant access to your professional dashboard.</p>
                    </div>
                </div>
                <div className="text-center relative p-10 glass-panel rounded-3xl reveal hover:-translate-y-2 transition-transform duration-300">
                    <div className="text-[5rem] font-extrabold text-[var(--glass-border)] absolute -top-10 left-1/2 -translate-x-1/2 z-0 leading-none">02</div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4 text-[var(--text-primary)] mt-4">Shorten Links</h3>
                        <p className="text-slate-400 text-lg">Paste your long URLs and generate short, branded links instantly.</p>
                    </div>
                </div>
                <div className="text-center relative p-10 glass-panel rounded-3xl reveal hover:-translate-y-2 transition-transform duration-300">
                    <div className="text-[5rem] font-extrabold text-[var(--glass-border)] absolute -top-10 left-1/2 -translate-x-1/2 z-0 leading-none">03</div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4 text-[var(--text-primary)] mt-4">Track & Earn</h3>
                        <p className="text-slate-400 text-lg">Monitor your traffic in real-time and earn revenue for every download.</p>
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
