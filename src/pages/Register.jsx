import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Particles from '../components/Particles';
import { showToast } from '../toast'; // ✅ Premium Toast

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  const currentRef = searchParams.get('ref') || localStorage.getItem('saved_ref_code');

  useEffect(() => {
    // Save referral code if present
    if (currentRef) {
      localStorage.setItem('saved_ref_code', currentRef);
    }

    // 🚀 BACKGROUND PREFETCH MAGIC 🚀
    // Jab user Register page dekh raha hoga, piche se hum Login page ka JS load kar lenge 
    // kyunki Register hone ke baad usko directly login pe bhejenge.
    const prefetchLogin = setTimeout(() => {
      import('./Login').catch(() => console.log('Prefetch skipped'));
    }, 1500);

    return () => clearTimeout(prefetchLogin);
  }, [currentRef]);

  const handleRegister = async (e) => {
    e.preventDefault();

    // 🟢 BUG FIX: Data Sanitization (Space hatana aur chote akshar me karna)
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail || !password || !confirmPass) {
      return showToast("Please fill in all fields.", "error");
    }

    // Username me space allow nahi karna hai
    if (cleanUsername.includes(" ")) {
      return showToast("Username cannot contain spaces.", "error");
    }

    if (password !== confirmPass) return showToast("Passwords do not match!", "error");
    if (password.length < 6) return showToast("Password should be at least 6 characters.", "error");

    setIsLoading(true);
    try {
      // API call to create user
      const res = await fetch(`${API}/api/register`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: cleanUsername, 
          email: cleanEmail, 
          password: password, 
          ref: currentRef 
        })
      });

      const data = await res.json();

      // Handle backend errors (e.g., Username taken)
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      showToast("Account created successfully! Redirecting...", "success");
      localStorage.removeItem('saved_ref_code');
      
      // Navigate to Login instantly (kyunki wo pehle se background me preload ho chuka hai)
      setTimeout(() => navigate('/login'), 1500);

    } catch (e) { 
      showToast(e.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-primary)] flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-300">
      <Particles />

      {/* Header Navigation Elements */}
      <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-indigo-500 font-medium flex items-center gap-2 transition-colors z-20 bg-[var(--glass-panel)] border border-[var(--glass-border)] px-5 py-2.5 rounded-full backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-0.5">
        <i className="fas fa-arrow-left text-sm"></i> <span className="text-sm font-bold">Home</span>
      </Link>

      <Link to="/login" className="absolute top-8 right-8 group flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all backdrop-blur-md shadow-sm z-20">
        <span className="font-bold text-sm">Sign In</span>
        <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
      </Link>

      {/* Main Registration Area */}
      <div className="w-full max-w-md p-8 relative z-10 fade-in mt-16 md:mt-0">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-[var(--glass-border)] mb-4 shadow-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10">
            <i className="fas fa-crown text-indigo-500 text-3xl drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"></i>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
            URL<span className="text-indigo-500">KING</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium">Create your account today.</p>
          
          {currentRef && (
            <div className="mt-3">
              <span className="text-xs font-bold px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full inline-flex items-center shadow-sm">
                <i className="fas fa-gift mr-1.5"></i> Referred by a friend ✨
              </span>
            </div>
          )}
        </div>

        {/* Registration Form */}
        <div className="bg-[var(--glass-panel)] border border-[var(--glass-border)] rounded-3xl p-6 shadow-2xl backdrop-blur-md mb-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-secondary)] opacity-70">
                <i className="fas fa-user"></i>
              </div>
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-body)] border border-[var(--glass-border)] rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-[var(--text-primary)]" 
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-secondary)] opacity-70">
                <i className="fas fa-envelope"></i>
              </div>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-body)] border border-[var(--glass-border)] rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-[var(--text-primary)]" 
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-secondary)] opacity-70">
                <i className="fas fa-lock"></i>
              </div>
              <input 
                type="password" 
                placeholder="Create Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-body)] border border-[var(--glass-border)] rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-[var(--text-primary)]" 
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-secondary)] opacity-70">
                <i className="fas fa-lock"></i>
              </div>
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={confirmPass} 
                onChange={(e) => setConfirmPass(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-body)] border border-[var(--glass-border)] rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-[var(--text-primary)]" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full mt-2 py-4 rounded-xl font-bold text-white tracking-wide shadow-lg bg-indigo-600 hover:bg-indigo-500 transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <><i className="fas fa-circle-notch fa-spin text-lg"></i> Creating Account...</> : <><i className="fas fa-user-plus"></i> Join URLKING</>}
            </button>

            <p className="text-center text-sm mt-4 text-[var(--text-secondary)] font-medium">
              Already a member? 
              <Link to="/login" className="text-indigo-500 font-bold hover:text-indigo-600 transition-colors ml-1.5 underline-offset-4 hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        </div>

        {/* ✅ Info & Features Box Below Register */}
        <div className="w-full max-w-[400px] bg-[var(--glass-panel)] backdrop-blur-xl border border-[var(--glass-border)] p-6 rounded-2xl text-center shadow-lg fade-in">
          <div className="flex justify-center gap-6 mb-5">
            <div className="flex flex-col items-center gap-1.5 group cursor-default">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors shadow-sm"><i className="fas fa-link text-blue-500"></i></div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Shorten</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 group cursor-default">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:bg-green-500/20 transition-colors shadow-sm"><i className="fas fa-sack-dollar text-green-500"></i></div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Earn</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 group cursor-default">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors shadow-sm"><i className="fas fa-cloud-upload-alt text-purple-500"></i></div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Upload</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Why Join URLKING?</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
            Shorten URLs, bypass file limits with our Telegram Bot, and earn up to <strong className="text-green-500 font-bold">$5.00 CPM</strong> using our ultra-fast 2-page flow system.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
