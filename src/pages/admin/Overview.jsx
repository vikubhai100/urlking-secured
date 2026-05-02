import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

// 🟢 FIX 1: Stat component ko isi file mein daal diya taaki Import Error na aaye
const Stat = ({ label, value, icon, accent }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>
        <i className={`fas ${icon} text-sm`}></i>
      </div>
    </div>
    <div className="text-2xl font-bold text-slate-800 font-mono">{value}</div>
  </div>
);

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null); // 🟢 FIX 2: Agar error aaye toh UI pe dikhega
  const [stats, setStats] = useState({
    users: 0, clicks_today: 0, clicks_7d: 0, clicks_total: 0,
    income_today: 0, income_7d: 0, income_total: 0,
    withdraw_today: 0, withdraw_total: 0
  });

  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        console.log("Overview: Fetching API data..."); // Debug log
        const token = localStorage.getItem('admin_token');
        if (!token) throw new Error("Admin token missing!");

        const headers = { 'x-admin-token': token };

        // 1. Fetch Users Data
        const usersRes = await fetch(`${API}/api/admin/users?deleted=false`, { headers });
        if (!usersRes.ok) throw new Error(`Users API Failed: ${usersRes.status}`);
        const usersData = await usersRes.json();

        // 2. Fetch Withdrawals Data
        const withdrawRes = await fetch(`${API}/api/withdraw/admin/requests`, { headers });
        if (!withdrawRes.ok) throw new Error(`Withdraw API Failed: ${withdrawRes.status}`);
        const withdrawData = await withdrawRes.json();

        if (Array.isArray(usersData) && Array.isArray(withdrawData)) {
          let t_users = usersData.length;
          let t_clicks = 0, today_clicks = 0;
          let t_income = 0, today_income = 0;

          usersData.forEach(u => {
            t_clicks += (u.stats?.total || 0);
            t_income += parseFloat(u.stats?.earnings || 0);
            today_income += parseFloat(u.stats?.today_earnings || 0);

            let clicksToday = u.stats?.today_clicks;
            if (clicksToday == null) {
              const e = parseFloat(u.stats?.today_earnings || 0);
              const c = parseFloat(u.cpm || 0.5);
              clicksToday = c > 0 ? Math.round((e / c) * 1000) : 0;
            }
            today_clicks += clicksToday;
          });

          let t_withdraw = 0;
          let today_withdraw = 0;
          const todayDate = new Date().toISOString().split('T')[0];

          withdrawData.forEach(w => {
            if (w.status === 'approved') {
              t_withdraw += parseFloat(w.amount || 0);
              if (w.updated_at && w.updated_at.startsWith(todayDate)) {
                today_withdraw += parseFloat(w.amount || 0);
              }
            }
          });

          setStats({
            users: t_users, clicks_today: today_clicks, clicks_7d: 0, clicks_total: t_clicks,
            income_today: today_income, income_7d: 0, income_total: t_income,
            withdraw_today: today_withdraw, withdraw_total: t_withdraw
          });
          console.log("Overview: Data loaded successfully!"); // Debug log
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (error) {
        console.error("Overview Error:", error.message);
        setErrorMsg(error.message);
      } finally {
        setLoading(false); // 🟢 Har haal me loading false hoga
      }
    };

    fetchRealStats();
  }, []);

  // 🟢 Agar API me koi fault hoga, toh gol-gol ghoomne ke bajaye yeh message dikhega
  if (errorMsg) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center animate-fadeIn">
        <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-3" />
        <h3 className="text-red-700 font-bold text-lg mb-1">Failed to load Dashboard</h3>
        <p className="text-red-600 text-sm font-mono">{errorMsg}</p>
      </div>
    );
  }

  // Local Page Loader
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] rounded-full border-slate-200 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  const fmt$ = (n) => `$${parseFloat(n || 0).toFixed(2)}`;
  const fmtN = (n) => Number(n || 0).toLocaleString();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
          <i className="fas fa-chart-pie text-violet-600 text-lg" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">System Overview</h2>
      </div>
      
      {/* CLICKS STATS */}
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-4">Traffic & Users</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Users" value={fmtN(stats.users)} icon="fa-users" accent="bg-violet-100 text-violet-500" />
        <Stat label="Today Clicks" value={fmtN(stats.clicks_today)} icon="fa-bolt" accent="bg-sky-100 text-sky-500" />
        <Stat label="7 Days Clicks" value={fmtN(stats.clicks_7d)} icon="fa-chart-line" accent="bg-indigo-100 text-indigo-500" />
        <Stat label="Total Clicks" value={fmtN(stats.clicks_total)} icon="fa-mouse-pointer" accent="bg-slate-100 text-slate-500" />
      </div>

      {/* INCOME STATS */}
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-8">Revenue</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Today Income" value={fmt$(stats.income_today)} icon="fa-coins" accent="bg-amber-100 text-amber-500" />
        <Stat label="7 Days Income" value={fmt$(stats.income_7d)} icon="fa-sack-dollar" accent="bg-emerald-100 text-emerald-500" />
        <Stat label="Total Income" value={fmt$(stats.income_total)} icon="fa-dollar-sign" accent="bg-green-100 text-green-600" />
      </div>

      {/* WITHDRAWAL STATS */}
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-8">Payouts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Stat label="Today Payouts" value={fmt$(stats.withdraw_today)} icon="fa-hand-holding-dollar" accent="bg-rose-100 text-rose-500" />
        <Stat label="Total Payouts" value={fmt$(stats.withdraw_total)} icon="fa-wallet" accent="bg-red-100 text-red-500" />
      </div>
    </div>
  );
}
