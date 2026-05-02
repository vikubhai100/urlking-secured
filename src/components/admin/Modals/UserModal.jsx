import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

// --- INNER HELPERS (Taki Reference Error na aaye) ---
const fmt$ = (n) => `$${parseFloat(n || 0).toFixed(4)}`;

const ModalBadge = ({ children, color = 'slate' }) => {
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
  const [activeTab, setActiveTab] = useState('stats');
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Safety Checks for stats
  const totalEarnings = parseFloat(user?.stats?.earnings || 0);
  const totalWithdrawn = parseFloat(user?.stats?.withdrawn || 0);
  const totalPending = parseFloat(user?.stats?.pending || 0);
  const currentBalance = totalEarnings - (totalWithdrawn + totalPending);

  useEffect(() => {
    if (activeTab === 'finance' && user?.uid) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const res = await fetch(`${API}/api/withdraw/admin/requests?uid=${user.uid}`, {
            headers: { 'x-admin-token': adminToken }
          });
          const data = await res.json();
          setWithdrawals(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
        finally { setLoadingHistory(false); }
      };
      fetchHistory();
    }
  }, [activeTab, user?.uid, adminToken]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-violet-200">
              {(user.username || '?')[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 leading-tight">@{user.username || 'User'}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin Control Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="flex gap-1 p-2 bg-slate-50/50 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {['info', 'stats', 'finance', 'payment', 'config'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-violet-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab === 'finance' ? 'Wallet & History' : tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 gap-4 animate-fadeIn">
               <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                  <i className="fas fa-link text-violet-500 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Links</p>
                  <p className="text-2xl font-black text-slate-800">{user.links_count || 0}</p>
               </div>
               <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                  <i className="fas fa-mouse-pointer text-sky-500 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Clicks</p>
                  <p className="text-2xl font-black text-slate-800">{Number(user.stats?.total || 0).toLocaleString()}</p>
               </div>
               <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100">
                  <i className="fas fa-bolt text-amber-500 mb-2" />
                  <p className="text-[10px] font-bold text-amber-500 uppercase">Today Clicks</p>
                  <p className="text-2xl font-black text-amber-700">{user.stats?.today_clicks || 0}</p>
               </div>
               <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100">
                  <i className="fas fa-dollar-sign text-emerald-500 mb-2" />
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Earnings</p>
                  <p className="text-2xl font-black text-emerald-700">{fmt$(totalEarnings)}</p>
               </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-violet-600 text-white shadow-xl shadow-violet-100">
                  <p className="text-[9px] font-bold uppercase opacity-70 mb-1">Balance</p>
                  <p className="text-xl font-black font-mono">{fmt$(currentBalance)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Withdrawn</p>
                  <p className="text-xl font-black text-emerald-600 font-mono">{fmt$(totalWithdrawn)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Pending</p>
                  <p className="text-xl font-black text-amber-500 font-mono">{fmt$(totalPending)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Withdrawal History</h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50">
                      <tr><th className="p-3">DATE</th><th className="p-3 text-center">AMOUNT</th><th className="p-3 text-right">STATUS</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loadingHistory ? (
                        <tr><td colSpan="3" className="p-6 text-center animate-pulse text-slate-300">Syncing history...</td></tr>
                      ) : withdrawals.length === 0 ? (
                        <tr><td colSpan="3" className="p-10 text-center text-slate-300 italic">No history found</td></tr>
                      ) : withdrawals.map(w => (
                        <tr key={w.id}>
                          <td className="p-3 text-slate-500">{new Date(w.created_at).toLocaleDateString()}</td>
                          <td className="p-3 text-center font-bold">{fmt$(w.amount)}</td>
                          <td className="p-3 text-right">
                            <ModalBadge color={w.status === 'approved' ? 'green' : w.status === 'pending' ? 'yellow' : 'red'}>{w.status}</ModalBadge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4 animate-fadeIn">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Username</label>
                    <input readOnly value={user.username || ''} className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Role</label>
                    <input readOnly value={user.role || 'user'} className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold capitalize" />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email</label>
                  <input readOnly value={user.email || ''} className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold" />
               </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Close</button>
          <button onClick={onSaved} className="px-8 py-3 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-200">
            Save Changes
          </button>
        </div>
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }`}</style>
    </div>
  );
}
