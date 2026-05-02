import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚠️ CSS IMPORT (Tere structure ke hisaab se)
import './index.css'; 

// 🟢 FIX 1: Home, Login, aur Register (Direct Import - 0 Delay)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// --- 🟡 Public Heavy Pages (Lazy Load) ---
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Rates = lazy(() => import('./pages/Rates'));
const PaymentProof = lazy(() => import('./pages/PaymentProof'));
const Uploader = lazy(() => import('./pages/Uploader'));

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const DMCA = lazy(() => import('./pages/DMCA'));
const Terms = lazy(() => import('./pages/Terms'));
const InvalidLink = lazy(() => import('./pages/InvalidLink'));

// --- 🟣 NEW: SaaS Admin Panel (Strict Lazy Load - Touch hone par load honge) ---
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Overview = lazy(() => import('./pages/admin/Overview'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const TopPerformers = lazy(() => import('./pages/admin/TopPerformers'));
const WithdrawalsPage = lazy(() => import('./pages/admin/WithdrawalsPage'));
const SupportTickets = lazy(() => import('./pages/admin/SupportTickets'));
const MailerPage = lazy(() => import('./pages/admin/MailerPage'));
const ManagersPage = lazy(() => import('./pages/admin/ManagersPage'));
const RecyclePage = lazy(() => import('./pages/admin/RecyclePage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

// 🟢 FIX 2: Anti-Flash Loader
const PageLoader = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-body)] z-[999]">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
};

function App() {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'light') {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
      setIsLightMode(true);
    }
  }, []);

  // 🚀 FIX 3: BACKGROUND PRELOAD MAGIC (Only for Public Pages)
  useEffect(() => {
    const preloadTimeout = setTimeout(() => {
      import('./pages/Dashboard');
      import('./pages/Uploader');
      import('./pages/Rates');
      import('./pages/PaymentProof');
      // Note: Admin routes ko preload nahi kiya taaki optimization bani rahe
    }, 2000); 

    return () => clearTimeout(preloadTimeout);
  }, []);

  const toggleTheme = () => {
    const isNowLight = document.body.classList.toggle('light-mode');
    document.documentElement.classList.toggle('light-mode');
    setIsLightMode(isNowLight);
    localStorage.setItem('theme', isNowLight ? 'light' : 'dark');
  };

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Main Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Lazy Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/payment-proof" element={<PaymentProof />} />
          <Route path="/uploader" element={<Uploader />} />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/terms" element={<Terms />} />

          {/* 🔒 Admin Gateway (Ghost Mode) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 🟣 SaaS Admin Shell (Nested) */}
          <Route path="/admin" element={<AdminLayout>}>
            <Route index element={<Overview />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="top" element={<TopPerformers />} />
            <Route path="withdrawals" element={<WithdrawalsPage />} />
            <Route path="support" element={<SupportTickets />} />
            <Route path="mailer" element={<MailerPage />} />
            <Route path="managers" element={<ManagersPage />} />
            <Route path="recycle" element={<RecyclePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<InvalidLink />} />
        </Routes>
      </Suspense>

      {/* Theme Toggle Button */}
      <button onClick={toggleTheme} className="floating-theme-btn" title="Toggle Theme">
        <i className={`fas ${isLightMode ? 'fa-sun text-yellow-500' : 'fa-moon'}`}></i>
      </button>

      {/* Global Style Overrides */}
      <style>{`
        .floating-theme-btn {
          position: fixed;
          bottom: 25px;
          right: 25px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #1e293b;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
          border: none;
          z-index: 40; /* 👈 Keep below Modal (z-50) */
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .floating-theme-btn:active { transform: scale(0.9); }
        .light-mode .floating-theme-btn { background: white; color: #1e293b; border: 1px solid #e2e8f0; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </Router>
  );
}

export default App;
