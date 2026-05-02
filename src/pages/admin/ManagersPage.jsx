import React, { useState, useEffect, useCallback, useRef } from 'react';
import UserModal from '../../components/admin/Modals/UserModal';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
const PER_PAGE = 12;

const Avatar = ({ name }) => (
  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black shrink-0 border border-indigo-200/50 shadow-sm transition-transform group-hover:scale-110">
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

  // 🚀 HYBRID FETCH LOGIC (Array aur Paginated dono handle honge)
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

      // 🟢 Fix: Agar backend paginated data bhej raha hai
      if (data && data.users && Array.isArray(data.users)) {
        setManagersCache(prev => ({ ...prev, [pageNum]: data.users }));
        setTotalCount(data.total || data.users.length);
      } 
      // 🟢 Fix: Agar backend sirf plain array bhej raha hai
      else if (Array.isArray(data)) {
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
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <i className="fas fa-user-shield text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Staff Management</h2>
            <div className="flex items-center gap-2">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin & Managers</p>
               {prefetching && <span className="text-[9px] bg-emerald-50 text-emerald-500 px-2 py-0.5 rounded-full font-black animate-pulse">Syncing...</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
            <input 
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search staff members..."
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-2xl border border-slate-100 bg-white text-sm focus:border-indigo-400 outline-none shadow-sm transition-all"
            />
          </div>
          <button onClick={() => fetchManagers(page)} className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 shadow-sm transition-colors">
            <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[450px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manager Details</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority</th>
                <th className="p-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && pageUsers.length === 0 ? (
                // 🦴 Skeleton UI
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-5"><div className="h-10 w-40 bg-slate-100 rounded-2xl" /></td>
                    <td className="p-5"><div className="h-6 w-24 bg-slate-50 rounded-lg mx-auto" /></td>
                    <td className="p-5"><div className="h-6 w-16 bg-slate-50 rounded-full mx-auto" /></td>
                    <td className="p-5"><div className="h-9 w-20 bg-slate-100 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : pageUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-20 text-center text-slate-300 italic font-medium">No staff members found matching criteria</td></tr>
              ) : (
                pageUsers.map(u => (
                  <tr 
                    key={u.uid} 
                    onClick={() => setUserModal(u)}
                    className="group cursor-pointer hover:bg-indigo-50/30 transition-all duration-200"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar name={u.username} />
                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{u.username || 'Staff Member'}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 font-mono text-xs">{Number(u.stats?.total || 0).toLocaleString()} Clicks</span>
                        <span className="text-[10px] font-bold text-emerald-500">${parseFloat(u.stats?.earnings || 0).toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                       <button className="px-4 py-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-sm">
                         Settings
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER --- */}
        <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {totalCount} Total Staff · Page {page}/{totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1 || loading} 
              onClick={(e) => { e.stopPropagation(); setPage(p => p - 1); }}
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 disabled:opacity-20 hover:border-indigo-300 shadow-sm transition-all"
            >
              <i className="fas fa-chevron-left text-xs" />
            </button>
            <button 
              disabled={page === totalPages || loading} 
              onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
              className={`w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 disabled:opacity-20 hover:border-indigo-300 shadow-sm transition-all relative ${managersCache[page + 1] ? 'border-indigo-400 text-indigo-600' : ''}`}
            >
              <i className="fas fa-chevron-right text-xs" />
              {managersCache[page + 1] && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white shadow-sm animate-pulse" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- USER MODAL --- */}
      {userModal && (
        <UserModal 
          user={userModal} 
          adminToken={token}
          onClose={() => setUserModal(null)} 
          onSaved={() => { 
            setUserModal(null); 
            setManagersCache({}); // Clear cache on save to force fresh fetch
            fetchManagers(page, true); 
          }} 
        />
      )}
    </div>
  );
}
