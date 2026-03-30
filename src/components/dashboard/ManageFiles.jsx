import React, { useState, useEffect } from 'react';

const ManageFiles = ({ token }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [renameModal, setRenameModal] = useState({ open: false, id: '', name: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: '' });
  
  const API = "https://go.urlking.site";
  const AD_BASE = "https://go.urlking.site/";

  useEffect(() => { loadFiles(); }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/dev/my-files`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleRename = async () => {
    if (!renameModal.name) return alert("Name cannot be empty");
    try {
      const res = await fetch(`${API}/api/dev/rename-file`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ short_id: renameModal.id, new_name: renameModal.name })
      });
      if (res.ok) { alert("Renamed!"); setRenameModal({ open: false, id: '', name: '' }); loadFiles(); } 
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch (e) { alert("Server error"); }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/api/dev/delete-file/${deleteModal.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { alert("Deleted!"); setDeleteModal({ open: false, id: '' }); loadFiles(); }
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch (e) { alert("Server error"); }
  };

  return (
    <div className="fade-in w-full max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Manage Uploaded Files</h2>
      
      <div className="glass-panel rounded-2xl overflow-hidden min-h-[400px]">
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
                <tr><td colSpan="5" className="p-6 text-center text-slate-500"><i className="fas fa-circle-notch fa-spin text-2xl mb-2"></i><br/>Loading...</td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-slate-500">No active files uploaded yet.</td></tr>
              ) : (
                files.map(f => {
                  const shortUrl = AD_BASE + f.short_id;
                  return (
                    <tr key={f.short_id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 pl-6 font-medium">
                        <div className="flex items-center gap-2 max-w-[200px] truncate" title={f.file_name}>
                          <i className="fas fa-file-alt text-indigo-500"></i> <span className="truncate">{f.file_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400">{f.file_size}</td>
                      <td className="p-4 text-xs">
                        <a href={shortUrl} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline flex items-center gap-1"><i className="fas fa-external-link-alt"></i> Link</a>
                      </td>
                      <td className="p-4 text-xs text-slate-400">{new Date(f.created_at).toLocaleDateString()}</td>
                      <td className="p-4 pr-6 text-right">
                        <button onClick={() => setRenameModal({ open: true, id: f.short_id, name: f.file_name })} className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-600 text-indigo-500 hover:text-white transition-all text-xs mr-2"><i className="fas fa-pencil-alt"></i></button>
                        <button onClick={() => setDeleteModal({ open: true, id: f.short_id })} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white transition-all text-xs mr-2"><i className="fas fa-trash-alt"></i></button>
                        <button onClick={() => { navigator.clipboard.writeText(shortUrl); alert("Copied!"); }} className="p-2 rounded-lg bg-green-500/10 hover:bg-green-600 text-green-500 hover:text-white transition-all text-xs"><i className="fas fa-copy"></i></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENAME MODAL */}
      {renameModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Rename File</h3>
            <input type="text" className="input-premium w-full p-3 rounded-lg mb-4" value={renameModal.name} onChange={(e) => setRenameModal({ ...renameModal, name: e.target.value })} />
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
              <button onClick={() => setRenameModal({ open: false, id: '', name: '' })} className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded">Cancel</button>
              <button onClick={handleRename} className="btn-action px-6 py-2 rounded text-white">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-sm text-center">
            <i className="fas fa-trash-alt text-4xl text-red-500 mb-4"></i>
            <h3 className="text-xl font-bold mb-2">Delete Permanently?</h3>
            <p className="text-sm text-slate-400 mb-6">This will break existing links.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteModal({ open: false, id: '' })} className="px-4 py-2 text-slate-400">Cancel</button>
              <button onClick={handleDelete} className="px-6 py-2 bg-red-600 text-white rounded font-bold">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFiles;
