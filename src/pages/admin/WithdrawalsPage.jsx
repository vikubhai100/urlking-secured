import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

const fmt$ = (n) => `$${parseFloat(n || 0).toFixed(2)}`;
const Badge = ({ children, color = 'slate' }) => {
  const map = { green: 'bg-emerald-50 text-emerald-700 border-emerald-200', red: 'bg-red-50 text-red-600 border-red-200', yellow: 'bg-amber-50 text-amber-700 border-amber-200' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[color] || map.slate}`}>{children}</span>;
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
        alert(`${action}d successfully!`); // Yahan apna showToast use kar lena
        loadWithdrawals(); 
      }
    } catch (err) {
      alert('Error processing request');
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <i className="fas fa-wallet text-emerald-500" /> Withdrawals
        </h2>
        <button onClick={loadWithdrawals} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 shadow-sm transition-colors">
          <i className={`fas fa-sync-alt mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase w-16">#ID</th>
                <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase">User</th>
                <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase">Amount</th>
                <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase">Method / Account</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Status</th>
                <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {withdrawals.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-slate-400">{loading ? 'Loading...' : 'No requests pending'}</td></tr>
              ) : withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-500">#{w.id}</td>
                  <td className="p-4 cursor-pointer">
                    <div className="font-semibold text-slate-800 hover:text-violet-600 transition-colors">{w.username || 'User'}</div>
                    <div className="text-xs text-slate-400">{w.email}</div>
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-600 font-mono text-base">{fmt$(w.amount)}</td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-violet-600 uppercase">{w.method}: </span>
                    <span className="text-xs text-slate-500 font-mono break-all">{w.account_details}</span>
                  </td>
                  <td className="p-4 text-center">
                    <Badge color={w.status === 'approved' ? 'green' : w.status === 'rejected' ? 'red' : 'yellow'}>{w.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    {w.status === 'pending' && (
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => handleWithdrawal(w.id, 'approve')} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-sm"><i className="fas fa-check mr-1" />Pay</button>
                        <button onClick={() => handleWithdrawal(w.id, 'reject')} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors shadow-sm"><i className="fas fa-times mr-1" />Reject</button>
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
