import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Particles from '../components/Particles';
import { showToast } from '../toast'; // ✅ Premium Toast Added

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
    if (currentRef) {
      localStorage.setItem('saved_ref_code', currentRef);
    }
  }, [currentRef]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPass) return showToast("Please fill in all fields.", "error");
    if (password !== confirmPass) return showToast("Passwords do not match!", "error");
    if (password.length < 6) return showToast("Password should be at least 6 characters.", "error");

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, ref: currentRef })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      showToast("Account created successfully! Redirecting...", "success");
      localStorage.removeItem('saved_ref_code');
      setTimeout(() => navigate('/login'), 1500);
    } catch (e) { 
      showToast(e.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Particles />
      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center z-50 fixed top-0 left-0">
        <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-lg transition-all hover:scale-105" style={{background: 'var(--fab-bg)', border: '1px solid var(--input-border)'}}>
          <i className="fas fa-arrow-left text-sm"></i> <span className="font-medium text-sm">Home</span>
        </Link>
        <Link to="/login" className="group flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all backdrop-blur-md">
          <span className="font-medium text-sm">Sign In</span>
          <i className="fas fa-arrow-right text-xs group-hover:translate-x-0.5 transition-transform"></i>
        </Link>
      </nav>

      {/* Main Registration Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen relative z-10 w-full pt-24 pb-12">
        
        {/* Registration Card */}
        <div className="border-animated w-full max-w-[400px] mb-6 shadow-2xl">
          <div className="relative z-20 p-8 md:p-10 bg-slate-900 rounded-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-700/30 mb-4 bg-slate-800 shadow-xl">
                <i className="fas fa-crown text-indigo-500 text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">URL<span className="text-indigo-500">KING</span></h1>
              <p className="text-sm mt-2 text-slate-400">Create an account today.</p>
              {currentRef && <p className="text-xs mt-2 text-purple-400 font-bold px-3 py-1 bg-purple-500/10 inline-block rounded-full border border-purple-500/20"><i className="fas fa-gift mr-1"></i> Referred by a friend ✨</p>}
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="relative">
                <input type="text" placeholder="Username" className="input-premium w-full p-4 pl-12 rounded-xl text-white bg-slate-800/50 border border-white/5 focus:border-indigo-500/50" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              </div>
              <div className="relative">
                <input type="email" placeholder="Email Address" className="input-premium w-full p-4 pl-12 rounded-xl text-white bg-slate-800/50 border border-white/5 focus:border-indigo-500/50" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              </div>
              <div className="relative">
                <input type="password" placeholder="Create Password" className="input-premium w-full p-4 pl-12 rounded-xl text-white bg-slate-800/50 border border-white/5 focus:border-indigo-500/50" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              </div>
              <div className="relative">
                <input type="password" placeholder="Confirm Password" className="input-premium w-full p-4 pl-12 rounded-xl text-white bg-slate-800/50 border border-white/5 focus:border-indigo-500/50" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required />
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-user-plus"></i> Create Account</>}
              </button>

              <p className="text-center text-sm mt-4 text-slate-400">
                Already a member? <Link to="/login" className="text-indigo-500 font-bold hover:text-indigo-400 transition-colors">Sign in here</Link>
              </p>
            </form>
          </div>
        </div>

        {/* ✅ Info & Features Box Below Login */}
        <div className="w-full max-w-[400px] bg-slate-900/60 backdrop-blur-xl border border-white/5 p-6 rounded-2xl text-center shadow-2xl">
          <div className="flex justify-center gap-6 mb-4">
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors"><i className="fas fa-link text-blue-400"></i></div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Shorten</span>
            </div>
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:bg-green-500/20 transition-colors"><i className="fas fa-sack-dollar text-green-400"></i></div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Earn</span>
            </div>
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors"><i className="fas fa-cloud-upload-alt text-purple-400"></i></div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Upload</span>
            </div>
          </div>
          
          <h3 className="text-sm font-bold text-white mb-2">Why Join URLKING?</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Shorten URLs, bypass file limits with our powerful Telegram Bot, and earn up to <strong className="text-green-400">$5.00 CPM</strong> using our ultra-fast 2-page flow system.
          </p>
        </div>

      </div>
    </>
  );
};

export default Register;
