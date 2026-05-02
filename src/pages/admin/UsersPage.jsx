import React, { useState, useEffect } from 'react';
import UserModal from '../../components/admin/Modals/UserModal';
import ConfirmModal from '../../components/admin/Modals/ConfirmModal';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

// --- TINY HELPERS ---
const fmt$ = (n) => `$${parseFloat(n || 0).toFixed(2)}`;
const fmtN = (n) => Number(n || 0).toLocaleString();

const Avatar = ({ name, size = 8 }) => {
  const ch = (name || '?')[0].toUpperCase();
  const colors = ['bg-violet-500','bg-cyan-500','bg-rose-500','bg-amber-500','bg-emerald-500','bg-sky-500'];
  const color = colors[ch.charCodeAt(0) % colors.length];
  return (
    <div className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
      {ch}
    </div>
  );
};

const Badge = ({ children, color = 'slate' }) => {
  const map = { green: 'bg-emerald-50 text-emerald-700 border-emerald-200', red: 'bg-red-50 text-red-600 border-red-200', yellow: 'bg-amber-50 text-amber-700 border-amber-200', blue: 'bg-sky-50 text-sky-700 border-sky-200', slate: 'bg-slate-100 text-slate-600 border-slate-200', purple: 'bg-violet-50 text-violet-700 border-violet-200' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[color]}`}>{children}</span>;
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const [selected, setSelected] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  
  const [userModal, setUserModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const token = localStorage.getItem('admin_token');

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Yahan apna apiFetch lagana
      const res = await fetch(`${API}/api/admin/users?deleted=false`, { headers: { 'x-admin-token': token } });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openUser = (uid) => {
    const base = users.find(u => u.uid === uid) || { uid };
    setUserModal({ ...base });
    // Yahan API call kar sakte ho user ka detail laane ke liye (jaise pehle tha)
  };

  const confirmAction = (type, payload, cfg) => setConfirmModal({ type, payload, ...cfg });

  const executeAction = async () => {
    // Bulk delete/suspend API call yahan handle hogi
    setConfirmModal(null);
    loadUsers();
    setSelected([]);
  };

  // Filter & Pagination Logic
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return !q || (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE));
  const pageUsers  = filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header & Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <i className="fas fa-users text-violet-500" /> Manage Users
        </h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
            <input 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1); }} 
              placeholder="Search by name or email…"
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-violet-400 text-slate-700 shadow-sm" 
            />
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => { setSelectMode(s => !s); setSelected([]); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors shadow-sm ${selectMode ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300'}`}>
              <i className={`fas ${selectMode ? 'fa-times' : 'fa-check-square'} mr-1.5`} />{selectMode ? 'Cancel' : 'Select'}
            </button>
            
            {selectMode && selected.length > 0 && (
              <button onClick={() => confirmAction('delete', selected, { title: 'Suspend users?', message: `${selected.length} user(s) selected.`, confirmText: 'Suspend', danger: true })}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white border border-red-500 hover:bg-red-600 shadow-sm transition-colors animate-fadeIn">
                Action ({selected.length})
              </button>
            )}
            
            <button onClick={loadUsers} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:border-violet-300 shadow-sm transition-colors">
              <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {selectMode && <th className="w-10 p-4 text-center"><input type="checkbox" onChange={e => setSelected(e.target.checked ? pageUsers.map(u => u.uid) : [])} checked={selected.length > 0 && selected.length === pageUsers.length} className="rounded border-slate-300 text-violet-600" /></th>}
                <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Links</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clicks</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Earned</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageUsers.length === 0 ? (
                <tr><td colSpan="7" className="p-10 text-center text-slate-400 text-sm">{loading ? 'Loading...' : 'No users found'}</td></tr>
              ) : pageUsers.map(u => (
                <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                  {selectMode && <td className="p-4 text-center"><input type="checkbox" checked={selected.includes(u.uid)} onChange={() => setSelected(p => p.includes(u.uid) ? p.filter(x => x !== u.uid) : [...p, u.uid])} className="rounded border-slate-300 text-violet-600" /></td>}
                  <td className="p-4">
                    <button onClick={() => openUser(u.uid)} className="flex items-center gap-3 text-left hover:text-violet-600 transition-colors">
                      <Avatar name={u.username} />
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{u.username || 'Unknown'}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </button>
                  </td>
                  <td className="p-4 text-center text-slate-600 font-mono">{u.links_count || 0}</td>
                  <td className="p-4 text-center font-bold text-slate-800 font-mono">{fmtN(u.stats?.total)}</td>
                  <td className="p-4 text-center font-bold text-emerald-600 font-mono">{fmt$(u.stats?.earnings)}</td>
                  <td className="p-4 text-center"><Badge color={u.role === 'admin' ? 'purple' : u.role === 'manager' ? 'blue' : 'slate'}>{u.role || 'user'}</Badge></td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openUser(u.uid)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200 transition-colors">
                        <i className="fas fa-edit mr-1" />Edit
                      </button>
                      <button onClick={() => confirmAction('delete', [u.uid], { title: 'Suspend user?', message: `Suspend ${u.username}?`, confirmText: 'Suspend', danger: true })}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 flex items-center justify-center transition-colors">
                        <i className="fas fa-ban text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400 font-semibold">{filteredUsers.length} users · Page {page} of {totalPages}</p>
          <div className="flex gap-1.5">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:border-violet-300 transition-colors text-xs"><i className="fas fa-chevron-left" /></button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:border-violet-300 transition-colors text-xs"><i className="fas fa-chevron-right" /></button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {userModal && (
        <UserModal 
          user={userModal} 
          allUsers={users} 
          adminToken={token}
          onClose={() => setUserModal(null)} 
          onSaved={() => { setUserModal(null); loadUsers(); }} 
        />
      )}

      {confirmModal && (
        <ConfirmModal 
          open 
          onClose={() => setConfirmModal(null)}
          title={confirmModal.title} 
          message={confirmModal.message}
          confirmText={confirmModal.confirmText} 
          danger={confirmModal.danger}
          onConfirm={executeAction} 
        />
      )}
    </div>
  );
}
