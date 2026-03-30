import React, { useState, useEffect } from 'react';

const Withdraw = ({ token, user }) => {
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);
  const API = "https://go.urlking.site";

  useEffect(() => { loadWithdrawalInfo(); }, []);

  const loadWithdrawalInfo = async () => {
    try {
      const res = await fetch(`${API}/api/withdraw/info`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setHistory(data.history || []);
    } catch (e) { console.error(e); }
  };

  const handleRequest = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 2.00) return alert("Minimum withdrawal is $2.00");
    try {
      const res = await fetch(`${API}/api/withdraw/request`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt })
      });
      const data = await res.json();
      if (res.ok) { alert("Withdrawal requested!"); setAmount(''); loadWithdrawalInfo(); } 
      else { alert(data.error || "Request failed"); }
    } catch(e) { alert("Server Error"); }
  };

  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Withdraw Funds</h2>
      
      <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-emerald-900/10 to-slate-900/10 border-emerald-500/30">
        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-emerald-500 font-bold uppercase tracking-wider text-sm mb-1">Available Balance</p>
            <h1 className="text-4xl font-bold font-mono">${Number(user?.balance || 0).toFixed(4)}</h1>
            <p className="text-sm mt-1 text-slate-400">Min limit: <span className="font-bold text-white">$2.00</span></p>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
             <i className="fas fa-coins text-3xl text-emerald-500"></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><i className="fas fa-paper-plane text-indigo-400"></i> Request Payment</h3>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl mb-4">
             <p className="text-sm text-indigo-400"><i className="fas fa-info-circle mr-1"></i> Payment sent to account details saved in Settings.</p>
          </div>
          <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input type="number" step="0.01" placeholder="0.00" className="input-premium w-full p-3 pl-8 rounded-xl font-mono" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <button onClick={handleRequest} className="btn-action w-full py-3 rounded-xl text-white font-bold flex justify-center items-center gap-2">
            Request Withdraw <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Status Guide</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> Pending</div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Approved</div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Rejected</div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Transaction History</h3>
      <div className="glass-panel rounded-2xl overflow-hidden w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead className="border-b border-[var(--glass-border)] bg-[var(--table-header-bg)] text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="p-4 pl-6">Date</th>
              <th className="p-4">ID</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Method</th>
              <th className="p-4 pr-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glass-border)] text-sm">
            {history.length === 0 ? (
               <tr><td colSpan="5" className="p-6 text-center text-slate-400">No transactions found.</td></tr>
            ) : (
               history.map(item => (
                 <tr key={item.id} className="hover:bg-white/5">
                   <td className="p-4 pl-6 text-slate-400 font-mono text-xs">{new Date(item.created_at).toLocaleDateString()}</td>
                   <td className="p-4 text-slate-400 text-xs">#{item.id}</td>
                   <td className="p-4 font-bold font-mono">${item.amount.toFixed(2)}</td>
                   <td className="p-4 text-slate-400 text-xs">{item.method}</td>
                   <td className="p-4">
                     <span className={`px-2 py-1 rounded-md text-xs font-bold border uppercase ${item.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : item.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                       {item.status}
                     </span>
                   </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Withdraw;
