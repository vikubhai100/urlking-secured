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

// 🚀 MAIN COMPONENT
export default function UserModal({ user, allUsers, adminToken, onClose, onSaved, apiFetch }) {
  const [tab, setTab] = useState('info');
  const [data, setData] = useState(user);
  const [saving, setSaving] = useState(false);
  
  // 💰 Finance Tab Data
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  // 🚀 Fetch Finance History (Sirf is user ka filter karke)
  useEffect(() => {
    if (tab === 'finance') {
      const getHistory = async () => {
        setLoadingHistory(true);
        try {
          const res = await apiFetch(`${API}/api/withdraw/admin/requests`, {
            headers: { 'x-admin-token': adminToken }
          });
          // Ensure res is array before filtering
          if (res && Array.isArray(res)) {
            setHistory(res.filter(w => w.uid === data.uid));
          }
        } catch (err) { 
          console.error("Finance Fetch Error:", err); 
        } finally { 
          setLoadingHistory(false); 
        }
      };
      getHistory();
    }
  }, [tab, data.uid, adminToken, apiFetch]);

  // Financial Calculations
  const earnings = parseFloat(data.stats?.earnings || 0);
  const withdrawn = parseFloat(data.stats?.withdrawn || 0);
  const pending = parseFloat(data.stats?.pending || 0);
  const balance = earnings - (withdrawn + pending);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`${API}/api/admin/user`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }, 
        body: JSON.stringify({ 
          uid: data.uid, 
          role: data.role, 
          cpm: data.cpm, 
          name: data.name, 
          telegram: data.telegram, // ✅ Added Telegram back
          youtube: data.youtube,   // ✅ Added Youtube back
          click_percentage: data.click_percentage ?? 100 
        }) 
      });
      
      await apiFetch(`${API}/api/dev/toggle-permission`, { 
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
    { id: 'finance', label: 'Finance' }, // ✅ Section Present
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
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ℹ️ INFO TAB (Restored All Fields) */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
          {[['Email', data.email, true], ['Username', data.username, true], ['Mobile', data.mobile, true], ['Joined', data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A', true]].map(([lbl, val, ro]) => (
            <div key={lbl}>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{lbl}</label>
              <input readOnly={ro} value={val || ''}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-700 outline-none transition-colors" />
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
          
          {/* ✅ Telegram & Youtube Restored with Links */}
          <div className="sm:col-span-2 space-y-4 mt-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Telegram Link</label>
              <div className="flex gap-2">
                <input value={data.telegram || ''} onChange={e => set('telegram', e.target.value)} placeholder="https://t.me/username" className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 outline-none focus:border-violet-400" />
                {data.telegram && <a href={data.telegram} target="_blank" rel="noreferrer" className="px-4 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-500 hover:text-white transition-colors flex items-center"><i className="fab fa-telegram" /></a>}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">YouTube Link</label>
              <div className="flex gap-2">
                <input value={data.youtube || ''} onChange={e => set('youtube', e.target.value)} placeholder="https://youtube.com/@channel" className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 outline-none focus:border-violet-400" />
                {data.youtube && <a href={data.youtube} target="_blank" rel="noreferrer" className="px-4 rounded-xl bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white transition-colors flex items-center"><i className="fab fa-youtube" /></a>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💳 PAYMENT TAB (Restored Exactly) */}
      {tab === 'payment' && (
        <div className="space-y-4 animate-fadeIn">
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

      {/* 💰 FINANCE TAB (Added with specific user filter) */}
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
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
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
                    <tr><td colSpan="3" className="p-10 text-center italic text-slate-300">Fetching user data...</td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan="3" className="p-10 text-center text-slate-300 italic">No history found for this user</td></tr>
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

      {/* 📊 STATS TAB */}
      {tab === 'stats' && (
        <div className="space-y-4 animate-fadeIn">
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

      {/* ⚙️ CONFIG TAB (Restored All Fields) */}
      {tab === 'config' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role</label>
              <select value={data.role} onChange={e => set('role', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 outline-none focus:border-violet-400 transition-all">
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
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
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all">
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
      
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </Modal>
  );
}
