import React, { useState, useEffect } from 'react';
import { showToast } from '../../toast';
import { getApiUrl } from '../../security';

const Help = ({ user, isActive }) => {
  const [openFaq, setOpenFaq] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myTickets, setMyTickets] = useState([]); // 🟢 NAYA STATE: Tickets store karne ke liye
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    category: '',
    priority: 'Normal',
    subject: '',
    message: '',
    consent: false
  });

  const API = getApiUrl();
  const token = localStorage.getItem("token");

  // 🟢 NAYA FUNCTION: User ke tickets server se laane ke liye
  const fetchMyTickets = async () => {
    if (!token) return;
    setLoadingTickets(true);
    try {
      const res = await fetch(`${API}/api/support/tickets`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMyTickets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load tickets");
    } finally {
      setLoadingTickets(false);
    }
  };

  // Jab page active ho, tab tickets load karo
  useEffect(() => {
    if (isActive) {
      fetchMyTickets();
    }
  }, [isActive]);

  if (!isActive) return null;

  const faqs = [
    {
      q: "How long does a pending withdrawal take?",
      a: "Normal processing time is 7 working days. If your withdrawal is pending, please wait until the 7 days are complete before raising a ticket."
    },
    {
      q: "Where can I find the Payment Proof / TXID?",
      a: "You can find your TXID and payment status inside the 'Withdraw' section under your transaction history. We also upload payment proofs on our official Telegram channel."
    },
    {
      q: "How to update payout details?",
      a: "You can easily update your UPI, Bank, or Crypto address by navigating to 'Settings' > 'Profile' from your dashboard."
    },
    {
      q: "Account verification / KYC help",
      a: "Currently, KYC is not mandatory for basic withdrawals on URL KING. If there are any compliance issues with your account, our team will contact you via email."
    },
    {
      q: "Reason for Refunded / Returned withdrawals",
      a: "If your withdrawal is returned, it usually means you provided incorrect payment details, or our anti-fraud system detected invalid/bot clicks on your links."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return showToast("Please select a category", "error");
    if (!formData.consent) return showToast("Please agree to the privacy policy", "error");

    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API}/api/support/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit ticket");

      showToast("Support ticket submitted successfully!", "success");
      setFormData({ ...formData, subject: '', message: '', consent: false });
      
      // 🟢 Ticket submit hone ke baad list ko turant refresh karo
      fetchMyTickets();

    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in max-w-4xl mx-auto space-y-6 pb-10">
      
      {/* 🟣 BANNER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <i className="fas fa-life-ring text-white"></i>
            </div>
            Support Center
          </h2>
          <p className="text-indigo-100 text-sm md:text-base opacity-90">
            Quick help + Ticket form — resolving queries instantly ✅
          </p>
        </div>
      </div>

      {/* 🎫 MY TICKETS SECTION (NAYA SECTION) */}
      <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <i className="fas fa-ticket-alt text-indigo-400"></i> My Support Tickets
          </h3>
          <button onClick={fetchMyTickets} className="text-xs font-bold text-slate-400 hover:text-indigo-400 transition-colors">
            <i className="fas fa-sync-alt mr-1"></i> Refresh
          </button>
        </div>

        {loadingTickets ? (
          <div className="flex justify-center p-6"><i className="fas fa-spinner fa-spin text-2xl text-indigo-500"></i></div>
        ) : myTickets.length === 0 ? (
          <div className="text-center p-6 text-slate-500">
            <i className="fas fa-inbox text-3xl mb-2 opacity-50"></i>
            <p className="text-sm">You haven't created any support tickets yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTickets.map(ticket => (
              <div key={ticket.id} className="bg-slate-800/40 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-800/60">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-slate-500">#{ticket.id}</span>
                    <h4 className="text-sm font-bold text-white">{ticket.subject}</h4>
                  </div>
                  <p className="text-xs text-slate-400">{new Date(ticket.created_at).toLocaleString()} • {ticket.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg border ${
                    ticket.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600/50'
                  }`}>
                    {ticket.status === 'Open' && <i className="fas fa-circle text-[8px] mr-1 animate-pulse"></i>}
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ⚡ QUICK HELP / FAQ */}
        <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] rounded-3xl p-6 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <i className="fas fa-bolt text-yellow-500"></i> Quick FAQ
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-white/5 bg-slate-800/30 rounded-xl overflow-hidden transition-all">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full px-5 py-4 text-left font-bold text-[var(--text-primary)] flex justify-between items-center hover:bg-slate-800/50 text-sm"
                >
                  {faq.q}
                  <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`}></i>
                </button>
                <div className={`px-5 overflow-hidden transition-all duration-300 ease-in-out text-sm text-[var(--text-secondary)] ${openFaq === index ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>

          {/* 🤝 CONTACT OPTIONS (Moved below FAQ for better layout) */}
          <div className="mt-8 pt-6 border-t border-white/5">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Direct Contact</h3>
             <div className="grid grid-cols-1 gap-3">
              <a href="https://t.me/vikubhai01" target="_blank" rel="noreferrer" className="w-full bg-[#0088cc] hover:bg-[#0077b3] text-white py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors shadow-md">
                <i className="fab fa-telegram-plane text-lg"></i> Telegram Support
              </a>
              <a href="mailto:support@urlking.site" className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors shadow-md">
                <i className="far fa-envelope text-lg"></i> Email Support
              </a>
            </div>
          </div>
        </div>

        {/* 📝 TICKET FORM */}
        <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <i className="fas fa-edit text-indigo-400"></i> Open a Ticket
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-3 input-premium rounded-xl text-sm text-[var(--text-primary)] bg-slate-800" required>
                  <option value="">Select Category</option>
                  <option value="withdrawal">Withdrawal Issue</option>
                  <option value="upload">Upload/Link Issue</option>
                  <option value="bug">Report a Bug</option>
                  <option value="other">Other / General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full p-3 input-premium rounded-xl text-sm text-[var(--text-primary)] bg-slate-800">
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subject</label>
                <input type="text" placeholder="Short description of issue" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full p-3 input-premium rounded-xl text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Message</label>
                <textarea rows="5" placeholder="Please provide all necessary details..." value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full p-4 input-premium rounded-xl text-sm resize-none" required></textarea>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group mt-4">
              <input type="checkbox" checked={formData.consent} onChange={(e) => setFormData({...formData, consent: e.target.checked})} className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-800 accent-indigo-500" />
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                I agree to the <a href="/privacy-policy" target="_blank" className="text-indigo-400 hover:underline">Privacy Policy</a>.
              </span>
            </label>

            <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
              {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
              {isSubmitting ? 'Sending...' : 'Submit Ticket'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Help;
