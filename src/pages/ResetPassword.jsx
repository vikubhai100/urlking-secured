import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Particles from '../components/Particles';
import Header from '../components/Header'; // Standard Header added
import Footer from '../components/Footer'; // Standard Footer added
import { showToast } from '../toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading');
  const [errorData, setErrorData] = useState({ title: '', msg: '' });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = "https://go.urlking.site";

  // --- VERIFY TOKEN ON PAGE LOAD ---
  useEffect(() => {
    if (!token) {
      setErrorData({ title: "Access Denied", msg: "No security token found in the URL." });
      setStatus('error');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-token/${token}`);
        const data = await res.json();

        if (data.valid || res.ok) {
          setStatus('form');
        } else {
          setErrorData({ title: "Link Expired or Invalid", msg: data.error || "Please request a new reset link." });
          setStatus('error');
        }
      } catch (e) {
        setErrorData({ title: "Connection Error", msg: "Failed to connect to the server. Try again later." });
        setStatus('error');
      }
    };

    verifyToken();
  }, [token]);

  // --- SUBMIT NEW PASSWORD ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) return showToast("Please fill both fields.", "error");
    if (newPassword.length < 6) return showToast("Password must be at least 6 characters.", "error");
    if (newPassword !== confirmPassword) return showToast("Passwords do not match!", "error");

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();

      if (data.ok || res.ok) {
        showToast("Password updated successfully! Redirecting...", "success");
        setTimeout(() => navigate('/login'), 1500);
      } else {
        showToast(data.error || "Failed to update. Link may be expired.", "error");
        setIsSubmitting(false);
      }
    } catch (err) {
      showToast("Server Error. Please try again later.", "error");
      setIsSubmitting(false);
    }
  };

  return (
    // Flex-col set kiya hai taaki Header upar, Footer neeche aur Main content beech mein rahe
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-body)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles />
      </div>

      {/* Standard Header Component */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 relative z-10 mt-20 md:mt-0">
        <div className="w-full max-w-md p-8 fade-in">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-700/30 mb-4 shadow-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] light:from-white light:to-[#f1f5f9]">
              <i className="fas fa-shield-alt text-indigo-500 text-2xl drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"></i>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">Reset Password</h1>
            <p className="text-sm text-[var(--text-secondary)]">Secure your URL King account</p>
          </div>

          <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] rounded-3xl p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
            
            {/* 1. LOADING STATE */}
            {status === 'loading' && (
              <div className="text-center py-6 fade-in">
                <i className="fas fa-circle-notch fa-spin text-indigo-500 text-4xl mb-4 drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]"></i>
                <h2 className="text-lg font-bold text-indigo-400 mb-2">Verifying Secure Link...</h2>
                <p className="text-sm text-[var(--text-secondary)]">Please wait while we check token validity.</p>
              </div>
            )}

            {/* 2. ERROR STATE */}
            {status === 'error' && (
              <div className="text-center fade-in py-6">
                <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]"></i>
                <h2 className="text-xl font-bold text-red-400 mb-2">{errorData.title}</h2>
                <p className="text-sm text-[var(--text-secondary)]">{errorData.msg}</p>
                <button 
                  onClick={() => navigate('/login')} 
                  className="mt-6 px-6 py-2.5 rounded-xl border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--nav-hover)] transition-colors text-sm font-bold w-full"
                >
                  Return to Login
                </button>
              </div>
            )}

            {/* 3. FORM STATE */}
            {status === 'form' && (
              <form onSubmit={handleSubmit} className="fade-in space-y-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--input-icon)]">
                    <i className="fas fa-lock"></i>
                  </div>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password (Min 6 chars)" 
                    className="w-full pl-12 pr-4 py-4 input-premium rounded-xl text-sm" 
                    required 
                    minLength="6"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--input-icon)]">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password" 
                    className="w-full pl-12 pr-4 py-4 input-premium rounded-xl text-sm" 
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-action w-full py-4 rounded-xl font-bold text-white tracking-wide shadow-lg transform active:scale-95 transition-transform flex justify-center items-center gap-2 mt-2"
                >
                  {isSubmitting ? <i className="fas fa-circle-notch fa-spin text-lg"></i> : "Set New Password"}
                </button>
              </form>
            )}

          </div>
        </div>
      </main>

      {/* Standard Footer Component */}
      <div className="relative z-20">
        <Footer />
      </div>

    </div>
  );
};

export default ResetPassword;
