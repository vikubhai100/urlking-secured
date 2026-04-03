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
  const [stats, setStats] = useState({ total: 0, today: 0, daily: Array(30).fill(0) });

  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  useEffect(() => {
    if (isActive !== false) { 
      fetchStats();
    }
  }, [token, isActive]); 

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setStats({ 
          total: data.total || 0, 
          today: data.today || 0, 
          daily: data.daily || Array(30).fill(0) 
        });
      }
    } catch (err) { 
      console.error("Error fetching stats", err); 
    }
  };

  const handleShorten = async () => {
    if (!url) return showToast("Please enter a valid URL to shorten.", "error"); 

    const payload = { url, alias };
    if (expirationDate) {
      payload.expires_at = expirationDate;
    }

    try {
      const res = await fetch(`${API}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create short link");

      setResultLink(`https://go.urlking.site/${data.id}`); 
      setUrl('');
      setAlias('');
      setExpirationDate(''); 
      fetchStats(); 

      showToast("Link successfully shortened!", "success"); 
    } catch (e) { 
      showToast(e.message, "error"); 
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultLink);
    showToast("Link Copied Successfully!", "success"); 
  };

  const chartData = {
    labels: Array.from({ length: stats.daily.length }, (_, i) => i + 1),
    datasets: [
      {
        fill: true,
        data: stats.daily,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(99, 102, 241, 0.2)', 
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
        ticks: { color: '#94a3b8' } 
      }, 
      y: { 
        grid: { color: 'rgba(148, 163, 184, 0.1)' }, 
        ticks: { color: '#94a3b8' }, 
        beginAtZero: true 
      } 
    }
  };

  const today = new Date().toISOString().slice(0, 16);

  return (
    <div className="fade-in w-full max-w-5xl mx-auto space-y-6 px-1 md:px-0">

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

      {/* 🟢 COMPACT & PERFECTLY SPACED SHORTEN BOX */}
      <div className="border-animated p-1">
        <div className="relative z-10 p-5 md:p-6 glass-panel border-none rounded-[1.2rem]">
          <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)] mb-4">
            <i className="fas fa-magic text-indigo-500"></i> Shorten New URL
          </h3>

          <div className="space-y-4"> {/* Reduced spacing here from space-y-6 to space-y-4 */}
            
            {/* 1. Main URL Input */}
            <div>
              <div className="relative">
                <i className="fas fa-link absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                {/* Changed py-4 to py-3 to make box slimmer */}
                <input 
                  type="url" 
                  placeholder="Your URL Here (https://...)" 
                  className="input-premium w-full py-3 pl-11 pr-4 rounded-xl text-sm" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                />
              </div>
            </div>

            {/* 2. Alias Input */}
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5 tracking-wide">
                Alias
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">/</span>
                <input 
                  type="text" 
                  placeholder="Alias (Optional)" 
                  className="input-premium w-full py-3 pl-9 pr-4 rounded-xl text-sm" 
                  value={alias} 
                  onChange={(e) => setAlias(e.target.value)} 
                />
              </div>
            </div>

            {/* 3. Expiration Date Input */}
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5 tracking-wide">
                Expiration date
              </label>
              <div className="relative w-full md:w-1/2 lg:w-1/3">
                <i className="fas fa-clock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="datetime-local" 
                  className="input-premium w-full py-3 pl-11 pr-4 rounded-xl text-sm text-slate-400 focus:text-[var(--text-primary)]" 
                  value={expirationDate} 
                  min={today}
                  onChange={(e) => setExpirationDate(e.target.value)} 
                />
              </div>
            </div>

            {/* 4. Shorten Button (Bada aur bold!) */}
            <div className="pt-2">
              <button 
                onClick={handleShorten} 
                className="btn-action w-full md:w-auto px-10 py-3 rounded-xl text-white font-bold shadow-[0_5px_15px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 hover:-translate-y-1 transition-transform"
              >
                <span>Shorten</span> <i className="fas fa-bolt"></i>
              </button>
            </div>

          </div>

          {/* Success Link Display */}
          {resultLink && (
            <div className="mt-6 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/30 shadow-inner fade-in">
              <div className="flex-1 min-w-0 w-full text-center md:text-left">
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1">
                  <i className="fas fa-check-circle"></i> Success! Your Link:
                </p>
                <p className="font-mono truncate text-base font-bold text-[var(--text-primary)]">
                  {resultLink}
                </p>
              </div>
              <button 
                onClick={copyToClipboard} 
                className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <i className="far fa-copy"></i> Copy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-6">
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-mouse-pointer text-8xl text-[var(--text-primary)]"></i>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Total Clicks</p>
          <p className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text-primary)]">{stats.total.toLocaleString()}</p>
          <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-4"></div>
        </div>

        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-pink-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-calendar-day text-8xl text-[var(--text-primary)]"></i>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Today's Clicks</p>
          <p className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text-primary)]">{stats.today.toLocaleString()}</p>
          <div className="h-1.5 w-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mt-4"></div>
        </div>
      </div>

      {/* Analytics Chart & Support Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        {/* Chart Column */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-5 md:p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
            <i className="fas fa-chart-area text-indigo-500"></i> Daily Clicks Chart (30 Days)
          </h3>
          <div className="w-full h-[250px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Support Column */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between border-t-4 border-indigo-500">
          <div>
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4 shadow-inner border border-indigo-500/20">
              <i className="fas fa-headset text-xl"></i>
            </div>
            <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">Dedicated Support</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Need higher CPM, API integrations, or have queries? Contact our management team for priority assistance.
            </p>
          </div>

          <div className="space-y-3">
            <a href="https://wa.me/919304266995" target="_blank" rel="noopener noreferrer" className="w-full py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md">
              <i className="fab fa-whatsapp text-lg"></i> WhatsApp Support
            </a>
            <a href="https://t.me/vikubhai01" target="_blank" rel="noopener noreferrer" className="w-full py-2.5 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md">
              <i className="fab fa-telegram-plane text-lg"></i> Contact Manager
            </a>
            <a href="mailto:support@urlking.site" className="w-full py-2.5 px-4 rounded-xl bg-[var(--nav-hover)] border border-[var(--glass-border)] text-[var(--text-primary)] hover:border-indigo-500/50 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md">
              <i className="fas fa-envelope text-indigo-500 text-lg"></i> Email Support
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;
