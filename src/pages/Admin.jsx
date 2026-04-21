import React, { useState, useEffect, useCallback, useRef } from 'react';
import { showToast } from '../toast';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

// ─────────────────────────────────────────────
// FETCH HELPER — retry + timeout + abort
// ─────────────────────────────────────────────
async function apiFetch(url, opts = {}, retries = 2) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(timeout);
    if (res.status === 401) { localStorage.removeItem('admin_token'); window.location.reload(); }
    return res;
  } catch (err) {
    clearTimeout(timeout);
    if (retries > 0 && err.name !== 'AbortError') {
      await new Promise(r => setTimeout(r, 800));
      return apiFetch(url, opts, retries - 1);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────
// TINY HELPERS
// ─────────────────────────────────────────────
const fmt$ = (n, d = 2) => `$${parseFloat(n || 0).toFixed(d)}`;
const fmtN = (n) => Number(n || 0).toLocaleString();

function getTodayClicks(u) {
  if (u.stats?.today_clicks != null) return u.stats.today_clicks;
  const e = parseFloat(u.stats?.today_earnings || 0);
  const c = parseFloat(u.cpm || 0.5);
  return c > 0 ? Math.round((e / c) * 1000) : 0;
}

function Avatar({ name, size = 8 }) {
  const ch = (name || '?')[0].toUpperCase();
  const colors = ['bg-violet-500','bg-cyan-500','bg-rose-500','bg-amber-500','bg-emerald-500','bg-sky-500'];
  const color = colors[ch.charCodeAt(0) % colors.length];
  return (
    <div className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
      {ch}
    </div>
  );
}

function Badge({ children, color = 'slate' }) {
  const map = { green: 'bg-emerald-50 text-emerald-700 border-emerald-200', red: 'bg-red-50 text-red-600 border-red-200', yellow: 'bg-amber-50 text-amber-700 border-amber-200', blue: 'bg-sky-50 text-sky-700 border-sky-200', slate: 'bg-slate-100 text-slate-600 border-slate-200', purple: 'bg-violet-50 text-violet-700 border-violet-200' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[color]}`}>{children}</span>;
}

function Spinner({ sm }) {
  return <div className={`${sm ? 'w-4 h-4 border-2' : 'w-8 h-8 border-[3px]'} rounded-full border-slate-200 border-t-violet-500 animate-spin`} />;
}

function Stat({ label, value, icon, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>
          <i className={`fas ${icon} text-sm`}></i>
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800 font-mono">{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL WRAPPER
// ─────────────────────────────────────────────
function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-md'} bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="border-t border-slate-100 p-4 bg-slate-50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// USER MODAL
// ─────────────────────────────────────────────
function UserModal({ user, allUsers, adminToken, onClose, onSaved }) {
  const [tab, setTab] = useState('info');
  const [data, setData] = useState(user);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`${API}/api/admin/user`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }, body: JSON.stringify({ uid: data.uid, role: data.role, cpm: data.cpm, name: data.name, click_percentage: data.click_percentage ?? 100 }) });
      await apiFetch(`${API}/api/dev/toggle-permission`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: data.uid, can_upload: data.can_upload ? 1 : 0 }) }).catch(() => {});
      showToast('Saved!', 'success');
      onSaved();
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const tabs = [{ id: 'info', label: 'Info' }, { id: 'payment', label: 'Payment' }, { id: 'stats', label: 'Stats' }, { id: 'config', label: 'Config' }];

  const referrer = data.referred_by ? (allUsers.find(x => x.uid === data.referred_by)?.username || data.referred_by.slice(0, 8)) : null;

  return (
    <Modal open onClose={onClose} title={data.name || data.username || 'User'} subtitle={`UID: ${data.uid}`} wide
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-bold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
            {saving ? <Spinner sm /> : <i className="fas fa-save" />} Save
          </button>
        </div>
      }
    >
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[['Email', data.email, true], ['Username', data.username, true], ['Mobile', data.mobile, true], ['Joined', data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A', true]].map(([lbl, val, ro]) => (
            <div key={lbl}>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{lbl}</label>
              <input readOnly={ro} value={val || ''} onChange={ro ? undefined : e => set(lbl.toLowerCase(), e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-700 outline-none focus:border-violet-400 transition-colors" />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
            <input value={data.name || ''} onChange={e => set('name', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 outline-none focus:border-violet-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Referred By</label>
            <input readOnly value={referrer || 'Direct'} className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-600 outline-none" />
          </div>
          {data.telegram && (
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Telegram</label>
              <div className="flex gap-2">
                <input readOnly value={data.telegram} className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-600 outline-none" />
                <a href={data.telegram} target="_blank" rel="noreferrer" className="px-4 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-500 hover:text-white transition-colors flex items-center"><i className="fab fa-telegram" /></a>
              </div>
            </div>
          )}
          {data.youtube && (
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">YouTube</label>
              <div className="flex gap-2">
                <input readOnly value={data.youtube} className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-600 outline-none" />
                <a href={data.youtube} target="_blank" rel="noreferrer" className="px-4 rounded-xl bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white transition-colors flex items-center"><i className="fab fa-youtube" /></a>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'payment' && (
        <div className="space-y-4">
          <div className="bg-violet-50 border border-violet-200 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-violet-600 uppercase mb-1">Withdrawal Method</p>
            <p className="text-base font-bold text-slate-800 uppercase">{data.withdrawal_method || 'UPI'}</p>
            <p className="text-sm font-mono text-slate-600 mt-1 break-all">{data.withdrawal_account || 'N/A'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['Bank Name', data.bank_name], ['IFSC', data.bank_ifsc], ['Account No.', data.bank_account], ['Holder Name', data.bank_holder]].map(([lbl, val]) => (
              <div key={lbl}>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{lbl}</label>
                <input readOnly value={val || 'N/A'} className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-700 font-mono outline-none" />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total Links', value: fmtN(data.links_count), icon: 'fa-link', c: 'bg-slate-100 text-slate-500' },
              { label: 'Total Clicks', value: fmtN(data.stats?.total), icon: 'fa-mouse-pointer', c: 'bg-violet-100 text-violet-500' },
              { label: 'Today Clicks', value: fmtN(getTodayClicks(data)), icon: 'fa-bolt', c: 'bg-sky-100 text-sky-500' },
              { label: 'Total Earned', value: fmt$(data.stats?.earnings, 2), icon: 'fa-dollar-sign', c: 'bg-emerald-100 text-emerald-500' },
              { label: 'Today Earned', value: fmt$(data.stats?.today_earnings, 4), icon: 'fa-coins', c: 'bg-amber-100 text-amber-500' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-sm">
                <div className={`w-8 h-8 rounded-lg ${s.c} flex items-center justify-center mx-auto mb-2`}><i className={`fas ${s.icon} text-sm`} /></div>
                <div className="text-xl font-bold text-slate-800 font-mono">{s.value}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'config' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role</label>
              <select value={data.role} onChange={e => set('role', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 outline-none focus:border-violet-400">
                <option value="user">User</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CPM ($)</label>
              <input type="number" step="0.01" value={data.cpm || ''} onChange={e => set('cpm', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 font-mono outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Click % (0-100)</label>
              <input type="number" min="0" max="100" value={data.click_percentage ?? 100} onChange={e => set('click_percentage', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 font-mono outline-none focus:border-violet-400" />
            </div>
          </div>
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div>
              <p className="text-sm font-bold text-slate-700">File Upload Access</p>
              <p className="text-xs text-slate-400 mt-0.5">Allow this user to upload files</p>
            </div>
            <button onClick={() => set('can_upload', !data.can_upload)}
              className={`relative w-12 h-6 rounded-full transition-colors ${data.can_upload ? 'bg-violet-500' : 'bg-slate-200'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${data.can_upload ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─────────────────────────────────────────────
// CONFIRM MODAL
// ─────────────────────────────────────────────
function ConfirmModal({ open, title, message, confirmText, danger, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`px-5 py-2 rounded-xl text-sm font-bold text-white transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-violet-600 hover:bg-violet-700'}`}>{confirmText}</button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const AdminConsole = () => {
  const [state, setState] = useState('loading');
  const [isSetup, setIsSetup] = useState(false);
  const [pass, setPass] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [tab, setTab] = useState('users');
  const [sidebar, setSidebar] = useState(false);

  const [users, setUsers]         = useState([]);
  const [withdrawals, setWith]    = useState([]);
  const [tickets, setTickets]     = useState([]);
  const [stats, setStats]         = useState({ users: 0, clicks: 0, payout: 0, today: 0 });

  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const PER_PAGE = 12;
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  const [userModal, setUserModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [ticketModal, setTicketModal]   = useState(null);

  const [globalCpm, setGlobalCpm] = useState('0.50');

  // Mailer
  const [mailer, setMailer] = useState({ subject: '', title: '', message: '', adminKey: '' });
  const [mailing, setMailing] = useState(false);

  const logout = useCallback(() => {
    if (token) apiFetch(`${API}/api/admin/logout`, { method: 'POST', headers: { 'x-admin-token': token } }).catch(() => {});
    localStorage.removeItem('admin_token');
    window.location.reload();
  }, [token]);

  // ── AUTH ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('key');
    (async () => {
      try {
        if (key) {
          const res = await apiFetch(`${API}/api/admin/access`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
          const d = await res.json();
          if (!d.valid) return setState('ghost');
        } else if (!token) return setState('ghost');
        const sys = await apiFetch(`${API}/api/admin/status`);
        const sd = await sys.json();
        if (!sd.is_setup) { setIsSetup(true); setState('login'); }
        else if (token) { setState('dashboard'); }
        else setState('login');
      } catch { setState('login'); }
    })();
  }, []);

  const doLogin = async () => {
    if (!pass) return;
    try {
      const ep = isSetup ? '/api/admin/setup' : '/api/admin/login';
      const res = await apiFetch(`${API}${ep}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pass }) });
      const d = await res.json();
      if (d.token) { localStorage.setItem('admin_token', d.token); setToken(d.token); setState('dashboard'); }
      else showToast(d.error || 'Wrong password', 'error');
    } catch { showToast('Connection error', 'error'); }
  };

  // ── DATA FETCH ──
  const loadUsers = useCallback(async (t = token) => {
    if (!t) return;
    setLoading(true);
    try {
      const isRecycle = tab === 'recycle';
      const res = await apiFetch(`${API}/api/admin/users?deleted=${isRecycle}`, { headers: { 'x-admin-token': t } });
      const data = await res.json();
      setUsers(data);
      setStats({
        users: data.length,
        clicks: data.reduce((s, u) => s + (u.stats?.total || 0), 0),
        payout: data.reduce((s, u) => s + parseFloat(u.stats?.earnings || 0), 0),
        today: data.reduce((s, u) => s + parseFloat(u.stats?.today_earnings || 0), 0),
      });
    } catch { showToast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }, [token, tab]);

  const loadWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/api/withdraw/admin/requests`, { headers: { 'x-admin-token': token } });
      const d = await res.json();
      setWith(Array.isArray(d) ? d : []);
    } catch { showToast('Failed', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/api/support/admin/tickets`, { headers: { 'x-admin-token': token } });
      const d = await res.json();
      setTickets(Array.isArray(d) ? d : []);
    } catch { showToast('Failed', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    if (state !== 'dashboard') return;
    setSelected([]); setSelectMode(false); setPage(1);
    if (['users', 'managers', 'recycle', 'top'].includes(tab)) loadUsers();
    else if (tab === 'withdrawals') loadWithdrawals();
    else if (tab === 'tickets') loadTickets();
  }, [tab, state]);

  // ── OPEN USER MODAL ──
  const openUser = async (uid) => {
    const base = users.find(u => u.uid === uid) || { uid };
    setUserModal({ ...base, _loading: true });
    try {
      const res = await apiFetch(`${API}/api/admin/users/${uid}`, { headers: { 'x-admin-token': token } });
      if (res.ok) { const d = await res.json(); setUserModal({ ...base, ...d, _loading: false }); }
      else setUserModal(p => ({ ...p, _loading: false }));
    } catch { setUserModal(p => ({ ...p, _loading: false })); }
  };

  // ── ACTIONS ──
  const execAction = async (type, payload) => {
    setConfirmModal(null);
    setLoading(true);
    try {
      const map = {
        global_cpm:      [`${API}/api/admin/global-cpm`,        'POST', { cpm: payload }],
        allow_uploads:   [`${API}/api/dev/allow-all-uploads`,   'POST', {}],
        promote:         [`${API}/api/admin/user`,              'PUT',  { uid: payload, role: 'manager', cpm: users.find(u=>u.uid===payload)?.cpm }],
        demote:          [`${API}/api/admin/user`,              'PUT',  { uid: payload, role: 'user',    cpm: users.find(u=>u.uid===payload)?.cpm }],
        delete:          [`${API}/api/admin/soft-delete`,       'POST', { uids: payload }],
        restore:         [`${API}/api/admin/restore`,           'POST', { uids: payload }],
        permanent:       [`${API}/api/admin/permanent-delete`,  'POST', { uids: payload }],
      };
      const [url, method, body] = map[type];
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify(body) });
      const d = await res.json();
      if (d.ok || res.ok) { showToast('Done!', 'success'); loadUsers(); setSelected([]); }
      else showToast(d.error || 'Failed', 'error');
    } catch { showToast('Error', 'error'); }
    finally { setLoading(false); }
  };

  const confirm = (type, payload, cfg) => setConfirmModal({ type, payload, ...cfg });

  const handleWithdrawal = async (id, action) => {
    try {
      const res = await apiFetch(`${API}/api/withdraw/admin/action`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ id, action }) });
      const d = await res.json();
      if (d.ok) { showToast(`${action}d!`, 'success'); loadWithdrawals(); }
    } catch { showToast('Error', 'error'); }
  };

  const handleTicket = async (id, status) => {
    try {
      const res = await apiFetch(`${API}/api/support/admin/tickets/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ status }) });
      if (res.ok) { showToast('Updated', 'success'); setTicketModal(null); loadTickets(); }
    } catch { showToast('Error', 'error'); }
  };

  const sendMail = async () => {
    const { adminKey, subject, title, message } = mailer;
    if (!adminKey || !subject || !title || !message) return showToast('Fill all fields', 'error');
    setMailing(true);
    try {
      const res = await apiFetch(`${API}/api/admin/send-bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ adminKey, subject, title, message }) });
      const d = await res.json();
      if (res.ok) showToast(d.message || 'Sent!', 'success');
      else showToast(d.error || 'Failed', 'error');
    } catch { showToast('Error', 'error'); }
    finally { setMailing(false); }
  };

  // ── FILTERED / PAGINATED USERS ──
  const filteredUsers = users.filter(u => {
    if (tab === 'managers') return u.role === 'manager' || u.role === 'admin';
    const q = search.toLowerCase();
    return !q || (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE));
  const pageUsers  = filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const NAV = [
    { id: 'users',       icon: 'fa-users',           label: 'Users' },
    { id: 'top',         icon: 'fa-trophy',           label: 'Leaderboard' },
    { id: 'withdrawals', icon: 'fa-wallet',           label: 'Withdrawals' },
    { id: 'tickets',     icon: 'fa-headset',          label: 'Support',    dot: tickets.some(t => t.status === 'Open') },
    { id: 'mailer',      icon: 'fa-paper-plane',      label: 'Mailer' },
    { id: 'managers',    icon: 'fa-user-shield',      label: 'Managers' },
    { id: 'recycle',     icon: 'fa-trash',            label: 'Recycle' },
    { id: 'settings',   icon: 'fa-sliders-h',        label: 'Settings' },
  ];

  // ── GHOST ──
  if (state === 'ghost') return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="text-5xl font-bold text-slate-700">404</p></div>;

  // ── LOGIN ──
  if (state === 'login') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-violet-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <i className="fas fa-shield-halved text-violet-600 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 text-center mb-1">{isSetup ? 'Setup Admin' : 'Admin Login'}</h2>
        <p className="text-xs text-slate-400 text-center mb-6">Enter your password to continue</p>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()}
          placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-violet-400 text-center font-bold mb-4" />
        <button onClick={doLogin} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors">
          {isSetup ? 'Create Admin' : 'Sign In'}
        </button>
      </div>
    </div>
  );

  // ── LOADING ──
  if (state === 'loading') return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Spinner /></div>
  );

  // ── DASHBOARD ──
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
      `}</style>

      {/* ── LOADING OVERLAY ── */}
      {loading && (
        <div className="fixed inset-0 z-40 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
          <Spinner />
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <>
        {sidebar && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebar(false)} />}
        <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200 ${sidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:sticky md:top-0 md:h-screen`}>
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-shield-halved text-white text-sm" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">AdminPanel</p>
                <p className="text-[10px] text-slate-400">URLKing</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {NAV.map(n => (
              <button key={n.id} onClick={() => { setTab(n.id); setSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${tab === n.id ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                <i className={`fas ${n.icon} w-4 text-center`} />
                {n.label}
                {n.dot && <span className="absolute right-3 w-2 h-2 bg-red-400 rounded-full animate-pulse" />}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-slate-100">
            <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 font-medium transition-colors">
              <i className="fas fa-sign-out-alt w-4 text-center" /> Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-20">
          <button onClick={() => setSidebar(true)} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <i className="fas fa-bars text-sm" />
          </button>
          <span className="font-bold text-slate-800 text-sm">AdminPanel</span>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-5">

          {/* ── USERS / MANAGERS / RECYCLE ── */}
          {['users','managers','recycle'].includes(tab) && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat label="Total Users"  value={fmtN(stats.users)}  icon="fa-users"         accent="bg-violet-100 text-violet-500" />
                <Stat label="Total Clicks" value={fmtN(stats.clicks)} icon="fa-mouse-pointer"  accent="bg-sky-100 text-sky-500" />
                <Stat label="Total Payout" value={fmt$(stats.payout)} icon="fa-sack-dollar"   accent="bg-emerald-100 text-emerald-500" />
                <Stat label="Today Earned" value={fmt$(stats.today, 4)} icon="fa-coins"       accent="bg-amber-100 text-amber-500" />
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email…"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-violet-400 text-slate-700" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectMode(s => !s); setSelected([]); }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${selectMode ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300'}`}>
                    <i className={`fas ${selectMode ? 'fa-times' : 'fa-check-square'} mr-1.5`} />{selectMode ? 'Cancel' : 'Select'}
                  </button>
                  {selectMode && selected.length > 0 && (
                    <button onClick={() => confirm(tab === 'recycle' ? 'restore' : 'delete', selected, { title: tab === 'recycle' ? 'Restore?' : 'Suspend?', message: `${selected.length} user(s) selected.`, confirmText: tab === 'recycle' ? 'Restore' : 'Suspend', danger: tab !== 'recycle' })}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white border border-red-500 hover:bg-red-600 transition-colors">
                      Action ({selected.length})
                    </button>
                  )}
                  <button onClick={() => loadUsers()} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:border-violet-300 transition-colors">
                    <i className="fas fa-sync-alt" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {selectMode && <th className="w-10 p-4 text-center"><input type="checkbox" onChange={e => setSelected(e.target.checked ? pageUsers.map(u => u.uid) : [])} checked={selected.length > 0 && selected.length === pageUsers.length} className="rounded border-slate-300 text-violet-600" /></th>}
                        <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                        <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Links</th>
                        <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clicks</th>
                        <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Earned</th>
                        <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                        <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pageUsers.length === 0 ? (
                        <tr><td colSpan="7" className="p-10 text-center text-slate-400 text-sm">No users found</td></tr>
                      ) : pageUsers.map(u => (
                        <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                          {selectMode && <td className="p-4 text-center"><input type="checkbox" checked={selected.includes(u.uid)} onChange={() => setSelected(p => p.includes(u.uid) ? p.filter(x => x !== u.uid) : [...p, u.uid])} className="rounded border-slate-300 text-violet-600" /></td>}
                          <td className="p-4">
                            <button onClick={() => openUser(u.uid)} className="flex items-center gap-3 text-left hover:text-violet-600 transition-colors">
                              <Avatar name={u.username} />
                              <div>
                                <div className="font-semibold text-slate-800 text-sm">{u.username || 'Unknown'}</div>
                                <div className="text-xs text-slate-400">{u.email}</div>
                              </div>
                            </button>
                          </td>
                          <td className="p-4 text-center text-slate-600 font-mono">{u.links_count || 0}</td>
                          <td className="p-4 text-center font-bold text-slate-800 font-mono">{fmtN(u.stats?.total)}</td>
                          <td className="p-4 text-center font-bold text-emerald-600 font-mono">{fmt$(u.stats?.earnings)}</td>
                          <td className="p-4 text-center"><Badge color={u.role === 'admin' ? 'purple' : u.role === 'manager' ? 'blue' : 'slate'}>{u.role || 'user'}</Badge></td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {tab !== 'recycle' ? (
                                <>
                                  <button onClick={() => openUser(u.uid)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200 transition-colors">
                                    <i className="fas fa-edit mr-1" />Edit
                                  </button>
                                  <button onClick={() => confirm('delete', [u.uid], { title: 'Suspend user?', message: `Suspend ${u.username}?`, confirmText: 'Suspend', danger: true })}
                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 flex items-center justify-center transition-colors">
                                    <i className="fas fa-ban text-xs" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => confirm('restore', [u.uid], { title: 'Restore?', message: `Restore ${u.username}?`, confirmText: 'Restore', danger: false })}
                                    className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center transition-colors">
                                    <i className="fas fa-trash-restore text-xs" />
                                  </button>
                                  <button onClick={() => confirm('permanent', [u.uid], { title: 'Delete forever?', message: `Permanently delete ${u.username}? This cannot be undone.`, confirmText: 'Delete Forever', danger: true })}
                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 flex items-center justify-center transition-colors">
                                    <i className="fas fa-skull text-xs" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
                  <p className="text-xs text-slate-400">{filteredUsers.length} users · Page {page}/{totalPages}</p>
                  <div className="flex gap-1.5">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:border-violet-300 transition-colors text-xs"><i className="fas fa-chevron-left" /></button>
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:border-violet-300 transition-colors text-xs"><i className="fas fa-chevron-right" /></button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── TOP PERFORMERS ── */}
          {tab === 'top' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <i className="fas fa-trophy text-amber-400 text-xl" />
                <h3 className="font-bold text-slate-800">Leaderboard — Today</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100 bg-slate-50">
                    <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase w-14">Rank</th>
                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase">User</th>
                    <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Clicks</th>
                    <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Earned</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {[...users].filter(u => getTodayClicks(u) > 0 || parseFloat(u.stats?.today_earnings || 0) > 0)
                      .sort((a, b) => getTodayClicks(b) - getTodayClicks(a))
                      .map((u, i) => (
                        <tr key={u.uid} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => openUser(u.uid)}>
                          <td className="p-4 text-center text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-slate-400 font-mono text-sm">#{i+1}</span>}</td>
                          <td className="p-4"><div className="flex items-center gap-3"><Avatar name={u.username} /><div><div className="font-semibold text-slate-800">{u.username}</div><div className="text-xs text-slate-400">{u.email}</div></div></div></td>
                          <td className="p-4 text-center font-bold text-sky-600 font-mono">{fmtN(getTodayClicks(u))}</td>
                          <td className="p-4 text-center font-bold text-emerald-600 font-mono">{fmt$(u.stats?.today_earnings, 4)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── WITHDRAWALS ── */}
          {tab === 'withdrawals' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3"><i className="fas fa-wallet text-emerald-500 text-xl" /><h3 className="font-bold text-slate-800">Withdrawal Requests</h3></div>
                <button onClick={loadWithdrawals} className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:border-emerald-300 transition-colors"><i className="fas fa-sync-alt mr-1.5" />Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100 bg-slate-50">
                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase">User</th>
                    <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase">Amount</th>
                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase">Method / Account</th>
                    <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Status</th>
                    <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase">Action</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {withdrawals.length === 0 ? <tr><td colSpan="5" className="p-10 text-center text-slate-400">No requests</td></tr>
                      : withdrawals.map(w => (
                        <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 cursor-pointer" onClick={() => openUser(w.uid)}>
                            <div className="font-semibold text-slate-800 hover:text-violet-600 transition-colors">{w.username || 'User'}</div>
                            <div className="text-xs text-slate-400">{w.email}</div>
                          </td>
                          <td className="p-4 text-right font-bold text-emerald-600 font-mono text-base">{fmt$(w.amount)}</td>
                          <td className="p-4"><span className="text-xs font-bold text-violet-600 uppercase">{w.method}: </span><span className="text-xs text-slate-500 font-mono break-all">{w.account_details}</span></td>
                          <td className="p-4 text-center"><Badge color={w.status === 'approved' ? 'green' : w.status === 'rejected' ? 'red' : 'yellow'}>{w.status}</Badge></td>
                          <td className="p-4 text-right">
                            {w.status === 'pending' && (
                              <div className="flex gap-1.5 justify-end">
                                <button onClick={() => handleWithdrawal(w.id, 'approve')} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"><i className="fas fa-check mr-1" />Pay</button>
                                <button onClick={() => handleWithdrawal(w.id, 'reject')} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors"><i className="fas fa-times mr-1" />Reject</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TICKETS ── */}
          {tab === 'tickets' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3"><i className="fas fa-headset text-rose-500 text-xl" /><h3 className="font-bold text-slate-800">Support Tickets</h3></div>
                <button onClick={loadTickets} className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:border-rose-300 transition-colors"><i className="fas fa-sync-alt mr-1.5" />Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100 bg-slate-50">
                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase">User</th>
                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase">Subject</th>
                    <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Priority</th>
                    <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Status</th>
                    <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase">Action</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {tickets.length === 0 ? <tr><td colSpan="5" className="p-10 text-center text-slate-400">No tickets</td></tr>
                      : tickets.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 cursor-pointer" onClick={() => openUser(t.uid)}>
                            <div className="font-semibold text-slate-800 hover:text-violet-600 transition-colors">{t.name}</div>
                            <div className="text-xs text-slate-400">{t.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-700">{t.subject}</div>
                            <div className="text-xs text-slate-400">{t.category}</div>
                          </td>
                          <td className="p-4 text-center"><Badge color={t.priority === 'Urgent' ? 'red' : t.priority === 'High' ? 'yellow' : 'blue'}>{t.priority}</Badge></td>
                          <td className="p-4 text-center"><Badge color={t.status === 'Open' ? 'green' : 'slate'}>{t.status}</Badge></td>
                          <td className="p-4 text-right">
                            <button onClick={() => setTicketModal(t)} className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 border border-violet-200 text-xs font-semibold hover:bg-violet-100 transition-colors"><i className="fas fa-eye mr-1" />View</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── MAILER ── */}
          {tab === 'mailer' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center"><i className="fas fa-paper-plane text-sky-600" /></div>
                <div><h3 className="font-bold text-slate-800">Broadcast Mailer</h3><p className="text-xs text-slate-400">Send email to all users</p></div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[['Admin Secret Key', 'adminKey', 'password'], ['Email Subject', 'subject', 'text']].map(([lbl, key, type]) => (
                    <div key={key}>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{lbl}</label>
                      <input type={type} value={mailer[key]} onChange={e => setMailer(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-sky-400" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Mail Title</label>
                  <input value={mailer.title} onChange={e => setMailer(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-sky-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Message (HTML ok)</label>
                  <textarea rows={5} value={mailer.message} onChange={e => setMailer(p => ({ ...p, message: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-sky-400 resize-y" />
                </div>
                <button onClick={sendMail} disabled={mailing} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50">
                  {mailing ? <><Spinner sm /> Sending…</> : <><i className="fas fa-paper-plane" /> Send Broadcast</>}
                </button>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && (
            <div className="max-w-2xl space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><i className="fas fa-dollar-sign text-emerald-600" /></div>
                  <div><h4 className="font-bold text-slate-800">Global CPM</h4><p className="text-xs text-slate-400">Apply CPM to all users at once</p></div>
                </div>
                <div className="flex gap-3 items-center">
                  <input type="number" step="0.01" value={globalCpm} onChange={e => setGlobalCpm(e.target.value)} className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono font-bold text-lg text-center outline-none focus:border-emerald-400" />
                  <button onClick={() => confirm('global_cpm', globalCpm, { title: 'Update Global CPM?', message: `Set CPM to $${globalCpm} for ALL users. This cannot be undone.`, confirmText: 'Apply Now', danger: false })}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors">
                    Apply to All
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center"><i className="fas fa-cloud-upload-alt text-violet-600" /></div>
                  <div><h4 className="font-bold text-slate-800">Mass Upload Permissions</h4><p className="text-xs text-slate-400">Grant upload access to all users</p></div>
                </div>
                <button onClick={() => confirm('allow_uploads', null, { title: 'Allow uploads for ALL?', message: 'This grants file upload permission to every registered user.', confirmText: 'Allow All', danger: false })}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm flex items-center gap-2 transition-colors">
                  <i className="fas fa-unlock-alt" /> Authorize All Users
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── USER MODAL ── */}
      {userModal && !userModal._loading && (
        <UserModal user={userModal} allUsers={users} adminToken={token}
          onClose={() => setUserModal(null)}
          onSaved={() => { setUserModal(null); loadUsers(); showToast('Saved!', 'success'); }} />
      )}
      {userModal?._loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 shadow-2xl">
            <Spinner /><p className="text-sm text-slate-500">Loading user…</p>
          </div>
        </div>
      )}

      {/* ── TICKET MODAL ── */}
      {ticketModal && (
        <Modal open onClose={() => setTicketModal(null)} title={`Ticket #${ticketModal.id}`} subtitle={ticketModal.subject}
          footer={ticketModal.status === 'Open' && (
            <div className="flex justify-end">
              <button onClick={() => handleTicket(ticketModal.id, 'Closed')} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors">
                <i className="fas fa-check mr-2" />Mark Resolved
              </button>
            </div>
          )}>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
              <div><p className="font-semibold text-slate-800 text-sm">{ticketModal.name}</p><p className="text-xs text-slate-400">{ticketModal.email}</p></div>
              <Badge color={ticketModal.priority === 'Urgent' ? 'red' : ticketModal.priority === 'High' ? 'yellow' : 'blue'}>{ticketModal.priority}</Badge>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">{ticketModal.message}</div>
            <p className="text-xs text-slate-400 text-right">{new Date(ticketModal.created_at).toLocaleString()}</p>
          </div>
        </Modal>
      )}

      {/* ── CONFIRM MODAL ── */}
      {confirmModal && (
        <ConfirmModal open onClose={() => setConfirmModal(null)}
          title={confirmModal.title} message={confirmModal.message}
          confirmText={confirmModal.confirmText} danger={confirmModal.danger}
          onConfirm={() => execAction(confirmModal.type, confirmModal.payload)} />
      )}
    </div>
  );
};

export default AdminConsole;
