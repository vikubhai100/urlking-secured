
import React, { useState, useEffect, useCallback, useRef } from 'react';
import UserModal from '../../components/admin/Modals/UserModal';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
const PER_PAGE = 12;

const Avatar = ({ name }) => (
  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-transform group-hover:scale-110"
    style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',boxShadow:'0 3px 10px rgba(79,70,229,0.35)'}}>
    {(name || '?')[0].toUpperCase()}
  </div>
);

export default function ManagersPage() {
  const [managersCache, setManagersCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [prefetching, setPrefetching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [userModal, setUserModal] = useState(null);

  const token = localStorage.getItem('admin_token');

  const fetchManagers = useCallback(async (pageNum, isPrefetch = false) => {
    if (managersCache[pageNum] && !isPrefetch && !search) return;

    if (!isPrefetch) setLoading(true);
    else setPrefetching(true);

    try {
      const res = await fetch(
        `${API}/api/admin/users?role=manager&page=${pageNum}&limit=${PER_PAGE}&search=${search}`, 
        { headers: { 'x-admin-token': token } }
      );
      const data = await res.json();

      if (data && data.users && Array.isArray(data.users)) {
        setManagersCache(prev => ({ ...prev, [pageNum]: data.users }));
        setTotalCount(data.total || data.users.length);
      } else if (Array.isArray(data)) {
        const filtered = data.filter(u => u.role === 'manager' || u.role === 'admin');
        setManagersCache({ 1: filtered });
        setTotalCount(filtered.length);
      }
    } catch (err) {
      console.error("Staff Fetch Error:", err);
    } finally {
      setLoading(false);
      setPrefetching(false);
    }
  }, [managersCache, search, token]);

  useEffect(() => {
    setManagersCache({});
    fetchManagers(1);
  }, [search]);

  useEffect(() => {
    const nextPage = page + 1;
    const totalPages = Math.ceil(totalCount / PER_PAGE);
    if (nextPage <= totalPages && !managersCache[nextPage]) {
      fetchManagers(nextPage, true);
    }
  }, [page, totalCount, managersCache, fetchManagers]);

  const pageUsers = managersCache[page] || [];
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed)',boxShadow:'0 8px 20px rgba(79,70,229,0.3)'}}>
            <i className="fas fa-user-shield text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff Management</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Admins & Managers</p>
              {prefetching && (
                <span className="text-[9px] bg-emerald-50 text-emerald-500 px-2 py-0.5 rounded-full font-black border border-emerald-100 animate-pulse">
                  Syncing…
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
            <input 
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search staff members..."
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none shadow-sm placeholder-slate-400 transition-all"
              onFocus={e => e.target.style.borderColor='#4f46e5'}
              onBlur={e => e.target.style.borderColor=''}
            />
          </div>
          <button 
            onClick={() => fetchManagers(page)} 
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"
          >
            <i className={`fas fa-sync-alt text-sm ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[450px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Manager Details</th>
                <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Performance</th>
                <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Role</th>
                <th className="px-5 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && pageUsers.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 bg-slate-100 rounded" />
                          <div className="h-2.5 w-36 bg-slate-50 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="h-8 w-24 bg-slate-50 rounded-lg mx-auto" /></td>
                    <td className="px-5 py-4"><div className="h-6 w-16 bg-slate-50 rounded-full mx-auto" /></td>
                    <td className="px-5 py-4"><div className="h-9 w-20 bg-slate-100 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : pageUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <i className="fas fa-user-shield text-3xl text-slate-400" />
                      <p className="font-bold text-slate-500 text-sm">No staff members found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageUsers.map(u => (
                  <tr 
                    key={u.uid}
                    onClick={() => setUserModal(u)}
                    className="group cursor-pointer hover:bg-indigo-50/40 transition-all duration-200"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={u.username} />
                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{u.username || 'Staff Member'}</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-slate-700 font-mono text-xs">{Number(u.stats?.total || 0).toLocaleString()} Clicks</span>
                        <span className="text-[11px] font-bold text-emerald-500">${parseFloat(u.stats?.earnings || 0).toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                        u.role === 'admin' 
                          ? 'bg-purple-50 text-purple-600 border-purple-100' 
                          : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all text-[11px] font-black uppercase tracking-wider shadow-sm border border-slate-200 group-hover:border-indigo-600">
                        Settings
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400">
            {totalCount} Staff · Page {page}/{totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1 || loading}
              onClick={e => { e.stopPropagation(); setPage(p => p - 1); }}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 disabled:opacity-25 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-all text-xs"
            >
              <i className="fas fa-chevron-left" />
            </button>
            <button 
              disabled={page === totalPages || loading}
              onClick={e => { e.stopPropagation(); setPage(p => p + 1); }}
              className={`w-9 h-9 rounded-xl bg-white border text-slate-500 disabled:opacity-25 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-all text-xs relative ${managersCache[page + 1] ? 'border-indigo-300 text-indigo-600' : 'border-slate-200'}`}
            >
              <i className="fas fa-chevron-right" />
              {managersCache[page + 1] && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Modal ─── */}
      {userModal && (
        <UserModal 
          user={userModal} adminToken={token}
          onClose={() => setUserModal(null)} 
          onSaved={() => { setUserModal(null); setManagersCache({}); fetchManagers(page, true); }} 
        />
      )}
    </div>
  );
}
