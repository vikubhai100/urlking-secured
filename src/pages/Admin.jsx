import React, { useState, useEffect, useRef, useCallback } from 'react';
import { showToast } from '../../toast'; 

const AdminConsole = () => {
  const [appState, setAppState] = useState('loading'); 
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [password, setPassword] = useState('');
  const [adminToken, setAdminToken] = useState(localStorage.getItem('admin_token') || '');

  const [activeTab, setActiveTab] = useState('users'); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingSection, setIsLoadingSection] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalClicks: 0, totalPayout: 0, todayEarn: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // 🔥 Added 'loading' state for lazy loading user details
  const [userModal, setUserModal] = useState({ open: false, activeTab: 'profile', data: null, loading: false });
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', payload: null, title: '', msg: '', btnText: '', btnClass: '' });

  const [globalCpm, setGlobalCpm] = useState('0.50');
  const [mailerForm, setMailerForm] = useState({ adminKey: '', subject: '', title: '', message: '' });
  const [mailerStatus, setMailerStatus] = useState({ loading: false, result: null, isError: false });

  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
  const canvasRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get('key');

    const checkAccess = async () => {
      if (!urlKey && adminToken) return checkSystem();
      if (!urlKey && !adminToken) return setAppState('ghost');
      try {
        const res = await fetch(`${API}/api/admin/access`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: urlKey })
        });
        const data = await res.json();
        if (data.valid) checkSystem();
        else setAppState('ghost');
      } catch (e) { setAppState('ghost'); }
    };
    checkAccess();
  }, []);

  const checkSystem = async () => {
    try {
      const res = await fetch(`${API}/api/admin/status`);
      const data = await res.json();
      if (!data.is_setup) { setIsSetupMode(true); setAppState('login'); } 
      else if (adminToken) { setAppState('dashboard'); loadUsers(); } 
      else { setAppState('login'); }
    } catch (e) {
      showToast("Backend Offline", "error");
      setAppState('login');
    }
  };

  // 🔥 FIX: Direct token passing to ensure immediate fetch on login
  const doLogin = async () => {
    if (!password) return showToast("Enter password", "error");
    const endpoint = isSetupMode ? "/api/admin/setup" : "/api/admin/login";
    try {
      const res = await fetch(`${API}${endpoint}`, { 
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) 
      });
      const data = await res.json();
      if (data.token || data.ok) {
        if (data.token) { 
          localStorage.setItem('admin_token', data.token); 
          setAdminToken(data.token); 
          setAppState('dashboard'); 
          loadUsers(data.token); // Pass token directly here
        }
      } else { showToast(data.error || "Error", "error"); }
    } catch (e) { showToast("Connection Error", "error"); }
  };

  const logout = () => {
    if (adminToken) fetch(`${API}/api/admin/logout`, { method: "POST", headers: { 'x-admin-token': adminToken } }).catch(e => {});
    localStorage.removeItem('admin_token'); window.location.reload();
  };

  // Particles Background
  useEffect(() => {
    if (appState !== 'dashboard' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let particles = [];
    for (let i = 0; i < 40; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, dx: (Math.random() - 0.5) * 0.5, dy: (Math.random() - 0.5) * 0.5 });
    
    let animationFrameId;
    const anim = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(239,68,68,0.15)';
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
      });
      animationFrameId = requestAnimationFrame(anim);
    };
    anim();
    return () => cancelAnimationFrame(animationFrameId);
  }, [appState]);

  // 🔥 Updated loadUsers to accept override token
  const loadUsers = useCallback(async (tokenOverride) => {
    const tokenToUse = tokenOverride || adminToken || localStorage.getItem('admin_token');
    if (!tokenToUse) return;
    setIsLoadingSection(true);
    const isRecycle = activeTab === 'recycle';
    try {
      const res = await fetch(`${API}/api/admin/users?deleted=${isRecycle}`, { headers: { 'x-admin-token': tokenToUse } });
      if (res.status === 401) return logout();
      const data = await res.json();
      
      setAllUsers(data);
      filterAndSetUsers(data, activeTab, searchQuery);
      
      const tUsers = data.length;
      const tClicks = data.reduce((sum, u) => sum + (u.stats?.total || 0), 0);
      const tPayout = data.reduce((sum, u) => sum + parseFloat(u.stats?.earnings || 0), 0);
      const tToday = data.reduce((sum, u) => sum + parseFloat(u.stats?.today_earnings || 0), 0);
      
      setStats({ totalUsers: tUsers, totalClicks: tClicks, totalPayout: tPayout, todayEarn: tToday });
    } catch (e) { showToast("Failed to load users", "error"); } 
    finally { setIsLoadingSection(false); }
  }, [adminToken, activeTab, searchQuery, API]);

  useEffect(() => {
    if (appState === 'dashboard' && ['users', 'managers', 'recycle'].includes(activeTab)) { loadUsers(); } 
    else if (appState === 'dashboard' && activeTab === 'withdrawals') { loadWithdrawals(); }
  }, [activeTab]);

  const loadWithdrawals = async () => {
    setIsLoadingSection(true);
    try {
      const res = await fetch(`${API}/api/withdraw/admin/requests`, { headers: { 'x-admin-token': adminToken } });
      const data = await res.json();
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (e) { showToast("Failed to load withdrawals", "error"); } 
    finally { setIsLoadingSection(false); }
  };

  const filterAndSetUsers = (users, tab, search) => {
    let source = users;
    if (tab === 'managers') source = users.filter(u => u.role === 'manager' || u.role === 'admin');
    const term = search.toLowerCase();
    const filtered = source.filter(u => (u.username && u.username.toLowerCase().includes(term)) || (u.email && u.email.toLowerCase().includes(term)));
    setDisplayedUsers(filtered); setCurrentPage(1);
  };

  const handleSearch = (e) => { setSearchQuery(e.target.value); filterAndSetUsers(allUsers, activeTab, e.target.value); };

  const totalPages = Math.ceil(displayedUsers.length / itemsPerPage) || 1;
  const currentUsers = displayedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedUsers(currentUsers.map(u => u.uid));
    else setSelectedUsers([]);
  };
  const toggleUserSelection = (uid) => setSelectedUsers(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);

  const handleBatchAction = () => {
    if (selectedUsers.length === 0) return showToast("Select users first", "error");
    if (activeTab === 'recycle') openConfirmModal('restore', selectedUsers);
    else openConfirmModal('delete', selectedUsers);
  };

  // 🔥 LAZY LOADING LOGIC: Fetch full details only when clicked
  const openUserDetails = async (basicUser) => {
    setUserModal({ open: true, activeTab: 'profile', data: basicUser, loading: true });
    try {
      const res = await fetch(`${API}/api/admin/users/${basicUser.uid}`, { 
        headers: { 'x-admin-token': adminToken || localStorage.getItem('admin_token') } 
      });
      const fullData = await res.json();
      // Merge basic data with the heavy fetched data
      setUserModal({ open: true, activeTab: 'profile', data: { ...basicUser, ...fullData }, loading: false });
    } catch (error) {
      showToast("Could not load user details", "error");
      setUserModal(prev => ({ ...prev, loading: false }));
    }
  };

  // ... (openConfirmModal and executeConfirmAction remain unchanged) ...
  const openConfirmModal = (type, payload) => {
    let title = '', msg = '', btnText = '', btnClass = '';
    if (type === 'global_cpm') { title = "System CPM Update"; msg = `Enforce fixed CPM of $${payload} across ALL accounts.`; btnText = "Enforce CPM Update"; btnClass = "bg-green-600 hover:bg-green-500"; } 
    else if (type === 'allow_all_uploads') { title = "Unlock Mass Uploads?"; msg = `Grant 'DevUploads' permissions to every registered user.`; btnText = "Authorize All Accounts"; btnClass = "bg-purple-600 hover:bg-purple-500"; } 
    else if (type === 'promote' || type === 'demote') {
      const u = allUsers.find(x => x.uid === payload);
      title = type === 'promote' ? "Elevate Privileges" : "Revoke Privileges";
      msg = `${type === 'promote' ? 'Grant' : 'Strip'} Manager access for ${u ? u.username : 'this user'}?`;
      btnText = type === 'promote' ? "Promote to Manager" : "Demote to User";
      btnClass = type === 'promote' ? "bg-indigo-600 hover:bg-indigo-500" : "bg-orange-600 hover:bg-orange-500";
    } 
    else if (type === 'delete') { title = "Suspend Accounts?"; msg = `Move ${payload.length} account(s) to Recycle Bin.`; btnText = "Suspend Accounts"; btnClass = "bg-yellow-600 hover:bg-yellow-500 text-white"; } 
    else if (type === 'restore') { title = "Restore Accounts?"; msg = `Reactivate ${payload.length} suspended account(s).`; btnText = "Restore Access"; btnClass = "bg-green-600 hover:bg-green-500"; } 
    else if (type === 'permanent') { title = "Irreversible Deletion"; msg = `Wipe ${payload.length} user(s) completely?`; btnText = "Nuke Data Forever"; btnClass = "bg-red-600 hover:bg-red-700"; }
    setConfirmModal({ open: true, type, payload, title, msg, btnText, btnClass });
  };

  const executeConfirmAction = async () => {
    const { type, payload } = confirmModal;
    setConfirmModal(prev => ({ ...prev, open: false }));
    setIsLoadingSection(true);

    try {
      let endpoint = '', body = {}, method = 'POST';
      if (type === 'global_cpm') { endpoint = "/api/admin/global-cpm"; body = { cpm: payload }; }
      else if (type === 'allow_all_uploads') { endpoint = "/api/dev/allow-all-uploads"; }
      else if (type === 'promote' || type === 'demote') {
        const u = allUsers.find(x => x.uid === payload);
        endpoint = "/api/admin/user"; method = "PUT"; body = { uid: payload, role: type === 'promote' ? 'manager' : 'user', cpm: u.cpm, name: u.name };
      }
      else if (type === 'delete') { endpoint = "/api/admin/soft-delete"; body = { uids: payload }; }
      else if (type === 'restore') { endpoint = "/api/admin/restore"; body = { uids: payload }; }
      else if (type === 'permanent') { endpoint = "/api/admin/permanent-delete"; body = { uids: payload }; }

      const res = await fetch(`${API}${endpoint}`, { method, headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }, body: JSON.stringify(body) });
      const d = await res.json();
      
      if (d.ok || res.ok) { showToast("System updated successfully", "success"); loadUsers(); setSelectedUsers([]); } 
      else { showToast(d.error || "Action Blocked", "error"); }
    } catch (e) { showToast("Server execution failed", "error"); } 
    finally { setIsLoadingSection(false); }
  };

  // ... (Other action functions remain unchanged) ...
  const handleWithdrawalAction = async (id, action) => {
    if(!window.confirm(`Proceed to ${action.toUpperCase()} request #${id}?`)) return;
    try {
      const res = await fetch(`${API}/api/withdraw/admin/action`, {
        method: "POST", headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ id, action })
      });
      const data = await res.json();
      if(data.ok) { showToast(`Request ${action}d!`, "success"); loadWithdrawals(); } else showToast("Action failed", "error");
    } catch(e) { showToast("Server error", "error"); }
  };

  const sendBulkMail = async () => {
    const { adminKey, subject, title, message } = mailerForm;
    if (!adminKey || !subject || !title || !message) return showToast("Fill all fields!", "error");
    setMailerStatus({ loading: true, result: null, isError: false });
    try {
      const res = await fetch(`${API}/api/admin/send-bulk`, {
        method: "POST", headers: { "Content-Type": "application/json", 'x-admin-token': adminToken },
        body: JSON.stringify({ adminKey, subject, title, message })
      });
      const data = await res.json();
      if(res.ok) { setMailerStatus({ loading: false, result: data.message, isError: false }); showToast("Broadcast Complete!", "success"); } 
      else throw new Error(data.error);
    } catch(e) { setMailerStatus({ loading: false, result: e.message, isError: true }); }
  };

  const saveUserChanges = async () => {
    try {
      await fetch(`${API}/api/admin/user`, { 
          method: "PUT", headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }, 
          body: JSON.stringify({ uid: userModal.data.uid, role: userModal.data.role, cpm: userModal.data.cpm, name: userModal.data.name }) 
      });
      await fetch(`${API}/api/dev/toggle-permission`, {
          method: "POST", headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: userModal.data.uid, can_upload: userModal.data.can_upload ? 1 : 0 })
      }).catch(e=>{});

      setUserModal({ open: false, data: null, activeTab: 'profile', loading: false });
      loadUsers(); showToast("Configuration updated!", "success");
    } catch(e) { showToast("Error saving updates", "error"); }
  };

  if (appState === 'ghost') {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center text-center font-sans">
        <div><h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1><p className="text-slate-500 text-xl">Page Not Found</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden flex relative z-0">
      
      {/* CUSTOM CSS */}
      <style>{`
        .glass-panel { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); transition: transform 0.2s, box-shadow 0.2s; }
        .glass-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
        .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; border-radius: 0.75rem; color: #94a3b8; transition: all 0.2s; margin-bottom: 0.5rem; width: 100%; font-weight: 500; }
        .nav-item:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
        .nav-item.active { background: linear-gradient(90deg, rgba(239, 68, 68, 0.15), transparent); color: #f87171; border-left: 3px solid #ef4444; }
        .input-premium { background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); color: white; transition: all 0.3s; }
        .input-premium:focus { background: rgba(2, 6, 23, 0.9); border-color: #f87171; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); outline: none; }
        .btn-action { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); transition: all 0.3s; }
        .btn-action:hover:not(:disabled) { box-shadow: 0 0 15px rgba(239, 68, 68, 0.5); transform: translateY(-1px); }
        .border-animated { position: relative; background: rgba(15, 23, 42, 0.6); border-radius: 1.25rem; z-index: 1; overflow: hidden; }
        .border-animated::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: conic-gradient(transparent, rgba(239, 68, 68, 0.8), transparent 30%); animation: rotate-border 4s linear infinite; z-index: -2; }
        .border-animated::after { content: ''; position: absolute; inset: 1px; background: rgba(15, 23, 42, 0.95); border-radius: 1.2rem; z-index: -1; }
        @keyframes rotate-border { 100% { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .modal-tab { transition: all 0.2s ease; cursor: pointer; border-bottom: 2px solid transparent; padding-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600; white-space: nowrap; }
        .modal-tab:hover:not(.active) { color: #f8fafc; }
        .modal-tab.active { border-color: #6366f1; color: #818cf8; }
        .custom-checkbox { appearance: none; width: 1.2rem; height: 1.2rem; border: 2px solid #475569; border-radius: 0.35rem; cursor: pointer; position: relative; transition: all 0.2s; }
        .custom-checkbox:checked { background: #ef4444; border-color: #ef4444; }
        .custom-checkbox:checked::after { content: '✔'; color: white; position: absolute; font-size: 0.7rem; top: 50%; left: 50%; transform: translate(-50%, -50%); }
      `}</style>

      {/* CANVAS BACKGROUND */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-b from-[#020617] to-[#1e1b4b]"></canvas>
      
      {/* SECTION LOADER */}
      {isLoadingSection && (
        <div className="fixed inset-0 z-[85] bg-black/60 flex flex-col items-center justify-center fade-in">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
        </div>
      )}

      {/* ... (Login Overlay, Mobile Header, Sidebar remain same) ... */}
      {appState === 'login' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="border-animated w-full max-w-md p-1">
            <div className="bg-slate-900 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                <i className="fas fa-fingerprint text-3xl text-red-500"></i>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Admin Security</h2>
              <p className="text-xs text-slate-400 mb-6">Enter protocol password to proceed</p>
              <input 
                type="password" 
                className="input-premium w-full p-4 rounded-xl mb-4 text-center tracking-[0.3em] font-bold text-lg" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doLogin()}
              />
              <button onClick={doLogin} className="btn-action w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-red-500/20 text-lg">Unlock Console</button>
              {isSetupMode && <div className="mt-4 text-green-400 text-sm font-medium p-3 bg-green-500/10 rounded-lg border border-green-500/20">Setup Mode: Create a new secure password</div>}
            </div>
          </div>
        </div>
      )}

      {appState === 'dashboard' && (
        <>
          <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 p-4 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h1 className="text-lg font-bold text-white tracking-wide">ADMIN<span className="text-red-500">PANEL</span></h1>
          </div>

          <aside className={`fixed inset-y-0 left-0 w-72 glass-panel transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 z-[60] flex flex-col bg-[#020617] md:bg-transparent`}>
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30"><i className="fas fa-shield-alt text-red-500"></i></div>
                <span>ADMIN<span className="text-red-500">PANEL</span></span>
              </h1>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white"><i className="fas fa-times text-xl"></i></button>
            </div>
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {[
                { id: 'users', icon: 'fa-users', label: 'All Users', color: '' },
                { id: 'withdrawals', icon: 'fa-money-check-alt', label: 'Withdrawals', color: 'text-green-400' },
                { id: 'mailer', icon: 'fa-paper-plane', label: 'Bulk Mailer', color: 'text-blue-400' },
                { id: 'managers', icon: 'fa-user-tie', label: 'Managers', color: 'text-purple-400' },
                { id: 'recycle', icon: 'fa-trash-alt', label: 'Recycle Bin', color: 'text-yellow-500' },
                { id: 'settings', icon: 'fa-cogs', label: 'Global Settings', color: 'text-slate-300' }
              ].map(tab => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); setIsSelectionMode(false); setSelectedUsers([]); }} className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}>
                  <i className={`fas ${tab.icon} w-6 text-center ${activeTab === tab.id ? '' : tab.color}`}></i> <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-6 border-t border-white/5 bg-black/20">
              <button onClick={logout} className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                <i className="fas fa-sign-out-alt"></i> Exit Console
              </button>
            </div>
          </aside>

          {sidebarOpen && <div className="fixed inset-0 bg-black/80 z-[55] md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>}

          <main className="flex-1 md:ml-72 p-4 md:p-10 pt-24 md:pt-10 min-h-screen w-full overflow-x-hidden">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight capitalize">
                  {activeTab === 'withdrawals' ? 'Financials & Payouts' : activeTab === 'settings' ? 'System Configuration' : activeTab === 'mailer' ? 'Communications' : activeTab.replace('-', ' ')}
                </h2>
                <p className="text-slate-400 text-sm mt-1">Overview of system performance and controls.</p>
              </div>
              <div className="glass-panel px-5 py-2.5 rounded-xl flex items-center gap-3 border-green-500/30 bg-green-500/5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-bold tracking-wide text-green-400 uppercase">System Online</span>
              </div>
            </div>

            {['users', 'managers', 'recycle'].includes(activeTab) && (
              <section className="space-y-6 fade-in">
                {/* Stats & Search Toolbar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="glass-card p-5 md:p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><i className="fas fa-users text-6xl text-white"></i></div>
                    <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Total Users</p>
                    <p className="text-2xl md:text-3xl font-bold text-white font-mono">{stats.totalUsers}</p>
                    <div className="h-1 w-8 bg-indigo-500 rounded-full mt-3"></div>
                  </div>
                  <div className="glass-card p-5 md:p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><i className="fas fa-mouse-pointer text-6xl text-white"></i></div>
                    <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">System Clicks</p>
                    <p className="text-2xl md:text-3xl font-bold text-white font-mono">{stats.totalClicks}</p>
                    <div className="h-1 w-8 bg-blue-500 rounded-full mt-3"></div>
                  </div>
                  <div className="glass-card p-5 md:p-6 rounded-2xl relative overflow-hidden group border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><i className="fas fa-sack-dollar text-6xl text-green-400"></i></div>
                    <p className="text-green-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Total Payouts</p>
                    <p className="text-2xl md:text-3xl font-bold text-white font-mono">${stats.totalPayout.toFixed(2)}</p>
                    <div className="h-1 w-8 bg-green-500 rounded-full mt-3"></div>
                  </div>
                  <div className="glass-card p-5 md:p-6 rounded-2xl relative overflow-hidden group border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><i className="fas fa-coins text-6xl text-yellow-400"></i></div>
                    <p className="text-yellow-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Today's Earned</p>
                    <p className="text-2xl md:text-3xl font-bold text-white font-mono">${stats.todayEarn.toFixed(4)}</p>
                    <div className="h-1 w-8 bg-yellow-500 rounded-full mt-3"></div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-panel p-4 rounded-xl">
                  <div className="relative w-full md:w-96 group">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"></i>
                    <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Search username or email..." className="input-premium w-full pl-11 pr-4 py-3 rounded-xl text-sm shadow-inner" />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedUsers([]); }} className={`px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap ${isSelectionMode ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'}`}>
                      {isSelectionMode ? <><i className="fas fa-times"></i> Cancel</> : <><i className="fas fa-check-square"></i> Select</>}
                    </button>
                    {isSelectionMode && (
                      <button onClick={handleBatchAction} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap">
                        <i className="fas fa-trash"></i> Action Selected
                      </button>
                    )}
                    <button onClick={() => loadUsers()} className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md whitespace-nowrap">
                      <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden flex flex-col min-h-[400px] shadow-2xl">
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] md:text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-white/10 bg-black/20">
                          {isSelectionMode && <th className="p-4 w-12 text-center"><input type="checkbox" onChange={toggleSelectAll} checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0} className="custom-checkbox" /></th>}
                          <th className="p-4 w-64 md:w-72">User Details</th>
                          <th className="p-4 w-24 text-center">Links</th>
                          <th className="p-4 w-32 text-center">Clicks</th>
                          <th className="p-4 w-32 text-center">Total Earn</th>
                          <th className="p-4 w-32 text-center">Permissions</th>
                          <th className="p-4 w-32 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-white/5">
                        {currentUsers.length === 0 ? (
                          <tr><td colSpan="7" className="p-16 text-center"><div className="text-slate-500 mb-2"><i className="fas fa-folder-open text-4xl"></i></div><p className="text-slate-400 font-medium">No users found.</p></td></tr>
                        ) : (
                          currentUsers.map(u => (
                            <tr key={u.uid} onClick={() => isSelectionMode && toggleUserSelection(u.uid)} className={`hover:bg-white/5 transition-colors group ${selectedUsers.includes(u.uid) ? 'bg-red-500/10 border-l-2 border-red-500' : ''} ${isSelectionMode ? 'cursor-pointer' : ''}`}>
                              {isSelectionMode && <td className="p-4 text-center"><input type="checkbox" checked={selectedUsers.includes(u.uid)} readOnly className="custom-checkbox" /></td>}
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-white border border-white/10 shadow-lg">{(u.username || 'U').charAt(0).toUpperCase()}</div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-white text-sm truncate">{u.username || 'Unknown'}</div>
                                    <div className="text-xs text-slate-500 truncate">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-center"><span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-mono border border-white/5">{u.links_count || 0}</span></td>
                              <td className="p-4 text-center"><div className="text-white font-bold text-sm">{u.stats?.total || 0}</div></td>
                              <td className="p-4 text-center"><div className="text-green-400 font-mono font-bold text-sm bg-green-500/10 inline-block px-2 py-1 rounded">${u.stats?.earnings || '0.00'}</div></td>
                              <td className="p-4 text-center">
                                <div className="flex flex-col items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${u.role === 'manager' || u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' : 'bg-slate-800 text-slate-400'}`}>{u.role} (${u.cpm || 0.5})</span>
                                  {u.can_upload ? <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-[10px] font-bold"><i className="fas fa-cloud-upload-alt mr-1"></i> ON</span> : <span className="px-2 py-1 bg-slate-800 text-slate-500 rounded text-[10px] font-bold"><i className="fas fa-lock mr-1"></i> OFF</span>}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                  {activeTab !== 'recycle' ? (
                                    <>
                                      {u.role !== 'manager' && u.role !== 'admin' ? 
                                        <button onClick={(e) => { e.stopPropagation(); openConfirmModal('promote', u.uid); }} className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-all border border-white/5 text-xs mr-2"><i className="fas fa-user-shield"></i></button> :
                                        <button onClick={(e) => { e.stopPropagation(); openConfirmModal('demote', u.uid); }} className="p-1.5 rounded-lg bg-slate-800 hover:bg-orange-600 text-orange-400 hover:text-white transition-all border border-white/5 text-xs mr-2"><i className="fas fa-user-minus"></i></button>
                                      }
                                      {/* 🔥 FIX: Changed from direct state set to openUserDetails for lazy loading */}
                                      <button onClick={(e) => { e.stopPropagation(); openUserDetails(u); }} className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-blue-400 hover:text-white transition-all border border-white/5 text-xs mr-1"><i className="fas fa-pencil-alt"></i></button>
                                      <button onClick={(e) => { e.stopPropagation(); openConfirmModal('delete', [u.uid]); }} className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-red-400 hover:text-white transition-all border border-white/5 text-xs"><i className="fas fa-ban"></i></button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={(e) => { e.stopPropagation(); openConfirmModal('restore', [u.uid]); }} className="p-1.5 rounded-lg bg-slate-800 hover:bg-green-600 text-green-400 hover:text-white transition-all border border-white/5 text-xs mr-1"><i className="fas fa-trash-restore"></i></button>
                                      <button onClick={(e) => { e.stopPropagation(); openConfirmModal('permanent', [u.uid]); }} className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-800 text-red-500 hover:text-white transition-all border border-white/5 text-xs"><i className="fas fa-radiation"></i></button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-white/10 flex items-center justify-end gap-2 bg-black/20">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><i className="fas fa-chevron-left"></i></button>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest px-3 py-1 bg-slate-800 rounded-lg">Page {currentPage} of {totalPages}</span>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><i className="fas fa-chevron-right"></i></button>
                  </div>
                </div>
              </section>
            )}

            {/* TAB: WITHDRAWALS, MAILER, SETTINGS - Hidden for brevity (same as previous) */}
          </main>

          {/* USER EDIT MODAL WITH LOADING STATE */}
          {userModal.open && userModal.data && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setUserModal({ open: false, data: null, activeTab: 'profile', loading: false })}></div>
              <div className="relative z-10 w-full max-w-3xl border-animated p-1">
                <div className="bg-slate-900 rounded-2xl flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="flex justify-between items-center p-6 border-b border-white/5 bg-slate-800/50 rounded-t-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-inner">{(userModal.data.username || 'U').charAt(0).toUpperCase()}</div>
                      <div><h3 className="text-xl font-bold text-white">{userModal.data.username || 'Unknown'}</h3><p className="text-xs text-slate-400 font-mono">UID: {userModal.data.uid}</p></div>
                    </div>
                    <button onClick={() => setUserModal({ open: false, data: null, activeTab: 'profile', loading: false })} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
                  </div>
                  
                  {/* Modal Tabs */}
                  <div className="flex overflow-x-auto border-b border-white/5 px-6 pt-4 gap-6 bg-slate-900 custom-scrollbar">
                    {[{id: 'profile', icon: 'fa-user', label: 'Profile'}, {id: 'payment', icon: 'fa-wallet', label: 'Payment'}, {id: 'stats', icon: 'fa-chart-bar', label: 'Stats'}, {id: 'roles', icon: 'fa-shield-alt', label: 'Config'}].map(tab => (
                      <button key={tab.id} onClick={() => setUserModal({ ...userModal, activeTab: tab.id })} className={`modal-tab ${userModal.activeTab === tab.id ? 'active' : 'text-slate-400 border-transparent'}`}><i className={`fas ${tab.icon} mr-1`}></i> {tab.label}</button>
                    ))}
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-900/80 min-h-[300px]">
                    
                    {/* 🔥 LAZY LOADING SPINNER */}
                    {userModal.loading ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-4 pt-10">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Fetching User Data...</p>
                      </div>
                    ) : (
                      <>
                        {userModal.activeTab === 'profile' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 fade-in">
                            <div><label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Email</label><input type="text" readOnly value={userModal.data.email || 'N/A'} className="input-premium w-full p-3 rounded-xl text-sm opacity-80" /></div>
                            <div><label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Joined</label><input type="text" readOnly value={new Date(userModal.data.created_at).toLocaleString()} className="input-premium w-full p-3 rounded-xl text-sm opacity-80" /></div>
                            <div><label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Name</label><input type="text" value={userModal.data.name || ''} onChange={e=>setUserModal({...userModal, data: {...userModal.data, name: e.target.value}})} className="input-premium w-full p-3 rounded-xl text-sm" /></div>
                            <div><label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Social Handle</label><input type="text" readOnly value={userModal.data.social || 'N/A'} className="input-premium w-full p-3 rounded-xl text-sm opacity-80" /></div>
                            <div><label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Telegram Link</label><input type="text" readOnly value={userModal.data.telegram || 'N/A'} className="input-premium w-full p-3 rounded-xl text-sm opacity-80" /></div>
                            <div><label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">YouTube Channel</label><input type="text" readOnly value={userModal.data.youtube || 'N/A'} className="input-premium w-full p-3 rounded-xl text-sm opacity-80" /></div>
                          </div>
                        )}

                        {userModal.activeTab === 'payment' && (
                          <div className="space-y-5 fade-in">
                            <div className="bg-indigo-500/10 border border-indigo-500/30 p-5 rounded-xl mb-6 shadow-inner">
                              <label className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block mb-1">Selected Withdrawal Method</label>
                              <div className="text-xl font-bold text-white uppercase mb-1">{userModal.data.withdrawal_method || 'UPI (Default)'}</div>
                              <div className="text-sm font-mono text-indigo-300">{userModal.data.withdrawal_account || 'N/A'}</div>
                            </div>
                            {/* ... (Bank Details boxes, same as before) ... */}
                          </div>
                        )}
                        {/* ... (Stats & Roles tabs remain the same) ... */}
                      </>
                    )}
                  </div>
                  
                  {/* Modal Footer */}
                  <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-slate-900 rounded-b-xl">
                    <button onClick={() => setUserModal({ open: false, data: null, activeTab: 'profile', loading: false })} className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors text-sm font-bold">Cancel</button>
                    <button onClick={saveUserChanges} disabled={userModal.loading} className="btn-action px-8 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-50"><i className="fas fa-save mr-2"></i> Save</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ... (Confirm Modal remains the same) ... */}
        </>
      )}
    </div>
  );
};

export default AdminConsole;
