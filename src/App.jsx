import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  useEffect(() => {
    // Check initial theme from localStorage
    if (localStorage.getItem('theme') === 'light') {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    document.body.classList.toggle('light-mode');
    document.documentElement.classList.toggle('light-mode');
    
    const themeIcon = document.getElementById('theme-icon');
    if (document.body.classList.contains('light-mode')) {
      localStorage.setItem('theme', 'light');
      if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      }
    } else {
      localStorage.setItem('theme', 'dark');
      if (themeIcon) {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      }
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      {/* Global Floating Theme Button */}
      <button onClick={toggleTheme} className="floating-theme-btn" title="Toggle Theme">
        <i className="fas fa-moon" id="theme-icon"></i>
      </button>
    </Router>
  );
}

export default App;
