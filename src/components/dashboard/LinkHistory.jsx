import React, { useState, useEffect } from 'react';
import { showToast } from '../../toast'; // Premium Toast

// 1. isActive prop add kiya gaya
const LinkHistory = ({ token, isActive }) => {
  const [links, setLinks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [editModal, setEditModal] = useState({ open: false, id: '', url: '' });

  const API = "https://go.urlking.site";
  const AD_BASE = "https://go.urlking.site/";

  // 2. isActive check karega aur silently data update karega
  useEffect(() => {
    if (isActive !== false) {
      loadHistory(page, true); // true = silent refresh (no spinner)
    }
  }, [page, isActive, token]);

  // 3. isSilent logic lagaya taaki background update me spinner na dikhe
  const loadHistory = async (p, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`${API}/api/history?page=${p}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : (data.data || []));
    } catch (e) { 
      console.error(e); 
    }
    setLoading(false);
  };

  const handleEdit = async () => {
    try {
      const res = await fetch(`${API}/api/link`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: editModal.id, url: editModal.url })
      });
      if (res.ok) { 
        showToast("Updated Successfully!", "success"); 
        setEditModal({ open: false, id: '', url: '' }); 
        loadHistory(page, true); // Silent refresh after edit
      } else { 
        const d = await res.json(); 
        showToast(d.error || "Update failed", "error"); 
      }
    } catch (e) { showToast("Server error", "error"); }
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    showToast("Copied!", "success");
  };

  // SAFETY LOCK: Ensures only 5 items are shown on the UI, even if API returns 100 items.
  const isApiPaginated = links.length <= 5;
  const displayLinks = isApiPaginated ? links : links.slice((page - 1) * 5, page * 5);
  const disableNext = isApiPaginated ? links.length < 5 : links.length <= page * 5;

  return (
    <div className="fade-in w-full max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Link History</h2>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
        <div className="divide-y divide-[var(--glass-border)] flex-1 overflow-auto p-2">
          {loading ? (
            <div className="p-8 text-center text-slate-500"><i className="fas fa-circle-notch fa-spin text-2xl mb-2 text-indigo-500"></i><br/>Loading links...</div>
          ) : displayLinks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No links found. Create one!</div>
          ) : (
            displayLinks.map(item => {
              const short = AD_BASE + item.id;
              let displayUrl = item.url.replace(/^https?:\/\//, '');
              if (displayUrl.length > 35) displayUrl = displayUrl.substring(0, 35) + '...';

              return (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-[var(--nav-hover)] transition-colors gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setEditModal({ open: true, id: item.id, url: item.url })} className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-all border border-indigo-500/20 text-xs"><i className="fas fa-pencil-alt"></i></button>
                    <button onClick={() => copyLink(short)} className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 text-emerald-500 hover:text-white transition-all text-xs border border-emerald-500/20"><i className="fas fa-copy"></i></button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm md:text-base text-[var(--text-primary)]" title={item.url}>{displayUrl}</p>
                    <a href={short} target="_blank" rel="noreferrer" className="text-indigo-500 text-xs hover:underline flex items-center gap-1 mt-1"><i className="fas fa-external-link-alt text-xs"></i> {short}</a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ORIGINAL PAGINATION UI */}
        <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--nav-hover)] flex justify-center items-center gap-4">
           <button onClick={() => setPage(page - 1)} disabled={page === 1} className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-indigo-500/20 disabled:hover:text-indigo-400"><i className="fas fa-chevron-left"></i></button>
           <span className="text-sm font-medium text-slate-400">Page {page}</span>
           <button onClick={() => setPage(page + 1)} disabled={disableNext} className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-indigo-500/20 disabled:hover:text-indigo-400"><i className="fas fa-chevron-right"></i></button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Edit Destination URL</h3>
            <p className="text-xs text-slate-400 mb-2">ID: {editModal.id}</p>
            <input type="url" className="input-premium w-full p-3 rounded-lg mb-4" value={editModal.url} onChange={(e) => setEditModal({ ...editModal, url: e.target.value })} />
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
              <button onClick={() => setEditModal({ open: false, id: '', url: '' })} className="px-4 py-2 text-slate-400 hover:bg-[var(--nav-hover)] rounded">Cancel</button>
              <button onClick={handleEdit} className="btn-action px-6 py-2 rounded text-white font-bold">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkHistory;
