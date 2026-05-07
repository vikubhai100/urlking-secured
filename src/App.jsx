import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ✅ FIXED: Sirf index.css import kiya hai kyunki tere paas App.css nahi hai
//import './index.css'; 

// 🟢 PUBLIC CORE PAGES (Direct Import - 0 Delay)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// 🚀 ADMIN CORE
import AdminLayout from './components/admin/AdminLayout'; 
import Overview from './pages/admin/Overview';

// --- 🟣 ADMIN PAGES (Lazy Load) ---
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const TopPerformers = lazy(() => import('./pages/admin/TopPerformers'));
const WithdrawalsPage = lazy(() => import('./pages/admin/WithdrawalsPage'));
const SupportTickets = lazy(() => import('./pages/admin/SupportTickets'));
const MailerPage = lazy(() => import('./pages/admin/MailerPage'));
const ManagersPage = lazy(() => import('./pages/admin/ManagersPage'));
const RecyclePage = lazy(() => import('./pages/admin/RecyclePage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

// --- 🟡 PUBLIC HEAVY PAGES (Lazy Load) ---
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Rates = lazy(() => import('./pages/Rates'));
const PaymentProof = lazy(() => import('./pages/PaymentProof'));
const Uploader = lazy(() => import('./pages/Uploader'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const DMCA = lazy(() => import('./pages/DMCA'));
const Terms = lazy(() => import('./pages/Terms'));
const InvalidLink = lazy(() => import('./pages/InvalidLink'));

// Page Loader
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
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 💡 YAHI MISSING THA: Reset Password Route */}
          <Route path="/reset-password" element={<ResetPassword />} /> 

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/payment-proof" element={<PaymentProof />} />
          <Route path="/uploader" element={<Uploader />} />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/terms" element={<Terms />} />

          {/* 🔒 Admin Gateway */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 🟣 SaaS Admin Shell */}
          <Route path="/admin" element={<AdminLayout />}>
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

          <Route path="*" element={<InvalidLink />} />
        </Routes>
      </Suspense>

      <button onClick={toggleTheme} className="floating-theme-btn" title="Toggle Theme">
        <i className={`fas ${isLightMode ? 'fa-sun text-yellow-500' : 'fa-moon'}`}></i>
      </button>

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
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          border: none;
          z-index: 40;
          transition: transform 0.2s;
        }
        .light-mode .floating-theme-btn { background: white; color: #1e293b; border: 1px solid #e2e8f0; }
      `}</style>
    </Router>
  );
}

export default App;
