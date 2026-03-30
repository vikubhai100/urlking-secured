import React, { useState, useEffect } from 'react';

const ProfileSettings = ({ token, user, fetchUserProfile }) => {
  const [form, setForm] = useState({
    name: '', social: '', mobile: '', upi_id: '',
    bank_holder: '', bank_name: '', bank_ifsc: '', bank_account: ''
  });

  const API = "https://go.urlking.site";

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '', social: user.social || '', mobile: user.mobile || '',
        upi_id: user.upi_id || '', bank_holder: user.bank_holder || '',
        bank_name: user.bank_name || '', bank_ifsc: user.bank_ifsc || '', bank_account: user.bank_account || ''
      });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const res = await fetch(`${API}/api/profile`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) { alert("Profile updated!"); fetchUserProfile(); }
      else alert("Failed to update profile");
    } catch (e) { alert("Error saving profile"); }
  };

  return (
    <div className="fade-in w-full max-w-3xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold">Account Settings</h2>

      <div className="glass-panel p-8 rounded-2xl">
        <div className="flex items-center gap-6 mb-8 border-b border-[var(--glass-border)] pb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
            <i className="fas fa-user"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold">Edit Profile</h3>
            <p className="text-sm text-slate-400">Update your public information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div><label className="text-sm text-slate-400 mb-2 block">Username <i className="fas fa-lock ml-1 text-xs"></i></label><input readOnly value={user?.username || ''} className="input-premium w-full p-3 rounded-lg opacity-70 cursor-not-allowed" /></div>
          <div><label className="text-sm text-slate-400 mb-2 block">Email <i className="fas fa-lock ml-1 text-xs"></i></label><input readOnly value={user?.email || ''} className="input-premium w-full p-3 rounded-lg opacity-70 cursor-not-allowed" /></div>
          <div><label className="text-sm text-slate-400 mb-2 block">Display Name</label><input name="name" value={form.name} onChange={handleChange} className="input-premium w-full p-3 rounded-lg" /></div>
          <div><label className="text-sm text-slate-400 mb-2 block">Social Handle</label><input name="social" value={form.social} onChange={handleChange} className="input-premium w-full p-3 rounded-lg" /></div>
        </div>
      </div>

      <h2 className="text-2xl font-bold">Withdrawal Details</h2>
      <div className="glass-panel p-8 rounded-2xl">
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-8 flex gap-4">
          <i className="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>
          <p className="text-sm text-yellow-600 dark:text-yellow-500/80">Ensure all bank details are 100% correct. Incorrect details may lead to permanent loss of funds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div><label className="text-sm text-slate-400 mb-2 block">Mobile (+91...)</label><input name="mobile" value={form.mobile} onChange={handleChange} className="input-premium w-full p-3 rounded-lg" /></div>
          <div><label className="text-sm text-slate-400 mb-2 block">Alternate UPI ID</label><input name="upi_id" value={form.upi_id} onChange={handleChange} className="input-premium w-full p-3 rounded-lg" /></div>
        </div>

        <h4 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-4 border-t border-[var(--glass-border)] pt-8">Bank Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2"><label className="text-sm text-slate-400 mb-2 block">Account Holder Name</label><input name="bank_holder" value={form.bank_holder} onChange={handleChange} className="input-premium w-full p-3 rounded-lg" /></div>
          <div><label className="text-sm text-slate-400 mb-2 block">Bank Name</label><input name="bank_name" value={form.bank_name} onChange={handleChange} className="input-premium w-full p-3 rounded-lg" /></div>
          <div><label className="text-sm text-slate-400 mb-2 block">IFSC Code</label><input name="bank_ifsc" value={form.bank_ifsc} onChange={handleChange} className="input-premium w-full p-3 rounded-lg uppercase" /></div>
          <div className="md:col-span-2"><label className="text-sm text-slate-400 mb-2 block">Account Number</label><input name="bank_account" value={form.bank_account} onChange={handleChange} className="input-premium w-full p-3 rounded-lg" /></div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-action px-8 py-3 rounded-xl font-bold">Save All Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
