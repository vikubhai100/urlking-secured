import React, { useState, useEffect, useCallback } from 'react';
import ConfirmModal from '../../components/admin/Modals/ConfirmModal';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
const PER_PAGE = 10;

const Avatar = ({ name }) => (
  <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs shrink-0 border border-slate-200">
    {(name || '?')[0].toUpperCase()}
  </div>
);

export default function RecyclePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState(null);
  
  const token = localStorage.getItem('admin_token');

  // 🚀 FAST FETCH LOGIC
  const loadDeletedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/users?deleted=true`, { 
        headers: { 'x-admin-token': token } 
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Recycle Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [token]);

  useEffect(() => {
    loadDeletedUsers();
  }, [loadDeletedUsers]);

  // Actions handler
  const executeAction = async () => {
    const { type, payload } = confirmModal;
    setConfirmModal(null);
    const endpoint = type === 'restore' ? '/api/admin/restore' : '/api/admin/permanent-delete';

    try {
      const res = await fetch(`${API}${endpoint}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, 
        body: JSON.stringify({ uids: payload }) 
      });
      if (res.ok) loadDeletedUsers();
      else alert('Action failed on server');
    } catch (err) { 
      alert('Error processing action'); 
    }
  };

  // Search & Pagination Logic
  const filteredUsers = users.filter(u => 
    !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE));
  const pageUsers = filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shadow-inner">
            <i className="fas fa-trash-alt text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Recycle Bin</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage suspended accounts</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
            <input 
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search deleted users..."
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-2xl border border-slate-100 bg-white text-sm focus:border-violet-400 outline-none transition-all shadow-sm"
            />
          </div>
          <button onClick={loadDeletedUsers} className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-violet-600 transition-colors shadow-sm">
            <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Suspended User</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Loss</th>
                <th className="p-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Recovery Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // 🦴 Skeleton UI
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-5"><div className="h-10 w-40 bg-slate-100 rounded-2xl" /></td>
                    <td className="p-5"><div className="h-6 w-16 bg-slate-50 rounded-lg mx-auto" /></td>
                    <td className="p-5"><div className="h-10 w-24 bg-slate-50 rounded-2xl ml-auto" /></td>
                  </tr>
                ))
              ) : pageUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <i className="fas fa-box-open text-4xl" />
                      <p className="font-bold text-sm">Recycle bin is clean</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageUsers.map(u => (
                  <tr key={u.uid} className="group hover:bg-slate-50/50 transition-all duration-200">
                    <td className="p-5">
                      <div className="flex items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Avatar name={u.username} />
                        <div>
                          <div className="font-bold text-slate-700">{u.username || 'Unknown User'}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <div className="inline-flex flex-col">
                        <span className="font-black text-slate-600 font-mono">{u.links_count || 0} Links</span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase">Will be restored</span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setConfirmModal({ type: 'restore', payload: [u.uid], title: 'Restore Account?', message: `This will bring @${u.username} back to the active user list.`, confirmText: 'Restore Now', danger: false })}
                          className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-sm"
                        >
                          <i className="fas fa-undo-alt mr-2" /> Restore
                        </button>
                        <button 
                          onClick={() => setConfirmModal({ type: 'permanent', payload: [u.uid], title: 'Permanent Wipe?', message: `Deleting @${u.username} is irreversible. All their links and data will be lost forever.`, confirmText: 'Wipe Data', danger: true })}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 transition-all active:scale-95 flex items-center justify-center shadow-sm"
                        >
                          <i className="fas fa-skull-crossbones text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="p-5 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {filteredUsers.length} Suspended · Page {page}/{totalPages}
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-20 hover:border-violet-300 transition-all shadow-sm">
              <i className="fas fa-chevron-left text-xs" />
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-20 hover:border-violet-300 transition-all shadow-sm">
              <i className="fas fa-chevron-right text-xs" />
            </button>
          </div>
        </div>
      </div>

      {confirmModal && (
        <ConfirmModal 
          open onClose={() => setConfirmModal(null)}
          title={confirmModal.title} message={confirmModal.message}
          confirmText={confirmModal.confirmText} danger={confirmModal.danger}
          onConfirm={executeAction} 
        />
      )}
    </div>
  );
}
