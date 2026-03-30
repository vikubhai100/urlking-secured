import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeSection, setActiveSection, isMobileOpen, setIsMobileOpen, user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { id: 'create', icon: 'fa-plus-circle', label: 'Dashboard', color: '' },
    { id: 'upload', icon: 'fa-cloud-upload-alt', label: 'Upload File', color: '' },
    { id: 'files', icon: 'fa-folder-open', label: 'Manage Files', color: 'text-blue-400' },
    { id: 'history', icon: 'fa-history', label: 'My Links', color: '' },
    { id: 'withdraw', icon: 'fa-money-bill-wave', label: 'Withdraw', color: '' },
    { id: 'referrals', icon: 'fa-users', label: 'Referrals (5%)', color: 'text-purple-400' },
    { id: 'api', icon: 'fa-code', label: 'Developers API', color: '' },
    { id: 'quicklink', icon: 'fa-bolt', label: 'Quick Link', color: '' },
    { id: 'profile', icon: 'fa-user-cog', label: 'Settings', color: '' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <aside className={`fixed inset-y-0 left-0 w-72 bg-[var(--sidebar-bg)] border-r border-[var(--glass-border)] transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 z-50 flex flex-col`}>
        <div className="p-8 border-b border-[var(--glass-border)]">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <i className="fas fa-crown text-indigo-400"></i>
            </div>
            <span>URL<span className="text-indigo-500">KING</span></span>
          </h1>
        </div>

        <nav className="flex-1 p-6 overflow-y-auto">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveSection(item.id); setIsMobileOpen(false); }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all mb-2 ${activeSection === item.id ? 'bg-indigo-500/15 text-indigo-400 border-l-4 border-indigo-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <i className={`fas ${item.icon} w-6 text-center ${item.color}`}></i>
              <span className={`font-medium ${item.color}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-[var(--glass-border)] bg-[var(--nav-hover)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
              <i className="fas fa-user"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username || 'Loading...'}</p>
              <p className="text-xs text-green-400 truncate flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium flex items-center justify-center gap-2">
            <i className="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
