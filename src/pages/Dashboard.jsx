import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API}/api/me`, { 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } 
      });
      
      if (!res.ok) {
        if (res.status === 401) { localStorage.clear(); navigate('/login'); }
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      
      // Balance fetch (Safe)
      let balance = 0;
      try {
        const bRes = await fetch(`${API}/api/wallet/balance`, { headers: { 'Authorization': `Bearer ${token}` } });
        const bData = await bRes.json();
        balance = bData.balance || bData.balance_usd || 0;
      } catch (e) { console.log("Balance fetch error"); }

      setUser({ ...data, balance });
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    // SECURITY: Kabhi bhi child components render mat karo jab tak user data load na ho
    if (isLoading || !user) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    // Ab jab user load ho gaya hai, tabhi components dikhao (Black screen avoid karne ke liye)
    switch (activeSection) {
      case 'create': return <DashboardOverview token={token} user={user} />;
      case 'upload': return <UploadFile token={token} user={user} />;
      case 'files': return <ManageFiles token={token} />;
      case 'history': return <LinkHistory token={token} />;
      case 'withdraw': return <Withdraw token={token} user={user} />;
      case 'referrals': return <Referrals token={token} />;
      case 'api': return <DeveloperApi token={token} user={user} fetchUserProfile={fetchUserProfile} />;
      case 'quicklink': return <QuickLink user={user} />;
      case 'profile': return <ProfileSettings token={token} user={user} fetchUserProfile={fetchUserProfile} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen}
        user={user} 
      />
      <main className="md:ml-72 p-4 md:p-10 pt-24 min-h-screen relative z-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
