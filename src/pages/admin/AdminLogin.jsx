import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

export default function AdminLogin() {
  const [pass, setPass] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [state, setState] = useState('loading'); // 'loading', 'login', or 'ghost'
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const key = searchParams.get('key');
    const token = localStorage.getItem('admin_token');

    const checkAccess = async () => {
      try {
        // Agar URL me ?key= hai, to verify karo
        if (key) {
          const res = await fetch(`${API}/api/admin/access`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) 
          });
          const d = await res.json();
          if (!d.valid) return setState('ghost');
        } 
        // Agar token bhi nahi hai aur key bhi nahi hai, to 404 fake page dikhao (Ghost Mode)
        else if (!token) {
          return setState('ghost');
        }

        // Setup status check
        const sys = await fetch(`${API}/api/admin/status`);
        const sd = await sys.json();
        
        if (!sd.is_setup) { 
          setIsSetup(true); 
          setState('login'); 
        } else if (token) { 
          navigate('/admin'); // Token hai to seedha admin dashboard bhejo
        } else {
          setState('login');
        }
      } catch { 
        setState('login'); 
      }
    };
    
    checkAccess();
  }, [navigate, searchParams]);

  const doLogin = async () => {
    if (!pass) return;
    try {
      const ep = isSetup ? '/api/admin/setup' : '/api/admin/login';
      const res = await fetch(`${API}${ep}`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pass }) 
      });
      const d = await res.json();
      
      if (d.token) { 
        localStorage.setItem('admin_token', d.token); 
        navigate('/admin'); // Login success hone ke baad dashboard me bhejo
      } else {
        alert(d.error || 'Wrong password');
      }
    } catch { 
      alert('Connection error'); 
    }
  };

  // 👻 GHOST MODE: Kisi ko pata nahi chalega ki ye admin login hai
  if (state === 'ghost') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-5xl font-bold text-slate-700">404</p>
    </div>
  );

  if (state === 'loading') return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] rounded-full border-slate-200 border-t-violet-500 animate-spin" />
    </div>
  );

  // 🔒 LOGIN UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-violet-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 animate-fadeIn">
        <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <i className="fas fa-shield-halved text-violet-600 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 text-center mb-1">{isSetup ? 'Setup Admin' : 'Admin Login'}</h2>
        <p className="text-xs text-slate-400 text-center mb-6">Enter your password to continue</p>
        <input 
          type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()}
          placeholder="••••••••" 
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-violet-400 text-center font-bold mb-4 bg-slate-50 focus:bg-white" 
        />
        <button onClick={doLogin} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors shadow-sm">
          {isSetup ? 'Create Admin' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}
