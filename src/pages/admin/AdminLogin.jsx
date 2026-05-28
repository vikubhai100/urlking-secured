import { getApiUrl } from '../../security';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showToast } from '../../toast'; // 🔒 SECURITY: Use toast instead of alert()

const API = getApiUrl();

export default function AdminLogin() {
  const [pass, setPass] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [state, setState] = useState('loading');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const key = searchParams.get('key');
    const token = localStorage.getItem('admin_token');

    const checkAccess = async () => {
      try {
        if (key) {
          const res = await fetch(`${API}/api/admin/access`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) 
          });
          const d = await res.json();
          if (!d.valid) return setState('ghost');
        } 
        else if (!token) {
          return setState('ghost');
        }

        const sys = await fetch(`${API}/api/admin/status`);
        const sd = await sys.json();
        
        if (!sd.is_setup) { 
          setIsSetup(true); 
          setState('login'); 
        } else if (token) { 
          navigate('/admin');
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
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // 🔒 CSRF protection header
        }, 
        body: JSON.stringify({ password: pass }) 
      });
      const d = await res.json();
      
      if (d.token) { 
        localStorage.setItem('admin_token', d.token); 
        navigate('/admin');
      } else {
        // 🔒 SECURITY FIX: Replace alert() with secure toast (prevents spoofing)
        showToast(d.error || 'Wrong password', 'error');
      }
    } catch { 
      showToast('Connection error', 'error');
    }
  };

  if (state === 'ghost') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center select-none">
      <div className="text-center">
        <p className="text-[10rem] font-black leading-none tracking-tighter" style={{color:'#111827'}}>404</p>
        <p className="text-gray-800 text-xs uppercase tracking-[0.3em] mt-2">Page not found</p>
      </div>
    </div>
  );

  if (state === 'loading') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-7 h-7 border-2 rounded-full border-gray-800 border-t-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)'}} />
      
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'50px 50px'}} />

      <div className="relative w-full max-w-sm">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-[18px] flex items-center justify-center border border-emerald-500/20 bg-emerald-500/10">
              <i className="fas fa-shield-halved text-emerald-400 text-2xl" />
            </div>
            <div className="absolute -inset-3 rounded-[26px] bg-emerald-500/5 blur-xl pointer-events-none" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isSetup ? 'Initial Setup' : 'Admin Portal'}
          </h1>
          <p className="text-gray-600 text-sm mt-1.5">Authorized access only</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 shadow-2xl shadow-black/50">
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              {isSetup ? 'Set New Password' : 'Password'}
            </label>
            <input 
              type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()}
              placeholder="••••••••••••" 
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-600 outline-none text-sm transition-all"
              style={{caretColor: '#10b981'}}
              onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.4)'}
              onBlur={e => e.target.style.borderColor=''}
            />
          </div>

          <button onClick={doLogin} 
            className="w-full py-3 rounded-xl font-black text-sm transition-all active:scale-[0.98]"
            style={{background:'linear-gradient(135deg,#10b981,#059669)',color:'#f0fdf4',boxShadow:'0 8px 24px rgba(16,185,129,0.25)'}}>
            {isSetup ? 'Create Admin Account' : 'Sign In →'}
          </button>
        </div>

        <p className="text-center text-gray-800 text-xs mt-6">Protected with ghost access control</p>
      </div>
    </div>
  );
}
