import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const currentPath = location.pathname;

  // 🟢 1. Token Check: Yahan hum check kar rahe hain ki user logged in hai ya nahi
  const token = localStorage.getItem("token");

  // Scroll effect for navbar background shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-4 md:top-5 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100] transition-all duration-300 ${scrolled ? 'shadow-2xl' : ''}`}>
      <nav className={`bg-[var(--nav-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl h-[80px] flex items-center justify-between px-6 md:px-8 w-full transition-all duration-300 ${scrolled ? 'bg-opacity-95 shadow-[0_10px_40px_rgba(0,0,0,0.1)]' : 'bg-opacity-80'}`}>

        {/* Logo - z-index high rakha hai taaki menu ke upar rahe */}
        <Link to="/" onClick={closeMenu} className="text-2xl font-extrabold flex items-center gap-3 text-[var(--text-primary)] transition-transform hover:scale-105 z-50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <i className="fas fa-crown text-lg"></i>
          </div>
          <span className="tracking-tight">URLKING</span>
        </Link>

        {/* Desktop & Mobile Links Container */}
        <div className={`
          absolute lg:static top-[90px] left-0 w-full lg:w-auto 
          bg-[var(--bg-body)] lg:bg-transparent /* <-- Mobile me Solid Background */
          flex flex-col lg:flex-row items-center gap-6 lg:gap-8 
          p-8 lg:p-0 rounded-3xl lg:rounded-none
          border border-[var(--glass-border)] lg:border-none
          shadow-[0_30px_60px_rgba(0,0,0,0.5)] lg:shadow-none
          transition-all duration-400 ease-out z-40
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

          {/* 🟢 2. AUTH BUTTONS LOGIC */}
          <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
            {token ? (
              // Agar User Logged In hai -> Sirf Dashboard Button dikhao
              <Link 
                to="/dashboard" 
                onClick={closeMenu} 
                className="btn-action w-full lg:w-auto text-center px-8 py-3 rounded-full font-black text-white shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:-translate-y-1 transition-transform duration-300 flex items-center justify-center gap-2"
              >
                Dashboard <i className="fas fa-rocket"></i>
              </Link>
            ) : (
              // Agar User Guest hai -> Sign In / Sign Up dikhao
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
                  className="btn-action w-full lg:w-auto text-center px-8 py-3 rounded-full font-black text-white shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:-translate-y-1 transition-transform duration-300"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

        </div>

        {/* Mobile Toggle Button - z-index high rakha hai */}
        <button 
          className="lg:hidden w-12 h-12 rounded-xl bg-[var(--nav-hover)] border border-[var(--glass-border)] text-xl text-[var(--text-primary)] focus:outline-none flex items-center justify-center transition-colors hover:text-indigo-500 z-50" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </nav>
    </header>
  );
};

export default Header;
