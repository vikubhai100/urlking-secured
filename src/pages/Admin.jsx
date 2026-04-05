import React, { useState, useEffect, useRef, useCallback } from 'react';
import { showToast } from '../toast';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

// ============================================================================
// 🧩 SUB-COMPONENTS
// ============================================================================

const StatCard = ({ icon, title, value, colorClass, borderClass }) => (
  <div className={`p-5 md:p-6 rounded-2xl relative overflow-hidden group bg-[var(--glass-panel)] border ${borderClass} shadow-sm transition-transform hover:-translate-y-1`}>
    <div className={`absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform ${colorClass}`}><i className={`fas ${icon} text-6xl`}></i></div>
    <p className="text-[var(--text-secondary)] text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
    <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-mono">{value}</p>
    <div className={`h-1 w-8 rounded-full mt-3 ${colorClass.replace('text-', 'bg-')}`}></div>
  </div>
);

const TopPerformersTab = ({ users, openProfile }) => {
  const [timeframe, setTimeframe] = useState('today'); 

  const sortedUsers = [...users].filter(u => {
    const clicks = timeframe === 'today' ? (u.stats?.today_clicks || 0) : (u.stats?.total || 0);
    const earnings = timeframe === 'today' ? parseFloat(u.stats?.today_earnings || 0) : parseFloat(u.stats?.earnings || 0);
    return clicks > 0 || earnings > 0;
  }).sort((a, b) => {
    const aVal = timeframe === 'today' ? (a.stats?.today_clicks || parseFloat(a.stats?.today_earnings || 0)) : (a.stats?.total || 0);
    const bVal = timeframe === 'today' ? (b.stats?.today_clicks || parseFloat(b.stats?.today_earnings || 0)) : (b.stats?.total || 0);
    return bVal - aVal;
  });

  return (
    <section className="space-y-6 fade-in">
      <div className="flex justify-between items-center bg-[var(--glass-panel)] p-5 rounded-xl border border-[var(--glass-border)] shadow-sm">
        <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3">
          <i className="fas fa-trophy text-yellow-500 p-2 bg-yellow-500/10 rounded-lg"></i> Leaderboard
        </h3>
        <select 
          value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
          className="bg-[var(--nav-hover)] border border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-2 rounded-xl font-bold outline-none cursor-pointer"
        >
          <option value="today">Today's Performance</option>
          <option value="total">All-Time Performance</option>
        </select>
      </div>

      <div className="bg-[var(--glass-panel)] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase border-b border-[var(--glass-border)] bg-[var(--nav-hover)]">
                <th className="p-4 w-16 text-center">Rank</th>
                <th className="p-4">User</th>
                <th className="p-4 text-center">Clicks</th>
                <th className="p-4 text-center">Earnings</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[var(--glass-border)]">
              {sortedUsers.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-[var(--text-secondary)] font-medium">No active users {timeframe === 'today' ? 'today' : 'yet'}.</td></tr>
              ) : (
                sortedUsers.map((u, idx) => (
                  <tr key={u.uid} className="hover:bg-[var(--nav-hover)] transition-colors">
                    <td className="p-4 text-center font-black text-lg text-[var(--text-secondary)]">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>
                    <td className="p-4 cursor-pointer" onClick={() => openProfile(u.uid)}>
                      <div className="font-bold text-[var(--text-primary)] text-sm hover:text-indigo-500 transition-colors">{u.username || 'User'}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{u.email}</div>
                    </td>
                    <td className="p-4 text-center font-bold text-blue-500 text-lg">
                      {timeframe === 'today' ? (u.stats?.today_clicks || 0) : (u.stats?.total || 0)}
                    </td>
                    <td className="p-4 text-center font-bold text-green-500 font-mono">
                      ${timeframe === 'today' ? parseFloat(u.stats?.today_earnings || 0).toFixed(4) : parseFloat(u.stats?.earnings || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openProfile(u.uid)} className="p-2 rounded bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 text-xs transition-all">
                        <i className="fas fa-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const MailerTab = ({ adminToken }) => {
  const [mailerForm, setMailerForm] = useState({ adminKey: '', subject: '', title: '', message: '' });
  const [status, setStatus] = useState({ loading: false, result: null, isError: false });

  const sendBulkMail = async () => {
    const { adminKey, subject, title, message } = mailerForm;
    if (!adminKey || !subject || !title || !message) return showToast("Fill all fields!", "error");
    setStatus({ loading: true, result: null, isError: false });
    try {
      const res = await fetch(`${API}/api/admin/send-bulk`, {
        method: "POST", headers: { "Content-Type": "application/json", 'x-admin-token': adminToken },
        body: JSON.stringify({ adminKey, subject, title, message })
      });
      const data = await res.json();
      if(res.ok) { setStatus({ loading: false, result: data.message, isError: false }); showToast("Broadcast Complete!", "success"); } 
      else throw new Error(data.error);
    } catch(e) { setStatus({ loading: false, result: e.message, isError: true }); }
  };

  return (
    <section className="fade-in max-w-4xl mx-auto space-y-6">
      <div className="bg-[var(--glass-panel)] p-6 md:p-8 rounded-2xl shadow-sm border border-[var(--glass-border)] relative overflow-hidden">
        <div className="flex items-center gap-4 mb-6 border-b border-[var(--glass-border)] pb-4 relative z-10">
          <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-500 text-2xl"><i className="fas fa-rocket"></i></div>
          <div><h2 className="text-2xl font-bold text-[var(--text-primary)]">Broadcast Mailer</h2><p className="text-[var(--text-secondary)] text-sm">Send emails to all users instantly.</p></div>
        </div>
        <div className="space-y-5 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-2">Admin Secret Key</label><input type="password" value={mailerForm.adminKey} onChange={e=>setMailerForm({...mailerForm, adminKey: e.target.value})} className="w-full p-3.5 rounded-xl bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] outline-none focus:border-blue-500" /></div>
            <div><label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-2">Email Subject</label><input type="text" value={mailerForm.subject} onChange={e=>setMailerForm({...mailerForm, subject: e.target.value})} className="w-full p-3.5 rounded-xl bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] outline-none focus:border-blue-500" /></div>
          </div>
          <div><label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-2">Internal Mail Title</label><input type="text" value={mailerForm.title} onChange={e=>setMailerForm({...mailerForm, title: e.target.value})} className="w-full p-3.5 rounded-xl bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] outline-none focus:border-blue-500" /></div>
          <div><label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-2">Message Body (HTML)</label><textarea rows="6" value={mailerForm.message} onChange={e=>setMailerForm({...mailerForm, message: e.target.value})} className="w-full p-4 rounded-xl bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] outline-none focus:border-blue-500 resize-y"></textarea></div>
          <div className="pt-4 flex items-center justify-between">
            <button onClick={sendBulkMail} disabled={status.loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all">
              {status.loading ? <><i className="fas fa-spinner fa-spin"></i> Broadcasting...</> : <><i className="fas fa-paper-plane"></i> Launch Broadcast</>}
            </button>
          </div>
          {status.result && <div className={`mt-4 p-4 rounded-xl font-bold text-sm ${status.isError ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>{status.result}</div>}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// MAIN ADMIN CONSOLE EXPORT
// ============================================================================
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
  const [tickets, setTickets] = useState([]); 

  const [stats, setStats] = useState({ totalUsers: 0, totalClicks: 0, totalPayout: 0, todayEarn: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Modals
  const [userModal, setUserModal] = useState({ open: false, activeTab: 'profile', data: null, loading: false });
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', payload: null, title: '', msg: '', btnText: '', btnClass: '' });
  const [ticketModal, setTicketModal] = useState({ open: false, data: null });

  const [globalCpm, setGlobalCpm] = useState('0.50');

  // --- INIT & AUTH ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get('key');
    const checkAccess = async () => {
      if (!urlKey && adminToken) return checkSystem();
      if (!urlKey && !adminToken) return setAppState('ghost');
      try {
        const res = await fetch(`${API}/api/admin/access`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: urlKey }) });
        const data = await res.json();
        if (data.valid) checkSystem(); else setAppState('ghost');
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
    } catch (e) { showToast("Backend Offline", "error"); setAppState('login'); }
  };

  const doLogin = async () => {
    if (!password) return showToast("Enter password", "error");
    const endpoint = isSetupMode ? "/api/admin/setup" : "/api/admin/login";
    try {
      const res = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (data.token || data.ok) {
        if (data.token) { localStorage.setItem('admin_token', data.token); setAdminToken(data.token); setAppState('dashboard'); loadUsers(data.token); }
      } else { showToast(data.error || "Error", "error"); }
    } catch (e) { showToast("Connection Error", "error"); }
  };

  const logout = () => {
    if (adminToken) fetch(`${API}/api/admin/logout`, { method: "POST", headers: { 'x-admin-token': adminToken } }).catch(e => {});
    localStorage.removeItem('admin_token'); window.location.reload();
  };

  // --- DATA FETCHING ---
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
  }, [adminToken, activeTab, searchQuery]);

  const loadWithdrawals = useCallback(async () => {
    setIsLoadingSection(true);
    try {
      const res = await fetch(`${API}/api/withdraw/admin/requests`, { headers: { 'x-admin-token': adminToken } });
      const data = await res.json();
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (e) { showToast("Failed to load withdrawals", "error"); } 
    finally { setIsLoadingSection(false); }
  }, [adminToken]);

  const loadTickets = useCallback(async () => {
    setIsLoadingSection(true);
    try {
      const res = await fetch(`${API}/api/support/admin/tickets`, { headers: { 'x-admin-token': adminToken } });
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) { showToast("Failed to load tickets", "error"); } 
    finally { setIsLoadingSection(false); }
  }, [adminToken]);

  useEffect(() => {
    if (appState === 'dashboard') {
      if (['users', 'managers', 'recycle', 'top'].includes(activeTab)) loadUsers();
      else if (activeTab === 'withdrawals') loadWithdrawals();
      else if (activeTab === 'tickets') loadTickets();
    }
  }, [activeTab, loadUsers, loadWithdrawals, loadTickets, appState]);

  const filterAndSetUsers = (users, tab, search) => {
    let source = users;
    if (tab === 'managers') source = users.filter(u => u.role === 'manager' || u.role === 'admin');
    const term = search.toLowerCase();
    const filtered = source.filter(u => (u.username && u.username.toLowerCase().includes(term)) || (u.email && u.email.toLowerCase().includes(term)));
    setDisplayedUsers(filtered); setCurrentPage(1);
  };

  const handleSearch = (e) => { setSearchQuery(e.target.value); filterAndSetUsers(allUsers, activeTab, e.target.value); };

  // --- ACTIONS ---
  
  // 🟢 FIXED: Profile Data Fetching (Instant base data show, background fetch)
  const openUserDetailsByUid = async (uid) => {
    const baseUser = allUsers.find(u => u.uid === uid) || { uid, username: 'Unknown User' };
    
    setUserModal({ open: true, activeTab: 'profile', data: baseUser, loading: true });
    
    try {
      const res = await fetch(`${API}/api/admin/users/${uid}`, { headers: { 'x-admin-token': adminToken } });
      if (res.ok) {
        const fullData = await res.json();
        setUserModal({ open: true, activeTab: 'profile', data: { ...baseUser, ...fullData }, loading: false });
      } else { 
        setUserModal(prev => ({ ...prev, loading: false })); 
      }
    } catch (error) {
      showToast("Could not fetch advanced details", "error");
      setUserModal(prev => ({ ...prev, loading: false }));
    }
  };

  const saveUserChanges = async () => {
    try {
      await fetch(`${API}/api/admin/user`, { 
          method: "PUT", headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }, 
          body: JSON.stringify({ uid: userModal.data.uid, role: userModal.data.role, cpm: userModal.data.cpm, name: userModal.data.name, click_percentage: userModal.data.click_percentage || 100 }) 
      });
      await fetch(`${API}/api/dev/toggle-permission`, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: userModal.data.uid, can_upload: userModal.data.can_upload ? 1 : 0 }) }).catch(e=>{});
      setUserModal({ open: false, data: null, activeTab: 'profile', loading: false });
      loadUsers(); showToast("Configuration updated!", "success");
    } catch(e) { showToast("Error saving updates", "error"); }
  };

  const openConfirmModal = (type, payload) => {
    let title = '', msg = '', btnText = '', btnClass = '';
    if (type === 'global_cpm') { title = "System CPM Update"; msg = `Enforce fixed CPM of $${payload} across ALL accounts.`; btnText = "Enforce CPM Update"; btnClass = "bg-green-600 hover:bg-green-500 text-white"; } 
    else if (type === 'allow_all_uploads') { title = "Unlock Mass Uploads?"; msg = `Grant 'DevUploads' permissions to every registered user.`; btnText = "Authorize All Accounts"; btnClass = "bg-purple-600 hover:bg-purple-500 text-white"; } 
    else if (type === 'promote' || type === 'demote') {
      const u = allUsers.find(x => x.uid === payload);
      title = type === 'promote' ? "Elevate Privileges" : "Revoke Privileges";
      msg = `${type === 'promote' ? 'Grant' : 'Strip'} Manager access for ${u ? u.username : 'this user'}?`;
      btnText = type === 'promote' ? "Promote to Manager" : "Demote to User";
      btnClass = type === 'promote' ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-orange-600 hover:bg-orange-500 text-white";
    } 
    else if (type === 'delete') { title = "Suspend Accounts?"; msg = `Move ${payload.length} account(s) to Recycle Bin.`; btnText = "Suspend Accounts"; btnClass = "bg-yellow-600 hover:bg-yellow-500 text-white"; } 
    else if (type === 'restore') { title = "Restore Accounts?"; msg = `Reactivate ${payload.length} suspended account(s).`; btnText = "Restore Access"; btnClass = "bg-green-600 hover:bg-green-500 text-white"; } 
    else if (type === 'permanent') { title = "Irreversible Deletion"; msg = `Wipe ${payload.length} user(s) completely?`; btnText = "Nuke Data Forever"; btnClass = "bg-red-600 hover:bg-red-700 text-white"; }
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
      if (d.ok || res.ok) { showToast("Success", "success"); loadUsers(); setSelectedUsers([]); } else { showToast(d.error || "Action Blocked", "error"); }
    } catch (e) { showToast("Failed", "error"); } finally { setIsLoadingSection(false); }
  };

  const handleWithdrawalAction = async (id, action) => {
    if(!window.confirm(`Proceed to ${action.toUpperCase()} request #${id}?`)) return;
    try {
      const res = await fetch(`${API}/api/withdraw/admin/action`, { method: "POST", headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }, body: JSON.stringify({ id, action }) });
      const data = await res.json();
      if(data.ok) { showToast(`Request ${action}d!`, "success"); loadWithdrawals(); } else showToast("Action failed", "error");
    } catch(e) { showToast("Server error", "error"); }
  };

  const handleTicketStatus = async (id, status) => {
    if(!window.confirm(`Mark this ticket as ${status}?`)) return;
    try {
      const res = await fetch(`${API}/api/support/admin/tickets/${id}`, { method: "PUT", headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }, body: JSON.stringify({ status }) });
      const data = await res.json();
      if(data.ok || res.ok) { showToast(`Ticket marked as ${status}`, "success"); setTicketModal({ open: false, data: null }); loadTickets(); } else showToast("Failed to update ticket", "error");
    } catch(e) { showToast("Server error", "error"); }
  };

  // --- RENDER ---
  if (appState === 'ghost') return <div className="fixed inset-0 bg-[var(--bg-body)] z-[100] flex items-center justify-center text-center"><h1 className="text-6xl font-bold text-[var(--text-primary)]">404</h1></div>;

  const totalPages = Math.ceil(displayedUsers.length / itemsPerPage) || 1;
  const currentUsers = displayedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-primary)] font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden flex">
      {/* CUSTOM CSS FOR ADMIN */}
      <style>{`
        .custom-checkbox { appearance: none; width: 1.2rem; height: 1.2rem; border: 2px solid var(--text-secondary); border-radius: 0.35rem; cursor: pointer; position: relative; transition: all 0.2s; }
        .custom-checkbox:checked { background: #6366f1; border-color: #6366f1; }
        .custom-checkbox:checked::after { content: '✔'; color: white; position: absolute; font-size: 0.7rem; top: 50%; left: 50%; transform: translate(-50%, -50%); }
      `}</style>

      {isLoadingSection && (
        <div className="fixed inset-0 z-[85] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center fade-in">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* LOGIN OVERLAY */}
      {appState === 'login' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--bg-body)] backdrop-blur-md p-4">
          <div className="bg-[var(--glass-panel)] border border-[var(--glass-border)] w-full max-w-md rounded-2xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20"><i className="fas fa-fingerprint text-3xl text-red-500"></i></div>
            <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Admin Security</h2>
            <p className="text-xs text-[var(--text-secondary)] mb-6">Enter protocol password to proceed</p>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doLogin()} className="w-full bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] text-center p-4 rounded-xl mb-4 font-bold outline-none focus:border-red-500" placeholder="••••••••" />
            <button onClick={doLogin} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg">Unlock Console</button>
          </div>
        </div>
      )}

      {/* DASHBOARD LAYOUT */}
      {appState === 'dashboard' && (
        <>
          {/* Mobile Header */}
          <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--glass-panel)] border-b border-[var(--glass-border)] p-4 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[var(--text-primary)] p-2 rounded-lg bg-[var(--nav-hover)]"><i className="fas fa-bars"></i></button>
            <h1 className="text-lg font-bold tracking-wide text-[var(--text-primary)]">ADMIN<span className="text-red-500">PANEL</span></h1>
          </div>

          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 w-72 bg-[var(--glass-panel)] border-r border-[var(--glass-border)] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 z-[60] flex flex-col`}>
            <div className="p-8 border-b border-[var(--glass-border)] flex justify-between items-center">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/30"><i className="fas fa-shield-alt text-red-500"></i></div><span>ADMIN<span className="text-red-500">PANEL</span></span></h1>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[var(--text-secondary)]"><i className="fas fa-times text-xl"></i></button>
            </div>
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {[
                { id: 'users', icon: 'fa-users', label: 'All Users', color: '' },
                { id: 'top', icon: 'fa-trophy', label: 'Leaderboard', color: 'text-yellow-500' },
                { id: 'withdrawals', icon: 'fa-money-check-alt', label: 'Withdrawals', color: 'text-green-500' },
                { id: 'tickets', icon: 'fa-life-ring', label: 'Support Tickets', color: 'text-rose-500' },
                { id: 'mailer', icon: 'fa-paper-plane', label: 'Bulk Mailer', color: 'text-blue-500' },
                { id: 'managers', icon: 'fa-user-tie', label: 'Managers', color: 'text-purple-500' },
                { id: 'recycle', icon: 'fa-trash-alt', label: 'Recycle Bin', color: 'text-orange-500' },
                { id: 'settings', icon: 'fa-cogs', label: 'System Settings', color: 'text-slate-400' }
              ].map(tab => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); setIsSelectionMode(false); setSelectedUsers([]); }} 
                  className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-[var(--text-secondary)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)]'}`}>
                  <i className={`fas ${tab.icon} w-6 text-center ${activeTab === tab.id ? '' : tab.color}`}></i> {tab.label}
                  {tab.id === 'tickets' && tickets.some(t => t.status === 'Open') && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-auto"></div>}
                </button>
              ))}
            </nav>
            <div className="p-6 border-t border-[var(--glass-border)]">
              <button onClick={logout} className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-colors"><i className="fas fa-sign-out-alt"></i> Exit Console</button>
            </div>
          </aside>

          {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-[55] md:hidden" onClick={() => setSidebarOpen(false)}></div>}

          {/* Main Content Area */}
          <main className="flex-1 md:ml-72 p-4 md:p-8 pt-24 md:pt-8 w-full overflow-x-hidden min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-[var(--glass-border)] pb-6">
              <div>
                <h2 className="text-3xl font-bold capitalize text-[var(--text-primary)]">{activeTab.replace('-', ' ')}</h2>
                <p className="text-[var(--text-secondary)] text-sm mt-1">Overview and management controls.</p>
              </div>
            </div>

            {/* TAB RENDERING */}
            {['users', 'managers', 'recycle'].includes(activeTab) && (
              <section className="space-y-6 fade-in">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <StatCard icon="fa-users" title="Total Users" value={stats.totalUsers} colorClass="text-indigo-500" borderClass="border-indigo-500/20" />
                  <StatCard icon="fa-mouse-pointer" title="System Clicks" value={stats.totalClicks} colorClass="text-blue-500" borderClass="border-blue-500/20" />
                  <StatCard icon="fa-sack-dollar" title="Total Payouts" value={`$${stats.totalPayout.toFixed(2)}`} colorClass="text-green-500" borderClass="border-green-500/20" />
                  <StatCard icon="fa-coins" title="Today's Earned" value={`$${stats.todayEarn.toFixed(4)}`} colorClass="text-yellow-500" borderClass="border-yellow-500/20" />
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between bg-[var(--glass-panel)] p-4 rounded-xl border border-[var(--glass-border)]">
                  <div className="relative w-full md:w-96">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"></i>
                    <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Search user..." className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] outline-none focus:border-indigo-500" />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <button onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedUsers([]); }} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${isSelectionMode ? 'bg-indigo-600 text-white border border-indigo-500' : 'bg-[var(--nav-hover)] border border-[var(--glass-border)] text-[var(--text-primary)]'}`}>
                      {isSelectionMode ? <><i className="fas fa-times mr-1"></i> Cancel</> : <><i className="fas fa-check-square mr-1"></i> Select</>}
                    </button>
                    {isSelectionMode && <button onClick={() => openConfirmModal(activeTab==='recycle'?'restore':'delete', selectedUsers)} className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap">Action</button>}
                    <button onClick={() => loadUsers()} className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap"><i className="fas fa-sync-alt"></i> Refresh</button>
                  </div>
                </div>

                <div className="bg-[var(--glass-panel)] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs font-bold text-[var(--text-secondary)] uppercase bg-[var(--nav-hover)] border-b border-[var(--glass-border)]">
                          {isSelectionMode && <th className="p-4 w-12 text-center"><input type="checkbox" onChange={(e) => setSelectedUsers(e.target.checked ? currentUsers.map(u=>u.uid) : [])} checked={selectedUsers.length > 0} className="custom-checkbox" /></th>}
                          <th className="p-4">User Details</th><th className="p-4 text-center">Links</th><th className="p-4 text-center">Clicks</th><th className="p-4 text-center">Earn</th><th className="p-4 text-center">Role</th><th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-[var(--glass-border)]">
                        {currentUsers.length === 0 ? (
                           <tr><td colSpan="7" className="p-12 text-center text-[var(--text-secondary)] font-medium">No users found.</td></tr>
                        ) : (
                          currentUsers.map(u => (
                            <tr key={u.uid} className="hover:bg-[var(--nav-hover)] transition-colors">
                              {isSelectionMode && <td className="p-4 text-center"><input type="checkbox" checked={selectedUsers.includes(u.uid)} onChange={()=>toggleUserSelection(u.uid)} className="custom-checkbox" /></td>}
                              <td className="p-4 cursor-pointer" onClick={() => openUserDetailsByUid(u.uid)}>
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">{(u.username || 'U').charAt(0).toUpperCase()}</div>
                                  <div><div className="font-bold text-[var(--text-primary)] hover:text-indigo-500 transition-colors">{u.username || 'Unknown'}</div><div className="text-xs text-[var(--text-secondary)]">{u.email}</div></div>
                                </div>
                              </td>
                              <td className="p-4 text-center">{u.links_count || 0}</td>
                              <td className="p-4 text-center font-bold text-[var(--text-primary)]">{u.stats?.total || 0}</td>
                              <td className="p-4 text-center text-green-500 font-bold">${u.stats?.earnings || '0.00'}</td>
                              <td className="p-4 text-center text-xs uppercase font-bold text-[var(--text-secondary)]">{u.role}</td>
                              <td className="p-4 text-right">
                                {activeTab !== 'recycle' ? (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); openUserDetailsByUid(u.uid); }} className="p-2 rounded bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors mr-1"><i className="fas fa-edit"></i> Edit</button>
                                    <button onClick={(e) => { e.stopPropagation(); openConfirmModal('delete', [u.uid]); }} className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"><i className="fas fa-ban"></i></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); openConfirmModal('restore', [u.uid]); }} className="p-2 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors mr-1"><i className="fas fa-trash-restore"></i></button>
                                    <button onClick={(e) => { e.stopPropagation(); openConfirmModal('permanent', [u.uid]); }} className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"><i className="fas fa-radiation"></i></button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-[var(--glass-border)] flex items-center justify-end gap-2 bg-[var(--nav-hover)]">
                    <button className="w-8 h-8 rounded-lg bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><i className="fas fa-chevron-left"></i></button>
                    <span className="text-[var(--text-secondary)] text-xs font-bold px-3 py-1">Page {currentPage} of {totalPages}</span>
                    <button className="w-8 h-8 rounded-lg bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><i className="fas fa-chevron-right"></i></button>
                  </div>
                </div>
              </section>
            )}

            {/* TAB: TOP PERFORMERS */}
            {activeTab === 'top' && <TopPerformersTab users={allUsers} openProfile={openUserDetailsByUid} />}

            {/* TAB: WITHDRAWALS */}
            {activeTab === 'withdrawals' && (
              <section className="space-y-6 fade-in">
                <div className="flex justify-between items-center bg-[var(--glass-panel)] p-5 rounded-xl border border-[var(--glass-border)] shadow-sm">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3"><i className="fas fa-money-check-alt text-green-500 p-2 bg-green-500/10 rounded-lg"></i> Withdrawal Requests</h3>
                  <button onClick={loadWithdrawals} className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md"><i className="fas fa-sync-alt mr-2"></i> Refresh</button>
                </div>
                <div className="bg-[var(--glass-panel)] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase bg-[var(--nav-hover)] border-b border-[var(--glass-border)]">
                          <th className="p-4 w-20">ID</th><th className="p-4">User</th><th className="p-4 text-right">Amount</th><th className="p-4">Method Details</th><th className="p-4 text-center">Status</th><th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-[var(--glass-border)]">
                        {withdrawals.length === 0 ? (
                           <tr><td colSpan="6" className="p-12 text-center text-[var(--text-secondary)] font-medium">No requests found.</td></tr>
                        ) : (
                          withdrawals.map(w => (
                            <tr key={w.id} className="hover:bg-[var(--nav-hover)] transition-colors">
                              <td className="p-4 font-mono text-[var(--text-secondary)] text-xs">#{w.id}</td>
                              <td className="p-4 cursor-pointer" onClick={() => openUserDetailsByUid(w.uid)}>
                                <div className="font-bold hover:text-indigo-500 transition-colors text-[var(--text-primary)]">{w.username || 'User'} <i className="fas fa-external-link-alt text-[10px] text-[var(--text-secondary)] ml-1"></i></div>
                                <div className="text-xs text-[var(--text-secondary)]">{w.email}</div>
                              </td>
                              <td className="p-4 text-right font-mono font-bold text-green-500 text-lg">${w.amount?.toFixed(2)}</td>
                              <td className="p-4"><div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-body)] p-2.5 rounded-lg border border-[var(--glass-border)] break-all"><span className="font-bold text-indigo-400 uppercase">{w.method}:</span> {w.account_details}</div></td>
                              <td className="p-4 text-center uppercase text-[10px] font-bold">
                                {w.status === 'pending' ? <span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">Pending</span> :
                                 w.status === 'approved' ? <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">Paid</span> :
                                 <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">Rejected</span>}
                              </td>
                              <td className="p-4 text-right">
                                {w.status === 'pending' && (
                                  <>
                                    <button onClick={() => handleWithdrawalAction(w.id, 'approve')} className="p-2 mr-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/20"><i className="fas fa-check"></i></button>
                                    <button onClick={() => handleWithdrawalAction(w.id, 'reject')} className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"><i className="fas fa-times"></i></button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* TAB: TICKETS */}
            {activeTab === 'tickets' && (
              <section className="space-y-6 fade-in">
                <div className="flex justify-between items-center bg-[var(--glass-panel)] p-5 rounded-xl border border-[var(--glass-border)] shadow-sm">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3"><i className="fas fa-life-ring text-rose-500 p-2 bg-rose-500/10 rounded-lg"></i> Support Tickets</h3>
                  <button onClick={loadTickets} className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md"><i className="fas fa-sync-alt mr-2"></i> Refresh</button>
                </div>
                <div className="bg-[var(--glass-panel)] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase bg-[var(--nav-hover)] border-b border-[var(--glass-border)]">
                          <th className="p-4 w-16">ID</th><th className="p-4">User Info</th><th className="p-4">Subject</th><th className="p-4 text-center">Priority</th><th className="p-4 text-center">Status</th><th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-[var(--glass-border)]">
                        {tickets.length === 0 ? (
                          <tr><td colSpan="6" className="p-12 text-center text-[var(--text-secondary)] font-medium">No support tickets found.</td></tr>
                        ) : (
                          tickets.map(t => (
                            <tr key={t.id} className="hover:bg-[var(--nav-hover)] transition-colors cursor-pointer" onClick={() => setTicketModal({ open: true, data: t })}>
                              <td className="p-4 font-mono text-[var(--text-secondary)] text-xs">#{t.id}</td>
                              <td className="p-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); openUserDetailsByUid(t.uid); }}>
                                <div className="font-bold text-[var(--text-primary)] hover:text-indigo-500 transition-colors text-sm">{t.name} <i className="fas fa-external-link-alt text-[10px] text-[var(--text-secondary)]"></i></div>
                                <div className="text-[10px] text-[var(--text-secondary)] truncate w-40">{t.email}</div>
                              </td>
                              <td className="p-4"><div className="font-bold text-indigo-400 text-xs truncate w-48">{t.subject}</div><div className="text-[10px] uppercase text-[var(--text-secondary)] mt-1">{t.category}</div></td>
                              <td className="p-4 text-center text-[10px] font-bold uppercase">
                                {t.priority === 'Urgent' ? <span className="text-red-500">Urgent</span> : t.priority === 'High' ? <span className="text-orange-500">High</span> : <span className="text-blue-500">Normal</span>}
                              </td>
                              <td className="p-4 text-center text-[10px] font-bold uppercase">
                                {t.status === 'Open' ? <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20">Open</span> : <span className="bg-[var(--bg-body)] text-[var(--text-secondary)] px-2 py-1 rounded border border-[var(--glass-border)]">Closed</span>}
                              </td>
                              <td className="p-4 text-right">
                                <button onClick={(e) => { e.stopPropagation(); setTicketModal({ open: true, data: t }); }} className="p-2 rounded bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 text-xs transition-all"><i className="fas fa-eye"></i> View</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* TAB: MAILER */}
            {activeTab === 'mailer' && <MailerTab adminToken={adminToken} />}

            {/* TAB: SETTINGS (Fixed Layout) */}
            {activeTab === 'settings' && (
              <section className="fade-in max-w-3xl mx-auto space-y-6">
                <div className="bg-[var(--glass-panel)] p-6 md:p-8 rounded-2xl border border-[var(--glass-border)] shadow-sm">
                  <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3"><div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><i className="fas fa-dollar-sign"></i></div> Global CPM Controller</h4>
                  <p className="text-[var(--text-secondary)] text-sm mb-6 pl-11">Update the CPM for EVERY user instantly.</p>
                  <div className="flex gap-4 pl-11">
                    <input type="number" step="0.01" value={globalCpm} onChange={(e) => setGlobalCpm(e.target.value)} className="bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] text-center p-3 rounded-lg font-bold text-xl w-32 outline-none focus:border-indigo-500" />
                    <button onClick={() => openConfirmModal('global_cpm', globalCpm)} className="bg-green-600 hover:bg-green-500 text-white px-8 rounded-xl font-bold shadow-md transition-colors">Apply to All</button>
                  </div>
                </div>

                <div className="bg-[var(--glass-panel)] p-6 md:p-8 rounded-2xl border border-[var(--glass-border)] shadow-sm">
                  <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3"><div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><i className="fas fa-cloud-upload-alt"></i></div> Mass Upload Permissions</h4>
                  <p className="text-[var(--text-secondary)] text-sm mb-6 pl-11">Unlock file upload capabilities for all registered accounts at once.</p>
                  <div className="pl-11">
                    <button onClick={() => openConfirmModal('allow_all_uploads', null)} className="bg-purple-600 hover:bg-purple-500 text-white py-3.5 px-8 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors">
                      <i className="fas fa-unlock-alt"></i> Authorize Uploads for ALL Users
                    </button>
                  </div>
                </div>
              </section>
            )}

          </main>

          {/* 🟢 FULL USER EDIT MODAL 🟢 */}
          {userModal.open && userModal.data && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setUserModal({ open: false, data: null, activeTab: 'profile', loading: false })}></div>
              <div className="relative z-10 w-full max-w-3xl bg-[var(--glass-panel)] border border-[var(--glass-border)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden fade-in">
                
                <div className="p-6 border-b border-[var(--glass-border)] flex justify-between items-center bg-[var(--nav-hover)]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-lg">{(userModal.data.username || 'U').charAt(0).toUpperCase()}</div>
                    <div><h3 className="text-xl font-bold text-[var(--text-primary)]">{userModal.data.username || 'User Profile'}</h3><p className="text-xs text-[var(--text-secondary)] font-mono">UID: {userModal.data.uid}</p></div>
                  </div>
                  <button onClick={() => setUserModal({ open: false, data: null, activeTab: 'profile', loading: false })} className="text-[var(--text-secondary)] hover:text-red-500 transition-colors"><i className="fas fa-times text-xl"></i></button>
                </div>
                
                <div className="flex px-6 bg-[var(--nav-hover)] gap-6 border-b border-[var(--glass-border)] overflow-x-auto">
                  {[{id: 'profile', label: 'Profile'}, {id: 'payment', label: 'Payment Details'}, {id: 'stats', label: 'Statistics'}, {id: 'roles', label: 'Configuration'}].map(tab => (
                    <button key={tab.id} onClick={() => setUserModal({...userModal, activeTab: tab.id})} className={`py-3 text-sm font-bold uppercase transition-colors whitespace-nowrap ${userModal.activeTab === tab.id ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{tab.label}</button>
                  ))}
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                  {userModal.loading ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-4">
                      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                      <p className="text-[var(--text-secondary)] text-sm font-bold uppercase">Fetching Deep Data...</p>
                    </div>
                  ) : (
                    <>
                      {userModal.activeTab === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 fade-in">
                          <div><label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block mb-1">Email</label><input type="text" readOnly value={userModal.data.email || 'N/A'} className="w-full p-3 rounded-xl text-sm bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-secondary)] outline-none" /></div>
                          <div><label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block mb-1">Joined</label><input type="text" readOnly value={userModal.data.created_at ? new Date(userModal.data.created_at).toLocaleString() : 'N/A'} className="w-full p-3 rounded-xl text-sm bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-secondary)] outline-none" /></div>
                          <div><label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block mb-1">Full Name</label><input type="text" value={userModal.data.name || ''} onChange={e=>setUserModal({...userModal, data: {...userModal.data, name: e.target.value}})} className="w-full p-3 rounded-xl text-sm bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] outline-none focus:border-indigo-500" /></div>
                          <div><label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block mb-1">Social Handle</label><input type="text" readOnly value={userModal.data.social || 'N/A'} className="w-full p-3 rounded-xl text-sm bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-secondary)] outline-none" /></div>
                        </div>
                      )}

                      {userModal.activeTab === 'payment' && (
                        <div className="space-y-5 fade-in">
                          <div className="bg-yellow-500/5 border border-yellow-500/20 p-3 rounded-xl flex gap-3 text-[var(--text-primary)]">
                            <i className="fas fa-info-circle text-yellow-500 mt-0.5"></i>
                            <p className="text-xs leading-relaxed">Payment details are strictly read-only for admin. Use this info to process user withdrawals.</p>
                          </div>
                          <div className="bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-xl shadow-sm">
                            <label className="text-[10px] text-indigo-500 uppercase font-bold tracking-wider block mb-1">Selected Withdrawal Method</label>
                            <div className="text-xl font-bold text-[var(--text-primary)] uppercase mb-1">{userModal.data.withdrawal_method || 'UPI (Default)'}</div>
                            <div className="text-sm font-mono text-[var(--text-secondary)] break-all">{userModal.data.withdrawal_account || 'N/A'}</div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block mb-1">Bank Name</label><input type="text" readOnly value={userModal.data.bank_name || 'N/A'} className="w-full p-2.5 rounded-lg text-sm bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-secondary)] outline-none" /></div>
                            <div><label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block mb-1">IFSC Code</label><input type="text" readOnly value={userModal.data.bank_ifsc || 'N/A'} className="w-full p-2.5 rounded-lg text-sm bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-secondary)] outline-none font-mono uppercase" /></div>
                            <div><label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block mb-1">Account Number</label><input type="text" readOnly value={userModal.data.bank_account || 'N/A'} className="w-full p-2.5 rounded-lg text-sm bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-secondary)] outline-none font-mono" /></div>
                            <div><label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block mb-1">Account Holder</label><input type="text" readOnly value={userModal.data.bank_holder || 'N/A'} className="w-full p-2.5 rounded-lg text-sm bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-secondary)] outline-none" /></div>
                          </div>
                        </div>
                      )}

                      {userModal.activeTab === 'stats' && (
                        <div className="space-y-5 fade-in">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-[var(--bg-body)] border border-[var(--glass-border)] p-4 rounded-xl text-center"><i className="fas fa-link text-[var(--text-secondary)] mb-2 text-lg"></i><div className="text-xl font-bold text-[var(--text-primary)]">{userModal.data.links_count || 0}</div><div className="text-[10px] uppercase text-[var(--text-secondary)]">Total Links</div></div>
                            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl text-center"><i className="fas fa-mouse-pointer text-blue-500 mb-2 text-lg"></i><div className="text-xl font-bold text-blue-500">{userModal.data.stats?.total || 0}</div><div className="text-[10px] uppercase text-blue-500">Total Clicks</div></div>
                            <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-xl text-center"><i className="fas fa-sack-dollar text-green-500 mb-2 text-lg"></i><div className="text-xl font-bold text-green-500">${userModal.data.stats?.earnings || '0.00'}</div><div className="text-[10px] uppercase text-green-500">Total Income</div></div>
                            <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl text-center"><i className="fas fa-coins text-yellow-500 mb-2 text-lg"></i><div className="text-xl font-bold text-yellow-500">${userModal.data.stats?.today_earnings || '0.00'}</div><div className="text-[10px] uppercase text-yellow-500">Earned Today</div></div>
                          </div>
                          <div className="bg-[var(--nav-hover)] border border-[var(--glass-border)] p-5 rounded-xl flex items-center justify-between">
                            <div><h4 className="text-[var(--text-primary)] font-bold mb-1"><i className="fas fa-user-plus mr-1 text-indigo-500"></i> Referral Info</h4><p className="text-xs text-[var(--text-secondary)]">User who invited this account to the platform.</p></div>
                            <div className="text-right">
                              <span className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Referred By</span>
                              <span className="px-3 py-1 bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] rounded font-bold text-sm">
                                {userModal.data.referred_by ? (allUsers.find(x => x.uid === userModal.data.referred_by)?.username || `UID: ${userModal.data.referred_by.substring(0,8)}...`) : "None / Direct"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {userModal.activeTab === 'roles' && (
                        <div className="grid md:grid-cols-2 gap-6 fade-in">
                          <div className="space-y-5">
                            <div><label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-2">System Role</label><select value={userModal.data.role} onChange={e=>setUserModal({...userModal, data: {...userModal.data, role: e.target.value}})} className="w-full p-3 rounded-xl bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] outline-none focus:border-indigo-500"><option value="user">Standard User</option><option value="manager">Manager (Elevated)</option></select></div>
                            <div><label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-2">Custom CPM ($)</label><input type="number" step="0.01" value={userModal.data.cpm} onChange={e=>setUserModal({...userModal, data: {...userModal.data, cpm: e.target.value}})} className="w-full p-3 rounded-xl font-mono bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] outline-none focus:border-indigo-500" /></div>
                            <div><label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-2">Valid Click Percentage (%)</label><input type="number" max="100" min="0" value={userModal.data.click_percentage ?? 100} onChange={e => setUserModal({...userModal, data: {...userModal.data, click_percentage: e.target.value}})} className="w-full p-3 rounded-xl font-mono bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] outline-none focus:border-indigo-500" /></div>
                          </div>
                          <div className="bg-[var(--nav-hover)] p-5 rounded-xl border border-[var(--glass-border)] h-fit">
                            <h4 className="text-xs text-[var(--text-secondary)] uppercase font-bold mb-4 border-b border-[var(--glass-border)] pb-2">Feature Permissions</h4>
                            <div className="flex items-center justify-between">
                              <div><p className="text-[var(--text-primary)] font-bold text-sm">File Uploads</p><p className="text-xs text-[var(--text-secondary)] mt-1">Allow user to upload to cloud</p></div>
                              <input type="checkbox" checked={!!userModal.data.can_upload} onChange={e=>setUserModal({...userModal, data: {...userModal.data, can_upload: e.target.checked}})} className="custom-checkbox" />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="p-5 border-t border-[var(--glass-border)] bg-[var(--nav-hover)] flex justify-end gap-3">
                  <button onClick={() => setUserModal({ open: false, data: null, activeTab: 'profile', loading: false })} className="px-6 py-2.5 rounded-xl font-bold bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Cancel</button>
                  <button onClick={saveUserChanges} disabled={userModal.loading} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-2.5 rounded-xl font-bold text-white shadow-md transition-colors disabled:opacity-50"><i className="fas fa-save mr-2"></i> Save Changes</button>
                </div>
              </div>
            </div>
          )}
          
          {/* TICKET VIEW MODAL */}
          {ticketModal.open && ticketModal.data && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTicketModal({ open: false, data: null })}></div>
              <div className="relative z-10 w-full max-w-lg bg-[var(--glass-panel)] border border-[var(--glass-border)] rounded-2xl shadow-2xl flex flex-col fade-in">
                <div className="flex justify-between items-center p-6 border-b border-[var(--glass-border)] bg-[var(--nav-hover)] rounded-t-2xl">
                  <div><h3 className="text-xl font-bold text-[var(--text-primary)]"><i className="fas fa-envelope-open-text text-indigo-500 mr-2"></i> Ticket #{ticketModal.data.id}</h3><p className="text-xs text-[var(--text-secondary)] mt-1">{new Date(ticketModal.data.created_at).toLocaleString()}</p></div>
                  <button onClick={() => setTicketModal({ open: false, data: null })} className="text-[var(--text-secondary)] hover:text-red-500 transition-colors"><i className="fas fa-times text-xl"></i></button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-[var(--bg-body)] p-4 rounded-xl border border-[var(--glass-border)] flex justify-between items-start">
                    <div className="cursor-pointer group" onClick={() => openUserDetailsByUid(ticketModal.data.uid)}>
                      <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors">{ticketModal.data.name} <i className="fas fa-external-link-alt text-[10px] text-[var(--text-secondary)]"></i></p>
                      <p className="text-xs text-[var(--text-secondary)]">{ticketModal.data.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${ticketModal.data.priority === 'Urgent' ? 'bg-red-500/10 text-red-500' : ticketModal.data.priority === 'High' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>{ticketModal.data.priority}</span>
                  </div>
                  <div><h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Subject</h4><p className="text-sm font-bold text-indigo-400">{ticketModal.data.subject} <span className="text-[var(--text-secondary)] font-normal">({ticketModal.data.category})</span></p></div>
                  <div><h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Message</h4><div className="bg-[var(--bg-body)] p-4 rounded-xl border border-[var(--glass-border)] text-sm text-[var(--text-primary)] whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">{ticketModal.data.message}</div></div>
                </div>
                <div className="p-5 border-t border-[var(--glass-border)] bg-[var(--nav-hover)] flex items-center justify-between rounded-b-2xl">
                  <div>{ticketModal.data.status === 'Open' ? <span className="text-emerald-500 font-bold text-xs"><i className="fas fa-circle text-[8px] animate-pulse mr-1"></i> Open</span> : <span className="text-[var(--text-secondary)] font-bold text-xs">Closed</span>}</div>
                  {ticketModal.data.status === 'Open' && <button onClick={() => handleTicketStatus(ticketModal.data.id, 'Closed')} className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl text-white font-bold text-sm transition-all shadow-md"><i className="fas fa-check mr-1"></i> Mark Resolved</button>}
                </div>
              </div>
            </div>
          )}

          {/* CONFIRM ACTION MODAL */}
          {confirmModal.open && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, open: false })}></div>
              <div className="relative z-10 w-full max-w-sm bg-[var(--glass-panel)] border border-[var(--glass-border)] rounded-2xl p-8 text-center shadow-2xl fade-in">
                <h3 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">{confirmModal.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-8">{confirmModal.msg}</p>
                <div className="flex flex-col gap-3">
                  <button onClick={executeConfirmAction} className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-colors ${confirmModal.btnClass}`}>{confirmModal.btnText}</button>
                  <button onClick={() => setConfirmModal({ ...confirmModal, open: false })} className="w-full py-3 rounded-xl bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
};

export default AdminConsole;
