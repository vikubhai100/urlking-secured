import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 🟢 PUBLIC PAGES (0 Delay)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// 🟣 ADMIN PANEL FIX: Direct Import (Taaki infinite loading par na atke)
// ⚠️ DHYAN DEIN: Agar aapne AdminLayout ko pages folder me rakha hai, toh uska path './pages/admin/AdminLayout' kar lena.
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout'; 
import Overview from './pages/admin/Overview';
import UsersPage from './pages/admin/UsersPage';
import TopPerformers from './pages/admin/TopPerformers';
import WithdrawalsPage from './pages/admin/WithdrawalsPage';
import SupportTickets from './pages/admin/SupportTickets';
import MailerPage from './pages/admin/MailerPage';
import ManagersPage from './pages/admin/ManagersPage';
import RecyclePage from './pages/admin/RecyclePage';
import SettingsPage from './pages/admin/SettingsPage';

// --- 🟡 USER HEAVY PAGES (Lazy Load - Yeh public site ko fast rakhenge) ---
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Rates = lazy(() => import('./pages/Rates'));
const PaymentProof = lazy(() => import('./pages/PaymentProof'));
const Uploader = lazy(() => import('./pages/Uploader'));

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const DMCA = lazy(() => import('./pages/DMCA'));
const Terms = lazy(() => import('./pages/Terms'));
const InvalidLink = lazy(() => import('./pages/InvalidLink'));

// 🟢 Anti-Flash Loader
const PageLoader = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timeout);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-body)] z-50">
      <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
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

  // 🚀 BACKGROUND PRELOAD MAGIC (Sirf public pages ke liye)
  useEffect(() => {
    const preloadTimeout = setTimeout(() => {
      import('./pages/Dashboard');
      import('./pages/Uploader');
      import('./pages/Rates');
      import('./pages/PaymentProof');
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
          {/* Main Routes */}
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

          {/* 🔒 Admin Login (Ghost Mode Guard) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 🟣 SaaS Admin Panel Nested Routes */}
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

          {/* 404 Fallback */}
          <Route path="*" element={<InvalidLink />} />
        </Routes>
      </Suspense>

      <button onClick={toggleTheme} className="floating-theme-btn" title="Toggle Theme">
        <i className={`fas ${isLightMode ? 'fa-sun text-yellow-500' : 'fa-moon'}`}></i>
      </button>
    </Router>
  );
}

export default App;
