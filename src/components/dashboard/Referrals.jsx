import React, { useState, useEffect } from 'react';

const Referrals = ({ token }) => {
  const [stats, setStats] = useState({ link: '', count: 0, earnings: 0, users: [] });
  const API = "https://go.urlking.site";

  useEffect(() => { loadReferrals(); }, []);

  const loadReferrals = async () => {
    try {
      const res = await fetch(`${API}/api/referral/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setStats({
          link: data.referral_link || '',
          count: data.referral_count || 0,
          earnings: data.total_earnings || 0,
          users: data.users || []
        });
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-6">Referral Program</h2>
      
      <div className="glass-panel p-8 rounded-2xl mb-8 border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/40">
            <i className="fas fa-gift text-3xl text-purple-500"></i>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Earn 5% Lifetime Commission</h3>
            <p className="text-slate-400 mb-4">Share your unique link. Receive 5% of their total earnings forever!</p>
            <div className="flex flex-col md:flex-row gap-3">
              <input type="text" readOnly value={stats.link} className="input-premium w-full p-3 rounded-xl font-mono text-sm" />
              <button onClick={() => { navigator.clipboard.writeText(stats.link); alert("Copied!"); }} className="btn-action px-6 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-purple-600 to-indigo-600">
                <i className="fas fa-copy"></i> Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 relative">
          <p className="text-sm font-medium mb-1 text-slate-400">Total Referrals</p>
          <p className="text-4xl font-bold tracking-tight">{stats.count}</p>
          <div className="h-1 w-12 bg-purple-500 rounded-full mt-4"></div>
        </div>
        <div className="glass-card rounded-2xl p-6 relative">
          <p className="text-sm font-medium mb-1 text-slate-400">Referral Earnings</p>
          <p className="text-4xl font-bold font-mono text-green-400">${Number(stats.earnings).toFixed(4)}</p>
          <div className="h-1 w-12 bg-green-500 rounded-full mt-4"></div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Referred Users</h3>
      <div className="glass-panel rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[300px]">
          <thead className="border-b border-[var(--glass-border)] bg-[var(--table-header-bg)] text-xs uppercase tracking-wider text-slate-400">
            <tr><th className="p-4 pl-6">Username</th><th className="p-4 pr-6">Join Date</th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--glass-border)] text-sm">
            {stats.users.length === 0 ? (
              <tr><td colSpan="2" className="p-6 text-center text-slate-500">No referrals yet. Share your link!</td></tr>
            ) : (
              stats.users.map((u, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="p-4 pl-6 font-medium">{u.username}</td>
                  <td className="p-4 font-mono text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Referrals;
