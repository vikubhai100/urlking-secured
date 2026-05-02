import React, { useState } from 'react';

const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

export default function MailerPage() {
  const [mailer, setMailer] = useState({ subject: '', title: '', message: '', adminKey: '' });
  const [mailing, setMailing] = useState(false);
  const token = localStorage.getItem('admin_token');

  const sendMail = async () => {
    const { adminKey, subject, title, message } = mailer;
    if (!adminKey || !subject || !title || !message) {
      return alert('Bhai, saari fields fill karna zaroori hai!'); // Yahan toast use kar lena
    }
    
    setMailing(true);
    try {
      const res = await fetch(`${API}/api/admin/send-bulk`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, 
        body: JSON.stringify({ adminKey, subject, title, message }) 
      });
      const d = await res.json();
      
      if (res.ok) {
        alert(d.message || 'Broadcast Sent Successfully!');
        setMailer({ subject: '', title: '', message: '', adminKey: '' }); // Clear form
      } else {
        alert(d.error || 'Failed to send mail');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setMailing(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-6">
        <i className="fas fa-paper-plane text-sky-500 text-xl" />
        <h2 className="text-xl font-bold text-slate-800">Broadcast Mailer</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center border border-sky-100">
            <i className="fas fa-bullhorn text-sky-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Send Announcement</h3>
            <p className="text-xs text-slate-400">This will email all registered users</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Admin Secret Key</label>
              <input type="password" value={mailer.adminKey} onChange={e => setMailer(p => ({ ...p, adminKey: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-sky-400 bg-slate-50 focus:bg-white transition-colors" placeholder="Enter secure key" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email Subject</label>
              <input type="text" value={mailer.subject} onChange={e => setMailer(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-sky-400 bg-slate-50 focus:bg-white transition-colors" placeholder="e.g., Important Update" />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Mail Title (Inside Email)</label>
            <input type="text" value={mailer.title} onChange={e => setMailer(p => ({ ...p, title: e.target.value }))} 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-sky-400 bg-slate-50 focus:bg-white transition-colors" placeholder="Heading of the email body" />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Message (HTML Supported)</label>
            <textarea rows={6} value={mailer.message} onChange={e => setMailer(p => ({ ...p, message: e.target.value }))} 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-sky-400 resize-y bg-slate-50 focus:bg-white transition-colors" placeholder="Write your message here. You can use <br>, <b>, etc." />
          </div>
          
          <div className="pt-2">
            <button onClick={sendMail} disabled={mailing} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm">
              {mailing ? (
                <><div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" /> Sending to all...</>
              ) : (
                <><i className="fas fa-paper-plane" /> Send Broadcast Now</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
