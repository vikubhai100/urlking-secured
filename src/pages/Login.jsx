import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Particles from '../components/Particles';
import { showToast } from '../toast'; // Premium Toast
import { getApiUrl } from '../security';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // 🔒 SECURITY: Client-side rate limiting for login attempts
  const [lastAttempt, setLastAttempt] = useState(0);
  const RATE_LIMIT_MS = 2000; // 2 seconds between attempts

  const navigate = useNavigate();
  const API = getApiUrl();

  // --- 🚀 PRO-LEVEL LOGIN LOGIC (With Instant Dashboard Data Prefetch) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      return showToast("Please fill all fields", "error");
    }

    // 🔒 SECURITY: Rate limiting check
    const now = Date.now();
    if (now - lastAttempt < RATE_LIMIT_MS) {
      return showToast("Please wait before trying again", "error");
    }
    setLastAttempt(now);

    setLoading(true);

    try {
      // 1. Send Login Request
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'X-Requested-With': 'XMLHttpRequest' // 🔒 CSRF protection header
        },
        body: JSON.stringify({ identifier, password }), 
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Save token immediately
        localStorage.setItem("token", data.token);
        showToast("Welcome back!", "success");

        // 🚀 MAGIC TRICK: Dashboard jane se pehle hi uska data fetch kar lo!
        // Isse dashboard 0 second me (Instant) load hoga without spinner.
        try {
          const dashRes = await fetch(`${API}/api/user/dashboard`, {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          if (dashRes.ok) {
            const dashData = await dashRes.json();
            // Data ko session storage me chupa do jise Dashboard padh lega
            sessionStorage.setItem('urlking_dash_cache', JSON.stringify(dashData));
          }
        } catch (prefetchErr) {
          console.log("Background prefetch failed, moving to dashboard normally.");
        }

        // Navigate instantly to dashboard
        navigate("/dashboard");
      } else {
        showToast(data.error || "Invalid Credentials", "error");
        setLoading(false); // Stop loader if failed
      }
    } catch (err) {
      showToast("Server Error! Check your internet connection.", "error");
      setLoading(false);
    } 
  };

  // --- FORGOT PASSWORD LOGIC ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      return showToast("Please enter your email address", "error");
    }

    setForgotLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'X-Requested-With': 'XMLHttpRequest' // 🔒 CSRF protection header
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Reset link sent to your email!", "success");
        setForgotModalOpen(false);
        setForgotEmail(''); // Reset field
      } else {
        showToast(data.error || "Failed to send link", "error");
      }
    } catch (err) {
      showToast("Server connection failed.", "error");
      console.error(err);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-primary)] flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-300">
      <Particles />

      {/* Header Navigation Elements */}
      <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-indigo-500 font-medium flex items-center gap-2 transition-colors z-20 bg-[var(--glass-panel)] border border-[var(--glass-border)] px-5 py-2.5 rounded-full backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-0.5">
        <i className="fas fa-arrow-left text-sm"></i> <span className="text-sm font-bold">Home</span>
      </Link>

      <Link to="/register" className="absolute top-8 right-8 group flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all backdrop-blur-md shadow-sm z-20">
        <span className="font-bold text-sm">Sign Up Free</span>
        <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
      </Link>

      {/* Main Login Box */}
      <div className="w-full max-w-md p-8 relative z-10 fade-in mt-16 md:mt-0">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-[var(--glass-border)] mb-4 shadow-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10">
            <i className="fas fa-crown text-indigo-500 text-3xl drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"></i>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
            URL<span className="text-indigo-500">KING</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium">Welcome back, Creator.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-secondary)] opacity-70">
              <i className="fas fa-user"></i>
            </div>
            <input 
              type="text" 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
              required 
              placeholder="Username or Email" 
              className="w-full pl-11 pr-4 py-4 bg-[var(--bg-body)] border border-[var(--glass-border)] rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-[var(--text-primary)]" 
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-secondary)] opacity-70">
              <i className="fas fa-lock"></i>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Password"
              autoComplete="current-password"
              className="w-full pl-11 pr-4 py-4 bg-[var(--bg-body)] border border-[var(--glass-border)] rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-[var(--text-primary)]" 
            />
          </div>

          <div className="flex items-center justify-between text-xs px-1 text-[var(--text-secondary)] font-medium">
            <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-500 transition-colors select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-500 text-indigo-600 focus:ring-indigo-500 cursor-pointer" defaultChecked />
              Remember me
            </label>
            <button 
              type="button" 
              onClick={() => setForgotModalOpen(true)} 
              className="text-indigo-500 hover:text-indigo-600 font-bold transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 rounded-xl font-bold text-white tracking-wide shadow-lg bg-indigo-600 hover:bg-indigo-500 transform active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <><i className="fas fa-circle-notch fa-spin text-lg"></i> Authenticating...</> : "Access Dashboard"}
          </button>
        </form>

        <p className="text-center text-sm mt-8 text-[var(--text-secondary)] font-medium">
          No account? 
          <Link to="/register" className="text-indigo-500 font-bold hover:text-indigo-600 transition-colors ml-1.5 underline-offset-4 hover:underline">
            Get started
          </Link>
        </p>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl text-center px-4 mt-8 relative z-10 fade-in">
        <div className="flex flex-col items-center gap-2 p-4 bg-[var(--glass-panel)] rounded-2xl border border-[var(--glass-border)] hover:-translate-y-1 transition-transform shadow-sm">
          <i className="fas fa-users text-indigo-500 text-xl"></i>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">10K+ Users</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-[var(--glass-panel)] rounded-2xl border border-[var(--glass-border)] hover:-translate-y-1 transition-transform shadow-sm">
          <i className="fas fa-link text-blue-500 text-xl"></i>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">50M+ Links</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-[var(--glass-panel)] rounded-2xl border border-[var(--glass-border)] hover:-translate-y-1 transition-transform shadow-sm">
          <i className="fas fa-shield-alt text-green-500 text-xl"></i>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Highly Secure</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-[var(--glass-panel)] rounded-2xl border border-[var(--glass-border)] hover:-translate-y-1 transition-transform shadow-sm">
          <i className="fas fa-bolt text-yellow-500 text-xl"></i>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ultra Fast</span>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-[var(--glass-panel)] border border-[var(--glass-border)] w-full max-w-[400px] rounded-3xl p-8 shadow-2xl relative">

            <div className="flex justify-between items-center mb-5">
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">Reset Password</h3>
              <button 
                onClick={() => setForgotModalOpen(false)} 
                className="text-[var(--text-secondary)] hover:text-red-500 transition-colors w-8 h-8 rounded-full bg-[var(--nav-hover)] flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <p className="text-sm mb-6 text-[var(--text-secondary)] font-medium leading-relaxed">
              Enter your registered email address. We'll send you a secure link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="relative text-left">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-secondary)] opacity-70">
                  <i className="fas fa-envelope text-sm"></i>
                </div>
                <input 
                  type="email" 
                  required 
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-body)] border border-[var(--glass-border)] rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-[var(--text-primary)]" 
                  autoComplete="email"
                />
              </div>

              <button 
                type="submit" 
                disabled={forgotLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white tracking-wide shadow-lg bg-indigo-600 hover:bg-indigo-500 flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
              >
                {forgotLoading ? <><i className="fas fa-circle-notch fa-spin"></i> Sending...</> : "Send Reset Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
