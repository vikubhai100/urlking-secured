import React from 'react';

export default function Stat({ label, value, icon, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>
          <i className={`fas ${icon} text-sm`}></i>
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800 font-mono">{value}</div>
    </div>
  );
}
