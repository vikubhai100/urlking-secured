import React, { useState, useEffect, useRef } from 'react';
import { showToast } from '../../toast'; // Premium Toast Import kiya gaya hai

const LinkHistory = ({ token }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Server-Side Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Cache for Pre-fetching (Pages instant load karne ke liye)
  const pageCache = useRef({}); 
  
  const [editModal, setEditModal] = useState({ open: false, id: '', url: '' });
  
  const API = "https://go.urlking.site";
  const AD_BASE = "https://go.urlking.site/";

  useEffect(() => { 
    loadHistory(currentPage); 
  }, [currentPage]);

  const loadHistory = async (page, forceRefresh = false) => {
    // 1. Agar data cache me hai, toh Instant Load
    if (pageCache.current[page] && !forceRefresh) {
      setLinks(pageCache.current[page]);
      setLoading(false);
      prefetchNextPage(page + 1);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/history?page=${page}&limit=5`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      
      // Handle Standard Pagination format or flat array
      const fetchedLinks = data.data ? data.data : (Array.isArray(data) ? data : []);
      const fetchedTotalPages = data.last_page || data.totalPages || 1;

      // Save to cache
      pageCache.current[page] = fetchedLinks;

      setLinks(fetchedLinks);
      setTotalPages(fetchedTotalPages);

      // 3. Pre-fetch next page silently
      prefetchNextPage(page + 1, fetchedTotalPages);

    } catch (e) { 
      console.error(e); 
      showToast("Failed to load history", "error");
    } finally {
      setLoading(false);
    }
  };

  // Pre-fetching Logic (Silent Background Fetch)
  const prefetchNextPage = async (nextPage, maxPages = totalPages) => {
    if (nextPage > maxPages || pageCache.current[nextPage]) return; 

    try {
      const res = await fetch(`${API}/api/history?page=${nextPage}&limit=5`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      const fetchedLinks = data.data ? data.data : (Array.isArray(data) ? data : []);
      
      // Chupchaap cache me save kar lo
      pageCache.current[nextPage] = fetchedLinks;
    } catch (e) {
      // Ignore background fetch errors
    }
  };

  const handleEdit = async () => {
    if (!editModal.url) return showToast("URL cannot be empty", "error");
    
    try {
      const res = await fetch(`${API}/api/link`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: editModal.id, url: editModal.url })
      });
      
      if (res.ok) { 
        showToast("Link Updated Successfully!", "success"); // NATIVE ALERT REMOVED
        setEditModal({ open: false, id: '', url: '' }); 
        
        // Cache clear karke current page ko refresh karo
        pageCache.current = {};
        loadHistory(currentPage, true); 
      } else { 
        const d = await res.json(); 
        showToast(d.error || "Update failed", "error"); 
      }
    } catch (e) { 
      showToast("Server error", "error"); 
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    showToast("Link Copied Successfully!", "success"); // NATIVE ALERT REMOVED
  };

  return (
    <div className="fade-in w-full max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Link History</h2>
        <button 
          onClick={() => loadHistory(currentPage, true)} 
          className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center"
          title="Refresh Data"
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
        </button>
      </div>
      
      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
        <div className="divide-y divide-[var(--glass-border)] flex-1 overflow-auto p-2">
          {loading ? (
            <div className="p-10 text-center text-slate-500 flex flex-col items-center">
               <i className="fas fa-circle-notch fa-spin text-3xl mb-3 text-indigo-500"></i>
               <p>Fetching your links...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="p-10 text-center text-slate-500 flex flex-col items-center">
               <i className="fas fa-link text-4xl mb-3 opacity-30"></i>
               <p>No links found. Create one!</p>
            </div>
          ) : (
            links.map(item => {
              const short = AD_BASE + item.id;
              let displayUrl = item.url.replace(/^https?:\/\//, '');
              if (displayUrl.length > 35) displayUrl = displayUrl.substring(0, 35) + '...';

              return (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-[var(--nav-hover)] transition-colors gap-4 group rounded-xl">
                  
                  {/* Actions (Edit & Copy) */}
                  <div className="flex items-center gap-2 shrink-0 md:order-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditModal({ open: true, id: item.id, url: item.url })} 
                      className="w-10 h-10 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white transition-all flex items-center justify-center tooltip-trigger"
                      title="Edit Link"
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                    <button 
                      onClick={() => copyToClipboard(short)} 
                      className="w-10 h-10 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all flex items-center justify-center tooltip-trigger"
                      title="Copy Link"
                    >
                      <i className="far fa-copy"></i>
                    </button>
                  </div>

                  {/* Link Details */}
                  <div className="flex-1 min-w-0 md:order-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded bg-slate-500/10 flex items-center justify-center text-slate-400">
                        <i className="fas fa-globe text-[10px]"></i>
                      </div>
                      <p className="font-medium truncate text-sm md:text-base text-[var(--text-primary)]" title={item.url}>
                        {displayUrl}
                      </p>
                    </div>
                    <a href={short} target="_blank" rel="noreferrer" className="text-indigo-500 text-xs hover:text-indigo-400 hover:underline flex items-center gap-1 mt-1 ml-8">
                      <i className="fas fa-external-link-alt text-[10px]"></i> {short}
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* PRE-FETCHING PAGINATION CONTROLS */}
        {!loading && (totalPages > 1 || currentPage > 1) && (
          <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--nav-hover)] flex justify-between items-center gap-4">
             <span className="text-sm font-medium text-slate-400 hidden sm:block">Page {currentPage} of {totalPages}</span>
             
             <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
               <button 
                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                 disabled={currentPage === 1} 
                 className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--glass-border)] bg-[var(--bg-body)] text-slate-400 hover:text-indigo-500 hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
               >
                 <i className="fas fa-chevron-left text-sm"></i>
               </button>
               
               <span className="text-sm font-bold text-[var(--text-primary)] sm:hidden">Page {currentPage}</span>
               
               <button 
                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                 // Agar API totalPages return nahi karti, to 5 se kam items hone pe next block kardo
                 disabled={currentPage === totalPages || links.length < 5} 
                 className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--glass-border)] bg-[var(--bg-body)] text-slate-400 hover:text-indigo-500 hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
               >
                 <i className="fas fa-chevron-right text-sm"></i>
               </button>
             </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL - White Theme Proofed */}
      {editModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
          <div className="glass-panel p-6 rounded-3xl w-full max-w-md shadow-2xl border border-indigo-500/30">
            <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Edit Destination URL</h3>
            <div className="bg-[var(--nav-hover)] px-3 py-2 rounded-lg border border-[var(--glass-border)] mb-4 inline-block">
              <p className="text-xs text-slate-400 font-mono">ID: {editModal.id}</p>
            </div>
            
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Target URL</label>
            <input 
              type="url" 
              className="input-premium w-full p-4 rounded-xl mb-6 text-sm" 
              value={editModal.url} 
              onChange={(e) => setEditModal({ ...editModal, url: e.target.value })} 
              placeholder="https://..."
            />
            
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
              <button 
                onClick={() => setEditModal({ open: false, id: '', url: '' })} 
                className="px-6 py-2.5 text-slate-400 hover:text-[var(--text-primary)] hover:bg-[var(--nav-hover)] rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleEdit} 
                className="btn-action px-8 py-2.5 rounded-xl text-white font-bold shadow-[0_4px_15px_rgba(99,102,241,0.3)]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkHistory;
