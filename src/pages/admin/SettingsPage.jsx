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
    <div className="space-y-8 animate-fadeIn">

      {/* ─── Header ─── */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg shadow-slate-900/20">
          <i className="fas fa-sliders-h text-slate-200 text-base" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Platform configuration</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-4">

        {/* ─── Global CPM Card ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-100/80 overflow-hidden">
          {/* Card top accent */}
          <div className="h-1 w-full" style={{background:'linear-gradient(90deg,#10b981,#059669)'}} />
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-100 bg-emerald-50 shrink-0">
                <i className="fas fa-dollar-sign text-emerald-600 text-lg" />
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-base">Global CPM Rate</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Force apply a specific CPM to all platform users at once.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
                <span className="text-slate-400 text-sm font-bold">$</span>
                <input 
                  type="number" step="0.01" value={globalCpm} onChange={e => setGlobalCpm(e.target.value)} 
                  className="w-20 text-slate-800 font-black font-mono text-lg text-center outline-none bg-transparent"
                />
              </div>
              <button 
                onClick={() => confirm('global_cpm', globalCpm, { title: 'Update Global CPM?', message: `Set CPM to $${globalCpm} for ALL users? This cannot be undone.`, confirmText: 'Apply to All', danger: false })}
                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md"
                style={{background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',boxShadow:'0 4px 14px rgba(16,185,129,0.25)'}}>
                Apply Update
              </button>
            </div>
          </div>
        </div>

        {/* ─── Mass Upload Card ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-100/80 overflow-hidden">
          {/* Card top accent */}
          <div className="h-1 w-full" style={{background:'linear-gradient(90deg,#7c3aed,#4f46e5)'}} />
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-violet-100 bg-violet-50 shrink-0">
                <i className="fas fa-cloud-upload-alt text-violet-600 text-lg" />
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-base">Mass Upload Permissions</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Grant file upload access to every registered user simultaneously.
                </p>
              </div>
            </div>

            <button 
              onClick={() => confirm('allow_uploads', null, { title: 'Allow uploads for ALL?', message: 'This will grant file upload permission to every single user in the database.', confirmText: 'Authorize All Users', danger: false })}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md"
              style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',boxShadow:'0 4px 14px rgba(124,58,237,0.25)'}}>
              <i className="fas fa-unlock-alt" /> Authorize All Users
            </button>
          </div>
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
