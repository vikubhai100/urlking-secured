import React, { useState, useEffect, useCallback } from 'react';
import { showToast } from '../../../toast'; 

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

// ─────────────────────────────────────────────
// FETCH HELPER
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
// USER MODAL (With Finance Section)
// ─────────────────────────────────────────────
function UserModal({ user, allUsers, adminToken, onClose, onSaved }) {
  const [tab, setTab] = useState('info');
  const [data, setData] = useState(user);
  const [saving, setSaving] = useState(false);
  
  // 🟢 Finance History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  // 🚀 Fetch specific user's withdrawal history
  useEffect(() => {
    if (tab === 'finance') {
      const getHistory = async () => {
        setLoadingHistory(true);
        try {
          const res = await apiFetch(`${API}/api/withdraw/admin/requests`, {
            headers: { 'x-admin-token': adminToken }
          });
          const json = await res.json();
          if (Array.isArray(json)) {
            // 🎯 MAIN FILTER: Sirf is user ka history dikhao
            setHistory(json.filter(w => w.uid === data.uid));
          }
        } catch (err) { console.error(err); }
        finally { setLoadingHistory(false); }
      };
      getHistory();
    }
  }, [tab, data.uid, adminToken]);

  // Financial Stats
  const earnings = parseFloat(data.stats?.earnings || 0);
  const withdrawn = parseFloat(data.stats?.withdrawn || 0);
  const pending = parseFloat(data.stats?.pending || 0);
  const balance = earnings - (withdrawn + pending);

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

  const tabs = [
    { id: 'info', label: 'Info' }, 
    { id: 'payment', label: 'Payment' }, 
    { id: 'stats', label: 'Stats' }, 
    { id: 'finance', label: 'Finance' }, // 🟢 Added
    { id: 'config', label: 'Config' }
  ];

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
          {/* Socials buttons - Kept Exactly as before */}
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

      {/* 🟢 NEW FINANCE TAB CONTENT */}
      {tab === 'finance' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-violet-600 p-4 rounded-2xl text-white shadow-lg">
              <p className="text-[9px] font-bold uppercase opacity-70 mb-1">Current Balance</p>
              <p className="text-lg font-black font-mono">{fmt$(balance)}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
              <p className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Total Paid</p>
              <p className="text-lg font-black text-emerald-700 font-mono">{fmt$(withdrawn)}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
              <p className="text-[9px] font-bold text-amber-500 uppercase mb-1">Pending</p>
              <p className="text-lg font-black text-amber-700 font-mono">{fmt$(pending)}</p>
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Withdrawal History</p>
              {loadingHistory && <Spinner sm />}
            </div>
            <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-xs text-left">
                <thead className="bg-white sticky top-0 border-b border-slate-50 text-[10px] text-slate-400 font-bold uppercase">
                  <tr><th className="p-3">Date</th><th className="p-3 text-center">Amount</th><th className="p-3 text-right">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingHistory && history.length === 0 ? (
                    <tr><td colSpan="3" className="p-10 text-center italic text-slate-300 animate-pulse">Syncing...</td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan="3" className="p-10 text-center text-slate-300 italic">No history found</td></tr>
                  ) : history.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-slate-500 font-medium">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-center font-bold font-mono text-slate-700">{fmt$(w.amount)}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${w.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : w.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
