import React, { useState, useEffect, useCallback } from 'react';
import { showToast } from '../../toast'; // Premium Toast
import { getApiUrl } from '../../security';

const Referrals = ({ token }) => {
  const [stats, setStats] = useState({ link: '', count: 0, earnings: 0, users: [] });
  const [loading, setLoading] = useState(true);

  const API = getApiUrl();

  const loadReferrals = useCallback(async () => {
    // FIX 1: Agar token abhi tak load nahi hua hai, toh API call mat karo (Prevent premature fetch fail)
    if (!token) return; 

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/referral/stats`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();

      if (res.ok) {
        setStats({
          link: data.referral_link || '',
          count: data.referral_count || 0,
          earnings: data.total_earnings || 0,
          users: data.users || []
        });
      } else {
        showToast(data.error || "Failed to load referral stats", "error");
      }
    } catch (e) { 
      console.error(e); 
      showToast("Network error while loading referrals", "error");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => { 
    // Jab bhi token change/load hoga, ye function automatically call ho jayega
    loadReferrals(); 
  }, [loadReferrals, token]);

  const handleCopy = () => {
    // FIX 2: Toast ke sath block format use kiya taaki properly execute ho
    if (!stats.link) {
      showToast("Link not available yet", "error");
      return;
    }
    
    navigator.clipboard.writeText(stats.link);
    showToast("Referral link copied!", "success");
  };

  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Referral Program</h2>

      {/* REFERRAL LINK BANNER */}
      <div className="glass-panel p-8 rounded-2xl mb-8 border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/40">
            <i className="fas fa-gift text-3xl text-purple-500"></i>
          </div>
          <div className="flex-1 text-center md:text-left w-full">
            <h3 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Earn 5% Lifetime Commission</h3>
            <p className="text-slate-400 mb-4">Share your unique link. Receive 5% of their total earnings forever!</p>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                readOnly 
                value={loading ? "Loading link..." : stats.link} 
                className="input-premium w-full p-3 rounded-xl font-mono text-sm text-slate-300 bg-black/20" 
              />
              <button 
                onClick={handleCopy} 
                disabled={loading || !stats.link}
                className="btn-action px-6 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <i className="fas fa-copy"></i> Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 relative bg-gradient-to-br from-purple-500/5 to-transparent">
          <p className="text-sm font-medium mb-1 text-slate-400">Total Referrals</p>
          <p className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            {loading ? <i className="fas fa-spinner fa-spin text-2xl text-purple-500"></i> : stats.count}
          </p>
          <div className="h-1 w-12 bg-purple-500 rounded-full mt-4"></div>
        </div>
        <div className="glass-card rounded-2xl p-6 relative bg-gradient-to-br from-green-500/5 to-transparent">
          <p className="text-sm font-medium mb-1 text-slate-400">Referral Earnings</p>
          <p className="text-4xl font-bold font-mono text-green-400">
            {loading ? <i className="fas fa-spinner fa-spin text-2xl"></i> : `$${Number(stats.earnings).toFixed(4)}`}
          </p>
          <div className="h-1 w-12 bg-green-500 rounded-full mt-4"></div>
        </div>
      </div>

      {/* REFERRED USERS TABLE */}
      <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Referred Users</h3>
      <div className="glass-panel rounded-2xl overflow-hidden overflow-x-auto min-h-[200px] flex flex-col">
        <table className="w-full text-left border-collapse min-w-[300px]">
          <thead className="border-b border-[var(--glass-border)] bg-[var(--table-header-bg)] text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="p-4 pl-6">Username</th>
              <th className="p-4 pr-6 text-right">Join Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glass-border)] text-sm text-[var(--text-primary)]">
            {loading ? (
              <tr>
                <td colSpan="2" className="p-8 text-center text-slate-500">
                  <i className="fas fa-circle-notch fa-spin text-2xl mb-2 text-purple-500"></i><br/>Loading users...
                </td>
              </tr>
            ) : stats.users.length === 0 ? (
              <tr>
                <td colSpan="2" className="p-8 text-center text-slate-400">
                  <i className="fas fa-users-slash text-2xl mb-2 opacity-50"></i><br/>No referrals yet. Share your link to start earning!
                </td>
              </tr>
            ) : (
              stats.users.map((u, i) => (
                <tr key={i} className="hover:bg-[var(--nav-hover)] transition-colors">
                  <td className="p-4 pl-6 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    {u.username}
                  </td>
                  <td className="p-4 pr-6 font-mono text-xs text-slate-400 text-right">
                    {new Date(u.created_at).toLocaleDateString()}
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

export default Referrals;
