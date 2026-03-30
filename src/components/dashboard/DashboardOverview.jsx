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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const DashboardOverview = ({ token, user }) => {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [resultLink, setResultLink] = useState('');
  const [stats, setStats] = useState({ total: 0, today: 0, daily: Array(30).fill(0) });
  
  const API = "https://go.urlking.site";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setStats({ total: data.total || 0, today: data.today || 0, daily: data.daily || Array(30).fill(0) });
      }
    } catch (err) { console.error("Error fetching stats", err); }
  };

  const handleShorten = async () => {
    if (!url) return alert("Please enter a valid URL");
    try {
      const res = await fetch(`${API}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url, alias })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      
      setResultLink(`${API}/${data.id}`);
      setUrl('');
      setAlias('');
      fetchStats(); // refresh stats
      alert("Link created successfully!");
    } catch (e) { alert(e.message); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultLink);
    alert("Copied!");
  };

  // Chart Data Preparation
  const chartData = {
    labels: Array.from({ length: stats.daily.length }, (_, i) => i + 1),
    datasets: [
      {
        fill: true,
        data: stats.daily,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(99, 102, 241, 0.2)', // Simplified gradient for React
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      x: { grid: { display: false } }, 
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, beginAtZero: true } 
    }
  };

  return (
    <div className="fade-in w-full max-w-5xl mx-auto space-y-6 md:space-y-8 px-1 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
        <div className="w-full md:w-auto text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-bold mb-1">Dashboard</h2>
          <p className="text-xs md:text-base text-slate-400">Track your performance.</p>
        </div>
        
        <div className="flex flex-row w-full md:w-auto gap-3">
          <div className="glass-panel px-4 py-3 md:px-6 rounded-xl border border-emerald-500/20 shadow-lg flex-1">
            <div className="flex items-center gap-2 mb-1">
              <i className="fas fa-wallet text-emerald-400"></i>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Wallet</span>
            </div>
            <span className="text-xl md:text-2xl font-mono font-bold">${Number(user?.balance || 0).toFixed(4)}</span>
          </div>
          
          <div className="glass-panel px-4 py-3 md:px-6 rounded-xl border border-green-500/20 shadow-lg flex-1">
            <div className="flex items-center gap-2 mb-1">
              <i className="fas fa-coins text-green-400"></i>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CPM</span>
            </div>
            <span className="text-xl md:text-2xl font-mono font-bold">${Number(user?.cpm || 0.50).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="border-animated p-1">
        <div className="relative z-10 p-4 md:p-8 space-y-6 glass-panel border-none">
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <i className="fas fa-magic text-indigo-400"></i> Shorten New URL
          </h3>
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <i className="fas fa-link absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              <input type="url" placeholder="Paste your long link here (https://...)" className="input-premium w-full p-4 pl-12 rounded-xl" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">/</span>
                <input type="text" placeholder="Custom Alias (Optional)" className="input-premium w-full p-4 pl-8 rounded-xl" value={alias} onChange={(e) => setAlias(e.target.value)} />
              </div>
              <button onClick={handleShorten} className="btn-action px-6 md:px-10 py-4 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2">
                <span>Shorten</span> <i className="fas fa-bolt"></i>
              </button>
            </div>
          </div>
          
          {resultLink && (
            <div className="mt-6 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 bg-indigo-500/10 border border-indigo-500/30">
              <div className="flex-1 min-w-0 w-full">
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">Success! Your Link:</p>
                <p className="font-mono truncate text-lg text-white">{resultLink}</p>
              </div>
              <button onClick={copyToClipboard} className="w-full md:w-auto px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md flex items-center justify-center gap-2">
                <i className="fas fa-copy"></i> Copy
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-8">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10"><i className="fas fa-mouse-pointer text-6xl"></i></div>
          <p className="text-sm font-medium mb-1 text-slate-400">Total Clicks</p>
          <p className="text-4xl font-bold tracking-tight">{stats.total}</p>
          <div className="h-1 w-12 bg-indigo-500 rounded-full mt-4"></div>
        </div>
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10"><i className="fas fa-calendar-day text-6xl"></i></div>
          <p className="text-sm font-medium mb-1 text-slate-400">Today's Clicks</p>
          <p className="text-4xl font-bold tracking-tight">{stats.today}</p>
          <div className="h-1 w-12 bg-purple-500 rounded-full mt-4"></div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4 md:p-6 mt-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-chart-area text-indigo-400"></i> Monthly Analytics
        </h3>
        <div className="w-full h-[250px] md:h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
