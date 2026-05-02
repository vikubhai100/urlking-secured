import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
const fmt$ = (n) => `$${parseFloat(n || 0).toFixed(4)}`;
const fmtN = (n) => Number(n || 0).toLocaleString();

const Avatar = ({ name }) => {
  const ch = (name || '?')[0].toUpperCase();
  return <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">{ch}</div>;
};

export default function TopPerformers() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    // API Fetch logic (Dashboard api ya users list api call yahan kar lena)
    fetch(`${API}/api/admin/users?deleted=false`, { headers: { 'x-admin-token': localStorage.getItem('admin_token') } })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  const getTodayClicks = (u) => {
    if (u.stats?.today_clicks != null) return u.stats.today_clicks;
    const e = parseFloat(u.stats?.today_earnings || 0);
    const c = parseFloat(u.cpm || 0.5);
    return c > 0 ? Math.round((e / c) * 1000) : 0;
  };

  // Filter and Sort by Today Clicks
  const topUsers = [...users]
    .filter(u => getTodayClicks(u) > 0 || parseFloat(u.stats?.today_earnings || 0) > 0)
    .sort((a, b) => getTodayClicks(b) - getTodayClicks(a));

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2">
        <i className="fas fa-trophy text-amber-400 text-xl" />
        <h2 className="text-xl font-bold text-slate-800">Leaderboard — Today</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase w-14">Rank</th>
                <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase">User</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Clicks</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-400">No active users today</td></tr>
              ) : topUsers.map((u, i) => (
                <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-center text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-slate-400 font-mono text-sm">#{i+1}</span>}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} />
                      <div>
                        <div className="font-semibold text-slate-800">{u.username}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-bold text-sky-600 font-mono">{fmtN(getTodayClicks(u))}</td>
                  <td className="p-4 text-center font-bold text-emerald-600 font-mono">{fmt$(u.stats?.today_earnings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
