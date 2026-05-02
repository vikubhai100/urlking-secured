import React from 'react';
import Modal from './Modal';

export default function ConfirmModal({ open, title, message, confirmText, danger, onConfirm, onClose }) {
  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={title}
      footer={
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-5 py-2 rounded-xl text-sm font-bold text-white transition-colors ${
              danger ? 'bg-red-500 hover:bg-red-600 shadow-sm' : 'bg-violet-600 hover:bg-violet-700 shadow-sm'
            }`}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
