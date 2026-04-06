import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 🟢 FIX 1: Home, Login, aur Register ko DIRECT import kiya. (Taki 0 second me khulein)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// --- 🟡 Baaki heavy pages ko Lazy Load rehne diya ---
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Rates = lazy(() => import('./pages/Rates'));
const PaymentProof = lazy(() => import('./pages/PaymentProof'));
const Uploader = lazy(() => import('./pages/Uploader'));
const Admin = lazy(() => import('./pages/Admin'));

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const DMCA = lazy(() => import('./pages/DMCA'));
const Terms = lazy(() => import('./pages/Terms'));
const InvalidLink = lazy(() => import('./pages/InvalidLink'));

// 🟢 FIX 2: Anti-Flash Loader (Spinner sirf tab dikhega jab sach me net slow ho)
const PageLoader = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 300ms ka delay, agar page usse pehle load ho gaya toh spinner nahi aayega (Instant feel)
    const timeout = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  if (!show) return null; // 300ms tak screen ekdum normal rahegi

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-body)] z-50">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
};

function App() {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Initial Theme Load
    if (localStorage.getItem('theme') === 'light') {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
      setIsLightMode(true);
    }
  }, []);

  // 🚀 FIX 3: BACKGROUND PRELOAD MAGIC
  useEffect(() => {
    // Home page render hone ke exactly 2 second baad browser background me baaki files download karega
    const preloadTimeout = setTimeout(() => {
      // Browser in files ko fetch karke cache me lock kar lega
      import('./pages/Dashboard');
      import('./pages/Uploader');
      import('./pages/Rates');
      import('./pages/PaymentProof');
      import('./pages/PrivacyPolicy');
      import('./pages/Terms');
      import('./pages/DMCA');
      // Admin route ko chahein toh preload mat karein security/size ke liye, par fast chahiye toh rakhein:
      import('./pages/Admin'); 
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
          {/* Main Routes - Eager Load (0 delay) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Lazy Routes - But Background Preloaded! */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/payment-proof" element={<PaymentProof />} />
          <Route path="/uploader" element={<Uploader />} />
          <Route path="/admin" element={<Admin />} />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/terms" element={<Terms />} />

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
