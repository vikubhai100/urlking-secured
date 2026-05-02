import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 🟢 PUBLIC CORE PAGES (0 Delay)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// 🚀 FIX: AdminLayout aur Overview ko DIRECT IMPORT kiya hai.
// Isse /admin hit hote hi bina kisi delay ya chunk error ke turant khulega.
// ⚠️ DHYAN DEIN: Apna folder check karna. Agar AdminLayout 'pages' me rakha hai, to path us hisab se dalna.
import AdminLayout from './components/admin/AdminLayout'; 
import Overview from './pages/admin/Overview';

// --- 🟣 ADMIN PAGES (Lazy Load - Par inka hit hona safe hai) ---
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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/payment-proof" element={<PaymentProof />} />
          <Route path="/uploader" element={<Uploader />} />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/terms" element={<Terms />} />

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
