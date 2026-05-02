import React, { useState, useEffect, useCallback, useRef } from 'react';
import UserModal from '../../components/admin/Modals/UserModal';
import ConfirmModal from '../../components/admin/Modals/ConfirmModal';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
const PER_PAGE = 12;

export default function ManagersPage() {
  const [managersCache, setManagersCache] = useState({}); // 🧠 Cache for pages
  const [loading, setLoading] = useState(false);
  const [prefetching, setPrefetching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [userModal, setUserModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const token = localStorage.getItem('admin_token');
  const abortControllerRef = useRef(null);

  // 🟢 CORE FETCH LOGIC (With API Pagination)
  const fetchManagers = useCallback(async (pageNum, isPrefetch = false) => {
    // Agar page pehle se cache mein hai, toh dobara load mat karo
    if (managersCache[pageNum] && !isPrefetch) return;

    if (!isPrefetch) setLoading(true);
    else setPrefetching(true);

    try {
      // 🚀 Tip: Backend API me `page`, `limit` aur `role` filter add karein
      const res = await fetch(
        `${API}/api/admin/users?role=manager&page=${pageNum}&limit=${PER_PAGE}&search=${search}`, 
        { headers: { 'x-admin-token': token } }
      );
      const data = await res.json();

      if (Array.isArray(data.users)) {
        setManagersCache(prev => ({ ...prev, [pageNum]: data.users }));
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setPrefetching(false);
    }
  }, [managersCache, search, token]);

  // 1. Initial Load (Page 1)
  useEffect(() => {
    setManagersCache({}); // Clear cache on search change
    fetchManagers(1);
  }, [search]);

  // 2. SMART PREFETCH: Jab page badle, toh agla page silently load karo
  useEffect(() => {
    const nextPage = page + 1;
    const totalPages = Math.ceil(totalCount / PER_PAGE);

    if (nextPage <= totalPages && !managersCache[nextPage]) {
      console.log(`🚀 Silently prefetching Page ${nextPage}...`);
      fetchManagers(nextPage, true);
    }
  }, [page, totalCount, managersCache, fetchManagers]);

  const pageUsers = managersCache[page] || [];
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Toolbar Section */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <i className="fas fa-user-shield text-indigo-500" /> Staff Management
          {prefetching && <span className="ml-2 text-[9px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full animate-pulse">Syncing Next...</span>}
        </h2>

        <div className="flex gap-2 w-full sm:w-auto">
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Quick search..."
            className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400" 
          />
          <button onClick={() => fetchManagers(page)} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-500">
            <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manager</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stats</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && pageUsers.length === 0 ? (
                // 🦴 Skeleton Loading State
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-10 w-40 bg-slate-100 rounded-lg"></div></td>
                    <td className="p-4"><div className="h-6 w-20 bg-slate-50 rounded mx-auto"></div></td>
                    <td className="p-4"><div className="h-6 w-16 bg-slate-50 rounded mx-auto"></div></td>
                    <td className="p-4"><div className="h-8 w-20 bg-slate-100 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                pageUsers.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {(u.username || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">{u.username}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.uid.slice(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-xs font-bold text-slate-600">{u.stats?.total || 0} clicks</div>
                      <div className="text-[10px] text-emerald-500 font-bold">${parseFloat(u.stats?.earnings || 0).toFixed(2)}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                       <button onClick={() => setUserModal(u)} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors">
                         <i className="fas fa-edit text-xs" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 📟 Optimized Pagination */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
            Total Results: {totalCount}
          </span>
          <div className="flex gap-1">
            <button 
              disabled={page === 1 || loading} 
              onClick={() => setPage(p => p - 1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-20 hover:border-indigo-300"
            >
              <i className="fas fa-chevron-left text-xs" />
            </button>
            <button 
              disabled={page === totalPages || loading} 
              onClick={() => setPage(p => p + 1)}
              className={`w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-20 hover:border-indigo-300 ${managersCache[page + 1] ? 'border-emerald-200 text-emerald-500' : ''}`}
            >
              <i className="fas fa-chevron-right text-xs" />
              {managersCache[page + 1] && <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white"></div>}
            </button>
          </div>
        </div>
      </div>
      
      {/* ... (Modals logic same rahega) */}
    </div>
  );
}
