import React, { useState } from 'react';
import { showToast } from '../../toast';

const Help = ({ user, isActive }) => {
  const [openFaq, setOpenFaq] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    category: '',
    priority: 'Normal',
    subject: '',
    message: '',
    consent: false
  });

  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";
  const token = localStorage.getItem("token");

  if (!isActive) return null;

  // 🟢 Pure English FAQs
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
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in max-w-3xl mx-auto space-y-6 pb-10">
      
      {/* 🟣 BANNER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <i className="fas fa-life-ring text-white text-sm"></i>
            </div>
            Support Center
          </h2>
          <p className="text-indigo-100 text-sm md:text-base opacity-90">
            Quick help + Ticket form (Category, Priority) — resolving 70% of user queries instantly ✅
          </p>
        </div>
      </div>

      {/* ⚡ QUICK HELP / FAQ */}
      <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <i className="fas fa-bolt text-yellow-500"></i> Quick Help / FAQ
          </h3>
          <span className="bg-slate-800 text-xs font-bold px-3 py-1 rounded-full text-slate-300">Most common answers</span>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-white/5 bg-slate-800/30 rounded-xl overflow-hidden transition-all">
              <button 
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="w-full px-5 py-4 text-left font-bold text-[var(--text-primary)] flex justify-between items-center hover:bg-slate-800/50"
              >
                {faq.q}
                <i className={`fas fa-chevron-down text-sm transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`}></i>
              </button>
              <div className={`px-5 overflow-hidden transition-all duration-300 ease-in-out text-sm text-[var(--text-secondary)] ${openFaq === index ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📝 TICKET FORM */}
      <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <i className="fas fa-edit text-indigo-400"></i> Create a Support Ticket
          </h3>
          <span className="bg-slate-800 text-xs font-bold px-3 py-1 rounded-full text-slate-300">Fast support</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Name</label>
              <input type="text" readOnly={!!user?.username} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 input-premium rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Email</label>
              <input type="email" readOnly={!!user?.email} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 input-premium rounded-xl text-sm" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-3 input-premium rounded-xl text-sm text-[var(--text-primary)]" required>
                <option value="">Select Category</option>
                <option value="withdrawal">Withdrawal Issue</option>
                <option value="upload">Upload/Link Issue</option>
                <option value="bug">Report a Bug</option>
                <option value="other">Other / General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full p-3 input-premium rounded-xl text-sm text-[var(--text-primary)]">
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Subject (short)</label>
            <input type="text" placeholder="Example: Withdraw pending 5+ days / TXID not received" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full p-3 input-premium rounded-xl text-sm" required />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Message (details)</label>
            <textarea rows="6" placeholder="Please add details:&#10;• Withdraw ID (if any)&#10;• Date/time&#10;• Payment method&#10;• TXID (if any)" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full p-4 input-premium rounded-xl text-sm resize-none" required></textarea>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" checked={formData.consent} onChange={(e) => setFormData({...formData, consent: e.target.checked})} className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 accent-indigo-500" />
            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
              I consent to collect my name and email. For more details check our <a href="/privacy-policy" target="_blank" className="text-indigo-400 hover:underline">Privacy Policy</a>.
            </span>
          </label>

          {/* 🟢 Pure English Rules */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-indigo-400 mb-2"><i className="fas fa-thumbtack mr-1"></i> Ticket Rules (please read):</h4>
            <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
              <li>Response time: <strong className="text-slate-200">Within 24-48 hours</strong></li>
              <li>Do not spam tickets — please raise <strong className="text-slate-200">only one ticket</strong> for the same issue.</li>
              <li>If your withdrawal is pending, do not message us before <strong className="text-slate-200">7 days</strong> (unless it is a failed transaction).</li>
            </ul>
          </div>

          <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
            {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-square"></i>}
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>

      {/* 🤝 CONTACT OPTIONS */}
      <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            🤝 Contact Options
          </h3>
          <span className="bg-slate-800 text-xs font-bold px-3 py-1 rounded-full text-slate-300">Trust</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="https://t.me/your_support_bot" target="_blank" rel="noreferrer" className="w-full bg-[#0088cc] hover:bg-[#0077b3] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-md">
            <i className="fab fa-telegram-plane text-lg"></i> Telegram Support
          </a>
          <a href="mailto:support@urlking.site" className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-md">
            <i className="far fa-envelope text-lg"></i> Email Support
          </a>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-sm text-slate-400">
          <i className="far fa-clock"></i>
          <span>Working Hours: <strong>10:00 AM - 08:00 PM (Mon-Sat)</strong></span>
        </div>
      </div>

    </div>
  );
};

export default Help;
