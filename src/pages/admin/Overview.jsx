import React, { useEffect, useState } from 'react';
import Stat from '../../components/admin/Stat';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    clicks_today: 0,
    clicks_7d: 0, // Iske liye backend update chahiye
    clicks_total: 0,
    income_today: 0,
    income_7d: 0, // Iske liye backend update chahiye
    income_total: 0,
    withdraw_today: 0, 
    withdraw_total: 0
  });

  useEffect(() => {
    const fetchRealStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('admin_token');
        const headers = { 'x-admin-token': token };

        // 1. Fetch Users Data
        const usersRes = await fetch(`${API}/api/admin/users?deleted=false`, { headers });
        const usersData = await usersRes.json();

        // 2. Fetch Withdrawals Data
        const withdrawRes = await fetch(`${API}/api/withdraw/admin/requests`, { headers });
        const withdrawData = await withdrawRes.json();

        if (Array.isArray(usersData) && Array.isArray(withdrawData)) {
          // --- Calculate Users & Earnings ---
          let t_users = usersData.length;
          let t_clicks = 0, today_clicks = 0;
          let t_income = 0, today_income = 0;

          usersData.forEach(u => {
            t_clicks += (u.stats?.total || 0);
            t_income += parseFloat(u.stats?.earnings || 0);
            today_income += parseFloat(u.stats?.today_earnings || 0);

            // Calculate Today Clicks (Exact purana formula)
            let clicksToday = u.stats?.today_clicks;
            if (clicksToday == null) {
              const e = parseFloat(u.stats?.today_earnings || 0);
              const c = parseFloat(u.cpm || 0.5);
              clicksToday = c > 0 ? Math.round((e / c) * 1000) : 0;
            }
            today_clicks += clicksToday;
          });

          // --- Calculate Withdrawals ---
          let t_withdraw = 0;
          let today_withdraw = 0;
          const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

          withdrawData.forEach(w => {
            // Sirf Approved payments ko total mein ginen
            if (w.status === 'approved') {
              t_withdraw += parseFloat(w.amount || 0);
              
              // Agar withdrawal ki date aaj ki hai (Assuming w.updated_at exists)
              if (w.updated_at && w.updated_at.startsWith(todayDate)) {
                today_withdraw += parseFloat(w.amount || 0);
              }
            }
          });

          // Set Real Data to State
          setStats({
            users: t_users,
            clicks_today: today_clicks,
            clicks_7d: 0, // Backend me 7-days ka endpoint banana padega aapko
            clicks_total: t_clicks,
            income_today: today_income,
            income_7d: 0, // Backend me 7-days ka endpoint banana padega
            income_total: t_income,
            withdraw_today: today_withdraw,
            withdraw_total: t_withdraw
          });
        }
      } catch (error) {
        console.error("Error fetching real stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealStats();
  }, []);

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
