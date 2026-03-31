import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Particles from '../components/Particles';
import { showToast } from '../toast'; // Premium Toast

const Login = () => {
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password States
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  
  const navigate = useNavigate();
  const API = "https://go.urlking.site";

  // --- LOGIN LOGIC ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);
        showToast("Welcome back!", "success"); // Original jaisa message
        // Original ki tarah 1 second ka delay taaki toast dikh sake
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        // Original ki tarah data.error catch kiya
        showToast(data.error || "Login failed", "error");
      }
    } catch (err) {
      showToast("Server Error! Check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD LOGIC (FIXED ENDPOINT) ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      return showToast("Please enter your email address", "error");
    }

    setForgotLoading(true);
    try {
      // YAHAN FIX KIYA HAI: /api/auth/forgot-password (Original HTML wala)
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      
      if (res.ok) {
        showToast("Reset link sent to your email!", "success");
        setForgotModalOpen(false);
        setForgotEmail(''); // Reset field
      } else {
        // Backend ka asli error message pakdega
        showToast(data.error || "Failed to send link", "error");
      }
    } catch (err) {
      showToast("Server Error. Check console.", "error");
      console.error(err);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-primary)] flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-300">
      <Particles />
      
      <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-indigo-400 font-medium flex items-center gap-2 transition-colors z-20 bg-[var(--fab-bg)] border border-[var(--input-border)] px-4 py-2 rounded-full backdrop-blur-md shadow-lg hover:scale-105">
        <i className="fas fa-arrow-left text-sm"></i> <span className="text-sm">Home</span>
      </Link>
      
      <Link to="/register" className="absolute top-8 right-8 group flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all backdrop-blur-md shadow-lg z-20">
        <span className="font-medium text-sm">Sign Up Free</span>
        <i className="fas fa-arrow-right text-xs group-hover:translate-x-0.5 transition-transform"></i>
      </Link>

      <div className="w-full max-w-md p-8 relative z-10 fade-in mt-12 md:mt-0">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-700/30 mb-4 shadow-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] light:from-white light:to-[#f1f5f9]">
            <i className="fas fa-crown text-indigo-500 text-2xl drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"></i>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
            URL<span className="text-indigo-500">KING</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Welcome back, Creator.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--input-icon)]">
              <i className="fas fa-envelope"></i>
            </div>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 input-premium rounded-xl text-sm" 
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--input-icon)]">
              <i className="fas fa-lock"></i>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 input-premium rounded-xl text-sm" 
            />
          </div>

          <div className="flex items-center justify-between text-xs px-1 text-[var(--text-secondary)]">
            <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-500 transition-colors">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 accent-indigo-500" />
              Keep me logged in
            </label>
            <button 
              type="button" 
              onClick={() => setForgotModalOpen(true)} 
              className="text-indigo-500 hover:text-indigo-400 font-semibold transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-premium w-full py-3.5 rounded-xl font-bold text-white tracking-wide shadow-lg transform active:scale-95 transition-transform flex justify-center items-center">
            {loading ? <i className="fas fa-circle-notch fa-spin text-lg"></i> : "Access Dashboard"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-[var(--text-secondary)]">
          No account? 
          <Link to="/register" className="text-indigo-500 font-bold hover:text-indigo-400 transition-colors ml-1 underline-offset-4 hover:underline">
            Get started
          </Link>
        </p>
      </div>

      {/* Stats Footer like original */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-[600px] text-center px-4 mt-8 relative z-10 fade-in">
        <div className="flex flex-col items-center gap-2 p-4 bg-[var(--nav-hover)] rounded-2xl border border-[var(--input-border)] hover:-translate-y-1 transition-transform shadow-sm">
          <i className="fas fa-users text-indigo-500 text-lg"></i>
          <span className="text-xs font-bold text-[var(--text-secondary)]">10K+ Users</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-[var(--nav-hover)] rounded-2xl border border-[var(--input-border)] hover:-translate-y-1 transition-transform shadow-sm">
          <i className="fas fa-link text-indigo-500 text-lg"></i>
          <span className="text-xs font-bold text-[var(--text-secondary)]">50M+ Links</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-[var(--nav-hover)] rounded-2xl border border-[var(--input-border)] hover:-translate-y-1 transition-transform shadow-sm">
          <i className="fas fa-shield-alt text-indigo-500 text-lg"></i>
          <span className="text-xs font-bold text-[var(--text-secondary)]">Secure</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-[var(--nav-hover)] rounded-2xl border border-[var(--input-border)] hover:-translate-y-1 transition-transform shadow-sm">
          <i className="fas fa-bolt text-indigo-500 text-lg"></i>
          <span className="text-xs font-bold text-[var(--text-secondary)]">Fast</span>
        </div>
      </div>

      {/* =========================================
          FORGOT PASSWORD MODAL
          ========================================= */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in">
          <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] w-full max-w-[380px] rounded-3xl p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative transform scale-100 transition-transform">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Reset Password</h3>
              <button 
                onClick={() => setForgotModalOpen(false)} 
                className="text-slate-500 hover:text-red-500 transition-colors"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <p className="text-sm mb-6 text-[var(--text-secondary)]">
              Enter your registered email address. We'll send you a secure link to reset your password.
            </p>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative text-left">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--input-icon)]">
                  <i className="fas fa-envelope text-sm"></i>
                </div>
                <input 
                  type="email" 
                  required 
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full pl-10 pr-4 py-3 input-premium rounded-xl text-sm" 
                  autoComplete="email"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={forgotLoading}
                className="btn-premium w-full py-3 rounded-xl font-bold text-white tracking-wide shadow-lg flex justify-center items-center gap-2"
              >
                {forgotLoading ? <i className="fas fa-circle-notch fa-spin"></i> : "Send Reset Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
