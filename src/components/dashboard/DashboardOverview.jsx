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
import { showToast } from '../../toast'; // Premium Toast Import kiya gaya hai

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const DashboardOverview = ({ token, user }) => {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [resultLink, setResultLink] = useState('');
  const [stats, setStats] = useState({ total: 0, today: 0, daily: Array(30).fill(0) });

  const API = "https://go.urlking.site";

  useEffect(() => {
    fetchStats();
  }, [token]); // Token dependency add ki gayi

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setStats({ total: data.total || 0, today: data.today || 0, daily: data.daily || Array(30).fill(0) });
      }
    } catch (err) { 
      console.error("Error fetching stats", err); 
    }
  };

  const handleShorten = async () => {
    if (!url) return showToast("Please enter a valid URL to shorten.", "error"); // NATIVE ALERT REMOVED
    
    try {
      const res = await fetch(`${API}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url, alias })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to create short link");

      setResultLink(`https://go.urlking.site/${data.id}`); // Constructing the final link
      setUrl('');
      setAlias('');
      fetchStats(); // refresh stats
      
      showToast("Link successfully shortened!", "success"); // NATIVE ALERT REMOVED
    } catch (e) { 
      showToast(e.message, "error"); // NATIVE ALERT REMOVED
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultLink);
    showToast("Link Copied Successfully!", "success"); // NATIVE ALERT REMOVED
  };

  // Chart Data Preparation - Theme Variables support
  const chartData = {
    labels: Array.from({ length: stats.daily.length }, (_, i) => i + 1),
    datasets: [
      {
        fill: true,
        data: stats.daily,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(99, 102, 241, 0.2)', // Light/Dark mode dono me acha lagta hai
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      x: { 
        grid: { display: false },
        ticks: { color: '#94a3b8' } // Text color for x-axis
      }, 
      y: { 
        grid: { color: 'rgba(148, 163, 184, 0.1)' }, // Muted grid line color for light/dark mode
        ticks: { color: '#94a3b8' }, // Text color for y-axis
        beginAtZero: true 
      } 
    }
  };

  return (
    <div className="fade-in w-full max-w-5xl mx-auto space-y-6 md:space-y-8 px-1 md:px-0">
      
      {/* Header & Wallet Cards */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
        <div className="w-full md:w-auto text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-1 text-[var(--text-primary)]">Dashboard</h2>
          <p className="text-sm md:text-base text-slate-400">Track your performance.</p>
        </div>

        <div className="flex flex-row w-full md:w-auto gap-3">
          <div className="glass-panel px-4 py-3 md:px-6 rounded-2xl border border-emerald-500/20 shadow-lg flex-1 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-2 mb-1">
              <i className="fas fa-wallet text-emerald-500"></i>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Wallet</span>
            </div>
            <span className="text-xl md:text-2xl font-mono font-bold text-[var(--text-primary)]">
              ${Number(user?.balance || 0).toFixed(4)}
            </span>
          </div>

          <div className="glass-panel px-4 py-3 md:px-6 rounded-2xl border border-indigo-500/20 shadow-lg flex-1 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-2 mb-1">
              <i className="fas fa-coins text-indigo-500"></i>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CPM</span>
            </div>
            <span className="text-xl md:text-2xl font-mono font-bold text-[var(--text-primary)]">
              ${Number(user?.cpm || 5.00).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Shorten Link Box */}
      <div className="border-animated p-1">
        <div className="relative z-10 p-5 md:p-8 space-y-6 glass-panel border-none rounded-[1.2rem]">
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <i className="fas fa-magic text-indigo-500"></i> Shorten New URL
          </h3>
          
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <i className="fas fa-link absolute left-4 top-1/2 -translate-y-1/2 text-[var(--input-icon)]"></i>
              <input 
                type="url" 
                placeholder="Paste your long link here (https://...)" 
                className="input-premium w-full p-4 pl-12 rounded-xl text-sm md:text-base" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--input-icon)]">/</span>
                <input 
                  type="text" 
                  placeholder="Custom Alias (Optional)" 
                  className="input-premium w-full p-4 pl-8 rounded-xl text-sm md:text-base" 
                  value={alias} 
                  onChange={(e) => setAlias(e.target.value)} 
                />
              </div>
              <button 
                onClick={handleShorten} 
                className="btn-action px-6 md:px-10 py-4 rounded-xl text-white font-bold shadow-[0_10px_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 hover:-translate-y-1 transition-transform"
              >
                <span>Shorten</span> <i className="fas fa-bolt"></i>
              </button>
            </div>
          </div>

          {/* Success Link Display */}
          {resultLink && (
            <div className="mt-6 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 bg-emerald-500/10 border border-emerald-500/30 shadow-inner fade-in">
              <div className="flex-1 min-w-0 w-full text-center md:text-left">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1">
                  <i className="fas fa-check-circle"></i> Success! Your Link:
                </p>
                <p className="font-mono truncate text-lg font-bold text-[var(--text-primary)]">
                  {resultLink}
                </p>
              </div>
              <button 
                onClick={copyToClipboard} 
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"
              >
                <i className="far fa-copy"></i> Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-8">
        <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-mouse-pointer text-8xl text-[var(--text-primary)]"></i>
          </div>
          <p className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-400">Total Clicks</p>
          <p className="text-4xl md:text-5xl font-black tracking-tight text-[var(--text-primary)]">{stats.total.toLocaleString()}</p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-6"></div>
        </div>
        
        <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-pink-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-calendar-day text-8xl text-[var(--text-primary)]"></i>
          </div>
          <p className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-400">Today's Clicks</p>
          <p className="text-4xl md:text-5xl font-black tracking-tight text-[var(--text-primary)]">{stats.today.toLocaleString()}</p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mt-6"></div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="glass-panel rounded-3xl p-5 md:p-8 mt-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
          <i className="fas fa-chart-area text-indigo-500"></i> Monthly Analytics
        </h3>
        <div className="w-full h-[300px] md:h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
    </div>
  );
};

export default DashboardOverview;
