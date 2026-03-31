import React, { useState, useEffect, useRef } from 'react';
import { showToast } from '../../toast'; // Premium Toast

const ManageFiles = ({ token }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Server-Side Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  
  // Cache for Pre-fetching (Stores pages so they load instantly)
  const pageCache = useRef({}); 
  
  const [renameModal, setRenameModal] = useState({ open: false, id: '', name: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: '' });
  
  const API = "https://go.urlking.site";
  const AD_BASE = "https://go.urlking.site/";

  // Whenever currentPage changes, fetch that page's data
  useEffect(() => { 
    fetchPageData(currentPage); 
  }, [currentPage]);

  // Main Fetch Logic
  const fetchPageData = async (page, forceRefresh = false) => {
    // 1. Agar data pehle se pre-fetch hoke cache me hai, toh INSTANT LOAD karo
    if (pageCache.current[page] && !forceRefresh) {
      setFiles(pageCache.current[page]);
      setLoading(false);
      // Ensure the *next* page is also pre-fetched if needed
      prefetchNextPage(page + 1);
      return;
    }

    // 2. Agar cache me nahi hai, toh API se fetch karo (Loading ghoomega)
    setLoading(true);
    try {
      // Backend ko bolo sirf 5 files de is specific page ki
      const res = await fetch(`${API}/api/dev/my-files?page=${page}&limit=5`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      
      // Handle Standard API Pagination Response (e.g. Laravel)
      const fetchedFiles = data.data ? data.data : (Array.isArray(data) ? data : []);
      const fetchedTotalPages = data.last_page || data.totalPages || 1;
      const fetchedTotal = data.total || fetchedFiles.length;

      // Save to cache
      pageCache.current[page] = fetchedFiles;

      setFiles(fetchedFiles);
      setTotalPages(fetchedTotalPages);
      setTotalFiles(fetchedTotal);

      // 3. Current page load hote hi, next page background me CHUPCHAAP fetch karo
      prefetchNextPage(page + 1, fetchedTotalPages);

    } catch (e) { 
      console.error(e); 
      showToast("Failed to load files", "error");
    } finally {
      setLoading(false);
    }
  };

  // Pre-fetching Logic (Silent Background Fetch)
  const prefetchNextPage = async (nextPage, maxPages = totalPages) => {
    if (nextPage > maxPages || pageCache.current[nextPage]) return; // Pehle se hai toh chhod do

    try {
      const res = await fetch(`${API}/api/dev/my-files?page=${nextPage}&limit=5`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      const fetchedFiles = data.data ? data.data : (Array.isArray(data) ? data : []);
      
      // Chupchaap cache me save kar lo, state change mat karo
      pageCache.current[nextPage] = fetchedFiles;
    } catch (e) {
      // Ignore prefetch errors silently
    }
  };

  // Actions
  const handleRename = async () => {
    if (!renameModal.name) return showToast("Name cannot be empty", "error");
    try {
      const res = await fetch(`${API}/api/dev/rename-file`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ short_id: renameModal.id, new_name: renameModal.name })
      });
      if (res.ok) { 
        showToast("Renamed Successfully!", "success"); 
        setRenameModal({ open: false, id: '', name: '' }); 
        
        // Clear cache and refresh current page to reflect changes
        pageCache.current = {}; 
        fetchPageData(currentPage, true); 
      } else { 
        const d = await res.json(); showToast(d.error || "Failed", "error"); 
      }
    } catch (e) { showToast("Server error", "error"); }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/api/dev/delete-file/${deleteModal.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { 
        showToast("Deleted Permanently!", "success"); 
        setDeleteModal({ open: false, id: '' }); 
        
        // Clear cache completely and reload page
        pageCache.current = {};
        
        // Edge case: Deleted last item on current page, go back 1 page
        if (files.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchPageData(currentPage, true);
        }
      } else { 
        const d = await res.json(); showToast(d.error || "Failed", "error"); 
      }
    } catch (e) { showToast("Server error", "error"); }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    showToast("Link Copied Successfully!", "success");
  };

  return (
    <div className="fade-in w-full max-w-5xl mx-auto space-y-6">
      
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Manage Uploaded Files</h2>
        <div className="text-sm text-slate-400 bg-[var(--nav-hover)] px-4 py-2 rounded-lg border border-[var(--glass-border)]">
          Total Files: <span className="font-bold text-[var(--text-primary)]">{totalFiles}</span>
        </div>
      </div>
      
      <div className="glass-panel rounded-2xl overflow-hidden min-h-[400px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="border-b border-[var(--glass-border)] bg-[var(--table-header-bg)] text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4 pl-6">File Name</th>
                <th className="p-4">Size</th>
                <th className="p-4">Link</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)] text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">
                    <i className="fas fa-circle-notch fa-spin text-3xl mb-3 text-indigo-500"></i><br/>Fetching files...
                  </td>
                </tr>
              ) : files.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">
                    <i className="fas fa-cloud-upload-alt text-4xl mb-3 opacity-30"></i><br/>No files found.
                  </td>
                </tr>
              ) : (
                files.map(f => {
                  const shortUrl = AD_BASE + f.short_id;
                  return (
                    <tr key={f.short_id} className="hover:bg-[var(--nav-hover)] transition-colors group">
                      <td className="p-4 pl-6 font-medium text-[var(--text-primary)]">
                        <div className="flex items-center gap-3 max-w-[200px]" title={f.file_name}>
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                            <i className="fas fa-file-alt text-xs"></i> 
                          </div>
                          <span className="truncate">{f.file_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400">{f.file_size}</td>
                      <td className="p-4 text-xs">
                        <a href={shortUrl} target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-400 hover:underline flex items-center gap-2">
                          {f.short_id} <i className="fas fa-external-link-alt opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </a>
                      </td>
                      <td className="p-4 text-xs text-slate-400">{new Date(f.created_at).toLocaleDateString()}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setRenameModal({ open: true, id: f.short_id, name: f.file_name })} className="w-8 h-8 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white transition-all text-xs flex items-center justify-center tooltip-trigger" title="Rename">
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button onClick={() => setDeleteModal({ open: true, id: f.short_id })} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all text-xs flex items-center justify-center tooltip-trigger" title="Delete">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                          <button onClick={() => copyToClipboard(shortUrl)} className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all text-xs flex items-center justify-center tooltip-trigger" title="Copy Link">
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* SERVER-SIDE PAGINATION CONTROLS */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--nav-hover)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-slate-400">
              Page <span className="font-bold text-[var(--text-primary)]">{currentPage}</span> of <span className="font-bold text-[var(--text-primary)]">{totalPages}</span>
            </span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-body)] flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              
              <div className="flex items-center gap-1 mx-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  // Clean UI logic: Only show current page, first, last, and immediate neighbors
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                          currentPage === pageNum 
                            ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                            : 'bg-[var(--bg-body)] border border-[var(--glass-border)] text-slate-400 hover:text-[var(--text-primary)] hover:border-indigo-500/50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="text-slate-500 px-1">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-body)] flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-chevron-right text-sm"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RENAME MODAL */}
      {renameModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
          <div className="glass-panel p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Rename File</h3>
            <input 
              type="text" 
              className="input-premium w-full p-4 rounded-xl mb-6 text-sm" 
              value={renameModal.name} 
              onChange={(e) => setRenameModal({ ...renameModal, name: e.target.value })} 
              placeholder="Enter new file name..."
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
              <button onClick={() => setRenameModal({ open: false, id: '', name: '' })} className="px-6 py-2.5 text-slate-400 hover:text-[var(--text-primary)] hover:bg-[var(--nav-hover)] rounded-xl transition-colors font-medium">Cancel</button>
              <button onClick={handleRename} className="btn-action px-8 py-2.5 rounded-xl text-white font-bold shadow-[0_4px_15px_rgba(99,102,241,0.3)]">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-trash-alt text-4xl text-red-500"></i>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Delete File?</h3>
            <p className="text-sm text-slate-400 mb-8">This action is permanent and will immediately break any existing download links.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={() => setDeleteModal({ open: false, id: '' })} className="w-full sm:w-auto px-6 py-3 text-slate-400 hover:text-[var(--text-primary)] hover:bg-[var(--nav-hover)] rounded-xl transition-colors font-medium">Cancel</button>
              <button onClick={handleDelete} className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFiles;
