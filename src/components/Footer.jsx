import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[var(--bg-body)] pt-20 pb-10 border-t border-[var(--glass-border)] mt-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-extrabold flex items-center gap-3 text-[var(--text-primary)] mb-6 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <i className="fas fa-crown"></i>
              </div>
              <span className="tracking-tight">URLKING</span>
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              The industry standard for link management. Built for developers, marketers, and power users.
            </p>
          </div>

          {/* Platform Links (UPDATED WITH NEW PAGES) */}
          <div>
            <h4 className="text-[var(--text-primary)] font-bold mb-6 text-lg transition-colors">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/rates" className="text-slate-400 hover:text-indigo-500 hover:translate-x-1 inline-block transition-all font-medium">
                  Payout Rates
                </Link>
              </li>
              <li>
                <Link to="/payment-proof" className="text-slate-400 hover:text-indigo-500 hover:translate-x-1 inline-block transition-all font-medium">
                  Payment Proofs
                </Link>
              </li>
              <li>
                <Link to="/uploader" className="text-slate-400 hover:text-indigo-500 hover:translate-x-1 inline-block transition-all font-medium">
                  Uploader & Bot
                </Link>
              </li>
              <li>
                <Link to="/#features" className="text-slate-400 hover:text-indigo-500 hover:translate-x-1 inline-block transition-all font-medium">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-[var(--text-primary)] font-bold mb-6 text-lg transition-colors">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-slate-400 hover:text-indigo-500 hover:translate-x-1 inline-block transition-all font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-indigo-500 hover:translate-x-1 inline-block transition-all font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-indigo-500 hover:translate-x-1 inline-block transition-all font-medium">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-[var(--glass-border)] text-slate-500 text-sm font-medium transition-colors">
          &copy; 2026 URLKING. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
