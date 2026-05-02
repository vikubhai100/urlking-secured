import React, { useState, useEffect } from 'react';
import ConfirmModal from '../../components/admin/Modals/ConfirmModal';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

const Avatar = ({ name }) => <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold text-sm shrink-0">{(name || '?')[0].toUpperCase()}</div>;

export default function RecyclePage() {
  const [users, setUsers] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);
  const token = localStorage.getItem('admin_token');

  const loadDeletedUsers = async () => {
    try {
      const res = await fetch(`${API}/api/admin/users?deleted=true`, { headers: { 'x-admin-token': token } });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadDeletedUsers(); }, []);

  const confirmAction = (type, payload, cfg) => setConfirmModal({ type, payload, ...cfg });

  const executeAction = async () => {
    const { type, payload } = confirmModal;
    setConfirmModal(null);
    const endpoint = type === 'restore' ? '/api/admin/restore' : '/api/admin/permanent-delete';
    
    try {
      await fetch(`${API}${endpoint}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, 
        body: JSON.stringify({ uids: payload }) 
      });
      loadDeletedUsers();
    } catch (err) { alert('Error processing action'); }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2">
        <i className="fas fa-trash text-slate-500 text-xl" />
        <h2 className="text-xl font-bold text-slate-800">Recycle Bin</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase">Suspended User</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Links</th>
                <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.length === 0 ? <tr><td colSpan="3" className="p-10 text-center text-slate-400">Recycle bin is empty</td></tr> : 
                users.map(u => (
                <tr key={u.uid} className="hover:bg-slate-50 transition-colors opacity-75 hover:opacity-100">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} />
                      <div>
                        <div className="font-semibold text-slate-800">{u.username || 'Unknown'}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center text-slate-600 font-mono">{u.links_count || 0}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => confirmAction('restore', [u.uid], { title: 'Restore User?', message: `Restore ${u.username}'s account?`, confirmText: 'Restore', danger: false })}
                        className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 flex items-center justify-center transition-colors">
                        <i className="fas fa-trash-restore" />
                      </button>
                      <button onClick={() => confirmAction('permanent', [u.uid], { title: 'Delete Forever?', message: `Permanently delete ${u.username}? This CANNOT be undone.`, confirmText: 'Delete Forever', danger: true })}
                        className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 flex items-center justify-center transition-colors">
                        <i className="fas fa-skull" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
