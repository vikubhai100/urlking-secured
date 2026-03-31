import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for navbar background shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-5 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300 ${scrolled ? 'shadow-2xl' : ''}`}>
      <nav className="bg-[var(--nav-hover)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl h-[80px] flex items-center justify-between px-8 w-full">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold flex items-center gap-3 text-[var(--text-primary)]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <i className="fas fa-crown"></i>
          </div>
          <span className="tracking-tight">URLKING</span>
        </Link>

        {/* Desktop & Mobile Links */}
        <div className={`fixed lg:static top-[90px] left-0 w-full lg:w-auto bg-[var(--bg-body)] lg:bg-transparent flex flex-col lg:flex-row items-start lg:items-center gap-8 p-6 lg:p-0 transition-transform duration-300 ${isMenuOpen ? 'translate-y-0 shadow-2xl rounded-2xl border border-[var(--glass-border)]' : '-translate-y-[150%] lg:translate-y-0'} lg:border-none lg:shadow-none`}>
          <a href="#features" className="font-semibold text-slate-400 hover:text-[var(--text-primary)] transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
          </a>
          <a href="#pricing" className="font-semibold text-slate-400 hover:text-[var(--text-primary)] transition-colors relative group">
            Rates
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
          </a>
          <a href="#how-it-works" className="font-semibold text-slate-400 hover:text-[var(--text-primary)] transition-colors relative group">
            How it Works
          </a>
          <Link to="/login" className="font-semibold text-slate-400 hover:text-[var(--text-primary)] transition-colors">
            Log In
          </Link>
          <Link to="/register" className="btn-action px-8 py-3 rounded-full font-bold text-white shadow-lg shadow-indigo-500/30">
            Get Started
          </Link>
        </div>
        
        {/* Mobile Toggle Button */}
        <button 
          className="lg:hidden text-2xl text-[var(--text-primary)] focus:outline-none" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </nav>
    </header>
  );
};

export default Header;
