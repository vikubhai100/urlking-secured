import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
      observer.observe(el);
    });

    if (window.innerWidth > 1024 && heroRef.current && cardRef.current) {
      const handleMouseMove = (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 30;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 30;
        cardRef.current.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
      };
      const handleMouseLeave = () => {
        cardRef.current.style.transform = `rotateY(-15deg) rotateX(15deg)`;
      };
      
      const container = heroRef.current;
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[var(--bg-body)]">
        <div className="absolute rounded-full blur-[100px] opacity-25 w-[400px] h-[400px] bg-indigo-500 top-[-10%] left-[-10%]"></div>
        <div className="absolute rounded-full blur-[100px] opacity-25 w-[300px] h-[300px] bg-pink-500 bottom-[10%] right-[-5%]"></div>
      </div>

      <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 bg-[var(--nav-hover)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl h-[80px] flex items-center px-8 shadow-xl">
        <nav className="w-full flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]">
              <i className="fas fa-crown"></i>
            </div>
            <span>URLKING</span>
          </Link>

          <div className={`fixed lg:static top-[90px] left-0 w-full lg:w-auto bg-[var(--bg-body)] lg:bg-transparent flex flex-col lg:flex-row items-start lg:items-center gap-6 p-6 lg:p-0 transition-transform ${isMenuOpen ? 'translate-y-0' : '-translate-y-[150%] lg:translate-y-0'} border-b lg:border-none border-[var(--glass-border)]`}>
             <a href="#features" className="font-semibold text-slate-400 hover:text-indigo-400">Features</a>
             <a href="#pricing" className="font-semibold text-slate-400 hover:text-indigo-400">Rates</a>
             <Link to="/login" className="font-semibold text-slate-400 hover:text-indigo-400">Log In</Link>
             <Link to="/register" className="btn-action px-6 py-2.5 rounded-full font-bold text-white">Get Started</Link>
          </div>
          
          <button className="lg:hidden text-2xl text-[var(--text-primary)]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <i className="fas fa-bars"></i>
          </button>
        </nav>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="pt-48 pb-32 px-6 max-w-7xl mx-auto" ref={heroRef}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <div className="inline-flex items-center px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold text-sm mb-6 gap-3">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> v3.0 Enterprise Live
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6 text-[var(--text-primary)]">
                Professional links & files for <br/>
                <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Professional Growth</span>
              </h1>
              <p className="text-lg text-slate-400 mb-10 max-w-lg leading-relaxed">
                Experience the most powerful link management platform. Built for modern brands to track, optimize, and scale their audience reach with zero compromise.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-action px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 text-white">
                  Start for Free <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>

            {/* 3D Visual */}
            <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center perspective-[2000px]">
              <div ref={cardRef} className="relative w-full max-w-[450px] transition-transform duration-100 ease-out" style={{transformStyle: 'preserve-3d', transform: 'rotateX(15deg) rotateY(-15deg)'}}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full p-6 glass-panel rounded-3xl shadow-2xl">
                   <div className="flex gap-2 mb-6">
                     <div className="w-3 h-3 rounded-full bg-red-500"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   </div>
                   <div className="flex justify-between mb-6">
                     <div>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Clicks</p>
                       <p className="text-3xl font-extrabold text-[var(--text-primary)]">128,409</p>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Links</p>
                       <p className="text-3xl font-extrabold text-indigo-500">842</p>
                     </div>
                   </div>
                   <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-3 mb-6">
                     <i className="fab fa-telegram text-xl text-indigo-400"></i>
                     <p className="text-sm font-medium text-[var(--text-primary)]"><b>@urlkings_bot</b> generated 45 links today!</p>
                   </div>
                   {/* Fake Chart Bars */}
                   <div className="flex items-end justify-between h-20 border-b border-[var(--glass-border)] pb-2 gap-2">
                     <div className="w-full bg-indigo-600 rounded-t-md h-[40%]"></div>
                     <div className="w-full bg-indigo-500 rounded-t-md h-[70%]"></div>
                     <div className="w-full bg-indigo-400 rounded-t-md h-[50%]"></div>
                     <div className="w-full bg-pink-500 rounded-t-md h-[90%]"></div>
                     <div className="w-full bg-indigo-500 rounded-t-md h-[60%]"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="border-y border-[var(--glass-border)] bg-[var(--glass-card)] backdrop-blur-md reveal">
          <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div><p className="text-5xl font-extrabold mb-2 text-[var(--text-primary)]">10M+</p><p className="text-indigo-500 font-bold uppercase tracking-widest text-sm">Links Created</p></div>
            <div><p className="text-5xl font-extrabold mb-2 text-[var(--text-primary)]">99.9%</p><p className="text-indigo-500 font-bold uppercase tracking-widest text-sm">Uptime</p></div>
            <div><p className="text-5xl font-extrabold mb-2 text-[var(--text-primary)]">500K</p><p className="text-indigo-500 font-bold uppercase tracking-widest text-sm">Happy Users</p></div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 px-6 max-w-7xl mx-auto" id="features">
            <div className="text-center max-w-3xl mx-auto mb-16 reveal">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[var(--text-primary)]">Designed for <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Performance</span></h2>
                <p className="text-lg text-slate-400">Everything you need to manage your links, track your audience, and grow your brand in one unified platform.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="glass-panel p-8 rounded-3xl reveal hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-2xl mb-6"><i className="fas fa-cloud-upload-alt"></i></div>
                    <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Secure File Uploader</h3>
                    <p className="text-slate-400 leading-relaxed">Host your files securely. Upload images, ZIPs, or documents, and instantly get a monetized shortlink to share with your users.</p>
                </div>
                <div className="glass-panel p-8 rounded-3xl reveal hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-2xl mb-6"><i className="fab fa-telegram-plane"></i></div>
                    <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Telegram Bot Sync</h3>
                    <p className="text-slate-400 leading-relaxed">Link your account to @urlkings_bot. Send any long URL or file to the bot, and get a monetized link instantly right inside Telegram.</p>
                </div>
                <div className="glass-panel p-8 rounded-3xl reveal hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-2xl mb-6"><i className="fas fa-pencil-alt"></i></div>
                    <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Custom Aliases</h3>
                    <p className="text-slate-400 leading-relaxed">Ditch the random characters. Create meaningful, branded links that users trust and click more often.</p>
                </div>
            </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-24 px-6 border-t border-[var(--glass-border)] bg-[var(--nav-hover)]" id="pricing">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16 reveal">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[var(--text-primary)]">Publisher <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Rates</span></h2>
                    <p className="text-lg text-slate-400">Monetize your content. Use our 2-page shortener and we pay you for every download.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="glass-panel p-10 rounded-3xl text-center reveal">
                        <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Link Type</h3>
                        <div className="text-4xl font-extrabold mb-2 text-[var(--text-primary)]">2 Pages</div>
                        <p className="text-slate-400 mb-8 font-medium">Shortener Structure</p>
                        <ul className="text-left space-y-4 mb-10 text-[var(--text-primary)]">
                            <li className="flex items-center gap-3"><i className="fas fa-check text-indigo-500"></i> Free to Create Links</li>
                            <li className="flex items-center gap-3"><i className="fas fa-check text-indigo-500"></i> 2 Page Redirect Flow</li>
                            <li className="flex items-center gap-3"><i className="fas fa-check text-indigo-500"></i> User Friendly</li>
                        </ul>
                        <Link to="/login" className="block w-full py-4 rounded-xl border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-colors font-bold text-[var(--text-primary)]">Create Link</Link>
                    </div>
                    <div className="glass-panel p-10 rounded-3xl text-center border-2 border-indigo-500 relative reveal shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-bold">High Payout</div>
                        <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">You Earn</h3>
                        <div className="text-5xl font-extrabold mb-2 text-[var(--text-primary)]">Up to $5.00</div>
                        <p className="text-slate-400 mb-8 font-medium">Per 1000 downloads</p>
                        <ul className="text-left space-y-4 mb-10 text-[var(--text-primary)]">
                            <li className="flex items-center gap-3"><i className="fas fa-check text-indigo-500"></i> Fixed Payout Rate</li>
                            <li className="flex items-center gap-3"><i className="fas fa-check text-indigo-500"></i> Monetized Views</li>
                            <li className="flex items-center gap-3"><i className="fas fa-check text-indigo-500"></i> Fast Withdrawals</li>
                        </ul>
                        <Link to="/register" className="btn-action block w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/30">Start Earning</Link>
                    </div>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#020617] py-20 border-t border-[var(--glass-border)]">
          <div className="max-w-7xl mx-auto px-6 text-center text-slate-400">
            <h2 className="text-2xl font-bold text-white mb-4">URLKING</h2>
            <p className="mb-8">The industry standard for link management.</p>
            <p>&copy; 2026 URLKING. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;
