import React, { useState } from 'react';
import ConfirmModal from '../../components/admin/Modals/ConfirmModal';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

export default function SettingsPage() {
  const [globalCpm, setGlobalCpm] = useState('0.50');
  const [confirmModal, setConfirmModal] = useState(null);
  const token = localStorage.getItem('admin_token');

  const executeAction = async () => {
    const { type, payload } = confirmModal;
    setConfirmModal(null);
    
    try {
      const map = {
        global_cpm: [`${API}/api/admin/global-cpm`, 'POST', { cpm: payload }],
        allow_uploads: [`${API}/api/dev/allow-all-uploads`, 'POST', {}],
      };
      const [url, method, body] = map[type];
      
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, 
        body: JSON.stringify(body) 
      });
      const d = await res.json();
      
      if (d.ok || res.ok) alert('Settings applied successfully!');
      else alert(d.error || 'Action failed');
    } catch (err) {
      alert('Network error');
    }
  };

  const confirm = (type, payload, cfg) => setConfirmModal({ type, payload, ...cfg });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-2 mb-2">
        <i className="fas fa-sliders-h text-slate-700 text-xl" />
        <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Global CPM Setting */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
              <i className="fas fa-dollar-sign text-emerald-600 text-lg" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">Global CPM Management</h4>
              <p className="text-xs text-slate-500 mt-0.5">Force apply a specific CPM to all users across the platform.</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
            <input type="number" step="0.01" value={globalCpm} onChange={e => setGlobalCpm(e.target.value)} 
              className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono font-bold text-lg text-center outline-none focus:border-emerald-400 bg-white" />
            <button onClick={() => confirm('global_cpm', globalCpm, { title: 'Update Global CPM?', message: `Are you sure you want to set CPM to $${globalCpm} for ALL users? This action cannot be undone.`, confirmText: 'Apply to All', danger: false })}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-sm">
              Apply Update
            </button>
          </div>
        </div>

        {/* Mass Upload Setting */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center border border-violet-100">
              <i className="fas fa-cloud-upload-alt text-violet-600 text-lg" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">Mass Upload Permissions</h4>
              <p className="text-xs text-slate-500 mt-0.5">Grant file upload access to every registered user at once.</p>
            </div>
          </div>
          
          <button onClick={() => confirm('allow_uploads', null, { title: 'Allow uploads for ALL?', message: 'This will grant file upload permission to every single user in the database.', confirmText: 'Authorize All Users', danger: false })}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
            <i className="fas fa-unlock-alt" /> Authorize All Users Now
          </button>
        </div>
      </div>

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
