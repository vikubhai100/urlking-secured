import React from 'react';

export default function Stat({ label, value, icon, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm transition-all hover:shadow-md group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${accent}`}>
          <i className={`fas ${icon} text-lg`}></i>
        </div>
        <div className="text-right">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-black text-slate-800 font-mono tracking-tight">{value}</div>
        {/* Visual decoration for SaaS feel */}
        <div className="h-1 w-12 bg-slate-50 rounded-full overflow-hidden">
            <div className={`h-full w-2/3 ${accent.split(' ')[1].replace('text', 'bg')}`}></div>
        </div>
      </div>
    </div>
  );
}
