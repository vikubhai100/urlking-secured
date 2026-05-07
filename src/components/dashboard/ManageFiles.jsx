import React, { useState, useEffect, useCallback } from 'react';
import { showToast } from '../../toast'; 

const ManageFiles = ({ token }) => {
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); 

  const [renameModal, setRenameModal] = useState({ open: false, id: '', name: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: '' });

  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
  const AD_BASE = import.meta.env.VITE_AD_BASE || "https://urlking.in/";

  const loadFiles = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/dev/my-files?page=${p}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      // Backend ab { data: [...] } format me bhej raha hai
      setFiles(Array.isArray(data) ? data : (data.data || []));
    } catch (e) { 
      console.error(e);
      showToast("Failed to fetch files", "error");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => { 
    loadFiles(page); 
  }, [page, loadFiles]);

  const handleRename = async () => {
    if (!renameModal.name.trim()) return showToast("Name cannot be empty", "error");

    setIsProcessing(true);
    try {
      const res = await fetch(`${API}/api/dev/rename-file`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ short_id: renameModal.id, new_name: renameModal.name })
      });

      if (res.ok) { 
        showToast("Renamed Successfully!", "success"); 
        setRenameModal({ open: false, id: '', name: '' }); 
        loadFiles(page); 
      } else { 
        const d = await res.json(); 
        showToast(d.error || "Failed to rename", "error"); 
      }
    } catch (e) { 
      showToast("Server error", "error"); 
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API}/api/dev/delete-file/${deleteModal.id}`, {
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) { 
        showToast("File Removed!", "success"); 
        setDeleteModal({ open: false, id: '' }); 
        loadFiles(page); 
      } else { 
        const d = await res.json(); 
        showToast(d.error || "Failed to delete", "error"); 
      }
    } catch (e) { 
      showToast("Server error", "error"); 
    } finally {
      setIsProcessing(false);
    }
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    showToast("Copied!", "success");
  };

  // Backend API pagination fallback logic
  const isApiPaginated = files.length <= 5;
  const displayFiles = isApiPaginated ? files : files.slice((page - 1) * 5, page * 5);
  const disableNext = isApiPaginated ? files.length < 5 : files.length <= page * 5;

  return (
    <div className="fade-in w-full max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Manage Uploaded Files</h2>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1 p-2">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="border-b border-[var(--glass-border)] bg-[var(--table-header-bg)] text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4 pl-6">File Name</th>
                <th className="p-4">Size</th>
                <th className="p-4">Link</th>
                <th className="p-4">Downloads</th> {/* 🟢 NAYA COLUMN */}
                <th className="p-4">Date</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)] text-sm text-[var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500">
                    <i className="fas fa-circle-notch fa-spin text-2xl mb-2 text-indigo-500"></i><br/>Loading...
                  </td>
                </tr>
              ) : displayFiles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500">No active files uploaded yet.</td>
                </tr>
              ) : (
                displayFiles.map(f => {
                  const shortUrl = AD_BASE + f.short_id;
                  const downloadCount = f.downloads || 0; // 🟢 Backend se count aayega

                  return (
                    <tr key={f.short_id} className="hover:bg-[var(--nav-hover)] transition-colors">
                      <td className="p-4 pl-6 font-medium">
                        <div className="flex items-center gap-2 max-w-[200px] truncate" title={f.file_name}>
                          <i className="fas fa-file-alt text-indigo-500"></i> <span className="truncate">{f.file_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400">{f.file_size}</td>
                      <td className="p-4 text-xs">
                        <a href={shortUrl} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline flex items-center gap-1">
                          <i className="fas fa-external-link-alt"></i> Link
                        </a>
                      </td>
                      
                      {/* 🟢 DOWNLOADS DATA CELL */}
                      <td className="p-4 text-xs font-black text-emerald-500">
                        <div className="bg-emerald-500/10 inline-block px-3 py-1 rounded-full border border-emerald-500/20">
                          <i className="fas fa-download mr-1"></i> {downloadCount}
                        </div>
                      </td>

                      <td className="p-4 text-xs text-slate-400">{new Date(f.created_at).toLocaleDateString()}</td>
                      <td className="p-4 pr-6 text-right">
                        <button onClick={() => setRenameModal({ open: true, id: f.short_id, name: f.file_name })} className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-600 text-indigo-500 hover:text-white transition-all text-xs mr-2" title="Rename">
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button onClick={() => setDeleteModal({ open: true, id: f.short_id })} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white transition-all text-xs mr-2" title="Delete">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                        <button onClick={() => copyLink(shortUrl)} className="p-2 rounded-lg bg-green-500/10 hover:bg-green-600 text-green-500 hover:text-white transition-all text-xs" title="Copy Link">
                          <i className="fas fa-copy"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION UI */}
        <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--nav-hover)] flex justify-center items-center gap-4">
           <button onClick={() => setPage(page - 1)} disabled={page === 1} className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-indigo-500/20 disabled:hover:text-indigo-400">
             <i className="fas fa-chevron-left"></i>
           </button>
           <span className="text-sm font-medium text-slate-400">Page {page}</span>
           <button onClick={() => setPage(page + 1)} disabled={disableNext} className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-indigo-500/20 disabled:hover:text-indigo-400">
             <i className="fas fa-chevron-right"></i>
           </button>
        </div>
      </div>

      {/* RENAME MODAL */}
      {renameModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Rename File</h3>
            <input 
              type="text" 
              className="input-premium w-full p-3 rounded-lg mb-4" 
              value={renameModal.name} 
              onChange={(e) => setRenameModal({ ...renameModal, name: e.target.value })} 
              disabled={isProcessing}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
              <button 
                onClick={() => setRenameModal({ open: false, id: '', name: '' })} 
                className="px-4 py-2 text-slate-400 hover:bg-[var(--nav-hover)] rounded"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleRename} 
                className="btn-action px-6 py-2 rounded text-white flex items-center gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL (🟢 UPDATED MESSAGE FOR SOFT DELETE) */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-sm text-center">
            <i className="fas fa-trash-alt text-4xl text-red-500 mb-4"></i>
            <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Remove File?</h3>
            <p className="text-sm text-slate-400 mb-6">This file will be removed from your dashboard. <br/><span className="text-emerald-500 font-bold">Your clicks & earnings are safe!</span></p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteModal({ open: false, id: '' })} 
                className="px-4 py-2 text-slate-400 hover:bg-[var(--nav-hover)] rounded"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold flex items-center gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : null}
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFiles;
