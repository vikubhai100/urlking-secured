import React, { useState, useEffect, useCallback } from 'react';
import UserModal from '../../components/admin/Modals/UserModal';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
const PER_PAGE = 12;

const Avatar = ({ name }) => (
  <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
    {(name || '?')[0].toUpperCase()}
  </div>
);

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [userModal, setUserModal] = useState(null);
  const token = localStorage.getItem('admin_token');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/users?deleted=false`, { 
        headers: { 'x-admin-token': token } 
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return !q || (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE));
  const pageUsers = filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <i className="fas fa-users text-violet-500" /> User Database
        </h2>
        <div className="relative w-full sm:w-64">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
          <input 
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Quick search..."
            className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-violet-400 outline-none"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-100">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Clicks</th>
                <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Earned</th>
                <th className="p-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-10 w-32 bg-slate-100 rounded-lg" /></td>
                    <td colSpan="3" className="p-4"><div className="h-6 w-full bg-slate-50 rounded" /></td>
                  </tr>
                ))
              ) : pageUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-20 text-center text-slate-400 italic">No users matching search...</td></tr>
              ) : pageUsers.map(u => (
                <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} />
                      <div>
                        <div className="font-bold text-slate-800 text-sm leading-none">{u.username || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-slate-700">{Number(u.stats?.total || 0).toLocaleString()}</td>
                  <td className="p-4 text-center font-mono font-bold text-emerald-600">${parseFloat(u.stats?.earnings || 0).toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setUserModal(u)} className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 text-xs font-bold border border-violet-100 hover:bg-violet-100 transition-colors">
                      <i className="fas fa-edit mr-1.5" />Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {page} / {totalPages}</span>
           <div className="flex gap-2">
             <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-20 hover:border-violet-300"><i className="fas fa-chevron-left text-xs"/></button>
             <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-20 hover:border-violet-300"><i className="fas fa-chevron-right text-xs"/></button>
           </div>
        </div>
      </div>

      {userModal && (
        <UserModal 
          user={userModal} 
          adminToken={token} 
          onClose={() => setUserModal(null)} 
          onSaved={() => { setUserModal(null); loadUsers(); }} 
        />
      )}
    </div>
  );
}
