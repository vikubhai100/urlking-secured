import React, { useState, useEffect } from 'react';
import Modal from '../../components/admin/Modals/Modal';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

const Badge = ({ children, color = 'slate' }) => {
  const map = { green: 'bg-emerald-50 text-emerald-700 border-emerald-200', red: 'bg-red-50 text-red-600 border-red-200', yellow: 'bg-amber-50 text-amber-700 border-amber-200', blue: 'bg-sky-50 text-sky-700 border-sky-200' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[color] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{children}</span>;
};

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

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <i className="fas fa-headset text-rose-500" /> Support Tickets
        </h2>
        <button onClick={loadTickets} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:border-rose-300 shadow-sm transition-colors">
          <i className={`fas fa-sync-alt mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase">User</th>
                <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase">Subject</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Priority</th>
                <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase">Status</th>
                <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tickets.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-400">{loading ? 'Loading...' : 'No tickets'}</td></tr>
              ) : tickets.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-700">{t.subject}</div>
                    <div className="text-xs text-slate-400">{t.category}</div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge color={t.priority === 'Urgent' ? 'red' : t.priority === 'High' ? 'yellow' : 'blue'}>{t.priority}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge color={t.status === 'Open' ? 'green' : 'slate'}>{t.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setTicketModal(t)} className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 border border-violet-200 text-xs font-semibold hover:bg-violet-100 shadow-sm transition-colors">
                      <i className="fas fa-eye mr-1" />View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Read Modal */}
      {ticketModal && (
        <Modal 
          open 
          onClose={() => setTicketModal(null)} 
          title={`Ticket #${ticketModal.id}`} 
          subtitle={ticketModal.subject}
          footer={ticketModal.status === 'Open' && (
            <div className="flex justify-end">
              <button onClick={() => handleTicket(ticketModal.id, 'Closed')} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-sm transition-colors">
                <i className="fas fa-check mr-2" />Mark Resolved
              </button>
            </div>
          )}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{ticketModal.name}</p>
                <p className="text-xs text-slate-400">{ticketModal.email}</p>
              </div>
              <Badge color={ticketModal.priority === 'Urgent' ? 'red' : ticketModal.priority === 'High' ? 'yellow' : 'blue'}>{ticketModal.priority}</Badge>
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
