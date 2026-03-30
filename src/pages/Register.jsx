import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Particles from '../components/Particles';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const API = "https://go.urlking.site";

  const currentRef = searchParams.get('ref') || localStorage.getItem('saved_ref_code');

  useEffect(() => {
    if (currentRef) {
      localStorage.setItem('saved_ref_code', currentRef);
    }
  }, [currentRef]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPass) return alert("Please fill in all fields.");
    if (password !== confirmPass) return alert("Passwords do not match!");
    if (password.length < 6) return alert("Password should be at least 6 characters.");

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, ref: currentRef })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      
      alert("Account created! Please sign in.");
      localStorage.removeItem('saved_ref_code');
      setTimeout(() => navigate('/login'), 1500);
    } catch (e) { 
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Particles />
      <nav className="w-full p-6 flex justify-between items-center z-50 fixed top-0 left-0">
        <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-lg transition-all hover:scale-105" style={{background: 'var(--fab-bg)', border: '1px solid var(--input-border)'}}>
          <i className="fas fa-arrow-left text-sm"></i> <span className="font-medium text-sm">Home</span>
        </Link>
        <Link to="/login" className="group flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all backdrop-blur-md">
          <span className="font-medium text-sm">Sign In</span>
          <i className="fas fa-arrow-right text-xs group-hover:translate-x-0.5 transition-transform"></i>
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen relative z-10 w-full pt-24">
        <div className="border-animated w-full max-w-[400px] mb-8">
          <div className="relative z-20 p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-700/30 mb-4 bg-slate-900 shadow-xl">
                <i className="fas fa-crown text-indigo-500 text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">URL<span className="text-indigo-500">KING</span></h1>
              <p className="text-sm mt-2 text-slate-400">Create an account today.</p>
              {currentRef && <p className="text-xs mt-2 text-purple-400 font-medium">Referred by a friend ✨</p>}
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="relative">
                <input type="text" placeholder="Username" className="input-premium w-full p-4 pl-12 rounded-xl" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              </div>
              <div className="relative">
                <input type="email" placeholder="Email Address" className="input-premium w-full p-4 pl-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              </div>
              <div className="relative">
                <input type="password" placeholder="Create Password" className="input-premium w-full p-4 pl-12 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              </div>
              <div className="relative">
                <input type="password" placeholder="Confirm Password" className="input-premium w-full p-4 pl-12 rounded-xl" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required />
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              </div>

              <button type="submit" disabled={isLoading} className="btn-premium w-full py-3.5 rounded-xl font-bold text-white shadow-lg">
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
              
              <p className="text-center text-sm mt-4 text-slate-400">
                Already a member? <Link to="/login" className="text-indigo-500 font-bold hover:underline">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
