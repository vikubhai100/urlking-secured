import { getApiUrl } from '../../security';
import React, { useState } from 'react';

const API = getApiUrl();

export default function MailerPage() {
  const [mailer, setMailer] = useState({ subject: '', title: '', message: '', adminKey: '' });
  const [mailing, setMailing] = useState(false);
  const token = localStorage.getItem('admin_token');

  const sendMail = async () => {
    const { adminKey, subject, title, message } = mailer;
    if (!adminKey || !subject || !title || !message) {
      return alert('Bhai, saari fields fill karna zaroori hai!');
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
        setMailer({ subject: '', title: '', message: '', adminKey: '' });
      } else {
        alert(d.error || 'Failed to send mail');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setMailing(false);
    }
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none placeholder-slate-400 transition-all";
  const focusStyle = { onFocus: e => e.target.style.borderColor='#0ea5e9', onBlur: e => e.target.style.borderColor='' };

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ─── Header ─── */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
          style={{background:'linear-gradient(135deg,#0ea5e9,#0284c7)',boxShadow:'0 8px 20px rgba(14,165,233,0.3)'}}>
          <i className="fas fa-paper-plane text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Broadcast Mailer</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Send announcement to all users</p>
        </div>
      </div>

      {/* ─── Form Card ─── */}
      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          
          {/* Card header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
              <i className="fas fa-bullhorn text-sky-500" />
            </div>
            <div>
              <p className="font-black text-slate-800">Send Announcement</p>
              <p className="text-xs text-slate-400 mt-0.5">This will email all registered users immediately</p>
            </div>
          </div>

          {/* Form fields */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Admin Secret Key">
                <input 
                  type="password" value={mailer.adminKey} 
                  onChange={e => setMailer(p => ({ ...p, adminKey: e.target.value }))}
                  placeholder="Enter secure key"
                  className={inputCls} {...focusStyle}
                />
              </Field>
              <Field label="Email Subject">
                <input 
                  type="text" value={mailer.subject} 
                  onChange={e => setMailer(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g., Important Update"
                  className={inputCls} {...focusStyle}
                />
              </Field>
            </div>

            <Field label="Mail Title (Inside Email)">
              <input 
                type="text" value={mailer.title} 
                onChange={e => setMailer(p => ({ ...p, title: e.target.value }))}
                placeholder="Heading of the email body"
                className={inputCls} {...focusStyle}
              />
            </Field>

            <Field label="Message (HTML Supported)">
              <textarea 
                rows={6} value={mailer.message} 
                onChange={e => setMailer(p => ({ ...p, message: e.target.value }))}
                placeholder="Write your message here. You can use <br>, <b>, <a href='...'>, etc."
                className={`${inputCls} resize-y leading-relaxed`} {...focusStyle}
              />
            </Field>

            <div className="pt-1">
              <button 
                onClick={sendMail} disabled={mailing}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg"
                style={{background:'linear-gradient(135deg,#0ea5e9,#0284c7)',color:'#fff',boxShadow:'0 4px 18px rgba(14,165,233,0.3)'}}>
                {mailing ? (
                  <>
                    <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                    Sending to all users...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" />
                    Send Broadcast
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

