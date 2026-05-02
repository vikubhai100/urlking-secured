import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  // Close on Escape key press
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Content */}
      <div className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-md'} bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white rounded-t-2xl">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">{children}</div>
        
        {footer && <div className="border-t border-slate-100 p-4 bg-slate-50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}
