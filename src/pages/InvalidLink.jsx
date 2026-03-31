import React from 'react';

const InvalidLink = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#020617] text-slate-50 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden relative z-0">

      {/* Custom Styles for Glow and Pulse Animation */}
      <style>{`
        .glow-top {
          position: absolute;
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 400px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%);
          filter: blur(80px);
          z-index: -1;
        }
        @keyframes pulse-red {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        .status-pulse {
          animation: pulse-red 2.5s infinite;
        }
      `}</style>

      {/* Background Glow */}
      <div className="glow-top"></div>

      {/* HEADER */}
      <header className="w-full max-w-7xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            URL<span className="text-blue-500 font-extrabold">KING</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">How it Works</a>
          <a href="#" className="hover:text-white transition-colors">Verify Link</a>
          <a href="#" className="hover:text-white transition-colors">API Dashboard</a>
        </nav>

        <div>
          {/* Note: If using React Router, change <a> to <Link to="/login"> */}
          <a href="/login" className="text-sm font-bold bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl hover:bg-white/10 transition-all">
            Login
          </a>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex items-center justify-center w-full px-6 py-12">
        <div className="max-w-xl w-full bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">

          {/* Icon Area */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 status-pulse"></div>
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-3">Link Expired or Invalid</h1>
            <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">
              The short link you are trying to access is no longer available in our database.
            </p>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10"></div>

          {/* Features Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/10 p-2 rounded-lg mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Advanced Protection</h4>
                <p className="text-xs text-slate-400 leading-relaxed">We protect you from malicious redirects by validating every destination URL.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-500/10 p-2 rounded-lg mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.005 3.005 0 013.75-2.906z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Genuine Traffic Only</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Our smart verification filters bot traffic to maintain high link integrity.</p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <a href="/login" className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white transition-all shadow-[0_10px_25px_rgba(37,99,235,0.3)]">
              Create Your Own Links
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#030712] border-t border-white/5 px-6 pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">U</div>
                <span className="text-lg font-bold text-white">URL King</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                The professional choice for secure link shortening and advanced link management.
              </p>
            </div>

            <div>
              <h5 className="text-white font-bold mb-6">Platform</h5>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Safety Tools</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Developers</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-bold mb-6">Support</h5>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Report Abuse</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-bold mb-6">Connect</h5>
              <div className="flex gap-4">
                <a href="#" className="bg-white/5 p-3 rounded-xl hover:bg-blue-600/20 text-slate-400 hover:text-blue-500 transition-all">TG</a>
                <a href="#" className="bg-white/5 p-3 rounded-xl hover:bg-blue-600/20 text-slate-400 hover:text-blue-500 transition-all">TW</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium">
              &copy; {new Date().getFullYear()} URL King Infrastructure. Built for Security.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Nodes: Operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default InvalidLink;