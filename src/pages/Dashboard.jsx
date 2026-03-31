import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from '../components/Particles';
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
  const [error, setError] = useState(null);
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
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json' 
        } 
      });
      
      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await res.json();
      
      // Fetch Balance separately
      let balance = 0;
      try {
        const bRes = await fetch(`${API}/api/wallet/balance`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        const bData = await bRes.json();
        balance = bData.balance || bData.balance_usd || 0;
      } catch (e) { console.log("Balance fetch failed"); }

      // Mapping backend data safely
      setUser({
        username: data.username || data.name || "User",
        email: data.email || "",
        api_token: data.api_token || "",
        balance: balance,
        ...data
      });
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile. Please refresh.");
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  if (error) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-white p-6 text-center">
      <div>
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-action px-6 py-2 rounded-full">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-body)]">
      <Particles />
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass-panel border-b border-[var(--glass-border)] p-4 flex items-center justify-between">
        <button onClick={() => setIsMobileOpen(true)} className="text-2xl text-white"><i className="fas fa-bars"></i></button>
        <h1 className="text-lg font-bold text-white">URLKING</h1>
      </div>

      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen}
        user={user} 
      />

      <main className="flex-1 md:ml-72 p-4 md:p-10 pt-24 min-h-screen relative z-10">
        {activeSection === 'create' && <DashboardOverview token={token} user={user} />}
        {activeSection === 'upload' && <UploadFile token={token} user={user} />}
        {activeSection === 'files' && <ManageFiles token={token} />}
        {activeSection === 'history' && <LinkHistory token={token} />}
        {activeSection === 'withdraw' && <Withdraw token={token} user={user} />}
        {activeSection === 'referrals' && <Referrals token={token} />}
        {activeSection === 'api' && <DeveloperApi token={token} user={user} fetchUserProfile={fetchUserProfile} />}
        {activeSection === 'quicklink' && <QuickLink user={user} />}
        {activeSection === 'profile' && <ProfileSettings token={token} user={user} fetchUserProfile={fetchUserProfile} />}
      </main>
    </div>
  );
};

export default Dashboard;
