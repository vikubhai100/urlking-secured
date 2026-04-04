import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const currentPath = location.pathname;

  const token = localStorage.getItem("token");

  // Scroll effect for navbar background shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    {/* 🟢 UPDATE: Fixed top-0, w-full, aur dynamic glass effect jo dono theme me mast lagega */}
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-[var(--bg-body)]/80 backdrop-blur-lg border-b border-[var(--glass-border)] shadow-sm' : 'bg-transparent border-b border-transparent'}`}>
      
      {/* 🟢 UPDATE: Inner container max-width ke sath */}
      <nav className="max-w-7xl mx-auto h-[80px] flex items-center justify-between px-4 md:px-8 w-full">

        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="text-2xl font-extrabold flex items-center gap-3 text-[var(--text-primary)] transition-transform hover:scale-105 z-50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md">
            <i className="fas fa-crown text-lg"></i>
          </div>
          <span className="tracking-tight">URLKING</span>
        </Link>

        {/* Desktop & Mobile Links Container */}
        <div className={`
          absolute lg:static top-[80px] left-0 w-full lg:w-auto 
          bg-[var(--bg-body)] lg:bg-transparent 
          flex flex-col lg:flex-row items-center gap-6 lg:gap-8 
          p-8 lg:p-0 
          border-b border-[var(--glass-border)] lg:border-none
          shadow-xl lg:shadow-none
          transition-all duration-300 ease-in-out z-40
          ${isMenuOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-4 opacity-0 invisible lg:translate-y-0 lg:opacity-100 lg:visible'}
        `}>

          <Link 
            to="/rates" 
            onClick={closeMenu} 
            className={`font-bold text-sm uppercase tracking-wider transition-colors relative group ${currentPath === '/rates' ? 'text-indigo-500' : 'text-slate-500 hover:text-[var(--text-primary)]'}`}
          >
            Payout Rates
            <span className={`absolute -bottom-1.5 left-0 h-0.5 bg-indigo-500 transition-all duration-300 ${currentPath === '/rates' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>

          <Link 
            to="/payment-proof" 
            onClick={closeMenu} 
            className={`font-bold text-sm uppercase tracking-wider transition-colors relative group ${currentPath === '/payment-proof' ? 'text-indigo-500' : 'text-slate-500 hover:text-[var(--text-primary)]'}`}
          >
            Payment Proof
            <span className={`absolute -bottom-1.5 left-0 h-0.5 bg-indigo-500 transition-all duration-300 ${currentPath === '/payment-proof' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>

          <Link 
            to="/uploader" 
            onClick={closeMenu} 
            className={`font-bold text-sm uppercase tracking-wider transition-colors relative group ${currentPath === '/uploader' ? 'text-indigo-500' : 'text-slate-500 hover:text-[var(--text-primary)]'}`}
          >
            Bot Guide
            <span className={`absolute -bottom-1.5 left-0 h-0.5 bg-indigo-500 transition-all duration-300 ${currentPath === '/uploader' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>

          {/* Divider for Mobile */}
          <div className="w-full h-[1px] bg-[var(--glass-border)] lg:hidden my-2"></div>

          {/* AUTH BUTTONS LOGIC */}
          <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
            {token ? (
              <Link 
                to="/dashboard" 
                onClick={closeMenu} 
                className="btn-action w-full lg:w-auto text-center px-8 py-3 rounded-full font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Dashboard <i className="fas fa-rocket"></i>
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={closeMenu} 
                  className="w-full lg:w-auto text-center font-bold text-slate-500 hover:text-[var(--text-primary)] transition-colors py-2"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  onClick={closeMenu} 
                  className="btn-action w-full lg:w-auto text-center px-8 py-3 rounded-full font-black text-white bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-500/30 hover:-translate-y-1 transition-all duration-300"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

        </div>

        {/* 🟢 UPDATE: Hamburger Menu Button ko clean kiya dono themes ke liye */}
        <button 
          className="lg:hidden w-10 h-10 rounded-lg text-2xl text-[var(--text-primary)] hover:bg-slate-500/10 focus:outline-none flex items-center justify-center transition-colors z-50" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </nav>
    </header>
  );
};

export default Header;
