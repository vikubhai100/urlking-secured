import { getApiUrl } from '../../security';
import React, { useState, useEffect } from 'react';
import Modal from '../../components/admin/Modals/Modal';

const API = getApiUrl();

const Badge = ({ children, color = 'slate' }) => {
  const map = { 
    green:  'bg-emerald-50 text-emerald-700 border-emerald-200', 
    red:    'bg-red-50 text-red-600 border-red-200', 
    yellow: 'bg-amber-50 text-amber-700 border-amber-200', 
    blue:   'bg-sky-50 text-sky-700 border-sky-200',
    slate:  'bg-slate-100 text-slate-600 border-slate-200'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${map[color] || map.slate}`}>
      {children}
    </span>
  );
};

const priorityColor = (p) => p === 'Urgent' ? 'red' : p === 'High' ? 'yellow' : 'blue';

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketModal, setTicketModal] = useState(null);
  const token = localStorage.getItem('admin_token');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/support/admin/tickets`, { headers: { 'x-admin-token': token } });
      const d = await res.json();
      setTickets(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleTicket = async (id, status) => {
    try {
      const res = await fetch(`${API}/api/support/admin/tickets/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, 
        body: JSON.stringify({ status }) 
      });
      if (res.ok) { 
        setTicketModal(null); 
        loadTickets(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCount = tickets.filter(t => t.status === 'Open').length;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{background:'linear-gradient(135deg,#f43f5e,#e11d48)',boxShadow:'0 8px 20px rgba(244,63,94,0.3)'}}>
            <i className="fas fa-headset text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Support Tickets</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              {openCount} open · {tickets.length} total
            </p>
          </div>
        </div>
        <button 
          onClick={loadTickets} 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-500 shadow-sm transition-all"
        >
          <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">User</th>
                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Subject</th>
                <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Priority</th>
                <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Status</th>
                <th className="px-5 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <div className="w-5 h-5 border-2 rounded-full border-slate-200 border-t-rose-400 animate-spin" />
                        <span className="text-sm font-medium">Loading tickets...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <i className="fas fa-ticket-alt text-3xl text-slate-400" />
                        <p className="font-bold text-slate-500 text-sm">No tickets yet</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : tickets.map(t => (
                <tr key={t.id} className="group hover:bg-rose-50/30 transition-colors duration-150">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-700 text-sm">{t.subject}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.category}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Badge color={priorityColor(t.priority)}>{t.priority}</Badge>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Badge color={t.status === 'Open' ? 'green' : 'slate'}>{t.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => setTicketModal(t)} 
                      className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 border border-violet-100 text-xs font-black uppercase tracking-wider hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all shadow-sm"
                    >
                      <i className="fas fa-eye mr-1.5" />View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Ticket Modal ─── */}
      {ticketModal && (
        <Modal 
          open 
          onClose={() => setTicketModal(null)} 
          title={`Ticket #${ticketModal.id}`} 
          subtitle={ticketModal.subject}
          footer={ticketModal.status === 'Open' && (
            <div className="flex justify-end">
              <button 
                onClick={() => handleTicket(ticketModal.id, 'Closed')} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md"
                style={{background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',boxShadow:'0 4px 14px rgba(16,185,129,0.25)'}}>
                <i className="fas fa-check" /> Mark Resolved
              </button>
            </div>
          )}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800 text-sm">{ticketModal.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{ticketModal.email}</p>
              </div>
              <Badge color={priorityColor(ticketModal.priority)}>{ticketModal.priority}</Badge>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed border border-slate-100">
              {ticketModal.message}
            </div>
            <p className="text-xs text-slate-400 text-right">{new Date(ticketModal.created_at).toLocaleString()}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
