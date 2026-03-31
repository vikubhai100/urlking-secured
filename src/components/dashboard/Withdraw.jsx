import React, { useState, useEffect, useCallback } from 'react';
import { showToast } from '../../toast'; // Premium Toast

const Withdraw = ({ token, user }) => {
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use Env Variables if available, else fallback to hardcoded
  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  const loadWithdrawalInfo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/withdraw/info`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history || []);
      } else {
        showToast(data.error || "Failed to load history", "error");
      }
    } catch (e) { 
      console.error(e); 
      showToast("Network error while loading history", "error");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => { 
    loadWithdrawalInfo(); 
  }, [loadWithdrawalInfo]);

  const handleRequest = async () => {
    const amt = parseFloat(amount);
    const availableBalance = parseFloat(user?.balance || 0);

    // Front-end Validations
    if (!amt || isNaN(amt)) return showToast("Please enter a valid amount", "error");
    if (amt < 2.00) return showToast("Minimum withdrawal is $2.00", "error");
    if (amt > availableBalance) return showToast("Insufficient balance!", "error");

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/withdraw/request`, {
        method: "POST", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt })
      });
      const data = await res.json();
      
      if (res.ok) { 
        showToast("Withdrawal requested successfully!", "success"); 
        setAmount(''); 
        loadWithdrawalInfo(); 
      } else { 
        showToast(data.error || "Request failed", "error"); 
      }
    } catch(e) { 
      showToast("Server Error, please try again", "error"); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Withdraw Funds</h2>

      {/* BALANCE PANEL */}
      <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-emerald-900/10 to-slate-900/10 border-emerald-500/30">
        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-emerald-500 font-bold uppercase tracking-wider text-sm mb-1">Available Balance</p>
            <h1 className="text-4xl font-bold font-mono text-white">
              ${Number(user?.balance || 0).toFixed(4)}
            </h1>
            <p className="text-sm mt-1 text-slate-400">Min limit: <span className="font-bold text-white">$2.00</span></p>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
             <i className="fas fa-coins text-3xl text-emerald-500"></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* REQUEST PAYMENT FORM */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
            <i className="fas fa-paper-plane text-indigo-400"></i> Request Payment
          </h3>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl mb-4">
             <p className="text-sm text-indigo-400">
               <i className="fas fa-info-circle mr-1"></i> Payment will be sent to the account details saved in Settings.
             </p>
          </div>
          <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                className="input-premium w-full p-3 pl-8 rounded-xl font-mono" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                disabled={isSubmitting}
              />
          </div>
          <button 
            onClick={handleRequest} 
            disabled={isSubmitting || !amount}
            className="btn-action w-full py-3 rounded-xl text-white font-bold flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><i className="fas fa-spinner fa-spin"></i> Processing...</>
            ) : (
              <>Request Withdraw <i className="fas fa-arrow-right"></i></>
            )}
          </button>
        </div>

        {/* STATUS GUIDE */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 text-[var(--text-primary)]">Status Guide</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> Pending
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Approved
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Rejected
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTION HISTORY TABLE */}
      <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Transaction History</h3>
      <div className="glass-panel rounded-2xl overflow-hidden w-full overflow-x-auto min-h-[200px] flex flex-col">
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
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  <i className="fas fa-circle-notch fa-spin text-2xl mb-2 text-indigo-500"></i><br/>Loading history...
                </td>
              </tr>
            ) : history.length === 0 ? (
               <tr>
                 <td colSpan="5" className="p-8 text-center text-slate-400">No transactions found.</td>
               </tr>
            ) : (
               history.map(item => (
                 <tr key={item.id} className="hover:bg-[var(--nav-hover)] transition-colors">
                   <td className="p-4 pl-6 text-slate-400 font-mono text-xs">{new Date(item.created_at).toLocaleDateString()}</td>
                   <td className="p-4 text-slate-400 text-xs font-mono">#{item.id}</td>
                   <td className="p-4 font-bold font-mono text-[var(--text-primary)]">${item.amount.toFixed(2)}</td>
                   <td className="p-4 text-slate-400 text-xs uppercase">{item.method || 'Auto'}</td>
                   <td className="p-4">
                     <span className={`px-2 py-1 rounded-md text-xs font-bold border uppercase tracking-wider
                       ${item.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                         item.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                         'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
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
