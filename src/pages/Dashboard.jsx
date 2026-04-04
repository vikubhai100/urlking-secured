import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import UploadFile from '../components/dashboard/UploadFile';
import ManageFiles from '../components/dashboard/ManageFiles';
import LinkHistory from '../components/dashboard/LinkHistory';
import Withdraw from '../components/dashboard/Withdraw';
import Referrals from '../components/dashboard/Referrals';
import DeveloperApi from '../components/dashboard/DeveloperApi';
import QuickLink from '../components/dashboard/QuickLink';
import MassShrinker from '../components/dashboard/MassShrinker'; 
import FullPageScript from '../components/dashboard/FullPageScript'; 
import ProfileSettings from '../components/dashboard/ProfileSettings';
import Help from '../components/dashboard/Help'; 
import Changepass from '../components/dashboard/Changepass';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('v') || 'create';

  const setActiveSection = (tabId) => {
    setSearchParams({ v: tabId });
  };

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 Optimized Keep-Alive: Sirf 'upload' ko track karenge
  const [isUploadMounted, setIsUploadMounted] = useState(false);

  useEffect(() => {
    if (activeSection === 'upload') {
      setIsUploadMounted(true);
    }
  }, [activeSection]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchUserProfile();
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API}/api/me`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
      if (!res.ok) {
        if (res.status === 401) { localStorage.clear(); navigate('/login'); }
        throw new Error("Failed to fetch profile");
      }
      const data = await res.json();

      let balance = 0;
      try {
        const bRes = await fetch(`${API}/api/wallet/balance`, { headers: { 'Authorization': `Bearer ${token}` } });
        const bData = await bRes.json();
        balance = bData.balance || 0;
      } catch (e) { }

      setUser({ ...data, balance });
      setIsLoading(false);
    } catch (err) { setIsLoading(false); }
  };

  const renderContent = () => {
    if (isLoading || !user) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="relative w-full">
        
        {/* 🟢 UPLOAD TAB: Isko 'hidden' logic se manage karenge taaki background me chalta rahe */}
        <div className={activeSection === 'upload' ? 'block fade-in' : 'hidden'}>
          {isUploadMounted && <UploadFile token={token} user={user} isActive={activeSection === 'upload'} />}
        </div>

        {/* 🟢 BAAKI TABS: Inko direct render karenge taaki switch karne par fresh reload ho jayein */}
        {activeSection === 'create' && <DashboardOverview token={token} user={user} isActive={true} />}
        {activeSection === 'files' && <ManageFiles token={token} isActive={true} />}
        {activeSection === 'history' && <LinkHistory token={token} isActive={true} />}
        {activeSection === 'withdraw' && <Withdraw token={token} user={user} isActive={true} />}
        {activeSection === 'referrals' && <Referrals token={token} isActive={true} />}
        {activeSection === 'api' && <DeveloperApi token={token} user={user} fetchUserProfile={fetchUserProfile} isActive={true} />}
        {activeSection === 'quicklink' && <QuickLink user={user} isActive={true} />}
        {activeSection === 'mass-shrinker' && <MassShrinker token={token} isActive={true} />}
        {activeSection === 'full-page' && <FullPageScript user={user} isActive={true} />}
        {activeSection === 'profile' && <ProfileSettings token={token} user={user} fetchUserProfile={fetchUserProfile} isActive={true} />}
        {activeSection === 'changepass' && <Changepass token={token} isActive={true} />}
        {activeSection === 'support' && <Help user={user} isActive={true} />}

        {activeSection === 'admin-users' && <div className="p-6 glass-panel rounded-2xl text-white font-bold">Admin: Manage Users (Coming Soon)</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-[var(--bg-body)] border-b border-[var(--glass-border)] p-4 flex items-center justify-between shadow-md">
        <button onClick={() => setIsMobileOpen(true)} className="text-2xl text-[var(--text-primary)] p-2">
          <i className="fas fa-bars"></i>
        </button>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">K</div>
           <h1 className="text-lg font-bold tracking-wide">URLKING</h1>
        </div>
        <div className="flex items-center gap-2 pr-1">
          <button onClick={() => setActiveSection('create')} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${activeSection === 'create' ? 'bg-indigo-500 text-white shadow-md' : 'bg-indigo-500/10 text-indigo-500'}`}><i className="fas fa-link text-sm"></i></button>
          <button onClick={() => setActiveSection('upload')} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${activeSection === 'upload' ? 'bg-pink-500 text-white shadow-md' : 'bg-pink-500/10 text-pink-500'}`}><i className="fas fa-cloud-upload-alt text-sm"></i></button>
        </div>
      </div>

      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} user={user} />

      <main className="md:ml-72 p-4 md:p-10 pt-24 min-h-screen flex flex-col relative z-10 overflow-x-hidden">
        <div className="flex-grow">
          {renderContent()}
        </div>

        <footer className="mt-12 pt-6 pb-2 border-t border-[var(--glass-border)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
          <p>&copy; {new Date().getFullYear()} URLKING. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-indigo-400">Privacy Policy</a>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <a href="/dmca" className="hover:text-indigo-400">DMCA</a>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <a href="/terms" className="hover:text-indigo-400">Terms</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
