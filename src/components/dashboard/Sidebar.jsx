import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeSection, setActiveSection, isMobileOpen, setIsMobileOpen, user }) => {
  const navigate = useNavigate();
  const isAdmin = user && (user.role === 1 || user.role === 'admin' || user.role === 'owner' || user.role === 'manager');

  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (['files', 'history'].includes(activeSection)) setIsManageOpen(true);
    if (['api', 'quicklink', 'mass-shrinker', 'full-page'].includes(activeSection)) setIsToolsOpen(true);
    if (['profile'].includes(activeSection)) setIsSettingsOpen(true);
  }, [activeSection]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/login');
  };

  const manageNav = [
    { id: 'files', label: 'All Files' },
    { id: 'history', label: 'All Links' },
  ];

  const toolNav = [
    { id: 'quicklink', label: 'Quick Link' },
    { id: 'mass-shrinker', label: 'Mass Shrinker' },
    { id: 'full-page', label: 'Full Page Script' },
    { id: 'api', label: 'Developers API' },
  ];

  const renderSingleButton = (id, icon, label) => (
    <button key={id} onClick={() => { setActiveSection(id); setIsMobileOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all font-medium text-left ${activeSection === id ? 'bg-indigo-600/10 text-indigo-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
      <i className={`fas ${icon} w-5 text-center ${activeSection === id ? 'text-indigo-500' : 'text-slate-500'}`}></i>
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {isMobileOpen && <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]" onClick={() => setIsMobileOpen(false)}></div>}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-[#0f172a] border-r border-slate-800 flex flex-col transition-transform duration-300 z-[80] shadow-2xl ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <i className="fas fa-crown text-lg"></i>
            </div>
            <span className="text-xl font-extrabold tracking-wide text-white">URLKING</span>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setIsMobileOpen(false)}>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide">

          {renderSingleButton('create', 'fa-home', 'Statistics')}
          {renderSingleButton('upload', 'fa-cloud-upload-alt', 'Upload File')}

          <div className="mb-1">
            <button 
              onClick={() => setIsManageOpen(!isManageOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-left ${isManageOpen ? 'bg-slate-800/50 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <i className={`fas fa-folder-open w-5 text-center ${isManageOpen ? 'text-indigo-400' : 'text-slate-500'}`}></i> Files & Links
              </div>
              <i className={`fas fa-chevron-left text-xs transition-transform duration-300 ${isManageOpen ? '-rotate-90 text-slate-300' : 'text-slate-500'}`}></i>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isManageOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col py-1">
                {manageNav.map(item => (
                  <button key={item.id} onClick={() => { setActiveSection(item.id); setIsMobileOpen(false); }}
                    className={`w-full text-left pl-12 pr-4 py-2.5 text-sm font-medium transition-colors ${activeSection === item.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {renderSingleButton('withdraw', 'fa-dollar-sign', 'Withdraw')}

          <div className="mb-1">
            <button 
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-left ${isToolsOpen ? 'bg-slate-800/50 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <i className={`fas fa-wrench w-5 text-center ${isToolsOpen ? 'text-indigo-400' : 'text-slate-500'}`}></i> Tools
              </div>
              <i className={`fas fa-chevron-left text-xs transition-transform duration-300 ${isToolsOpen ? '-rotate-90 text-slate-300' : 'text-slate-500'}`}></i>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isToolsOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col py-1">
                {toolNav.map(item => (
                  <button key={item.id} onClick={() => { setActiveSection(item.id); setIsMobileOpen(false); }}
                    className={`w-full text-left pl-12 pr-4 py-2.5 text-sm font-medium transition-colors ${activeSection === item.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {renderSingleButton('referrals', 'fa-exchange-alt', 'Referrals')}

          <div className="mb-1">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-left ${isSettingsOpen ? 'bg-slate-800/50 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <i className={`fas fa-cog w-5 text-center ${isSettingsOpen ? 'text-indigo-400' : 'text-slate-500'}`}></i> Settings
              </div>
              <i className={`fas fa-chevron-left text-xs transition-transform duration-300 ${isSettingsOpen ? '-rotate-90 text-slate-300' : 'text-slate-500'}`}></i>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSettingsOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col py-1">
                <button onClick={() => { setActiveSection('profile'); setIsMobileOpen(false); }}
                  className={`w-full text-left pl-12 pr-4 py-2.5 text-sm font-medium transition-colors ${activeSection === 'profile' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  Profile
                </button>
              </div>
            </div>
          </div>

          {/* 🟢 SUPPORT CENTER YAHAN LAGA DIYA */}
          {renderSingleButton('support', 'fa-life-ring', 'Support Center')}

          {isAdmin && (
            <div className="mt-6 border-t border-slate-800 pt-4">
              <p className="px-4 text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-3">Admin Panel</p>
              {renderSingleButton('admin-users', 'fa-user-shield', 'Manage Users')}
              {renderSingleButton('admin-links', 'fa-globe', 'All Links')}
              {renderSingleButton('admin-withdraws', 'fa-money-check-alt', 'Withdrawals')}
            </div>
          )}
        </nav>

        <div className="p-4 bg-slate-800/30 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-sm text-white truncate">{user?.username || 'User'}</p>
              <p className="text-[11px] text-emerald-400 font-medium">Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-bold flex items-center justify-center gap-2">
            <i className="fas fa-power-off"></i> Logout
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
