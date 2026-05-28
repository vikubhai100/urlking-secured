import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const currentPath = location.pathname;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location]);

  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { to: '/rates',         label: 'Payout Rates'   },
    { to: '/payment-proof', label: 'Payment Proof'  },
    { to: '/uploader',      label: 'Bot Guide'       },
  ];

  return (
    <>
      <style>{`
        .uk-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }
        .uk-header.scrolled {
          background: rgba(13, 17, 23, 0.82);
          backdrop-filter: blur(20px) saturate(1.5);
          -webkit-backdrop-filter: blur(20px) saturate(1.5);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 4px 30px rgba(0,0,0,0.3);
        }
        .uk-header.top {
          background: transparent;
          border-bottom: 1px solid transparent;
        }

        .uk-nav {
          max-width: 1200px; margin: 0 auto;
          height: 76px; display: flex; align-items: center;
          justify-content: space-between; padding: 0 28px;
        }

        .uk-logo {
          display: flex; align-items: center; gap: 11px;
          text-decoration: none; z-index: 60;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        .uk-logo:hover { transform: scale(1.03); }
        .uk-logo-icon {
          width: 40px; height: 40px; border-radius: 13px;
          background: linear-gradient(135deg, #6366f1, #f472b6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
          font-size: 17px; color: #fff; flex-shrink: 0;
        }
        .uk-logo-text {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 19px; letter-spacing: -0.01em;
          background: linear-gradient(135deg, #fff 30%, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .uk-links {
          display: flex; align-items: center; gap: 6px;
          list-style: none;
        }
        .uk-link-item a {
          display: block; padding: 7px 13px; border-radius: 10px;
          font-size: 13px; font-weight: 600; letter-spacing: 0.02em;
          text-decoration: none; color: rgba(255,255,255,0.5);
          transition: color 0.2s, background 0.2s;
          position: relative;
        }
        .uk-link-item a:hover,
        .uk-link-item a.active {
          color: #fff;
          background: rgba(255,255,255,0.06);
        }
        .uk-link-item a.active::after {
          content: ''; position: absolute; bottom: 4px; left: 50%;
          transform: translateX(-50%); width: 18px; height: 2px; border-radius: 2px;
          background: linear-gradient(to right, #6366f1, #f472b6);
        }

        .uk-auth { display: flex; align-items: center; gap: 10px; }

        .uk-btn-signin {
          padding: 8px 18px; border-radius: 10px;
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.55);
          text-decoration: none; transition: color 0.2s, background 0.2s;
          border: 1px solid transparent;
        }
        .uk-btn-signin:hover {
          color: #fff; background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.08);
        }

        .uk-btn-signup, .uk-btn-dashboard {
          padding: 9px 20px; border-radius: 11px;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px;
          color: #fff; text-decoration: none; border: none; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
          transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
        }
        .uk-btn-signup {
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          box-shadow: 0 4px 18px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .uk-btn-dashboard {
          background: linear-gradient(135deg, #f472b6, #a78bfa);
          box-shadow: 0 4px 18px rgba(244,114,182,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .uk-btn-signup:hover, .uk-btn-dashboard:hover { transform: translateY(-1px) scale(1.02); filter: brightness(1.06); }

        .uk-hamburger {
          display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; z-index: 60; background: none; border: none;
        }
        .uk-hamburger span {
          display: block; width: 22px; height: 2px; border-radius: 2px;
          background: rgba(255,255,255,0.7);
          transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
          transform-origin: center;
        }
        .uk-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .uk-hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
        .uk-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .uk-drawer {
          position: fixed; top: 76px; left: 0; right: 0;
          background: rgba(13,17,23,0.97); backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 20px 24px 28px; display: flex; flex-direction: column; gap: 4px;
          z-index: 999; transform: translateY(-12px); opacity: 0; visibility: hidden;
          transition: transform 0.3s cubic-bezier(.16,1,.3,1), opacity 0.3s ease, visibility 0.3s;
        }
        .uk-drawer.open { transform: translateY(0); opacity: 1; visibility: visible; }
        .uk-drawer-link {
          display: block; padding: 14px 16px; border-radius: 12px;
          font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.6);
          text-decoration: none; transition: color 0.2s, background 0.2s;
          display: flex; align-items: center; justify-content: space-between;
        }
        .uk-drawer-link:hover, .uk-drawer-link.active { color: #fff; background: rgba(255,255,255,0.06); }
        .uk-drawer-link.active { color: #a78bfa; }
        .uk-drawer-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 10px 0; }
        .uk-drawer-cta { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
        .uk-drawer-cta a { text-align: center; padding: 14px; border-radius: 13px; font-weight: 700; font-size: 15px; text-decoration: none; }
        .uk-drawer-cta .signin-m { color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1); }
        .uk-drawer-cta .signin-m:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .uk-drawer-cta .signup-m { background: linear-gradient(135deg, #6366f1, #a78bfa); color: #fff; }
        .uk-drawer-cta .dashboard-m { background: linear-gradient(135deg, #f472b6, #a78bfa); color: #fff; }

        @media (max-width: 1023px) {
          .uk-links, .uk-auth { display: none; }
          .uk-hamburger { display: flex; }
        }

        /* --- PURE CSS LIGHT MODE OVERRIDES --- */
        html.light-mode .uk-header.scrolled {
          background: rgba(255, 255, 255, 0.85);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
        }
        html.light-mode .uk-logo-text {
          background: linear-gradient(135deg, #1e1b4b 30%, #6366f1);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        html.light-mode .uk-link-item a { color: rgba(0, 0, 0, 0.6); }
        html.light-mode .uk-link-item a:hover,
        html.light-mode .uk-link-item a.active {
          color: #000; background: rgba(0, 0, 0, 0.05);
        }
        html.light-mode .uk-btn-signin { color: rgba(0, 0, 0, 0.7); }
        html.light-mode .uk-btn-signin:hover {
          color: #000; background: rgba(0, 0, 0, 0.05); border-color: rgba(0, 0, 0, 0.1);
        }
        html.light-mode .uk-hamburger span { background: rgba(0, 0, 0, 0.8); }
        html.light-mode .uk-drawer {
          background: rgba(248, 250, 252, 0.97); border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        html.light-mode .uk-drawer-link { color: rgba(0, 0, 0, 0.7); }
        html.light-mode .uk-drawer-link:hover,
        html.light-mode .uk-drawer-link.active {
          color: #000; background: rgba(0, 0, 0, 0.05);
        }
        html.light-mode .uk-drawer-link.active { color: #6366f1; }
        html.light-mode .uk-drawer-divider { background: rgba(0, 0, 0, 0.08); }
        html.light-mode .uk-drawer-cta .signin-m { color: rgba(0, 0, 0, 0.7); border-color: rgba(0, 0, 0, 0.15); }
        html.light-mode .uk-drawer-cta .signin-m:hover { background: rgba(0, 0, 0, 0.05); color: #000; }
      `}</style>

      <header className={`uk-header ${scrolled ? 'scrolled' : 'top'}`}>
        <nav className="uk-nav">
          <Link to="/" className="uk-logo">
            <div className="uk-logo-icon">
              <i className="fas fa-crown" />
            </div>
            <span className="uk-logo-text">URLKING</span>
          </Link>

          <ul className="uk-links">
            {navLinks.map(({ to, label }) => (
              <li key={to} className="uk-link-item">
                <Link to={to} className={currentPath === to ? 'active' : ''}>{label}</Link>
              </li>
            ))}
          </ul>

          <div className="uk-auth">
            {token ? (
              <Link to="/dashboard" className="uk-btn-dashboard">
                Dashboard <i className="fas fa-rocket" style={{ fontSize: 12 }} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="uk-btn-signin">Sign In</Link>
                <Link to="/register" className="uk-btn-signup">
                  Get Started <span>→</span>
                </Link>
              </>
            )}
          </div>

          <button
            className={`uk-hamburger ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </nav>
      </header>

      <div className={`uk-drawer ${isMenuOpen ? 'open' : ''}`}>
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`uk-drawer-link ${currentPath === to ? 'active' : ''}`}
            onClick={closeMenu}
          >
            {label}
            <span style={{ fontSize: 12, opacity: 0.4 }}>→</span>
          </Link>
        ))}
        <div className="uk-drawer-divider" />
        <div className="uk-drawer-cta">
          {token ? (
            <Link to="/dashboard" className="dashboard-m" onClick={closeMenu}>
              Dashboard 🚀
            </Link>
          ) : (
            <>
              <Link to="/login" className="signin-m" onClick={closeMenu}>Sign In</Link>
              <Link to="/register" className="signup-m" onClick={closeMenu}>
                Create Free Account →
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
