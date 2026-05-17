import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  const platformLinks = [
    { to: '/rates',         label: 'Payout Rates'   },
    { to: '/payment-proof', label: 'Payment Proofs'  },
    { to: '/uploader',      label: 'Uploader & Bot'  },
    { to: '/#features',     label: 'Features'        },
  ];

  const legalLinks = [
    { to: '/privacy-policy', label: 'Privacy Policy'   },
    { to: '/terms',           label: 'Terms of Service' },
    { to: '/dmca',            label: 'DMCA / Report'    },
    { href: 'mailto:support@urlking.site', label: 'Contact Us' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

        .uk-footer {
          background: #0a0e17;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 72px 28px 36px;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Ambient glow at top */
        .uk-footer::before {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(to right, transparent, rgba(99,102,241,0.4), rgba(244,114,182,0.3), transparent);
        }

        .uk-footer-inner {
          max-width: 1200px; margin: 0 auto;
        }

        .uk-footer-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 56px;
        }

        /* Logo col */
        .uk-footer-logo {
          display: flex; align-items: center; gap: 11px;
          text-decoration: none; margin-bottom: 18px; display: inline-flex;
        }
        .uk-footer-logo-icon {
          width: 40px; height: 40px; border-radius: 13px;
          background: linear-gradient(135deg, #6366f1, #f472b6);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; color: #fff; flex-shrink: 0;
          box-shadow: 0 0 24px rgba(99,102,241,0.3);
        }
        .uk-footer-logo-text {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 18px; letter-spacing: -0.01em;
          background: linear-gradient(135deg, #fff 30%, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .uk-footer-desc {
          color: rgba(255,255,255,0.38); font-size: 14px; line-height: 1.72;
          max-width: 300px; margin-bottom: 24px;
        }

        /* Social icons */
        .uk-footer-social {
          display: flex; gap: 10px;
        }
        .uk-footer-social a {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.4); font-size: 15px;
          text-decoration: none;
          transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
        }
        .uk-footer-social a:hover {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.3);
          color: #a78bfa; transform: translateY(-2px);
        }

        /* Link columns */
        .uk-footer-col h4 {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.7); margin-bottom: 20px;
        }
        .uk-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .uk-footer-col ul a {
          font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.38);
          text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
          transition: color 0.2s, transform 0.2s;
        }
        .uk-footer-col ul a:hover { color: #fff; transform: translateX(4px); }

        /* Arrow indicator */
        .uk-footer-col ul a::before {
          content: '→';
          font-size: 11px; opacity: 0; transform: translateX(-6px);
          transition: opacity 0.2s, transform 0.2s;
          color: #6366f1;
        }
        .uk-footer-col ul a:hover::before { opacity: 1; transform: translateX(0); }

        /* Bottom bar */
        .uk-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 28px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .uk-footer-copy {
          font-size: 12px; color: rgba(255,255,255,0.25); font-weight: 400;
        }
        .uk-footer-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 12px; border-radius: 999px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.15);
          font-size: 11px; font-weight: 600; color: rgba(167,139,250,0.7);
          letter-spacing: 0.04em;
        }
        .uk-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #34d399;
          animation: ukBlink 1.4s ease-in-out infinite;
        }
        @keyframes ukBlink { 0%,100%{opacity:1} 50%{opacity:0.25} }

        @media (max-width: 768px) {
          .uk-footer-grid { grid-template-columns: 1fr; gap: 36px; }
          .uk-footer-bottom { justify-content: center; text-align: center; }
        }
      `}</style>

      <footer className="uk-footer">
        <div className="uk-footer-inner">

          <div className="uk-footer-grid">

            {/* Brand Column */}
            <div>
              <Link to="/" className="uk-footer-logo">
                <div className="uk-footer-logo-icon">
                  <i className="fas fa-crown" />
                </div>
                <span className="uk-footer-logo-text">URLKING</span>
              </Link>
              <p className="uk-footer-desc" style={{ marginTop: 16 }}>
                The industry standard for link monetization. Built for creators, developers, and marketers who mean business.
              </p>
              <div className="uk-footer-social">
                <a href="https://t.me/urlkings_bot" target="_blank" rel="noreferrer" title="Telegram">
                  <i className="fab fa-telegram-plane" />
                </a>
                <a href="#" title="Twitter / X">
                  <i className="fab fa-x-twitter" />
                </a>
                <a href="#" title="Discord">
                  <i className="fab fa-discord" />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div className="uk-footer-col">
              <h4>Platform</h4>
              <ul>
                {platformLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="uk-footer-col">
              <h4>Legal & Company</h4>
              <ul>
                {legalLinks.map(({ to, href, label }) => (
                  <li key={label}>
                    {href
                      ? <a href={href}>{label}</a>
                      : <Link to={to}>{label}</Link>
                    }
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="uk-footer-bottom">
            <p className="uk-footer-copy">
              © {year} URLKING. All rights reserved.
            </p>
            <div className="uk-footer-badge">
              <span className="uk-live-dot" />
              All systems operational
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;
