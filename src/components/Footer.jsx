import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#020617] pt-20 pb-10 border-t border-[var(--glass-border)] mt-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-extrabold flex items-center gap-3 text-white mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <i className="fas fa-crown"></i>
              </div>
              <span className="tracking-tight">URLKING</span>
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              The industry standard for link management. Built for developers, marketers, and power users.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#pricing" className="text-slate-400 hover:text-indigo-400 transition-colors">Payout Rates</a></li>
              <li><a href="#features" className="text-slate-400 hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-slate-400 hover:text-indigo-400 transition-colors">How it Works</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-white/10 text-slate-500 text-sm">
          &copy; 2026 URLKING. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
