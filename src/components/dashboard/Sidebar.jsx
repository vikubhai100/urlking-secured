import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeSection, setActiveSection, isMobileOpen, setIsMobileOpen, user }) => {
  const navigate = useNavigate();
  const isAdmin = user && (user.role === 1 || user.role === 'admin' || user.role === 'owner' || user.role === 'manager');

  const navItems = [
    { id: 'create', icon: 'fa-home', label: 'Dashboard' },
    { id: 'upload', icon: 'fa-cloud-upload-alt', label: 'Upload File' },
    { id: 'files', icon: 'fa-folder-open', label: 'Manage Files' },
    { id: 'history', icon: 'fa-link', label: 'Links History' },
    { id: 'withdraw', icon: 'fa-wallet', label: 'Withdraw' },
    { id: 'referrals', icon: 'fa-users', label: 'Referrals' },
  ];

  // 🟢 NAYA CODE: Tools Section ke items alag kar diye taaki UI clean rahe
  const toolItems = [
    { id: 'api', icon: 'fa-code', label: 'Developer API' },
    { id: 'quicklink', icon: 'fa-bolt', label: 'Quick Link' },
    { id: 'mass-shrinker', icon: 'fa-compress-arrows-alt', label: 'Mass Shrinker' }, // Naya Tool
    { id: 'full-page', icon: 'fa-globe', label: 'Full Page Script' }, // Naya Tool
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/login');
  };

  return (
    <>
      {isMobileOpen && <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]" onClick={() => setIsMobileOpen(false)}></div>}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-[var(--sidebar-bg)] border-r border-[var(--glass-border)] flex flex-col transition-transform duration-300 z-[80] shadow-2xl backdrop-blur-xl ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white"><i className="fas fa-crown text-lg"></i></div>
            <span className="text-xl font-extrabold tracking-wide text-[var(--text-primary)]">URLKING</span>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setIsMobileOpen(false)}><i className="fas fa-times text-xl"></i></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">Main Menu</p>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setIsMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${activeSection === item.id ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'text-slate-400 hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)]'}`}>
              <i className={`fas ${item.icon} w-5 text-center ${activeSection === item.id ? 'text-indigo-500' : 'text-slate-500'}`}></i>{item.label}
            </button>
          ))}

          {/* 🟢 NAYA CODE: Tools Menu Section */}
          <p className="px-4 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 mt-6">Tools</p>
          {toolItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setIsMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${activeSection === item.id ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'text-slate-400 hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)]'}`}>
              <i className={`fas ${item.icon} w-5 text-center ${activeSection === item.id ? 'text-indigo-500' : 'text-slate-500'}`}></i>{item.label}
            </button>
          ))}

          {/* Settings Button */}
          <div className="mt-4 border-t border-white/5 pt-4">
            <button onClick={() => { setActiveSection('profile'); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${activeSection === 'profile' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'text-slate-400 hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)]'}`}>
                <i className={`fas fa-cog w-5 text-center ${activeSection === 'profile' ? 'text-indigo-500' : 'text-slate-500'}`}></i>Settings
            </button>
          </div>

          {isAdmin && (
            <>
              <p className="px-4 text-xs font-bold text-pink-500 uppercase tracking-wider mb-2 mt-6">Administration</p>
              <button onClick={() => { setActiveSection('admin-users'); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${activeSection === 'admin-users' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'text-slate-400 hover:bg-[var(--nav-hover)]'}`}>
                <i className="fas fa-user-shield w-5 text-center"></i> Manage Users
              </button>
              <button onClick={() => { setActiveSection('admin-links'); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${activeSection === 'admin-links' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'text-slate-400 hover:bg-[var(--nav-hover)]'}`}>
                <i className="fas fa-globe w-5 text-center"></i> All Links
              </button>
              <button onClick={() => { setActiveSection('admin-withdraws'); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${activeSection === 'admin-withdraws' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'text-slate-400 hover:bg-[var(--nav-hover)]'}`}>
                <i className="fas fa-money-check-alt w-5 text-center"></i> Withdrawals
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--nav-hover)]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              {/* Online Green Dot */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[var(--sidebar-bg)] rounded-full"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-sm text-[var(--text-primary)] truncate">{user?.username || 'User'}</p>
              {/* Online Text */}
              <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium flex items-center justify-center gap-2">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
