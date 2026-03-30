import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Global Background Component
import Particles from '../components/Particles';

// Dashboard Components
import Sidebar from '../components/dashboard/Sidebar';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import UploadFile from '../components/dashboard/UploadFile';
import ManageFiles from '../components/dashboard/ManageFiles';
import LinkHistory from '../components/dashboard/LinkHistory';
import Withdraw from '../components/dashboard/Withdraw';
import Referrals from '../components/dashboard/Referrals';
import DeveloperApi from '../components/dashboard/DeveloperApi';
import QuickLink from '../components/dashboard/QuickLink';
import ProfileSettings from '../components/dashboard/ProfileSettings';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('create');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const API = "https://go.urlking.site";

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
    
    // Auto-refresh wallet balance every 8 seconds
    const interval = setInterval(fetchUserProfile, 8000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  const fetchUserProfile = async () => {
    try {
      // 1. Fetch User Data
      const res = await fetch(`${API}/api/me`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        navigate('/login');
        return;
      }
      const data = await res.json();
      
      // 2. Fetch Wallet Balance
      const walletRes = await fetch(`${API}/api/wallet/balance`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const walletData = await walletRes.json();
      
      // Merge user data and wallet balance into one state
      setUser({ 
        ...data, 
        balance: walletData.balance || walletData.balance_usd || 0 
      });
      
      setIsLoading(false);
    } catch (err) { 
      console.error("Error fetching user data", err); 
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          <p className="text-slate-400 font-medium">Syncing your data...</p>
        </div>
      );
    }

    // Dynamic Tab Switching Logic
    switch (activeSection) {
      case 'create': 
        return <DashboardOverview token={token} user={user} />;
      case 'upload': 
        return <UploadFile token={token} user={user} />;
      case 'files': 
        return <ManageFiles token={token} />;
      case 'history': 
        return <LinkHistory token={token} />;
      case 'withdraw': 
        return <Withdraw token={token} user={user} />;
      case 'referrals': 
        return <Referrals token={token} />;
      case 'api': 
        return <DeveloperApi token={token} user={user} fetchUserProfile={fetchUserProfile} />;
      case 'quicklink': 
        return <QuickLink user={user} />;
      case 'profile': 
        return <ProfileSettings token={token} user={user} fetchUserProfile={fetchUserProfile} />;
      default:
        return <div className="p-8 text-center text-slate-400">Coming soon...</div>;
    }
  };

  return (
    <>
      {/* Background Particles */}
      <Particles />
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass-panel border-b border-[var(--glass-border)] p-4 flex items-center justify-between bg-[var(--bg-body)]">
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-2xl text-[var(--text-primary)]">
          <i className="fas fa-bars"></i>
        </button>
        <h1 className="text-lg font-bold tracking-wide text-[var(--text-primary)]">
          URL<span className="text-indigo-500">KING</span>
        </h1>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen}
        user={user}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full md:ml-72 p-4 md:p-10 pt-24 min-h-screen relative z-10 overflow-x-hidden">
        {renderContent()}
      </main>
    </>
  );
};

export default Dashboard;
