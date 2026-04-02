import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- 🚀 LAZY LOADING (Code Splitting): Isse website compressed aur super-fast load hogi ---
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Rates = lazy(() => import('./pages/Rates'));
const PaymentProof = lazy(() => import('./pages/PaymentProof'));
const Uploader = lazy(() => import('./pages/Uploader'));
const Admin = lazy(() => import('./pages/Admin'));
const InvalidLink = lazy(() => import('./pages/InvalidLink'));

function App() {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage on load
    if (localStorage.getItem('theme') === 'light') {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
      setIsLightMode(true);
    }
  }, []);

  const toggleTheme = () => {
    // Toggle the class on body and html
    const isNowLight = document.body.classList.toggle('light-mode');
    document.documentElement.classList.toggle('light-mode');

    // Update state and localStorage
    setIsLightMode(isNowLight);
    localStorage.setItem('theme', isNowLight ? 'light' : 'dark');
  };

  return (
    <Router>
      {/* fallback={null} ka matlab hai ki background mein code load hoga, par user ko koi loader nahi dikhega */}
      <Suspense fallback={null}>
        <Routes>
          {/* Main Public & User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/payment-proof" element={<PaymentProof />} />
          <Route path="/uploader" element={<Uploader />} />

          {/* Admin Route */}
          <Route path="/admin" element={<Admin />} />

          {/* Catch-All Route for 404 / Invalid Links */}
          <Route path="*" element={<InvalidLink />} />
        </Routes>
      </Suspense>

      {/* Global Floating Theme Button */}
      <button onClick={toggleTheme} className="floating-theme-btn" title="Toggle Theme">
        <i className={`fas ${isLightMode ? 'fa-sun text-yellow-500' : 'fa-moon'}`}></i>
      </button>
    </Router>
  );
}

export default App;
