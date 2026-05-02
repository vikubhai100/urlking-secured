import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { showToast } from '../../../toast'; 

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

// Helper Components
const Spinner = ({ sm }) => <div className={`${sm ? 'w-4 h-4 border-2' : 'w-8 h-8 border-[3px]'} rounded-full border-slate-200 border-t-violet-500 animate-spin`} />;
const fmt$ = (n, d = 2) => `$${parseFloat(n || 0).toFixed(d)}`;
const fmtN = (n) => Number(n || 0).toLocaleString();

const getTodayClicks = (u) => {
  if (u.stats?.today_clicks != null) return u.stats.today_clicks;
  const e = parseFloat(u.stats?.today_earnings || 0);
  const c = parseFloat(u.cpm || 0.5);
  return c > 0 ? Math.round((e / c) * 1000) : 0;
};

// Fetch Helper (Matches your AdminConsole logic to prevent logout)
async function apiFetchLocal(url, opts = {}) {
  const res = await fetch(url, opts);
  if (res.status === 401) { 
    localStorage.removeItem('admin_token'); 
    window.location.reload(); 
  }
  return res;
}

export default function UserModal({ user, allUsers, adminToken, onClose, onSaved }) {
  const [tab, setTab] = useState('info');
  const [data, setData] = useState(user);
  const [saving, setSaving] = useState(false);
  
  // Finance State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  // Finance Fetch Logic
  useEffect(() => {
    if (tab === 'finance') {
      const getHistory = async () => {
        setLoadingHistory(true);
        try {
          const res = await apiFetchLocal(`${API}/api/withdraw/admin/requests`, {
            headers: { 'x-admin-token': adminToken }
          });
          const json = await res.json();
          if (Array.isArray(json)) {
            setHistory(json.filter(w => w.uid === data.uid));
          }
        } catch (err) { console.error(err); }
        finally { setLoadingHistory(false); }
      };
      getHistory();
    }
  }, [tab, data.uid, adminToken]);

  // Financial Calculations
  const earnings = parseFloat(data.stats?.earnings || 0);
  const withdrawn = parseFloat(data.stats?.withdrawn || 0);
  const pending = parseFloat(data.stats?.pending || 0);
  const balance = earnings - (withdrawn + pending);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetchLocal(`${API}/api/admin/user`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }, 
        body: JSON.stringify({ 
          uid: data.uid, 
          role: data.role, 
          cpm: data.cpm, 
          name: data.name,
          telegram: data.telegram,
          youtube: data.youtube,
          click_percentage: data.click_percentage ?? 100 
        }) 
      });
      
      await apiFetchLocal(`${API}/api/dev/toggle-permission`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ uid: data.uid, can_upload: data.can_upload ? 1 : 0 }) 
      }).catch(() => {});
      
      showToast('Saved!', 'success');
      onSaved();
    } catch { 
      showToast('Save failed', 'error'); 
    } finally { 
      setSaving(false); 
    }
  };

  const tabs = [
    { id: 'info', label: 'Info' }, 
    { id: 'payment', label: 'Payment' }, 
    { id: 'stats', label: 'Stats' }, 
    { id: 'finance', label: 'Finance' },
    { id: 'config', label: 'Config' }
  ];

  const referrer = data.referred_by ? (allUsers.find(x => x.uid === data.referred_by)?.username || data.referred_by.slice(0, 8)) : null;

  return (
    <Modal open onClose={onClose} title={data.name || data.username || 'User'} subtitle={`UID: ${data.uid}`} wide
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-bold bg-violet-600 text-white flex items-center gap-2">
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
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-700 outline-none focus:border-violet-400" />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
            <input value={data.name || ''} onChange={e => set('name', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Referred By</label>
            <input readOnly value={referrer || 'Direct'} className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 outline-none" />
          </div>
          {/* ✅ Restored Social Inputs */}
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Telegram Link</label>
            <div className="flex gap-2">
              <input value={data.telegram || ''} onChange={e => set('telegram', e.target.value)} placeholder="https://t.me/..." className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 outline-none" />
              {data.telegram && <a href={data.telegram} target="_blank" rel="noreferrer" className="px-4 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center"><i className="fab fa-telegram" /></a>}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">YouTube Link</label>
            <div className="flex gap-2">
              <input value={data.youtube || ''} onChange={e => set('youtube', e.target.value)} placeholder="https://youtube.com/..." className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 outline-none" />
              {data.youtube && <a href={data.youtube} target="_blank" rel="noreferrer" className="px-4 rounded-xl bg-red-50 text-red-500 border border-red-200 flex items-center"><i className="fab fa-youtube" /></a>}
            </div>
          </div>
        </div>
      )}

      {tab === 'payment' && (
        <div className="space-y-4">
          <div className="bg-violet-50 border border-violet-200 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-violet-600 uppercase mb-1">Withdrawal Method</p>
            <p className="text-base font-bold text-slate-800 uppercase">{data.withdrawal_method || 'UPI'}</p>
            <p className="text-sm font-mono text-slate-600 mt-1 break-all">{data.withdrawal_account || data.upi_id || 'N/A'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
             {[['UPI ID', data.upi_id], ['Bank Name', data.bank_name], ['IFSC', data.bank_ifsc], ['Account No.', data.bank_account]].map(([lbl, val]) => (
              <div key={lbl}>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{lbl}</label>
                <input readOnly value={val || 'N/A'} className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 font-mono outline-none" />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'finance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-violet-600 p-4 rounded-2xl text-white">
              <p className="text-[9px] font-bold uppercase opacity-70">Balance</p>
              <p className="text-lg font-black font-mono">{fmt$(balance)}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-700">
              <p className="text-[9px] font-bold uppercase">Paid Out</p>
              <p className="text-lg font-black font-mono">{fmt$(withdrawn)}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-700">
              <p className="text-[9px] font-bold uppercase">Pending</p>
              <p className="text-lg font-black font-mono">{fmt$(pending)}</p>
            </div>
          </div>
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white max-h-[200px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-100">
                <tr><th className="p-3">Date</th><th className="p-3 text-center">Amount</th><th className="p-3 text-right">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingHistory ? <tr><td colSpan="3" className="p-10 text-center animate-pulse">Loading...</td></tr> :
                 history.length === 0 ? <tr><td colSpan="3" className="p-10 text-center text-slate-300">No data</td></tr> :
                 history.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="p-3">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-center font-bold">{fmt$(w.amount)}</td>
                    <td className="p-3 text-right capitalize font-semibold">{w.status}</td>
                  </tr>
                 ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'stats' && (
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
      )}

      {tab === 'config' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role</label>
              <select value={data.role} onChange={e => set('role', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 outline-none">
                <option value="user">User</option><option value="manager">Manager</option><option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CPM ($)</label>
              <input type="number" step="0.01" value={data.cpm || ''} onChange={e => set('cpm', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 font-mono outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Click % (0-100)</label>
              <input type="number" min="0" max="100" value={data.click_percentage ?? 100} onChange={e => set('click_percentage', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 font-mono outline-none" />
            </div>
          </div>
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
             <p className="text-sm font-bold text-slate-700">File Upload Access</p>
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
