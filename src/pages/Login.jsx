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
        showToast("Welcome back to URLKING!", "success");
        navigate("/dashboard");
      } else {
        showToast(data.message || "Invalid Credentials", "error");
      }
    } catch (err) {
      showToast("Server Error! Check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      return showToast("Please enter your email address", "error");
    }

    setForgotLoading(true);
    try {
      // Yahan aapke backend ka forgot password API aayega
      const res = await fetch(`${API}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (res.ok || res.status === 200) {
        showToast("Password reset link sent to your email!", "success");
        setForgotModalOpen(false);
        setForgotEmail(''); // Reset field
      } else {
        showToast(data.message || "Email not found", "error");
      }
    } catch (err) {
      // Agar API abhi ready nahi hai, toh as a fallback error dikhayega
      showToast("Server Error! Reset link could not be sent.", "error");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-primary)] flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-300">
      <Particles />
      
      <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-indigo-400 font-medium flex items-center gap-2 transition-colors z-20">
        <i className="fas fa-arrow-left"></i> Home
      </Link>
      <Link to="/register" className="absolute top-8 right-8 text-slate-400 hover:text-indigo-400 font-medium flex items-center gap-2 transition-colors z-20">
        Sign Up Free <i className="fas fa-arrow-right"></i>
      </Link>

      <div className="w-full max-w-md p-8 relative z-10 fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto bg-[var(--glass-card)] rounded-2xl flex items-center justify-center text-3xl text-indigo-500 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] border border-[var(--glass-border)]">
            <i className="fas fa-crown"></i>
          </div>
          <h2 className="text-4xl font-extrabold mb-3 text-[var(--text-primary)]">Welcome Back</h2>
          <p className="text-slate-400 text-lg">Log in to manage your empire.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <i className="fas fa-envelope"></i>
            </div>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 input-premium rounded-xl" 
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <i className="fas fa-lock"></i>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 input-premium rounded-xl" 
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" className="rounded border-[var(--glass-border)] bg-[var(--input-bg)] text-indigo-500 focus:ring-indigo-500" />
              Keep me logged in
            </label>
            {/* FIXED FORGOT PASSWORD BUTTON */}
            <button 
              type="button" 
              onClick={() => setForgotModalOpen(true)} 
              className="text-indigo-500 hover:text-indigo-400 font-bold transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-action w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
            {loading ? <i className="fas fa-circle-notch fa-spin text-xl"></i> : "Access Dashboard"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400">
          No account? <Link to="/register" className="text-indigo-500 font-bold hover:underline">Get started</Link>
        </p>
      </div>

      {/* =========================================
          FORGOT PASSWORD MODAL
          ========================================= */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setForgotModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-[var(--text-primary)] transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>

            <div className="w-20 h-20 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
              <i className="fas fa-unlock-alt text-3xl text-indigo-500"></i>
            </div>
            
            <h3 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Reset Password</h3>
            <p className="text-sm text-slate-400 mb-6">Enter your registered email address and we'll send you a link to reset your password.</p>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative text-left">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <i className="fas fa-envelope text-sm"></i>
                </div>
                <input 
                  type="email" 
                  required 
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full pl-10 pr-4 py-3 input-premium rounded-xl text-sm" 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={forgotLoading}
                className="btn-action w-full py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
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
