import React, { useEffect, useState } from 'react';
import Stat from '../../components/admin/Stat'; // ✅ Correct path to components folder

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0, clicks_today: 0, clicks_7d: 0, clicks_total: 0,
    income_today: 0, income_7d: 0, income_total: 0,
    withdraw_today: 0, withdraw_total: 0
  });

  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const headers = { 'x-admin-token': token };

        const usersRes = await fetch(`${API}/api/admin/users?deleted=false`, { headers });
        const usersData = await usersRes.json();
        const withdrawRes = await fetch(`${API}/api/withdraw/admin/requests`, { headers });
        const withdrawData = await withdrawRes.json();

        if (Array.isArray(usersData) && Array.isArray(withdrawData)) {
          // Calculations (Same as before)...
          // setStats({...})
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchRealStats();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-400">Loading Stats...</div>;

  const fmt$ = (n) => `$${parseFloat(n || 0).toFixed(2)}`;
  const fmtN = (n) => Number(n || 0).toLocaleString();

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-slate-800">System Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Users" value={fmtN(stats.users)} icon="fa-users" accent="bg-violet-100 text-violet-500" />
        <Stat label="Today Clicks" value={fmtN(stats.clicks_today)} icon="fa-bolt" accent="bg-sky-100 text-sky-500" />
        {/* Baaki stats cards... */}
      </div>
    </div>
  );
}
