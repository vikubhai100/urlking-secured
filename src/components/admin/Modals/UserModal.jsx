import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

// --- HELPERS ---
const fmt$ = (n) => `$${parseFloat(n || 0).toFixed(4)}`;

const Badge = ({ children, color = 'slate' }) => {
  const map = { 
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
    red: 'bg-red-50 text-red-600 border-red-200', 
    yellow: 'bg-amber-50 text-amber-700 border-amber-200', 
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200'
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[color]}`}>{children}</span>;
};

export default function UserModal({ user, adminToken, onClose, onSaved }) {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // 📝 EDITABLE STATE (User details + Socials)
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    role: user.role || 'user',
    cpm: user.cpm || 3.0,
    password: '',
    telegram: user.socials?.telegram || '',
    whatsapp: user.socials?.whatsapp || '',
  });

  // 💰 FINANCIALS
  const earnings = parseFloat(user.stats?.earnings || 0);
  const withdrawn = parseFloat(user.stats?.withdrawn || 0);
  const pending = parseFloat(user.stats?.pending || 0);
  const balance = earnings - (withdrawn + pending);

  // 🚀 FETCH ONLY THIS USER'S HISTORY
  useEffect(() => {
    if (activeTab === 'finance') {
      const getHistory = async () => {
        try {
          const res = await fetch(`${API}/api/withdraw/admin/requests`, {
            headers: { 'x-admin-token': adminToken }
          });
          const data = await res.json();
          // Frontend filter for safety: Sirf is user ka data dikhao
          const userHistory = data.filter(w => w.uid === user.uid);
          setHistory(userHistory);
        } catch (err) { console.error(err); }
      };
      getHistory();
    }
  }, [activeTab, user.uid, adminToken]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/users/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ uid: user.uid, ...formData })
      });
      if (res.ok) onSaved();
      else alert("Update failed!");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-[35px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
        
        {/* --- MODAL HEADER --- */}
        <div className="p-7 bg-white flex justify-between items-center border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-violet-200">
              {(user.username || '?')[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">@{user.username}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge color={user.role === 'admin' ? 'purple' : 'slate'}>{user.role}</Badge>
                <span className="text-[10px] text-slate-300 font-mono">UID: {user.uid.slice(0,15)}...</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-50 text-slate-300 hover:text-slate-600 transition-all flex items-center justify-center">
             <i className="fas fa-times" />
          </button>
        </div>

        {/* --- TAB NAVIGATION --- */}
        <div className="flex gap-1 p-2 bg-slate-50/50 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {['info', 'stats', 'finance', 'settings'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              {t === 'finance' ? 'Wallet' : t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
          
          {/* 📝 INFO & SOCIALS TAB */}
          {activeTab === 'info' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full mt-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full mt-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none">
                    <option value="user">Standard User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Social Links (Telegram/WhatsApp)</label>
                <div className="grid grid-cols-2 gap-4 mt-1.5">
                   <div className="relative">
                      <i className="fab fa-telegram absolute left-4 top-1/2 -translate-y-1/2 text-sky-500" />
                      <input value={formData.telegram} onChange={e => setFormData({...formData, telegram: e.target.value})} placeholder="@username" className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none" />
                   </div>
                   <div className="relative">
                      <i className="fab fa-whatsapp absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="Phone number" className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none" />
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* 💰 WALLET TAB */}
          {activeTab === 'finance' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-3xl bg-violet-600 text-white shadow-xl shadow-violet-100">
                   <p className="text-[9px] font-bold uppercase opacity-60">Balance</p>
                   <p className="text-lg font-black font-mono">{fmt$(balance)}</p>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Paid Out</p>
                   <p className="text-lg font-black text-emerald-600 font-mono">{fmt$(withdrawn)}</p>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Pending</p>
                   <p className="text-lg font-black text-amber-500 font-mono">{fmt$(pending)}</p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-[25px] overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr><th className="p-4 font-black text-slate-400 uppercase">Date</th><th className="p-4 text-center font-black text-slate-400">Amount</th><th className="p-4 text-right font-black text-slate-400">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.length === 0 ? (
                      <tr><td colSpan="3" className="p-10 text-center text-slate-300 italic font-medium">No withdrawal history for this user</td></tr>
                    ) : history.map(w => (
                      <tr key={w.id} className="hover:bg-slate-50/30">
                        <td className="p-4 text-slate-500 font-bold">{new Date(w.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-center font-black text-slate-700 font-mono">{fmt$(w.amount)}</td>
                        <td className="p-4 text-right"><Badge color={w.status === 'approved' ? 'green' : 'yellow'}>{w.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ⚙️ SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom CPM ($)</label>
                  <input type="number" value={formData.cpm} onChange={e => setFormData({...formData, cpm: e.target.value})} className="w-full mt-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-violet-600 outline-none" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Change Password (Leave blank to keep same)</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="New password..." className="w-full mt-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none" />
               </div>
            </div>
          )}
        </div>

        {/* --- MODAL FOOTER --- */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="px-10 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-violet-200 transition-all active:scale-95 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
