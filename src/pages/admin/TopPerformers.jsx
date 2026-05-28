import { getApiUrl } from '../../security';
import React, { useState, useEffect, useMemo } from 'react';
import UserModal from '../../components/admin/Modals/UserModal';

const API = getApiUrl();
const fmt$ = (n) => `$${parseFloat(n || 0).toFixed(4)}`;
const fmtN = (n) => Number(n || 0).toLocaleString();

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_GRAD = [
  'linear-gradient(135deg,#f59e0b,#d97706)',  // gold
  'linear-gradient(135deg,#94a3b8,#64748b)',  // silver
  'linear-gradient(135deg,#f97316,#ea580c)',  // bronze
];

const Avatar = ({ name, rank }) => {
  const grad = rank < 3 ? RANK_GRAD[rank] : 'linear-gradient(135deg,#7c3aed,#4f46e5)';
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 transition-transform group-hover:scale-110"
      style={{background: grad}}>
      {(name || '?')[0].toUpperCase()}
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

  useEffect(() => { loadData(); }, []);

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
    .slice(0, 50);
  }, [users]);

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',boxShadow:'0 8px 20px rgba(245,158,11,0.3)'}}>
            <i className="fas fa-trophy text-white text-base" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Top Performers</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Real-time leaderboard · Today
            </p>
          </div>
        </div>
        <button 
          onClick={loadData} 
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200 shadow-sm transition-all"
        >
          <i className={`fas fa-sync-alt text-sm ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ─── Leaderboard ─── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70 w-20">Rank</th>
                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">User</th>
                <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Today Clicks</th>
                <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Today Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4 text-center"><div className="w-8 h-8 bg-slate-100 rounded-full mx-auto" /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-full" />
                        <div className="space-y-1.5"><div className="h-3.5 w-28 bg-slate-100 rounded" /><div className="h-2.5 w-36 bg-slate-50 rounded" /></div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="h-7 w-20 bg-slate-50 rounded-xl mx-auto" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-20 bg-slate-100 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : processedUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <i className="fas fa-chart-bar text-3xl text-slate-400" />
                      <p className="font-bold text-slate-500 text-sm">No activity detected yet today</p>
                    </div>
                  </td>
                </tr>
              ) : processedUsers.map((u, i) => (
                <tr 
                  key={u.uid}
                  onClick={() => setSelectedUser(u)}
                  className={`group cursor-pointer transition-all duration-200 ${i < 3 ? 'hover:bg-amber-50/50' : 'hover:bg-violet-50/30'}`}
                >
                  <td className="px-5 py-4 text-center">
                    {i < 3 ? (
                      <span className={`text-xl ${i === 0 ? 'scale-125 inline-block' : ''}`}>{MEDAL[i]}</span>
                    ) : (
                      <span className="font-black font-mono text-slate-400 text-xs">#{i + 1}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} rank={i} />
                      <div>
                        <div className={`font-bold text-slate-800 text-sm group-hover:transition-colors ${i < 3 ? 'group-hover:text-amber-600' : 'group-hover:text-violet-600'}`}>
                          {u.username || 'Anonymous'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate max-w-[160px]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black font-mono text-xs border border-sky-100 bg-sky-50 text-sky-600 shadow-sm">
                      <i className="fas fa-bolt text-[9px]" />
                      {fmtN(u.calculated_today_clicks)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-emerald-500 font-black font-mono text-sm">
                      {fmt$(u.stats?.today_earnings)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal ─── */}
      {selectedUser && (
        <UserModal 
          user={selectedUser} allUsers={users} adminToken={token}
          onClose={() => setSelectedUser(null)} 
          onSaved={() => { setSelectedUser(null); loadData(); }} 
        />
      )}
    </div>
  );
}
