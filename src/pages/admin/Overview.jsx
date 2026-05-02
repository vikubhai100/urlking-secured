import React, { useEffect, useState } from 'react';
import Stat from '../../components/admin/Stat';
// import { apiFetch } from '../../utils/api'; // Apna API fetcher import kar lena

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    clicks_today: 0,
    clicks_7d: 0,
    clicks_total: 0,
    income_today: 0,
    income_7d: 0,
    income_total: 0,
    withdraw_today: 0,
    withdraw_total: 0
  });

  useEffect(() => {
    // Backend se stats fetch karne ka logic yahan aayega
    // Niche dummy data call hai, isko real API se replace kar lena:
    /*
    apiFetch(`${API}/api/admin/dashboard-stats`, {
      headers: { 'x-admin-token': localStorage.getItem('admin_token') }
    })
    .then(res => res.json())
    .then(data => { setStats(data); setLoading(false); })
    .catch(() => setLoading(false));
    */

    // For now, setting mock data to show UI
    setTimeout(() => {
      setStats({
        users: 1245,
        clicks_today: 15430,
        clicks_7d: 98200,
        clicks_total: 1450000,
        income_today: 45.50,
        income_7d: 310.20,
        income_total: 4500.00,
        withdraw_today: 120.00,
        withdraw_total: 3200.00
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] rounded-full border-slate-200 border-t-violet-500 animate-spin" /></div>;
  }

  const fmt$ = (n) => `$${parseFloat(n).toFixed(2)}`;
  const fmtN = (n) => Number(n).toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <i className="fas fa-chart-pie text-violet-500 text-xl" />
        <h2 className="text-xl font-bold text-slate-800">System Overview</h2>
      </div>
      
      {/* CLICKS STATS */}
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-4">Traffic & Users</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Users" value={fmtN(stats.users)} icon="fa-users" accent="bg-violet-100 text-violet-500" />
        <Stat label="Today Clicks" value={fmtN(stats.clicks_today)} icon="fa-bolt" accent="bg-sky-100 text-sky-500" />
        <Stat label="Last 7 Days Clicks" value={fmtN(stats.clicks_7d)} icon="fa-chart-line" accent="bg-indigo-100 text-indigo-500" />
        <Stat label="Total Clicks" value={fmtN(stats.clicks_total)} icon="fa-mouse-pointer" accent="bg-slate-100 text-slate-500" />
      </div>

      {/* INCOME STATS */}
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-8">Revenue</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Today Income" value={fmt$(stats.income_today)} icon="fa-coins" accent="bg-amber-100 text-amber-500" />
        <Stat label="Last 7 Days Income" value={fmt$(stats.income_7d)} icon="fa-sack-dollar" accent="bg-emerald-100 text-emerald-500" />
        <Stat label="Total Income" value={fmt$(stats.income_total)} icon="fa-dollar-sign" accent="bg-green-100 text-green-600" />
      </div>

      {/* WITHDRAWAL STATS */}
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-8">Payouts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Stat label="Today Withdrawal" value={fmt$(stats.withdraw_today)} icon="fa-hand-holding-dollar" accent="bg-rose-100 text-rose-500" />
        <Stat label="Total Withdrawal" value={fmt$(stats.withdraw_total)} icon="fa-wallet" accent="bg-red-100 text-red-500" />
      </div>
    </div>
  );
}
