import React, { useState } from 'react';
import { showToast } from '../../toast'; // Apne folder structure ke hisaab se path adjust kar lena
import { RateLimiter } from '../../security';

const passwordRateLimiter = new RateLimiter(3000, 3, 300000);

const Changepass = ({ token }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return showToast("Please fill all password fields", "error");
    }
    if (newPassword !== confirmPassword) {
      return showToast("New passwords do not match!", "error");
    }
    if (newPassword.length < 6) {
      return showToast("New password must be at least 6 characters", "error");
    }

    if (!passwordRateLimiter.canProceed()) {
      return showToast("Too many attempts. Please wait before trying again.", "error");
    }
    passwordRateLimiter.recordAttempt();

    setIsChangingPwd(true);
    try {
      const res = await fetch(`${API}/api/change-password`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong!");
      }

      showToast("Password updated successfully! 🔒", "success");
      
      // Success hone par form clear kar do
      setOldPassword(''); 
      setNewPassword(''); 
      setConfirmPassword('');
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="fade-in w-full max-w-3xl mx-auto space-y-6 px-2">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Security Settings</h2>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
        
        {/* Background glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
            <i className="fas fa-lock"></i>
          </div>
          Change Password
        </h3>

        <div className="space-y-6">
          
          {/* Old Password */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Current Password
            </label>
            <div className="relative">
              <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              <input 
                type="password" 
                placeholder="Enter your current password" 
                className="input-premium w-full py-3.5 pl-11 pr-4 rounded-xl text-sm transition-all focus:border-indigo-500/50 focus:bg-[var(--nav-hover)]" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
              />
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                New Password
              </label>
              <div className="relative">
                <i className="fas fa-shield-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  className="input-premium w-full py-3.5 pl-11 pr-4 rounded-xl text-sm transition-all focus:border-indigo-500/50 focus:bg-[var(--nav-hover)]" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <i className="fas fa-check-circle absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  className="input-premium w-full py-3.5 pl-11 pr-4 rounded-xl text-sm transition-all focus:border-indigo-500/50 focus:bg-[var(--nav-hover)]" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Guidelines / Tips */}
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3 mt-2">
            <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
            <p className="text-xs text-slate-400 leading-relaxed">
              Make sure your new password is at least <span className="text-blue-400 font-bold">6 characters</span> long. We recommend using a mix of letters, numbers, and symbols for better security.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-end">
            <button 
              onClick={handlePasswordChange} 
              disabled={isChangingPwd}
              className={`btn-action w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3.5 rounded-xl font-bold text-sm shadow-[0_5px_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2 ${isChangingPwd ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {isChangingPwd ? (
                <><i className="fas fa-spinner fa-spin"></i> Updating Password...</>
              ) : (
                <><i className="fas fa-save"></i> Save Changes</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Changepass;
