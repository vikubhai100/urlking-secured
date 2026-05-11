import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

const fmt$ = (n) => `$${parseFloat(n || 0).toFixed(2)}`;

const Badge = ({ children, color = 'slate' }) => {
  const map = { 
    green:  'bg-emerald-50 text-emerald-700 border-emerald-200', 
    red:    'bg-red-50 text-red-600 border-red-200', 
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    slate:  'bg-slate-100 text-slate-500 border-slate-200'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${map[color] || map.slate}`}>
      {children}
    </span>
  );
};

export default function WithdrawalsPage() {
  const [withdrawals, setWith] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('admin_token');

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/withdraw/admin/requests`, { headers: { 'x-admin-token': token } });
      const d = await res.json();
      setWith(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWithdrawals(); }, []);

  const handleWithdrawal = async (id, action) => {
    try {
      const res = await fetch(`${API}/api/withdraw/admin/action`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, 
        body: JSON.stringify({ id, action }) 
      });
      const d = await res.json();
      if (d.ok || res.ok) { 
        alert(`${action}d successfully!`);
        loadWithdrawals(); 
      }
    } catch (err) {
      alert('Error processing request');
    }
  };

  const pending = withdrawals.filter(w => w.status === 'pending');
  const totalPending = pending.reduce((s, w) => s + parseFloat(w.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{background:'linear-gradient(135deg,#10b981,#059669)',boxShadow:'0 8px 20px rgba(16,185,129,0.3)'}}>
            <i className="fas fa-wallet text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Withdrawals</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              {pending.length} pending · {fmt$(totalPending)} total
            </p>
          </div>
        </div>
        <button 
          onClick={loadWithdrawals}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-600 shadow-sm transition-all"
        >
          <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70 w-16">#ID</th>
                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">User</th>
                <th className="px-5 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Amount</th>
                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Method / Account</th>
                <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Status</th>
                <th className="px-5 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <div className="w-5 h-5 border-2 rounded-full border-slate-200 border-t-emerald-500 animate-spin" />
                        <span className="text-sm font-medium">Loading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <i className="fas fa-inbox text-3xl text-slate-400" />
                        <p className="font-bold text-slate-500 text-sm">No pending requests</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : withdrawals.map(w => (
                <tr key={w.id} className="group hover:bg-emerald-50/30 transition-colors duration-150">
                  <td className="px-5 py-4 font-mono font-bold text-slate-400 text-xs">#{w.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">{w.username || 'User'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{w.email}</div>
                  </td>
                  <td className="px-5 py-4 text-right font-black font-mono text-emerald-600 text-base">{fmt$(w.amount)}</td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-black text-violet-600 uppercase tracking-wider">{w.method}</span>
                    <span className="text-slate-300 mx-1">·</span>
                    <span className="text-xs text-slate-500 font-mono break-all">{w.account_details}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Badge color={w.status === 'approved' ? 'green' : w.status === 'rejected' ? 'red' : 'yellow'}>
                      {w.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {w.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleWithdrawal(w.id, 'approve')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm active:scale-95"
                        >
                          <i className="fas fa-check mr-1" /> Pay
                        </button>
                        <button 
                          onClick={() => handleWithdrawal(w.id, 'reject')}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 text-xs font-black uppercase tracking-wider hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm active:scale-95"
                        >
                          <i className="fas fa-times mr-1" /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
