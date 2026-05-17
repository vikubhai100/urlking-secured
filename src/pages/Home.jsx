import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Particles from '../components/Particles';

/* ─── Animated counter ─────────────────────────────────────────────────── */
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const start = prev.current, end = value;
    if (start === end) return;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 520, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * e));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return display.toLocaleString('en-US');
};

/* ─── Ripple ────────────────────────────────────────────────────────────── */
const useRipple = () =>
  useCallback((e) => {
    const btn = e.currentTarget;
    const c = document.createElement('span');
    const d = Math.max(btn.clientWidth, btn.clientHeight);
    const r = btn.getBoundingClientRect();
    Object.assign(c.style, {
      width: `${d}px`, height: `${d}px`,
      left: `${e.clientX - r.left - d / 2}px`,
      top: `${e.clientY - r.top - d / 2}px`,
      position: 'absolute', borderRadius: '50%',
      background: 'rgba(255,255,255,0.2)',
      transform: 'scale(0)', animation: 'ukRipple .5s linear',
      pointerEvents: 'none',
    });
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(c);
    c.addEventListener('animationend', () => c.remove());
  }, []);

/* ─── Home ──────────────────────────────────────────────────────────────── */
const Home = () => {
  const heroRef = useRef(null);
  const cardRef = useRef(null);
  const ripple  = useRipple();

  const [stats, setStats]           = useState({ clicks: 128409, botLinks: 847, files: 15203 });
  const [activeCard, setActiveCard] = useState(0);

  const cards = [
    { title: 'TOTAL CLICKS',   value: stats.clicks,   sub: 'Tracking Live', icon: '👁', accent: '#6366f1', bg: 'rgba(99,102,241,.12)',  bd: 'rgba(99,102,241,.25)'  },
    { title: 'LINKS VIA BOT',  value: stats.botLinks,  sub: '@urlkings_bot', icon: '✈', accent: '#a78bfa', bg: 'rgba(167,139,250,.12)', bd: 'rgba(167,139,250,.25)' },
    { title: 'FILES UPLOADED', value: stats.files,     sub: 'Safe Hosting',  icon: '☁', accent: '#f472b6', bg: 'rgba(244,114,182,.12)', bd: 'rgba(244,114,182,.25)' },
  ];

  /* scroll reveal */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('rv'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* 3D tilt — desktop only */
  useEffect(() => {
    const box = heroRef.current, card = cardRef.current;
    if (!box || !card || window.innerWidth < 1024) return;
    card.style.transform = 'rotateY(-4deg) rotateX(3deg)';
    const mv = (e) => {
      card.style.transform = `rotateY(${(window.innerWidth / 2 - e.pageX) / 70}deg) rotateX(${(window.innerHeight / 2 - e.pageY) / 70}deg)`;
    };
    const lv = () => { card.style.transform = 'rotateY(-4deg) rotateX(3deg)'; };
    box.addEventListener('mousemove', mv);
    box.addEventListener('mouseleave', lv);
    return () => { box.removeEventListener('mousemove', mv); box.removeEventListener('mouseleave', lv); };
  }, []);

  /* card cycle */
  useEffect(() => {
    const t = setInterval(() => setActiveCard(p => (p + 1) % 3), 3500);
    return () => clearInterval(t);
  }, []);

  /* live stats */
  useEffect(() => {
    const t = setInterval(() => setStats(p => ({
      clicks:   p.clicks   + Math.floor(Math.random() * 5 + 1),
      botLinks: p.botLinks  + Math.floor(Math.random() * 2),
      files:    p.files     + Math.floor(Math.random() * 2),
    })), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`
        /* --- System font stack: zero latency, looks great ---- */
        :root {
          --fd: -apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          --fb: -apple-system, 'SF Pro Text',    BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          --in: #6366f1; --vt: #a78bfa; --pk: #f472b6; --em: #34d399;
          --s1: #0d1117; --s2: #131a26; --s3: #1b2336;
          --bd: rgba(255,255,255,.07);
          --tx: #eef2ff; --mt: #6b7a96;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: var(--s1); color: var(--tx);
          font-family: var(--fb); -webkit-font-smoothing: antialiased;
          /* CRITICAL: prevent horizontal scroll on mobile */
          overflow-x: hidden; max-width: 100vw;
        }

        /* --- Keyframes --- */
        @keyframes ukRipple  { to { transform: scale(3.5); opacity: 0; } }
        @keyframes ukFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ukBadge   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes ukBarGrow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        @keyframes ukGrad    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes ukBlink   { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes ukIn      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes ukOrb     { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-14px)} }

        /* --- Scroll reveal --- */
        .reveal { opacity:0; transform:translateY(24px); transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1); }
        .reveal.rv { opacity:1; transform:none; }
        .reveal:nth-child(2){transition-delay:.1s}
        .reveal:nth-child(3){transition-delay:.2s}

        /* --- Hero staggered mount --- */
        .m0{opacity:0;animation:ukIn .7s cubic-bezier(.16,1,.3,1) .05s both}
        .m1{opacity:0;animation:ukIn .7s cubic-bezier(.16,1,.3,1) .17s both}
        .m2{opacity:0;animation:ukIn .7s cubic-bezier(.16,1,.3,1) .30s both}
        .m3{opacity:0;animation:ukIn .7s cubic-bezier(.16,1,.3,1) .44s both}

        /* --- Gradient text --- */
        .gt {
          background: linear-gradient(135deg,#6366f1,#a78bfa 50%,#f472b6);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: ukGrad 4s linear infinite;
        }

        /* --- Glow divider --- */
        .gline { height:1px; background:linear-gradient(to right,transparent,rgba(99,102,241,.35),rgba(244,114,182,.25),transparent); }

        /* --- Orb --- */
        .orb { position:absolute; border-radius:50%; filter:blur(80px); opacity:.14; pointer-events:none; animation:ukOrb 12s ease-in-out infinite; }

        /* --- Section label --- */
        .slabel {
          font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase;
          color:var(--in); display:flex; align-items:center; gap:8px; justify-content:center; margin-bottom:12px;
        }
        .slabel::before,.slabel::after{content:'';flex:0 0 20px;height:1px}
        .slabel::before{background:linear-gradient(to right,transparent,var(--in))}
        .slabel::after{background:linear-gradient(to left,transparent,var(--in))}

        /* --- Live dot --- */
        .ldot{width:7px;height:7px;border-radius:50%;background:var(--em);animation:ukBlink 1.4s ease-in-out infinite;flex-shrink:0}

        /* --- Buttons --- */
        .btn-p {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:13px 26px; border-radius:13px; border:none; cursor:pointer;
          font-family:var(--fd); font-weight:700; font-size:15px; letter-spacing:-.01em;
          background:linear-gradient(135deg,#6366f1,#a78bfa);
          color:#fff; text-decoration:none; position:relative; overflow:hidden;
          box-shadow:0 6px 22px rgba(99,102,241,.38),inset 0 1px 0 rgba(255,255,255,.18);
          transition:transform .18s,box-shadow .18s,filter .18s;
          /* GPU hint for smooth animation */
          will-change:transform;
          white-space:nowrap;
        }
        .btn-p:hover  { transform:translateY(-2px) scale(1.02); box-shadow:0 12px 28px rgba(99,102,241,.44); filter:brightness(1.06); }
        .btn-p:active { transform:scale(.97); }

        .btn-g {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:13px 26px; border-radius:13px; cursor:pointer;
          font-family:var(--fd); font-weight:600; font-size:15px; letter-spacing:-.01em;
          background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
          color:var(--tx); text-decoration:none; position:relative; overflow:hidden;
          transition:background .18s,border-color .18s,transform .18s;
          will-change:transform; white-space:nowrap;
        }
        .btn-g:hover { background:rgba(255,255,255,.09); border-color:rgba(255,255,255,.16); transform:translateY(-1px); }
        .btn-g:active{ transform:scale(.97); }

        /* --- Hero card --- */
        .hcard {
          background:var(--s2); border:1px solid var(--bd); border-radius:24px; padding:28px;
          box-shadow:0 36px 80px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.03);
          animation:ukFloat 5s ease-in-out infinite;
          will-change:transform;
        }

        /* --- Feature card --- */
        .fcard {
          background:var(--s2); border:1px solid var(--bd); border-radius:20px; padding:32px 28px;
          transition:transform .28s,border-color .28s,box-shadow .28s;
          will-change:transform;
        }
        .fcard:hover { transform:translateY(-4px); border-color:rgba(99,102,241,.22); box-shadow:0 16px 44px rgba(0,0,0,.32),0 0 24px rgba(99,102,241,.07); }

        .ficon { width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px;border:1px solid var(--bd); }

        /* --- Step circle --- */
        .scircle {
          width:56px;height:56px;border-radius:50%;font-size:22px;
          background:linear-gradient(var(--s2),var(--s2)) padding-box,linear-gradient(135deg,#6366f1,#f472b6) border-box;
          border:2px solid transparent;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;
        }

        /* --- Stat chip --- */
        .chip{display:inline-block;padding:4px 13px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;}

        /* --- Float badge --- */
        .fbadge {
          position:absolute;z-index:20;
          background:linear-gradient(135deg,#10b981,#059669);
          border-radius:12px;padding:8px 14px;
          display:flex;align-items:center;gap:6px;
          font-weight:700;font-size:12px;color:#fff;
          box-shadow:0 6px 20px rgba(16,185,129,.32);
          animation:ukBadge 2.8s ease-in-out infinite;
          white-space:nowrap;
        }

        /* --- Bar --- */
        .bar { flex:1;border-radius:4px 4px 0 0;transform-origin:bottom;animation:ukBarGrow .8s cubic-bezier(.16,1,.3,1) both;transition:filter .2s; }
        .bar:hover{filter:brightness(1.25)}

        /* --- CTA banner --- */
        .ctabanner {
          background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(244,114,182,.07));
          border:1px solid rgba(99,102,241,.18);border-radius:24px;
          padding:52px 32px;text-align:center;position:relative;overflow:hidden;
        }
        .ctabanner::before{content:'';position:absolute;inset:0;opacity:.03;background-image:radial-gradient(circle at 1px 1px,white 1px,transparent 0);background-size:24px 24px;}

        /* --- Scrollbar --- */
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:var(--s1)}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,.3);border-radius:2px}

        /* ============================================================
           MOBILE FIXES — this is the key section
           ============================================================ */
        /* Prevent text overflow: allow natural wrap */
        h1,h2,h3,p { word-break: break-word; overflow-wrap: break-word; }

        /* Hero headline font scale — won't overflow at any screen width */
        .hero-h1 {
          font-family: var(--fd); font-weight: 800; letter-spacing: -.025em; line-height: 1.07;
          /* clamp(min, preferred, max) — scales with viewport, never overflows */
          font-size: clamp(28px, 8.5vw, 66px);
          margin-bottom: 18px;
        }

        /* CTA row: side by side on all screens, wraps gracefully */
        .cta-row {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 28px;
        }
        /* Each button shrinks but stays readable */
        .cta-row .btn-p,
        .cta-row .btn-g {
          flex: 1 1 auto;
          min-width: 140px;
          max-width: 220px;
        }

        /* Trust row */
        .trust-row { display:flex; flex-wrap:wrap; gap:14px 20px; align-items:center; }
        .trust-item { display:flex; align-items:center; gap:6px; color:var(--mt); font-size:13px; }

        /* Hero grid: single column on mobile, 2-col on ≥1024px */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 44px;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr 1fr; }
        }

        /* Full-bleed section padding — safe on small screens */
        .sec { padding: 80px 20px; }
        .sec-narrow { max-width: 860px; margin: 0 auto; }
        .sec-wide   { max-width: 1200px; margin: 0 auto; }

        /* Feature grid */
        .feat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }

        /* Step grid */
        .step-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 28px;
        }

        /* Stats grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 28px;
          text-align: center;
        }
      `}</style>

      <Particles />
      <Header />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <main>

          {/* ── HERO ── */}
          <section
            ref={heroRef}
            style={{ padding: '148px 20px 88px', position: 'relative' }}
          >
            <div className="sec-wide" style={{ position: 'relative' }}>

              {/* Ambient orbs — clipped so they don't cause scroll */}
              <div className="orb" style={{ width: 420, height: 420, background: '#6366f1', top: -40, left: -80, animationDelay: '0s' }} />
              <div className="orb" style={{ width: 280, height: 280, background: '#f472b6', top: 100, right: -60, animationDelay: '5s' }} />

              <div className="hero-grid">

                {/* Left: copy */}
                <div>
                  {/* Live badge */}
                  <div className="m0" style={{ marginBottom: 20 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '7px 15px', borderRadius: 999,
                      background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.25)',
                      fontSize: 12, fontWeight: 700, color: '#a78bfa', letterSpacing: '.03em',
                    }}>
                      <span className="ldot" />
                      v3.0 Now Live — Highest CPM Guaranteed
                    </span>
                  </div>

                  {/* Headline — uses clamp so it NEVER overflows */}
                  <h1 className="hero-h1 m1">
                    Monetize Links<br />
                    with <span className="gt">Professionalism</span>
                  </h1>

                  {/* Subtext */}
                  <p className="m2" style={{
                    color: 'var(--mt)', fontSize: 'clamp(14px,3.8vw,17px)',
                    lineHeight: 1.72, marginBottom: 28, maxWidth: 440,
                  }}>
                    The industry's highest-paying link shortener. Fast 2-page flow, secure file hosting, and instant withdrawals.
                  </p>

                  {/* CTAs — side by side, wraps on very small screens */}
                  <div className="cta-row m3">
                    <Link to="/register" className="btn-p" onClick={ripple}>
                      Start Earning <span>→</span>
                    </Link>
                    <a href="#features" className="btn-g" onClick={ripple}>
                      <span>⚡</span> Features
                    </a>
                  </div>

                  {/* Trust */}
                  <div className="trust-row m3">
                    {['10M+ Links', 'Instant Pay', '$5 Global CPM'].map(t => (
                      <span key={t} className="trust-item">
                        <span style={{ color: 'var(--em)', fontWeight: 700 }}>✓</span> {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: 3D card */}
                <div style={{ display: 'flex', justifyContent: 'center', perspective: 1600 }}>
                  <div
                    ref={cardRef}
                    className="hcard"
                    style={{
                      width: '100%', maxWidth: 400,
                      transformStyle: 'preserve-3d',
                      transition: 'transform .32s cubic-bezier(.16,1,.3,1)',
                      position: 'relative',
                    }}
                  >
                    {/* Badge */}
                    <div className="fbadge" style={{ top: -14, right: -8 }}>
                      <span>📈</span> High CPM
                    </div>

                    {/* Mac dots */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                      {['#ef4444','#eab308','#22c55e'].map(c => (
                        <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                      ))}
                    </div>

                    {/* Fading stat cards */}
                    <div style={{ position: 'relative', height: 90, marginBottom: 20 }}>
                      {cards.map((card, i) => (
                        <div key={i} style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', gap: 16,
                          opacity: activeCard === i ? 1 : 0,
                          transform: activeCard === i ? 'translateX(0)' : 'translateX(8px)',
                          transition: 'opacity .55s ease, transform .55s ease',
                          pointerEvents: activeCard === i ? 'auto' : 'none',
                        }}>
                          <div style={{
                            width: 52, height: 52, borderRadius: 15, flexShrink: 0,
                            background: card.bg, border: `1px solid ${card.bd}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                          }}>
                            {card.icon}
                          </div>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', color: 'var(--mt)', textTransform: 'uppercase', marginBottom: 4 }}>{card.title}</p>
                            <p style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: 32, lineHeight: 1, color: 'var(--tx)' }}>
                              <AnimatedNumber value={card.value} />
                            </p>
                            <p style={{ fontSize: 12, fontWeight: 500, marginTop: 4, color: card.accent }}>{card.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dot indicators — clickable */}
                    <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
                      {cards.map((_, i) => (
                        <div key={i} onClick={() => setActiveCard(i)} style={{
                          height: 3, borderRadius: 2, cursor: 'pointer',
                          background: i === activeCard ? 'var(--in)' : 'var(--s3)',
                          width: i === activeCard ? 22 : 7, transition: 'all .35s ease',
                        }} />
                      ))}
                    </div>

                    {/* Bar chart */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 64, background: 'var(--s3)', borderRadius: 10, padding: '9px 11px' }}>
                      {[
                        { h:'36%', bg:'rgba(99,102,241,.28)',  d:'.00s' },
                        { h:'60%', bg:'rgba(99,102,241,.46)',  d:'.05s' },
                        { h:'46%', bg:'#6366f1',               d:'.10s' },
                        { h:'86%', bg:'linear-gradient(to top,#6366f1,#f472b6)', d:'.15s', glow:true },
                        { h:'68%', bg:'rgba(99,102,241,.56)',  d:'.20s' },
                        { h:'50%', bg:'rgba(167,139,250,.46)', d:'.25s' },
                      ].map((bar, i) => (
                        <div key={i} className="bar" style={{ height: bar.h, background: bar.bg, animationDelay: bar.d, boxShadow: bar.glow ? '0 0 12px rgba(244,114,182,.4)' : 'none' }} />
                      ))}
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--mt)' }}>Revenue — last 7 days</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--em)' }}>↑ 14.2%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ── STATS BAND ── */}
          <div className="gline" />
          <section style={{ padding: '52px 20px', background: 'rgba(255,255,255,.01)' }}>
            <div className="sec-wide">
              <div className="stats-grid reveal">
                {[
                  { val: '$5.00',   label: 'Global CPM',  c: 'var(--in)' },
                  { val: '10M+',    label: 'Links Served', c: 'var(--vt)' },
                  { val: 'Instant', label: 'Withdrawals',  c: 'var(--pk)' },
                ].map(({ val, label, c }) => (
                  <div key={label} style={{ padding: '16px 0' }}>
                    <p style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: 'clamp(30px,6vw,48px)', lineHeight: 1, marginBottom: 12 }}>{val}</p>
                    <span className="chip" style={{ background: `${c}18`, border: `1px solid ${c}28`, color: c }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className="gline" />

          {/* ── FEATURES ── */}
          <section id="features" className="sec">
            <div className="sec-wide">
              <div style={{ textAlign: 'center', marginBottom: 44 }} className="reveal">
                <div className="slabel">Platform Features</div>
                <h2 style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: 'clamp(24px,5vw,44px)', lineHeight: 1.1 }}>
                  Enterprise <span className="gt">Features</span>
                </h2>
                <p style={{ color: 'var(--mt)', marginTop: 12, fontSize: 15, maxWidth: 380, margin: '12px auto 0' }}>
                  Everything you need to grow traffic and earnings at scale.
                </p>
              </div>
              <div className="feat-grid">
                {[
                  { icon: '⚡', title: 'Fast 2-Page Flow',    desc: 'Optimized redirection engine ensures users reach destinations quickly while you earn maximum CPM.', accent: 'var(--in)', bg: 'rgba(99,102,241,.1)'  },
                  { icon: '✈', title: 'Telegram Bot',         desc: 'Shorten links and upload files instantly from Telegram using our powerful @urlkings_bot.',        accent: 'var(--vt)', bg: 'rgba(167,139,250,.1)' },
                  { icon: '🛡', title: 'Secure File Hosting',  desc: 'Host your files with confidence. AES encryption and global CDN delivery for your audience.',       accent: 'var(--pk)', bg: 'rgba(244,114,182,.1)' },
                ].map(({ icon, title, desc, accent, bg }) => (
                  <div key={title} className="fcard reveal">
                    <div className="ficon" style={{ background: bg, borderColor: `${accent}28`, color: accent }}>{icon}</div>
                    <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{title}</h3>
                    <p style={{ color: 'var(--mt)', lineHeight: 1.7, fontSize: 14 }}>{desc}</p>
                    <div style={{ marginTop: 20, fontSize: 13, fontWeight: 600, color: accent, cursor: 'pointer' }}>Learn more →</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section id="how-it-works" className="sec" style={{ background: 'rgba(255,255,255,.012)', borderTop: '1px solid var(--bd)' }}>
            <div className="sec-narrow">
              <div style={{ textAlign: 'center', marginBottom: 44 }} className="reveal">
                <div className="slabel">Simple Process</div>
                <h2 style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: 'clamp(24px,5vw,44px)', lineHeight: 1.1 }}>
                  How it <span className="gt">Works</span>
                </h2>
              </div>
              <div className="step-grid">
                {[
                  { num: '01', icon: '👤', title: 'Create Account', desc: 'Sign up in under 10 seconds. No credit card required.' },
                  { num: '02', icon: '🔗', title: 'Shorten Links',   desc: 'Use the dashboard or Telegram bot for one-click shortening.' },
                  { num: '03', icon: '💸', title: 'Get Paid',        desc: 'Withdraw earnings instantly to your preferred payment method.' },
                ].map(({ num, icon, title, desc }) => (
                  <div key={num} className="reveal" style={{ textAlign: 'center' }}>
                    <div className="scircle">{icon}</div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'var(--in)', marginBottom: 8, textTransform: 'uppercase' }}>Step {num}</p>
                    <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</h3>
                    <p style={{ color: 'var(--mt)', fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA BANNER ── */}
          <section className="sec">
            <div style={{ maxWidth: 740, margin: '0 auto' }} className="reveal">
              <div className="ctabanner">
                <h2 style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: 'clamp(20px,5vw,38px)', marginBottom: 14, position: 'relative' }}>
                  Ready to <span className="gt">start earning?</span>
                </h2>
                <p style={{ color: 'var(--mt)', fontSize: 15, margin: '0 auto 28px', maxWidth: 340, lineHeight: 1.7 }}>
                  Join thousands of creators already monetizing their links with URLKings.
                </p>
                <Link to="/register" className="btn-p" onClick={ripple} style={{ fontSize: 15, padding: '14px 34px' }}>
                  Create Free Account →
                </Link>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default Home;
