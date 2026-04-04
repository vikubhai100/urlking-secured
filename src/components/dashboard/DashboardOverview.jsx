import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { showToast } from '../../toast'; 

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const DashboardOverview = ({ token, user, isActive }) => {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [resultLink, setResultLink] = useState('');
  const [stats, setStats] = useState({ total: 0, today: 0, monthTotal: 0, daily: [] });

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  useEffect(() => {
    if (isActive !== false) fetchStats();
  }, [token, isActive, selectedMonth, selectedYear]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/stats?month=${selectedMonth}&year=${selectedYear}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setStats({ 
          total: data.total || 0, 
          today: data.today || 0, 
          monthTotal: data.monthTotal || 0,
          daily: data.daily || []
        });
      }
    } catch (err) { console.error(err); }
  };

  const handleShorten = async () => {
    if (!url) return showToast("Please enter a URL", "error"); 
    const payload = { url, alias };
    if (expirationDate) payload.expires_at = expirationDate;

    try {
      const res = await fetch(`${API}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResultLink(`https://go.urlking.site/${data.id}`); 
      setUrl(''); setAlias(''); setExpirationDate('');
      fetchStats();
      showToast("Link Shortened!", "success"); 
    } catch (e) { showToast(e.message, "error"); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultLink);
    showToast("Copied!", "success"); 
  };

  const chartData = {
    labels: Array.from({ length: stats.daily.length }, (_, i) => i + 1),
    datasets: [{
      fill: true,
      data: stats.daily,
      borderColor: '#818cf8',
      backgroundColor: 'rgba(99, 102, 241, 0.1)', 
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: '#6366f1',
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }, 
      y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#64748b', font: { size: 10 } }, beginAtZero: true } 
    }
  };

  const months = [
    { v: 1, l: 'Jan' }, { v: 2, l: 'Feb' }, { v: 3, l: 'Mar' }, { v: 4, l: 'Apr' },
    { v: 5, l: 'May' }, { v: 6, l: 'Jun' }, { v: 7, l: 'Jul' }, { v: 8, l: 'Aug' },
    { v: 9, l: 'Sep' }, { v: 10, l: 'Oct' }, { v: 11, l: 'Nov' }, { v: 12, l: 'Dec' }
  ];
  const years = Array.from({ length: (currentDate.getFullYear() - 2024) + 1 }, (_, i) => 2024 + i);

  return (
    <div className="fade-in w-full max-w-5xl mx-auto space-y-6 px-2">

      {/* Wallet Cards */}
      <div className="flex flex-row gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/10 flex-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Wallet</p>
          <span className="text-xl font-mono font-bold text-white">${Number(user?.balance || 0).toFixed(4)}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-indigo-500/10 flex-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">CPM</p>
          <span className="text-xl font-mono font-bold text-white">${Number(user?.cpm || 5).toFixed(2)}</span>
        </div>
      </div>

      {/* Shorten Box */}
      <div className="glass-panel p-5 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><i className="fas fa-magic text-indigo-500 text-sm"></i> Shorten URL</h3>
        <div className="space-y-4">
          <input type="url" placeholder="Your URL Here" className="input-premium w-full p-3.5 rounded-xl text-sm" value={url} onChange={e=>setUrl(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Alias</label>
              <input type="text" placeholder="Custom name" className="input-premium w-full p-3 rounded-xl text-sm mt-1" value={alias} onChange={e=>setAlias(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Expires At</label>
              <input type="datetime-local" className="input-premium w-full p-3 rounded-xl text-sm mt-1 text-slate-400" value={expirationDate} min={currentDate.toISOString().slice(0,16)} onChange={e=>setExpirationDate(e.target.value)} />
            </div>
          </div>
          <button onClick={handleShorten} className="btn-action w-full py-3.5 rounded-xl text-white font-bold shadow-lg">Shorten Now ⚡</button>
        </div>
        {resultLink && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col md:flex-row items-center gap-3">
            <p className="flex-1 font-mono text-sm text-emerald-400 truncate w-full">{resultLink}</p>
            <button onClick={copyToClipboard} className="w-full md:w-auto px-6 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase">Copy</button>
          </div>
        )}
      </div>

      {/* 🟢 FIXED ANALYTICS UI: No squashing */}
      <div className="glass-panel p-5 md:p-6 rounded-3xl border border-white/5">
        <div className="flex flex-row justify-between items-center mb-6">
          <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <i className="fas fa-chart-bar text-indigo-500"></i> Analytics
          </h3>
          
          {/* Compact Selectors */}
          <div className="flex gap-1.5">
            <select value={selectedMonth} onChange={e=>setSelectedMonth(Number(e.target.value))} className="bg-slate-800 border-none text-white text-[11px] font-bold py-1 px-2 rounded-lg cursor-pointer outline-none">
              {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
            <select value={selectedYear} onChange={e=>setSelectedYear(Number(e.target.value))} className="bg-slate-800 border-none text-white text-[11px] font-bold py-1 px-2 rounded-lg cursor-pointer outline-none">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Total Clicks</p>
            <p className="text-lg font-bold text-white">{stats.total.toLocaleString()}</p>
          </div>
          <div className="flex-1 border-l border-white/5 pl-4">
            <p className="text-[10px] text-indigo-400 font-bold uppercase">This Month</p>
            <p className="text-lg font-bold text-white">{stats.monthTotal.toLocaleString()}</p>
          </div>
        </div>

        {/* Chart Container - Fixed height to prevent "chapta" look */}
        <div className="w-full h-[280px] md:h-[320px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Footer Support Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <a href="https://wa.me/919304266995" className="p-3 rounded-xl bg-green-600/10 border border-green-600/20 text-green-500 text-center text-xs font-bold"><i className="fab fa-whatsapp mr-1"></i> WhatsApp</a>
        <a href="https://t.me/vikubhai01" className="p-3 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-400 text-center text-xs font-bold"><i className="fab fa-telegram-plane mr-1"></i> Telegram</a>
        <a href="mailto:support@urlking.site" className="col-span-2 md:col-span-1 p-3 rounded-xl bg-slate-800 border border-white/5 text-slate-400 text-center text-xs font-bold"><i className="fas fa-envelope mr-1"></i> Email</a>
      </div>

    </div>
  );
};

export default DashboardOverview;
