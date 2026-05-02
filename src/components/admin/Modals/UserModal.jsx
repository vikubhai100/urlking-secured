import React, { useState } from 'react';
import Modal from './Modal';
// Note: showToast aur apiFetch ko aapne jaha rakha hai waha se import kar lena
// import { showToast } from '../../../toast'; 
// import { apiFetch } from '../../../utils/api';

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

export default function UserModal({ user, allUsers, adminToken, onClose, onSaved, apiFetch, showToast }) {
  const [tab, setTab] = useState('info');
  const [data, setData] = useState(user);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`${API}/api/admin/user`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken }, 
        body: JSON.stringify({ uid: data.uid, role: data.role, cpm: data.cpm, name: data.name, click_percentage: data.click_percentage ?? 100 }) 
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

      {/* TABS CONTENT */}
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
