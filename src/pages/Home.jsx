import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Particles from '../components/Particles';

/* ─── Smooth animated counter ──────────────────────────────────────────── */
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const start = prev.current;
    const end   = value;
    if (start === end) return;
    const duration  = 550;
    const startTime = performance.now();
    const tick = (now) => {
      const p     = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);

  return display.toLocaleString('en-US');
};

/* ─── Ripple on click ───────────────────────────────────────────────────── */
const useRipple = () =>
  useCallback((e) => {
    const btn      = e.currentTarget;
    const circle   = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius   = diameter / 2;
    const rect     = btn.getBoundingClientRect();
    Object.assign(circle.style, {
      width: `${diameter}px`, height: `${diameter}px`,
      left:  `${e.clientX - rect.left - radius}px`,
      top:   `${e.clientY - rect.top  - radius}px`,
      position: 'absolute', borderRadius: '50%',
      background: 'rgba(255,255,255,0.22)',
      transform: 'scale(0)', animation: 'ukRipple 0.55s linear',
      pointerEvents: 'none',
    });
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(circle);
    circle.addEventListener('animationend', () => circle.remove());
  }, []);

/* ─── Home ──────────────────────────────────────────────────────────────── */
const Home = () => {
  const heroRef  = useRef(null);
  const cardRef  = useRef(null);
  const ripple   = useRipple();

  const [stats,      setStats]      = useState({ clicks: 128409, botLinks: 847, files: 15203 });
  const [activeCard, setActiveCard] = useState(0);

  const fadingCards = [
    { title:'TOTAL CLICKS',   value:stats.clicks,   sub:'Tracking Live', icon:'👁', accent:'#6366f1', accentAlpha:'rgba(99,102,241,0.12)',  border:'rgba(99,102,241,0.28)'  },
    { title:'LINKS VIA BOT',  value:stats.botLinks,  sub:'@urlkings_bot', icon:'✈', accent:'#a78bfa', accentAlpha:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.28)' },
    { title:'FILES UPLOADED', value:stats.files,     sub:'Safe Hosting',  icon:'☁', accent:'#f472b6', accentAlpha:'rgba(244,114,182,0.12)', border:'rgba(244,114,182,0.28)' },
  ];

  /* scroll reveal */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('uk-active'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.uk-reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* 3D tilt (desktop only) */
  useEffect(() => {
    const box  = heroRef.current;
    const card = cardRef.current;
    if (!box || !card || window.innerWidth < 1024) return;
    card.style.transform = 'rotateY(-4deg) rotateX(4deg)';
    const onMove  = (e) => {
      const x = (window.innerWidth  / 2 - e.pageX) / 65;
      const y = (window.innerHeight / 2 - e.pageY) / 65;
      card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    };
    const onLeave = () => { card.style.transform = 'rotateY(-4deg) rotateX(4deg)'; };
    box.addEventListener('mousemove',  onMove);
    box.addEventListener('mouseleave', onLeave);
    return () => { box.removeEventListener('mousemove', onMove); box.removeEventListener('mouseleave', onLeave); };
  }, []);

  /* auto-cycle hero card */
  useEffect(() => {
    const t = setInterval(() => setActiveCard(p => (p + 1) % 3), 3600);
    return () => clearInterval(t);
  }, []);

  /* live stats tick */
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --in: #6366f1; --vt: #a78bfa; --pk: #f472b6; --em: #34d399;
          --s1: #0d1117; --s2: #131a26; --s3: #1b2336;
          --bd: rgba(255,255,255,0.07);
          --tx: #eef2ff; --mt: #6b7a96;
          --fd: 'Syne', sans-serif; --fb: 'DM Sans', sans-serif;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--s1); color: var(--tx); font-family: var(--fb); -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        @keyframes ukRipple   { to { transform: scale(3.6); opacity: 0; } }
        @keyframes ukFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes ukBadge    { 0%,100%{transform:translateY(0) translateZ(40px)} 50%{transform:translateY(-7px) translateZ(40px)} }
        @keyframes ukBarGrow  { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        @keyframes ukGradMove { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes ukOrbFloat { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(28px,-18px) scale(1.04)} 70%{transform:translate(-16px,18px) scale(0.96)} }
        @keyframes ukDotBlink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes ukMountUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }

        .uk-reveal { opacity:0; transform:translateY(28px); transition: opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1); }
        .uk-reveal.uk-active { opacity:1; transform:none; }
        .uk-reveal:nth-child(2){transition-delay:.1s} .uk-reveal:nth-child(3){transition-delay:.2s}

        .uk-mount    { opacity:0; animation:ukMountUp .75s cubic-bezier(.16,1,.3,1) both; }
        .uk-d1{animation-delay:.05s} .uk-d2{animation-delay:.18s} .uk-d3{animation-delay:.32s} .uk-d4{animation-delay:.46s}

        .uk-grad { background:linear-gradient(135deg,#6366f1,#a78bfa 50%,#f472b6); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:ukGradMove 4s linear infinite; }

        .uk-glow-line { width:100%; height:1px; background:linear-gradient(to right,transparent,rgba(99,102,241,.35),rgba(244,114,182,.25),transparent); }

        .uk-orb { position:absolute; border-radius:50%; filter:blur(90px); opacity:.15; pointer-events:none; animation:ukOrbFloat 14s ease-in-out infinite; }

        .uk-section-label { font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--in); display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:14px; }
        .uk-section-label::before,.uk-section-label::after { content:''; flex:0 0 22px; height:1px; }
        .uk-section-label::before{background:linear-gradient(to right,transparent,var(--in))}
        .uk-section-label::after{background:linear-gradient(to left,transparent,var(--in))}

        .uk-live-dot { width:7px; height:7px; border-radius:50%; background:var(--em); animation:ukDotBlink 1.4s ease-in-out infinite; flex-shrink:0; }

        .uk-btn-primary {
          display:inline-flex; align-items:center; gap:9px;
          padding:13px 30px; border-radius:13px; border:none; cursor:pointer;
          font-family:var(--fd); font-weight:700; font-size:15px;
          background:linear-gradient(135deg,#6366f1,#a78bfa);
          color:#fff; text-decoration:none; position:relative; overflow:hidden;
          box-shadow:0 6px 24px rgba(99,102,241,.38),inset 0 1px 0 rgba(255,255,255,.18);
          transition:transform .2s,box-shadow .2s,filter .2s;
        }
        .uk-btn-primary:hover  { transform:translateY(-2px) scale(1.02); box-shadow:0 12px 32px rgba(99,102,241,.46); filter:brightness(1.06); }
        .uk-btn-primary:active { transform:scale(.97); }

        .uk-btn-ghost {
          display:inline-flex; align-items:center; gap:8px;
          padding:13px 28px; border-radius:13px; cursor:pointer;
          font-family:var(--fd); font-weight:600; font-size:15px;
          background:rgba(255,255,255,.04); border:1px solid var(--bd);
          color:var(--tx); text-decoration:none; position:relative; overflow:hidden;
          transition:background .2s,border-color .2s,transform .2s;
        }
        .uk-btn-ghost:hover { background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.14); transform:translateY(-1px); }

        .uk-feat-card { background:var(--s2); border:1px solid var(--bd); border-radius:22px; padding:34px 30px; transition:transform .3s,border-color .3s,box-shadow .3s; }
        .uk-feat-card:hover { transform:translateY(-5px); border-color:rgba(99,102,241,.22); box-shadow:0 18px 50px rgba(0,0,0,.35),0 0 28px rgba(99,102,241,.07); }

        .uk-feat-icon { width:50px; height:50px; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:21px; margin-bottom:18px; border:1px solid var(--bd); }

        .uk-step-circle {
          width:58px; height:58px; border-radius:50%; font-size:22px;
          background:linear-gradient(var(--s2),var(--s2)) padding-box, linear-gradient(135deg,#6366f1,#f472b6) border-box;
          border:2px solid transparent; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;
        }

        .uk-stat-chip { display:inline-block; padding:5px 14px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; }

        .uk-float-badge { position:absolute; z-index:20; background:linear-gradient(135deg,#10b981,#059669); border-radius:13px; padding:9px 15px; display:flex; align-items:center; gap:7px; font-weight:700; font-size:12px; color:#fff; box-shadow:0 6px 22px rgba(16,185,129,.35); animation:ukBadge 2.8s ease-in-out infinite; white-space:nowrap; }

        .uk-hero-card { background:var(--s2); border:1px solid var(--bd); border-radius:26px; padding:30px; box-shadow:0 40px 90px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.04); animation:ukFloat 5s ease-in-out infinite; }

        .uk-bar { flex:1; border-radius:5px 5px 0 0; transform-origin:bottom; animation:ukBarGrow .85s cubic-bezier(.16,1,.3,1) both; transition:filter .2s; }
        .uk-bar:hover { filter:brightness(1.25); }

        .uk-cta-banner { background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(244,114,182,.07)); border:1px solid rgba(99,102,241,.18); border-radius:26px; padding:56px 36px; text-align:center; position:relative; overflow:hidden; }
        .uk-cta-banner::before { content:''; position:absolute; inset:0; opacity:.035; background-image:radial-gradient(circle at 1px 1px,white 1px,transparent 0); background-size:26px 26px; }

        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:var(--s1)} ::-webkit-scrollbar-thumb{background:rgba(99,102,241,.3);border-radius:3px}

        @media(min-width:1024px){ .uk-hero-grid{grid-template-columns:1fr 1fr !important} }
        @media(max-width:640px){ .uk-hero-card{padding:22px} .uk-float-badge{font-size:11px;padding:7px 11px} }
      `}</style>

      {/* Particle background — fixed, z-index 0 */}
      <Particles />

      {/* Fixed header — z-index 1000 (set inside Header component) */}
      <Header />

      {/* Main content — z-index 1, above particles */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <main>

          {/* ── HERO ── */}
          <section ref={heroRef} style={{ padding: '154px 28px 96px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
            <div className="uk-orb" style={{ width:480, height:480, background:'#6366f1', top:-40, left:-100 }} />
            <div className="uk-orb" style={{ width:320, height:320, background:'#f472b6', top:140, right:-80, animationDelay:'5s' }} />

            <div className="uk-hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:52, alignItems:'center', position:'relative' }}>

              {/* Left: Copy */}
              <div style={{ maxWidth: 560 }}>
                <div className="uk-mount uk-d1" style={{ marginBottom: 22 }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:999, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', fontSize:12, fontWeight:700, color:'#a78bfa', letterSpacing:'0.04em' }}>
                    <span className="uk-live-dot" />
                    v3.0 Now Live — Highest CPM Guaranteed
                  </span>
                </div>

                <h1 className="uk-mount uk-d2" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(34px,5vw,66px)', lineHeight:1.07, marginBottom:20, letterSpacing:'-0.02em' }}>
                  Monetize Links<br />
                  with <span className="uk-grad">Professionalism</span>
                </h1>

                <p className="uk-mount uk-d3" style={{ color:'var(--mt)', fontSize:16, lineHeight:1.75, marginBottom:34, maxWidth:450 }}>
                  The industry's highest-paying link shortener. Fast 2-page flow, secure file hosting, and instant withdrawals — built for creators who mean business.
                </p>

                <div className="uk-mount uk-d4" style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <Link to="/register" className="uk-btn-primary" onClick={ripple}>
                    Start Earning <span style={{ fontSize:17 }}>→</span>
                  </Link>
                  <a href="#features" className="uk-btn-ghost" onClick={ripple}>
                    <span>⚡</span> Explore Features
                  </a>
                </div>

                <div className="uk-mount uk-d4" style={{ marginTop:28, display:'flex', gap:20, flexWrap:'wrap', alignItems:'center' }}>
                  {['10M+ Links','Instant Pay','$5 Global CPM'].map(t => (
                    <span key={t} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--mt)', fontSize:13 }}>
                      <span style={{ color:'#34d399' }}>✓</span> {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: 3D Hero Card */}
              <div style={{ display:'flex', justifyContent:'center', perspective:1800 }}>
                <div
                  ref={cardRef}
                  className="uk-hero-card"
                  style={{ width:'100%', maxWidth:420, transformStyle:'preserve-3d', transition:'transform .35s cubic-bezier(.16,1,.3,1)', position:'relative' }}
                >
                  <div className="uk-float-badge" style={{ top:-15, right:-8 }}>
                    <span>📈</span> High CPM
                  </div>

                  {/* Mac dots */}
                  <div style={{ display:'flex', gap:7, marginBottom:26 }}>
                    {['#ef4444','#eab308','#22c55e'].map(c => (
                      <div key={c} style={{ width:11, height:11, borderRadius:'50%', background:c }} />
                    ))}
                  </div>

                  {/* Fading stat */}
                  <div style={{ position:'relative', height:94, marginBottom:22 }}>
                    {fadingCards.map((card, i) => (
                      <div key={i} style={{
                        position:'absolute', inset:0, display:'flex', alignItems:'center', gap:18,
                        opacity:   activeCard===i ? 1 : 0,
                        transform: activeCard===i ? 'translateX(0)' : 'translateX(10px)',
                        transition:'opacity .6s ease,transform .6s ease',
                        pointerEvents: activeCard===i ? 'auto' : 'none',
                      }}>
                        <div style={{ width:54, height:54, borderRadius:16, flexShrink:0, background:card.accentAlpha, border:`1px solid ${card.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:23, boxShadow:`0 0 22px ${card.accentAlpha}` }}>
                          {card.icon}
                        </div>
                        <div>
                          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', color:'var(--mt)', textTransform:'uppercase', marginBottom:4 }}>{card.title}</p>
                          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:34, lineHeight:1, color:'var(--tx)' }}>
                            <AnimatedNumber value={card.value} />
                          </p>
                          <p style={{ fontSize:12, fontWeight:500, marginTop:5, color:card.accent }}>{card.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dot indicators */}
                  <div style={{ display:'flex', gap:6, marginBottom:22 }}>
                    {fadingCards.map((_,i) => (
                      <div key={i} onClick={() => setActiveCard(i)} style={{
                        height:4, borderRadius:2, cursor:'pointer',
                        background: i===activeCard ? 'var(--in)' : 'var(--s3)',
                        width: i===activeCard ? 24 : 8, transition:'all .4s ease',
                      }} />
                    ))}
                  </div>

                  {/* Bar chart */}
                  <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:68, background:'var(--s3)', borderRadius:12, padding:'10px 12px' }}>
                    {[
                      {h:'38%', bg:'rgba(99,102,241,.28)',  d:'.00s'},
                      {h:'62%', bg:'rgba(99,102,241,.48)',  d:'.05s'},
                      {h:'48%', bg:'#6366f1',               d:'.10s'},
                      {h:'88%', bg:'linear-gradient(to top,#6366f1,#f472b6)', d:'.15s', glow:true},
                      {h:'70%', bg:'rgba(99,102,241,.58)',  d:'.20s'},
                      {h:'52%', bg:'rgba(167,139,250,.48)', d:'.25s'},
                    ].map((bar,i) => (
                      <div key={i} className="uk-bar" style={{ height:bar.h, background:bar.bg, animationDelay:bar.d, boxShadow:bar.glow?'0 0 14px rgba(244,114,182,.4)':'none' }} />
                    ))}
                  </div>

                  <div style={{ marginTop:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'var(--mt)' }}>Revenue — last 7 days</span>
                    <span style={{ fontSize:12, fontWeight:700, color:'#34d399' }}>↑ 14.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── STATS BAND ── */}
          <div className="uk-glow-line" />
          <section style={{ padding:'60px 28px', background:'rgba(255,255,255,0.01)' }}>
            <div style={{ maxWidth:960, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:36, textAlign:'center' }} className="uk-reveal">
              {[
                {val:'$5.00',   label:'Global CPM',  color:'var(--in)'},
                {val:'10M+',    label:'Links Served', color:'var(--vt)'},
                {val:'Instant', label:'Withdrawals',  color:'var(--pk)'},
              ].map(({val,label,color}) => (
                <div key={label} style={{ padding:'20px 0' }}>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(34px,4vw,50px)', lineHeight:1, marginBottom:14 }}>{val}</p>
                  <span className="uk-stat-chip" style={{ background:`${color}18`, border:`1px solid ${color}28`, color }}>{label}</span>
                </div>
              ))}
            </div>
          </section>
          <div className="uk-glow-line" />

          {/* ── FEATURES ── */}
          <section id="features" style={{ padding:'92px 28px', maxWidth:1200, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:52 }} className="uk-reveal">
              <div className="uk-section-label">Platform Features</div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,4vw,46px)', lineHeight:1.1 }}>
                Enterprise <span className="uk-grad">Features</span>
              </h2>
              <p style={{ color:'var(--mt)', marginTop:14, fontSize:15, maxWidth:400, margin:'14px auto 0' }}>
                Everything you need to grow traffic and earnings at scale.
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:18 }}>
              {[
                {icon:'⚡', title:'Fast 2-Page Flow',   desc:'Optimized redirection engine ensures users reach destinations quickly while you earn maximum CPM revenue.',  accent:'var(--in)', bg:'rgba(99,102,241,0.1)'},
                {icon:'✈', title:'Telegram Bot',        desc:'Shorten links and upload files instantly from Telegram using our powerful @urlkings_bot integration.',        accent:'var(--vt)', bg:'rgba(167,139,250,0.1)'},
                {icon:'🛡', title:'Secure File Hosting', desc:'Host your files with confidence. AES encryption and global CDN delivery for your audience.',                  accent:'var(--pk)', bg:'rgba(244,114,182,0.1)'},
              ].map(({icon,title,desc,accent,bg}) => (
                <div key={title} className="uk-feat-card uk-reveal">
                  <div className="uk-feat-icon" style={{ background:bg, borderColor:`${accent}28`, color:accent }}>{icon}</div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, marginBottom:10 }}>{title}</h3>
                  <p style={{ color:'var(--mt)', lineHeight:1.72, fontSize:14 }}>{desc}</p>
                  <div style={{ marginTop:22, fontSize:13, fontWeight:600, color:accent, cursor:'pointer' }}>Learn more →</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section id="how-it-works" style={{ padding:'92px 28px', background:'rgba(255,255,255,0.012)', borderTop:'1px solid var(--bd)' }}>
            <div style={{ maxWidth:860, margin:'0 auto' }}>
              <div style={{ textAlign:'center', marginBottom:52 }} className="uk-reveal">
                <div className="uk-section-label">Simple Process</div>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,4vw,46px)', lineHeight:1.1 }}>
                  How it <span className="uk-grad">Works</span>
                </h2>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:32 }}>
                {[
                  {num:'01', icon:'👤', title:'Create Account',  desc:'Sign up in under 10 seconds. No credit card required.'},
                  {num:'02', icon:'🔗', title:'Shorten Links',    desc:'Use the dashboard or Telegram bot for instant, one-click shortening.'},
                  {num:'03', icon:'💸', title:'Get Paid',         desc:'Withdraw your earnings instantly to your preferred payment method.'},
                ].map(({num,icon,title,desc}) => (
                  <div key={num} className="uk-reveal" style={{ textAlign:'center', padding:'0 8px' }}>
                    <div className="uk-step-circle">{icon}</div>
                    <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', color:'var(--in)', marginBottom:8, textTransform:'uppercase' }}>Step {num}</p>
                    <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, marginBottom:10 }}>{title}</h3>
                    <p style={{ color:'var(--mt)', fontSize:14, lineHeight:1.68 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA BANNER ── */}
          <section style={{ padding:'80px 28px' }}>
            <div style={{ maxWidth:780, margin:'0 auto' }} className="uk-reveal">
              <div className="uk-cta-banner">
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(22px,3.5vw,40px)', marginBottom:16, position:'relative' }}>
                  Ready to <span className="uk-grad">start earning?</span>
                </h2>
                <p style={{ color:'var(--mt)', fontSize:15, margin:'0 auto 32px', maxWidth:360, lineHeight:1.7 }}>
                  Join thousands of creators already monetizing their links with URLKings.
                </p>
                <Link to="/register" className="uk-btn-primary" onClick={ripple} style={{ fontSize:16, padding:'15px 38px' }}>
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
