import React, { useState, useEffect, useMemo } from 'react';
import UserModal from '../../components/admin/Modals/UserModal';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
const fmt$ = (n) => `$${parseFloat(n || 0).toFixed(4)}`;
const fmtN = (n) => Number(n || 0).toLocaleString();

const Avatar = ({ name, rank }) => {
  const ch = (name || '?')[0].toUpperCase();
  const rankColors = ['bg-amber-400', 'bg-slate-300', 'bg-orange-400'];
  const bg = rank < 3 ? rankColors[rank] : 'bg-violet-500';
  return (
    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 transition-transform group-hover:scale-110`}>
      {rank < 3 ? <i className="fas fa-crown text-[10px] absolute -top-1 -right-1 text-white drop-shadow-md" /> : null}
      {ch}
    </div>
  );
};

export default function TopPerformers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const token = localStorage.getItem('admin_token');

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/api/admin/users?deleted=false`, { 
        headers: { 'x-admin-token': token } 
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Leaderboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🟢 SMART CALCULATION: Today Clicks & Earnings Logic
  const processedUsers = useMemo(() => {
    return users.map(u => {
      let t_clicks = u.stats?.today_clicks;
      const t_earn = parseFloat(u.stats?.today_earnings || 0);
      
      if (t_clicks == null || t_clicks === 0) {
        const cpm = parseFloat(u.cpm || 3.0);
        t_clicks = cpm > 0 ? Math.round((t_earn / cpm) * 1000) : 0;
      }
      return { ...u, calculated_today_clicks: t_clicks };
    })
    .filter(u => u.calculated_today_clicks > 0 || parseFloat(u.stats?.today_earnings || 0) > 0)
    .sort((a, b) => b.calculated_today_clicks - a.calculated_today_clicks)
    .slice(0, 50); // Top 50 Users
  }, [users]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shadow-sm">
            <i className="fas fa-trophy text-amber-500 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Top Performers</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Leaderboard — Today</p>
          </div>
        </div>
        <button onClick={loadData} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-amber-500 transition-colors">
          <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">Rank</th>
                <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Today Clicks</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Today Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // 🦴 Skeleton Rows for "Fast Load" feel
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-5 text-center"><div className="w-8 h-8 bg-slate-100 rounded-full mx-auto" /></td>
                    <td className="p-5"><div className="h-10 w-48 bg-slate-50 rounded-2xl" /></td>
                    <td className="p-5"><div className="h-6 w-20 bg-slate-50 rounded-lg mx-auto" /></td>
                    <td className="p-5"><div className="h-6 w-24 bg-slate-100 rounded-lg mx-auto" /></td>
                  </tr>
                ))
              ) : processedUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-20 text-center text-slate-400 font-medium italic">No activity detected yet today...</td></tr>
              ) : processedUsers.map((u, i) => (
                <tr 
                  key={u.uid} 
                  onClick={() => setSelectedUser(u)}
                  className="group cursor-pointer hover:bg-violet-50/30 transition-all duration-200"
                >
                  <td className="p-5 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-xl ${i === 0 ? 'scale-125' : ''}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}
                      </span>
                      {i > 2 && <span className="text-slate-400 font-black font-mono text-xs">#{i + 1}</span>}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={u.username} rank={i} />
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors">{u.username || 'Anonymous'}</div>
                        <div className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 rounded-xl font-black font-mono shadow-sm border border-sky-100/50">
                      <i className="fas fa-bolt text-[10px]" />
                      {fmtN(u.calculated_today_clicks)}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="text-emerald-600 font-black font-mono text-base">
                      {fmt$(u.stats?.today_earnings)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📥 USER DETAILS MODAL */}
      {selectedUser && (
        <UserModal 
          user={selectedUser} 
          allUsers={users} 
          adminToken={token}
          onClose={() => setSelectedUser(null)} 
          onSaved={() => { setSelectedUser(null); loadData(); }} 
        />
      )}
    </div>
  );
}
