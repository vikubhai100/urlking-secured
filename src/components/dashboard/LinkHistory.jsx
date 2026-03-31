import React, { useState, useEffect } from 'react';
import { showToast } from '../../toast';

const LinkHistory = ({ token }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "https://go.urlking.site";

  // Page load hote hi asli data fetch karega
  useEffect(() => {
    if (token) {
      fetchLinks();
    }
  }, [token]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/links`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Asli data state me set ho raha hai
        setLinks(data.links || data.data || []);
      } else {
        console.error("API Error:", data.message);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (alias) => {
    const fullUrl = `https://look.mypdftools.site/${alias}`;
    navigator.clipboard.writeText(fullUrl);
    showToast("Link Copied!", "success");
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/api/links/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Link deleted", "success");
        fetchLinks(); // List refresh
      }
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-[24px] fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Links History</h2>
          <p className="text-slate-400 text-sm">Real-time performance of your URLs.</p>
        </div>
        <button 
          onClick={fetchLinks} 
          className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center"
          title="Refresh Data"
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--glass-border)] text-slate-400 text-xs uppercase tracking-wider">
              <th className="pb-3 px-4 font-bold">Short Link</th>
              <th className="pb-3 px-4 font-bold">Original Destination</th>
              <th className="pb-3 px-4 font-bold text-center">Clicks</th>
              <th className="pb-3 px-4 font-bold">Date</th>
              <th className="pb-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glass-border)]">
            {loading ? (
              // Loading State
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
                    <p className="text-slate-400 font-medium">Fetching original data...</p>
                  </div>
                </td>
              </tr>
            ) : links.length > 0 ? (
              // Original Data Mapping
              links.map((link) => (
                <tr key={link.id} className="hover:bg-[var(--nav-hover)] transition-colors group">
                  <td className="py-4 px-4 text-sm font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fas fa-link text-xs"></i>
                      </div>
                      <a href={`https://look.mypdftools.site/${link.alias}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                        look.mypdftools.site/{link.alias}
                      </a>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-400 max-w-[200px] truncate" title={link.original_url}>
                    {link.original_url}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-lg bg-[var(--nav-hover)] border border-[var(--glass-border)] font-bold text-[var(--text-primary)]">
                      {link.clicks || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-400">
                    {new Date(link.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => copyToClipboard(link.alias)} className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center">
                        <i className="far fa-copy"></i>
                      </button>
                      <button onClick={() => handleDelete(link.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Empty State (No links yet)
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <div className="opacity-20 mb-4">
                    <i className="fas fa-link text-6xl text-slate-400"></i>
                  </div>
                  <p className="text-slate-400 font-bold text-lg">No active links found.</p>
                  <p className="text-slate-500 text-sm">Create a new link to see it here.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LinkHistory;
