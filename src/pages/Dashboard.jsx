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
  
  // 🚀 PREFETCH MAGIC: Pehle cache check karo taaki initial state blank na ho
  const cachedProfile = sessionStorage.getItem('urlking_profile_cache');
  const [user, setUser] = useState(cachedProfile ? JSON.parse(cachedProfile) : null);
  
  // Agar cache me data hai, toh loading screen nahi dikhegi!
  const [isLoading, setIsLoading] = useState(!cachedProfile);

  // Optimized Keep-Alive: Sirf 'upload' ko track karenge
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
    if (!token) { 
      navigate('/login'); 
      return; 
    }
    // Hamesha background me fresh data mangwao
    fetchUserProfile();
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      // 1. Fetch Profile Data
      const res = await fetch(`${API}/api/me`, { 
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Accept': 'application/json' 
        } 
      });
      
      if (!res.ok) {
        if (res.status === 401) { 
          localStorage.clear(); 
          sessionStorage.clear();
          navigate('/login'); 
        }
        throw new Error("Failed to fetch profile");
      }
      
      const data = await res.json();

      // 2. Fetch Balance Data
      let balance = 0;
      try {
        const bRes = await fetch(`${API}/api/wallet/balance`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        const bData = await bRes.json();
        balance = bData.balance || 0;
      } catch (e) {
        console.error("Balance fetch error:", e);
      }

      // Combine Data
      const finalUserData = { ...data, balance };
      
      // 🚀 Save to State & Cache
      setUser(finalUserData);
      sessionStorage.setItem('urlking_profile_cache', JSON.stringify(finalUserData));
      
    } catch (err) { 
      console.error(err);
    } finally {
      setIsLoading(false); // Spinner off
    }
  };

  const renderContent = () => {
    if (isLoading && !user) {
      return (
        <div className="flex items-center justify-center h-[60vh] fade-in">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="relative w-full">

        {/* UPLOAD TAB: Isko 'hidden' logic se manage karenge taaki background me chalta rahe */}
        <div className={activeSection === 'upload' ? 'block fade-in' : 'hidden'}>
          {isUploadMounted && <UploadFile token={token} user={user} isActive={activeSection === 'upload'} />}
        </div>

        {/* BAAKI TABS: Inko direct render karenge taaki switch karne par fresh reload ho jayein */}
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

        {activeSection === 'admin-users' && (
          <div className="p-6 bg-[var(--glass-panel)] border border-[var(--glass-border)] rounded-2xl text-[var(--text-primary)] font-bold text-center">
            Admin Area is now in the main Admin Console app.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-primary)] transition-colors duration-300">

      {/* 📱 MOBILE HEADER WITH CROWN 👑 LOGO RESTORED */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-[var(--bg-body)] border-b border-[var(--glass-border)] p-4 flex items-center justify-between shadow-md">
        
        <button onClick={() => setIsMobileOpen(true)} className="text-xl text-[var(--text-primary)] w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--nav-hover)] hover:bg-[var(--glass-panel)] transition-colors">
          <i className="fas fa-bars"></i>
        </button>

        <div className="flex items-center gap-2">
           {/* 🟢 Crown Logo */}
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]">
             <i className="fas fa-crown text-sm"></i>
           </div>
           <h1 className="text-lg font-bold tracking-wide text-[var(--text-primary)]">URLKING</h1>
        </div>

        <div className="flex items-center gap-2 pr-1">
          <button 
            onClick={() => setActiveSection('create')} 
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${activeSection === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-500/10 text-indigo-500'}`}
          >
            <i className="fas fa-link text-sm"></i>
          </button>
          
          {user?.can_upload ? (
            <button 
              onClick={() => setActiveSection('upload')} 
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${activeSection === 'upload' ? 'bg-purple-600 text-white shadow-md' : 'bg-purple-500/10 text-purple-500'}`}
            >
              <i className="fas fa-cloud-upload-alt text-sm"></i>
            </button>
          ) : null}
        </div>
      </div>

      {/* SIDEBAR COMPONENT */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        user={user} 
      />

      {/* MAIN CONTENT */}
      <main className="md:ml-72 p-4 md:p-8 pt-24 min-h-screen flex flex-col relative z-10 overflow-x-hidden">
        <div className="flex-grow">
          {renderContent()}
        </div>

        {/* FOOTER */}
        <footer className="mt-12 pt-6 pb-2 border-t border-[var(--glass-border)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-[var(--text-secondary)]">
          <p>&copy; {new Date().getFullYear()} URLKING. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-indigo-500 transition-colors">Privacy Policy</a>
            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] opacity-50"></span>
            <a href="/dmca" className="hover:text-indigo-500 transition-colors">DMCA</a>
            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] opacity-50"></span>
            <a href="/terms" className="hover:text-indigo-500 transition-colors">Terms</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
