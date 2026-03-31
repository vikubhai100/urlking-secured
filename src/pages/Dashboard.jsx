import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // URL Params ke liye add kiya

// Components Import
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
  // 1. URL Query Params Logic (URL me ?tab=api aayega)
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('tab') || 'create';

  const setActiveSection = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Keep-Alive Logic (Jo tab ek baar khulega, wo hide hoga delete nahi)
  const [mountedTabs, setMountedTabs] = useState([activeSection]);

  useEffect(() => {
    if (!mountedTabs.includes(activeSection)) {
      setMountedTabs((prev) => [...prev, activeSection]);
    }
  }, [activeSection, mountedTabs]);

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
    if (isLoading || !user) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    // 3. CSS Display Hiding (Tab click par Data gayab nahi hoga, bas hide hoga. Instant Load!)
    return (
      <div className="relative w-full">
        <div className={activeSection === 'create' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('create') && <DashboardOverview token={token} user={user} />}
        </div>
        <div className={activeSection === 'upload' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('upload') && <UploadFile token={token} user={user} />}
        </div>
        <div className={activeSection === 'files' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('files') && <ManageFiles token={token} />}
        </div>
        <div className={activeSection === 'history' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('history') && <LinkHistory token={token} />}
        </div>
        <div className={activeSection === 'withdraw' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('withdraw') && <Withdraw token={token} user={user} />}
        </div>
        <div className={activeSection === 'referrals' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('referrals') && <Referrals token={token} />}
        </div>
        <div className={activeSection === 'api' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('api') && <DeveloperApi token={token} user={user} fetchUserProfile={fetchUserProfile} />}
        </div>
        <div className={activeSection === 'quicklink' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('quicklink') && <QuickLink user={user} />}
        </div>
        <div className={activeSection === 'profile' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('profile') && <ProfileSettings token={token} user={user} fetchUserProfile={fetchUserProfile} />}
        </div>

        {/* Administration Dummy Panels */}
        <div className={activeSection === 'admin-users' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('admin-users') && <div className="p-6 glass-panel rounded-2xl">Admin: Manage Users (Coming Soon)</div>}
        </div>
        <div className={activeSection === 'admin-links' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('admin-links') && <div className="p-6 glass-panel rounded-2xl">Admin: All Links (Coming Soon)</div>}
        </div>
        <div className={activeSection === 'admin-withdraws' ? 'block fade-in' : 'hidden'}>
          {mountedTabs.includes('admin-withdraws') && <div className="p-6 glass-panel rounded-2xl">Admin: Withdrawals (Coming Soon)</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* 4. Mobile Top Navbar with Missing Crown Icon Fixed */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-[var(--bg-body)] border-b border-[var(--glass-border)] p-4 flex items-center justify-between shadow-md">
        <button onClick={() => setIsMobileOpen(true)} className="text-2xl text-[var(--text-primary)] p-2">
          <i className="fas fa-bars"></i>
        </button>
        
        {/* Original Logo added for mobile view */}
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
             <i className="fas fa-crown text-sm"></i>
           </div>
           <h1 className="text-lg font-bold tracking-wide">URLKING</h1>
        </div>
        
        <div className="w-8"></div> {/* Spacer to keep title centered */}
      </div>

      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen}
        user={user} 
      />
      <main className="md:ml-72 p-4 md:p-10 pt-24 min-h-screen relative z-10 overflow-x-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
