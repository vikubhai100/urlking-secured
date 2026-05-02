import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';

const NAV = [
  { path: '/admin', icon: 'fa-chart-pie', label: 'Overview', end: true },
  { path: '/admin/users', icon: 'fa-users', label: 'Users' },
  { path: '/admin/top', icon: 'fa-trophy', label: 'Leaderboard' },
  { path: '/admin/withdrawals', icon: 'fa-wallet', label: 'Withdrawals' },
  { path: '/admin/support', icon: 'fa-headset', label: 'Support' },
  { path: '/admin/mailer', icon: 'fa-paper-plane', label: 'Mailer' },
  { path: '/admin/managers', icon: 'fa-user-shield', label: 'Managers' },
  { path: '/admin/recycle', icon: 'fa-trash', label: 'Recycle' },
  { path: '/admin/settings', icon: 'fa-sliders-h', label: 'Settings' },
];

export default function AdminLayout() {
  const [sidebar, setSidebar] = useState(false);
  const navigate = useNavigate();

  // 🔒 GATEKEEPER LOCK
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {sidebar && <div className="fixed inset-0 z-30 bg-black/30 md:hidden backdrop-blur-sm" onClick={() => setSidebar(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200 ${sidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:sticky md:top-0 md:h-screen`}>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm">
              <i className="fas fa-shield-halved text-white text-sm" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm tracking-wide">AdminPanel</p>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">URLKING SaaS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV.map(n => (
            <NavLink key={n.path} to={n.path} end={n.end} onClick={() => setSidebar(false)}
              className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-violet-50 text-violet-700 font-bold shadow-sm border border-violet-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'}`}>
              <i className={`fas ${n.icon} w-5 text-center ${n.path === window.location.pathname ? 'text-violet-600' : 'text-slate-400'}`} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 font-bold transition-colors">
            <i className="fas fa-sign-out-alt" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
          <button onClick={() => setSidebar(true)} className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-600 transition-colors">
            <i className="fas fa-bars text-sm" />
          </button>
          <span className="font-bold text-slate-800 text-sm tracking-wide">URLKING</span>
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <i className="fas fa-user-shield text-violet-600 text-xs" />
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto animate-fadeIn">
          {/* YAHAN BAAKI PAGES RENDER HONGE */}
          <Outlet /> 
        </main>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
