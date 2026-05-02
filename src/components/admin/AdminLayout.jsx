import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

export default function AdminLogin() {
  const [pass, setPass] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [state, setState] = useState('loading'); 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // 🔒 URL se '?secure=' token uthao
    const secureToken = searchParams.get('secure');
    const adminToken = localStorage.getItem('admin_token');

    const verifyAccess = async () => {
      try {
        // Step 1: Agar URL mein 'secure' token hai, toh backend se verify karo
        if (secureToken) {
          const res = await fetch(`${API}/api/admin/access`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ key: secureToken }) // Backend 'key' expect karta hai
          });
          const d = await res.json();
          
          if (d.valid) {
            // Token sahi hai, check karo system setup hai ya nahi
            const sys = await fetch(`${API}/api/admin/status`);
            const sd = await sys.json();
            setIsSetup(!sd.is_setup);
            setState('login');
          } else {
            setState('ghost'); // Galat token pe Ghost Mode
          }
        } 
        // Step 2: Agar token nahi hai par pehle se logged in (admin_token) hai
        else if (adminToken) {
          const sys = await fetch(`${API}/api/admin/status`);
          const sd = await sys.json();
          if (sd.is_setup) {
            navigate('/admin'); // Seedha dashboard bhejo
          } else {
            setState('login');
          }
        } 
        // Step 3: Kuch bhi nahi hai, toh 404 dikhao (Kisi ko login page mat dikhao)
        else {
          setState('ghost');
        }
      } catch {
        setState('ghost');
      }
    };

    verifyAccess();
  }, [navigate, searchParams]);

  const doLogin = async () => {
    if (!pass) return;
    try {
      const ep = isSetup ? '/api/admin/setup' : '/api/admin/login';
      const res = await fetch(`${API}${ep}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ password: pass }) 
      });
      const d = await res.json();
      
      if (d.token) { 
        localStorage.setItem('admin_token', d.token); 
        navigate('/admin'); 
      } else {
        alert(d.error || 'Wrong password');
      }
    } catch { 
      alert('Connection error'); 
    }
  };

  // 👻 GHOST MODE: Yeh screen kisi aam user ko admin panel dhoondhne se rokegi
  if (state === 'ghost') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-7xl font-bold text-slate-800 mb-2">404</p>
          <p className="text-slate-600 text-sm font-medium tracking-widest uppercase">Page Not Found</p>
        </div>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] rounded-full border-slate-200 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  // 🔒 SECURE LOGIN UI (Sirf tabhi dikhega jab URL me sahi secure token ho)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-violet-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 animate-fadeIn">
        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-fingerprint text-violet-600 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
          {isSetup ? 'Initialize SaaS' : 'Identity Verify'}
        </h2>
        <p className="text-xs text-slate-400 text-center mb-8 uppercase tracking-widest font-semibold">
          URLKING Admin Gateway
        </p>
        
        <div className="space-y-4">
          <input 
            type="password" 
            value={pass} 
            onChange={e => setPass(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && doLogin()}
            placeholder="ENTER ADMIN KEY" 
            className="w-full px-4 py-4 rounded-2xl border border-slate-100 text-slate-800 outline-none focus:border-violet-400 text-center font-mono font-bold bg-slate-50 transition-all placeholder:text-slate-300" 
          />
          <button 
            onClick={doLogin} 
            className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-violet-500/20 active:scale-95"
          >
            {isSetup ? 'COMPLETE SETUP' : 'ACCESS DASHBOARD'}
          </button>
        </div>
      </div>
    </div>
  );
}
