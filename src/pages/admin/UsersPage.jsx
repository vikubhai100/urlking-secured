import React, { useState, useEffect, useCallback } from 'react';
import UserModal from '../../components/admin/Modals/UserModal';
import ConfirmModal from '../../components/admin/Modals/ConfirmModal'; // 🔴 Confirm Modal zaroori hai Suspend ke liye

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
const PER_PAGE = 12;

const Avatar = ({ name }) => (
  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-black text-sm shrink-0 border border-violet-200 shadow-sm transition-transform group-hover:scale-105">
    {(name || '?')[0].toUpperCase()}
  </div>
);

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [userModal, setUserModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // 🔴 For Ban/Suspend action
  
  const token = localStorage.getItem('admin_token');

  // 🚀 Fetch Users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/users?deleted=false`, { 
        headers: { 'x-admin-token': token } 
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Error loading users:", err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // 🚀 Open User Modal with fresh data API call (prevents 100% bug on load)
  const openUser = async (uid) => {
    const baseUser = users.find(u => u.uid === uid) || { uid };
    setUserModal({ ...baseUser, _loading: true }); // Show spinner mode first
    try {
      const res = await fetch(`${API}/api/admin/users/${uid}`, { 
        headers: { 'x-admin-token': token } 
      });
      if (res.ok) { 
        const freshData = await res.json(); 
        setUserModal({ ...baseUser, ...freshData, _loading: false }); 
      } else {
        setUserModal(p => ({ ...p, _loading: false }));
      }
    } catch { 
      setUserModal(p => ({ ...p, _loading: false })); 
    }
  };

  // 🚀 Suspend Action (Moves to Recycle Bin)
  const handleSuspend = async () => {
    const { payload } = confirmModal;
    setConfirmModal(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/soft-delete`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, 
        body: JSON.stringify({ uids: payload }) 
      });
      if (res.ok) {
        loadUsers(); // Refresh the list
      } else {
        alert("Failed to suspend user.");
      }
    } catch (err) { alert('Error processing action'); }
    finally { setLoading(false); }
  };

  // Filter & Pagination Logic
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return !q || (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE));
  const pageUsers = filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
             <i className="fas fa-users text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">User Database</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage all active members</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
          <input 
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Quick search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-100 bg-white text-sm focus:border-violet-400 outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[450px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-100">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Clicks</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Earned</th>
                <th className="p-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // 🦴 Skeleton UI
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-5 flex items-center gap-3"><div className="w-9 h-9 bg-slate-100 rounded-full" /><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                    <td className="p-5 text-center"><div className="h-4 w-12 bg-slate-100 rounded mx-auto" /></td>
                    <td className="p-5 text-center"><div className="h-4 w-12 bg-slate-100 rounded mx-auto" /></td>
                    <td className="p-5 text-right"><div className="h-8 w-20 bg-slate-100 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : pageUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-20 text-center text-slate-400 italic font-medium">No active users matching your search...</td></tr>
              ) : pageUsers.map(u => (
                <tr 
                  key={u.uid} 
                  // 🟢 Row Click Logic (Ignores button clicks)
                  onClick={() => openUser(u.uid)} 
                  className="group hover:bg-violet-50/30 transition-all duration-200 cursor-pointer"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={u.username} />
                      <div>
                        <div className="font-bold text-slate-800 text-sm leading-none group-hover:text-violet-600 transition-colors">{u.username || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400 font-medium mt-1">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-center font-mono font-black text-slate-600 text-xs">
                    {Number(u.stats?.total || 0).toLocaleString()}
                  </td>
                  <td className="p-5 text-center font-mono font-black text-emerald-500">
                    ${parseFloat(u.stats?.earnings || 0).toFixed(2)}
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Manage Button (Just triggers the row click effectively) */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); openUser(u.uid); }} 
                        className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest border border-slate-100 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all shadow-sm"
                      >
                        Manage
                      </button>
                      
                      {/* 🔴 Suspend / Ban Button */}
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setConfirmModal({ 
                            payload: [u.uid], 
                            title: 'Suspend User?', 
                            message: `Are you sure you want to suspend @${u.username}? They will be moved to the Recycle Bin.`, 
                            confirmText: 'Suspend Now', 
                            danger: true 
                          }); 
                        }} 
                        className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                        title="Suspend User"
                      >
                        <i className="fas fa-ban text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Footer / Pagination --- */}
        <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {filteredUsers.length} Users · Page {page} of {totalPages}
           </span>
           <div className="flex gap-2">
             <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 disabled:opacity-20 hover:border-violet-400 hover:text-violet-600 shadow-sm transition-all"><i className="fas fa-chevron-left text-xs"/></button>
             <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 disabled:opacity-20 hover:border-violet-400 hover:text-violet-600 shadow-sm transition-all"><i className="fas fa-chevron-right text-xs"/></button>
           </div>
        </div>
      </div>

      {/* --- User Modal --- */}
      {userModal && !userModal._loading && (
        <UserModal 
          user={userModal} 
          allUsers={users}
          adminToken={token} 
          onClose={() => setUserModal(null)} 
          onSaved={() => { setUserModal(null); loadUsers(); }} 
        />
      )}
      
      {/* --- Loading User Overlay --- */}
      {userModal?._loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl">
             <div className="w-8 h-8 border-[3px] rounded-full border-slate-100 border-t-violet-600 animate-spin" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing User...</p>
          </div>
        </div>
      )}

      {/* --- Confirm Ban Modal --- */}
      {confirmModal && (
        <ConfirmModal 
          open 
          onClose={() => setConfirmModal(null)}
          title={confirmModal.title} 
          message={confirmModal.message}
          confirmText={confirmModal.confirmText} 
          danger={confirmModal.danger}
          onConfirm={handleSuspend} 
        />
      )}
    </div>
  );
}
