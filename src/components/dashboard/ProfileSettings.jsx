import React, { useState, useEffect } from 'react';
import { showToast } from '../../toast'; // Premium Toast

const ProfileSettings = ({ token, user, fetchUserProfile }) => {
  const [form, setForm] = useState({
    name: '', social: '', mobile: '', telegram: '', youtube: '', 
    withdrawal_method: '', withdrawal_account: '',
    bank_holder: '', bank_name: '', bank_ifsc: '', bank_account: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '', 
        social: user.social || '', 
        mobile: user.mobile || '',
        telegram: user.telegram || '',
        youtube: user.youtube || '',
        withdrawal_method: user.withdrawal_method || 'upi', // Default method
        withdrawal_account: user.withdrawal_account || '',
        bank_holder: user.bank_holder || '',
        bank_name: user.bank_name || '', 
        bank_ifsc: user.bank_ifsc || '', 
        bank_account: user.bank_account || ''
      });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API}/api/profile`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) { 
        showToast("Profile updated successfully!", "success"); 
        fetchUserProfile(); 
      } else {
        showToast("Failed to update profile", "error");
      }
    } catch (e) { 
      showToast("Error saving profile", "error"); 
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions for Dynamic UI
  const getMinLimit = (method) => {
    const highLimitMethods = ['paypal', 'binance_id', 'binance_trc20', 'nagad', 'bkash', 'bank_account'];
    return highLimitMethods.includes(method) ? "$5.00" : "$2.00";
  };

  const getAccountLabel = (method) => {
    switch(method) {
      case 'gpay': return 'Google Pay Number / UPI ID';
      case 'phonepe': return 'PhonePe Number / UPI ID';
      case 'upi': return 'UPI ID';
      case 'paypal': return 'PayPal Email Address';
      case 'binance_id': return 'Binance Pay ID';
      case 'binance_trc20': return 'USDT (TRC20) Wallet Address';
      case 'nagad': return 'Nagad Account Number';
      case 'bkash': return 'bKash Account Number';
      case 'redeem_code': return 'Email Address (For Play Store Code)';
      default: return 'Account ID / Details';
    }
  };

  return (
    <div className="fade-in w-full max-w-3xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Account Settings</h2>

      {/* --- PROFILE INFORMATION --- */}
      <div className="glass-panel p-8 rounded-2xl border-[var(--glass-border)]">
        <div className="flex items-center gap-6 mb-8 border-b border-[var(--glass-border)] pb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            <i className="fas fa-user"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Edit Profile</h3>
            <p className="text-sm text-slate-400">Update your public information and social links</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">Username <i className="fas fa-lock ml-1 text-xs"></i></label>
            <input readOnly value={user?.username || ''} className="input-premium w-full p-3 rounded-xl opacity-50 cursor-not-allowed bg-black/20" />
          </div>
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">Email <i className="fas fa-lock ml-1 text-xs"></i></label>
            <input readOnly value={user?.email || ''} className="input-premium w-full p-3 rounded-xl opacity-50 cursor-not-allowed bg-black/20" />
          </div>
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">Display Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-premium w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">WhatsApp / Mobile</label>
            <input name="mobile" value={form.mobile} onChange={handleChange} className="input-premium w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" placeholder="+91..." />
          </div>
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">Social Handle</label>
            <input name="social" value={form.social} onChange={handleChange} className="input-premium w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" placeholder="@username" />
          </div>
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">Telegram Link</label>
            <input name="telegram" value={form.telegram} onChange={handleChange} className="input-premium w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" placeholder="https://t.me/..." />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">YouTube Channel Link</label>
            <input name="youtube" value={form.youtube} onChange={handleChange} className="input-premium w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" placeholder="https://youtube.com/..." />
          </div>
        </div>
      </div>

      {/* --- WITHDRAWAL SETTINGS --- */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Withdrawal Details</h2>
      <div className="glass-panel p-8 rounded-2xl border-[var(--glass-border)]">
        
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-8 flex gap-4">
          <i className="fas fa-exclamation-triangle text-yellow-500 text-xl mt-1"></i>
          <p className="text-sm text-yellow-600 dark:text-yellow-500/80 leading-relaxed">
            Ensure your payment details are 100% correct. Incorrect details may lead to payment delays or permanent loss of funds.
          </p>
        </div>

        {/* Dropdown Selection */}
        <div className="mb-8">
          <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">Select Withdrawal Method</label>
          <select 
            name="withdrawal_method" 
            value={form.withdrawal_method} 
            onChange={handleChange} 
            className="input-premium w-full p-4 rounded-xl font-bold bg-slate-900 cursor-pointer focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="upi">UPI (India)</option>
            <option value="gpay">Google Pay (India)</option>
            <option value="phonepe">PhonePe (India)</option>
            <option value="bank_account">Bank Transfer (India / Global)</option>
            <option value="paypal">PayPal (Global)</option>
            <option value="binance_id">Binance Pay ID (Global)</option>
            <option value="binance_trc20">USDT TRC20 (Global)</option>
            <option value="nagad">Nagad (Bangladesh)</option>
            <option value="bkash">bKash (Bangladesh)</option>
            <option value="redeem_code">Play Store Redeem Code (India Only)</option>
          </select>
          
          <div className="mt-3 flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold uppercase tracking-wider">
              Minimum Withdrawal: {getMinLimit(form.withdrawal_method)}
            </span>
          </div>
        </div>

        {/* Dynamic Input Box (Hides if Bank Account is selected) */}
        {form.withdrawal_method !== 'bank_account' && (
          <div className="mb-8 fade-in">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              {getAccountLabel(form.withdrawal_method)}
            </label>
            <input 
              name="withdrawal_account" 
              value={form.withdrawal_account} 
              onChange={handleChange} 
              placeholder={`Enter your ${getAccountLabel(form.withdrawal_method)}`}
              className="input-premium w-full p-4 rounded-xl font-mono text-indigo-300 focus:ring-2 focus:ring-indigo-500/50" 
            />
          </div>
        )}

        {/* Bank Details UI (Shows only if Bank Account is selected) */}
        {form.withdrawal_method === 'bank_account' && (
          <div className="fade-in">
            <h4 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-4 border-t border-[var(--glass-border)] pt-8">Bank Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">Account Holder Name</label>
                <input name="bank_holder" value={form.bank_holder} onChange={handleChange} className="input-premium w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" placeholder="John Doe" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">Account Number</label>
                <input name="bank_account" value={form.bank_account} onChange={handleChange} className="input-premium w-full p-3 rounded-xl font-mono text-indigo-300 focus:ring-2 focus:ring-indigo-500/50" placeholder="1234567890" />
              </div>
              <div>
                <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">Bank Name</label>
                <input name="bank_name" value={form.bank_name} onChange={handleChange} className="input-premium w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" placeholder="e.g. State Bank of India" />
              </div>
              <div>
                <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">IFSC Code / Swift Code</label>
                <input name="bank_ifsc" value={form.bank_ifsc} onChange={handleChange} className="input-premium w-full p-3 rounded-xl uppercase font-mono focus:ring-2 focus:ring-indigo-500/50" placeholder="SBIN0001234" />
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end border-t border-[var(--glass-border)] pt-6 mt-4">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn-action px-8 py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default ProfileSettings;
