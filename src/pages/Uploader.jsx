import React, { useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Particles from '../components/Particles';

const Uploader = () => {
  // Intersection Observer for Scroll Animations
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, { threshold: 0.1 });

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-body)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* Ambient Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles />
      </div>

      {/* Standard Header */}
      <div className="relative z-20">
        <Header />
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 relative z-10 pt-32 lg:pt-40 pb-20">
        
        {/* Page Header */}
        <section 
          ref={addToRefs} 
          className="text-center mb-20 opacity-0 translate-y-10 transition-all duration-1000 ease-out"
        >
          <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-black mb-6 tracking-tight leading-tight">
            Ultimate <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Uploader & Shortener</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Host unlimited files, bypass size restrictions directly via Telegram, or shorten standard URLs. Get paid for every visitor with the industry's fastest flow.
          </p>
        </section>

        {/* Highlight Grid */}
        <section 
          ref={addToRefs} 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-100"
        >
          <div className="glass-panel text-center p-8 md:p-10 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-[var(--bg-card)] to-indigo-500/5 shadow-[0_10px_30px_rgba(99,102,241,0.1)] hover:-translate-y-2 transition-transform duration-300">
            <i className="fas fa-money-bill-wave text-5xl text-indigo-500 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]"></i>
            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">Up to $5.00</h3>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Per 1000 Downloads/Views</p>
          </div>
          
          <div className="glass-panel text-center p-8 md:p-10 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-[var(--bg-card)] to-indigo-500/5 shadow-[0_10px_30px_rgba(99,102,241,0.1)] hover:-translate-y-2 transition-transform duration-300">
            <i className="fas fa-tachometer-alt text-5xl text-indigo-500 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]"></i>
            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">1 Min 5 Sec</h3>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Ultra-Fast User Flow</p>
          </div>
          
          <div className="glass-panel text-center p-8 md:p-10 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-[var(--bg-card)] to-indigo-500/5 shadow-[0_10px_30px_rgba(99,102,241,0.1)] hover:-translate-y-2 transition-transform duration-300">
            <i className="fas fa-layer-group text-5xl text-indigo-500 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]"></i>
            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">2 Pages Only</h3>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Clean & High Conversion</p>
          </div>
        </section>

        {/* Instruction Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          
          {/* Telegram Bot Card */}
          <div 
            ref={addToRefs} 
            className="glass-panel p-8 md:p-10 rounded-3xl opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-200"
          >
            <div className="flex items-center gap-4 mb-6">
              <i className="fab fa-telegram text-5xl text-[#0088cc] drop-shadow-[0_0_15px_rgba(0,136,204,0.4)]"></i>
              <h2 className="text-3xl font-black text-[var(--text-primary)]">Upload via Bot</h2>
            </div>
            <p className="text-slate-400 mb-8 leading-relaxed">
              The fastest way to upload large files. Bypass file size limits and get permanent download links straight to your chat.
            </p>
            
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/20 flex items-center justify-center font-black shrink-0">1</div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1">Start the Bot</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Search for <b className="text-[var(--text-primary)]">@urlkings_bot</b> on Telegram and click Start. Link your account securely.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/20 flex items-center justify-center font-black shrink-0">2</div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1">Forward or Upload File</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Send any document, video, or ZIP file directly to the bot. You can also send standard web URLs to just shorten them.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/20 flex items-center justify-center font-black shrink-0">3</div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1">Get Monetized Link</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">The bot instantly processes the file on our high-speed servers and replies with your $5 CPM monetized link.</p>
                </div>
              </li>
            </ul>

            {/* Telegram Chat Preview */}
            <div className="mt-8 bg-[var(--nav-hover)] border border-[var(--glass-border)] rounded-2xl p-5 font-mono text-sm">
              <div className="bg-[#0088cc] text-white p-3 rounded-2xl rounded-tr-none ml-auto max-w-[85%] mb-4 shadow-sm">
                Here is my 2GB movie file 🎬 video.mp4
              </div>
              <div className="bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] p-4 rounded-2xl rounded-tl-none mr-auto max-w-[95%] shadow-sm">
                ⚡ <b>Upload Successful!</b><br/><br/>
                📁 File: video.mp4<br/>
                🔗 Your Monetized Link:<br/>
                <span className="text-indigo-400 underline break-all">https://go.urlking.site/vIdx92</span><br/><br/>
                <i className="text-slate-400">Share this link to start earning!</i>
              </div>
            </div>
          </div>

          {/* Website Card */}
          <div 
            ref={addToRefs} 
            className="glass-panel p-8 md:p-10 rounded-3xl opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <i className="fas fa-laptop-code text-5xl text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]"></i>
              <h2 className="text-3xl font-black text-[var(--text-primary)]">Upload via Website</h2>
            </div>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Use our powerful web dashboard for drag-and-drop file uploads and advanced link management.
            </p>
            
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <i className="fas fa-sign-in-alt"></i>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1">Login to Dashboard</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Access your secure publisher panel at urlking.site to view your wallet and stats.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1">Drag & Drop Files</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Use the multi-file uploader. We support simultaneous high-speed uploads. Or, paste any long URL into the 'Quick Shortener' box.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <i className="fas fa-share-alt"></i>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1">Share & Track</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Copy your generated links. Users will experience our clean, 2-page flow (approx. 1 min 10 sec wait time), ensuring high completion rates.</p>
                </div>
              </li>
            </ul>

            {/* Info Box */}
            <div className="mt-8 border-2 border-dashed border-indigo-500/30 rounded-2xl p-6 md:p-8 bg-indigo-500/5 text-center transition-all hover:bg-indigo-500/10">
              <i className="fas fa-file-upload text-5xl text-indigo-500 mb-4 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]"></i>
              <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">Dual System Active</h4>
              <p className="text-sm text-slate-400">Our system detects if you input a <b className="text-[var(--text-primary)]">File</b> or a <b className="text-[var(--text-primary)]">URL</b> automatically. Both generate the same high-paying shortlinks.</p>
            </div>
          </div>

        </section>
      </main>

      {/* Standard Footer */}
      <div className="relative z-20 mt-auto">
        <Footer />
      </div>

    </div>
  );
};

export default Uploader;
