import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Particles from '../components/Particles';
import { showToast } from '../toast'; // Toast import kar liya

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://go.urlking.site/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        // NATIVE ALERT HATA DIYA, ORIGINAL TOAST LAGA DIYA
        showToast("Welcome back to URLKING!", "success");
        navigate("/dashboard");
      } else {
        showToast(data.message || "Invalid Credentials", "error");
      }
    } catch (err) {
      showToast("Server Error! Try again.", "error");
    } finally {
      setLoading(false);
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

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto bg-[var(--glass-card)] rounded-2xl flex items-center justify-center text-3xl text-indigo-500 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] border border-[var(--glass-border)]">
            <i className="fas fa-crown"></i>
          </div>
          <h2 className="text-4xl font-extrabold mb-3">Welcome Back</h2>
          <p className="text-slate-400 text-lg">Log in to manage your empire.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <i className="fas fa-envelope"></i>
            </div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 input-premium rounded-xl" />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <i className="fas fa-lock"></i>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password"
              className="w-full pl-12 pr-4 py-4 input-premium rounded-xl" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500" />
              Keep me logged in
            </label>
            <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Forgot Password?</a>
          </div>

          <button type="submit" disabled={loading} className="btn-action w-full py-4 rounded-xl font-bold text-lg">
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : "Access Dashboard"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400">
          No account? <Link to="/register" className="text-indigo-400 font-bold hover:underline">Get started</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
