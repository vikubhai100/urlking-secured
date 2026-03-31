import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- Saare Pages Import Kar Liye ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/ResetPassword';
import Rates from './pages/Rates';           // <-- Naya Add Hua
import PaymentProof from './pages/PaymentProof'; // <-- Naya Add Hua
import Uploader from './pages/Uploader';     // <-- Naya Add Hua

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* --- Naye Pages Ke Routes --- */}
        <Route path="/rates" element={<Rates />} />
        <Route path="/payment-proof" element={<PaymentProof />} />
        <Route path="/uploader" element={<Uploader />} />
      </Routes>

      {/* Global Floating Theme Button */}
      <button onClick={toggleTheme} className="floating-theme-btn" title="Toggle Theme">
        <i className={`fas ${isLightMode ? 'fa-sun text-yellow-500' : 'fa-moon'}`}></i>
      </button>
    </Router>
  );
}

export default App;
