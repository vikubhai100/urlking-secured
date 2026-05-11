import React, { useState, useEffect, useCallback } from 'react';
import UserModal from '../../components/admin/Modals/UserModal';
import ConfirmModal from '../../components/admin/Modals/ConfirmModal';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
const PER_PAGE = 12;

const Avatar = ({ name }) => (
  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-transform group-hover:scale-105"
    style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',boxShadow:'0 2px 8px rgba(124,58,237,0.3)'}}>
    {(name || '?')[0].toUpperCase()}
  </div>
);

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [userModal, setUserModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  
  const token = localStorage.getItem('admin_token');

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

  const openUser = async (uid) => {
    const baseUser = users.find(u => u.uid === uid) || { uid };
    setUserModal({ ...baseUser, _loading: true });
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
        loadUsers();
      } else {
        alert("Failed to suspend user.");
      }
    } catch (err) { alert('Error processing action'); }
    finally { setLoading(false); }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return !q || (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE));
  const pageUsers = filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',boxShadow:'0 8px 20px rgba(124,58,237,0.3)'}}>
            <i className="fas fa-users text-white text-base" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">User Database</h2>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              {users.length.toLocaleString()} active members
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
          <input 
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none transition-all shadow-sm placeholder-slate-400"
            onFocus={e => e.target.style.borderColor='#7c3aed'}
            onBlur={e => e.target.style.borderColor=''}
          />
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Profile</th>
                <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Clicks</th>
                <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Earned</th>
                <th className="px-5 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-24 bg-slate-100 rounded" />
                          <div className="h-2.5 w-32 bg-slate-50 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center"><div className="h-3.5 w-14 bg-slate-100 rounded mx-auto" /></td>
                    <td className="px-5 py-4 text-center"><div className="h-3.5 w-14 bg-slate-100 rounded mx-auto" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-8 w-20 bg-slate-100 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : pageUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <i className="fas fa-user-slash text-3xl text-slate-400" />
                      <p className="font-bold text-slate-500 text-sm">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : pageUsers.map(u => (
                <tr 
                  key={u.uid}
                  onClick={() => openUser(u.uid)}
                  className="group hover:bg-violet-50/40 transition-all duration-200 cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} />
                      <div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-violet-600 transition-colors">{u.username || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-black font-mono text-slate-700 text-xs">
                      {Number(u.stats?.total || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-black font-mono text-emerald-500 text-sm">
                      ${parseFloat(u.stats?.earnings || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={e => { e.stopPropagation(); openUser(u.uid); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-wider group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm border border-slate-200 group-hover:border-violet-600"
                      >
                        Manage
                      </button>
                      <button 
                        onClick={e => { 
                          e.stopPropagation(); 
                          setConfirmModal({ 
                            payload: [u.uid], 
                            title: 'Suspend User?', 
                            message: `Are you sure you want to suspend @${u.username}? They will be moved to the Recycle Bin.`, 
                            confirmText: 'Suspend Now', 
                            danger: true 
                          }); 
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-red-100 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95"
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

        {/* ─── Pagination ─── */}
        <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400">
            {filteredUsers.length} users · Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 disabled:opacity-25 hover:border-violet-300 hover:text-violet-600 transition-all shadow-sm text-xs font-bold"
            >
              <i className="fas fa-chevron-left" />
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 disabled:opacity-25 hover:border-violet-300 hover:text-violet-600 transition-all shadow-sm text-xs font-bold"
            >
              <i className="fas fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {userModal && !userModal._loading && (
        <UserModal 
          user={userModal} allUsers={users} adminToken={token} 
          onClose={() => setUserModal(null)} 
          onSaved={() => { setUserModal(null); loadUsers(); }} 
        />
      )}

      {userModal?._loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl border border-slate-100">
            <div className="w-8 h-8 border-[3px] rounded-full border-slate-100 border-t-violet-600 animate-spin" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Loading User...</p>
          </div>
        </div>
      )}

      {confirmModal && (
        <ConfirmModal 
          open onClose={() => setConfirmModal(null)}
          title={confirmModal.title} message={confirmModal.message}
          confirmText={confirmModal.confirmText} danger={confirmModal.danger}
          onConfirm={handleSuspend} 
        />
      )}
    </div>
  );
}
