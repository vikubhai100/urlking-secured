import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Particles from '../components/Particles';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const navigate = useNavigate();

  const API = "https://go.urlking.site";

  useEffect(() => {
    if (localStorage.getItem("token")) navigate('/dashboard');
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill in all fields.");

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Login failed");
      
      alert("Welcome back!");
      localStorage.setItem("token", data.token);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (e) { 
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPass = async () => {
    if(!forgotEmail) return alert("Please enter email");
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      if(res.ok) {
        alert("Reset link sent to your email!");
        setShowForgot(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send link");
      }
    } catch (e) {
      alert("Server Error.");
    }
  };

  return (
    <>
      <Particles />
      <nav className="w-full p-6 flex justify-between items-center z-50 fixed top-0 left-0">
        <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-lg transition-all hover:scale-105" style={{background: 'var(--fab-bg)', border: '1px solid var(--input-border)'}}>
          <i className="fas fa-arrow-left text-sm"></i> <span className="font-medium text-sm">Home</span>
        </Link>
        <Link to="/register" className="group flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all backdrop-blur-md">
          <span className="font-medium text-sm">Sign Up Free</span>
          <i className="fas fa-arrow-right text-xs group-hover:translate-x-0.5 transition-transform"></i>
        </Link>
      </nav>

      {showForgot && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--glass-panel)] border border-[var(--glass-border)] w-full max-w-sm rounded-2xl p-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Reset Password</h3>
              <button onClick={() => setShowForgot(false)} className="text-slate-500 hover:text-red-500"><i className="fas fa-times"></i></button>
            </div>
            <p className="text-sm mb-6 text-slate-400">Enter your registered email address to receive a secure reset link.</p>
            <input type="email" placeholder="Enter your email" className="input-premium w-full p-3 rounded-xl mb-4" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
            <button onClick={handleForgotPass} className="btn-premium w-full py-3 rounded-xl font-bold">Send Reset Link</button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen relative z-10 w-full pt-24">
        <div className="border-animated w-full max-w-[400px] mb-8">
          <div className="relative z-20 p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-700/30 mb-4 bg-slate-900 shadow-xl">
                <i className="fas fa-crown text-indigo-500 text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">URL<span className="text-indigo-500">KING</span></h1>
              <p className="text-sm mt-2" style={{color: 'var(--text-secondary)'}}>Welcome back, Creator.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <input type="email" placeholder="Email Address" className="input-premium w-full p-4 pl-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              </div>
              <div className="relative">
                <input type="password" placeholder="Password" className="input-premium w-full p-4 pl-12 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              </div>
              
              <div className="flex items-center justify-between text-xs px-1">
                <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-500 transition-colors text-slate-400">
                  <input type="checkbox" className="w-4 h-4 rounded accent-indigo-500" /> Keep me logged in
                </label>
                <button type="button" onClick={() => setShowForgot(true)} className="text-indigo-500 hover:text-indigo-400 font-semibold">Forgot Password?</button>
              </div>

              <button type="submit" disabled={isLoading} className="btn-premium w-full py-3.5 rounded-xl font-bold text-white shadow-lg">
                {isLoading ? 'Loading...' : 'Access Dashboard'}
              </button>
              
              <p className="text-center text-sm mt-4 text-slate-400">
                No account? <Link to="/register" className="text-indigo-500 font-bold hover:underline">Get started</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
