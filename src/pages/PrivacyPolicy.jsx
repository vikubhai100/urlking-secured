import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Particles from '../components/Particles';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-secondary)] font-sans flex flex-col transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none z-0"><Particles /></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow max-w-4xl mx-auto px-6 py-32 w-full fade-in">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-4">Privacy <span className="text-indigo-500">Policy</span></h1>
            <p className="text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] p-8 rounded-3xl shadow-xl space-y-8 leading-relaxed text-sm md:text-base">
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><i className="fas fa-shield-alt text-indigo-500"></i> 1. Information We Collect</h2>
              <p>At URL KING, we collect information to provide better services to all our users. When you register, we collect your Email, Username, and IP address. We also store the URLs you shorten and the files you upload via our Telegram Bot or Web Dashboard.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><i className="fas fa-database text-indigo-500"></i> 2. How We Use Information</h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>To provide, maintain, and improve our URL shortening and file hosting services.</li>
                <li>To process your withdrawal requests and manage your wallet balance.</li>
                <li>To prevent fraudulent activities, fake clicks, or bot traffic.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><i className="fas fa-cookie-bite text-indigo-500"></i> 3. Cookies & Tracking</h2>
              <p>We use cookies to keep you logged in and to track the source of clicks on your shortened links. Our advertising partners may also use cookies to serve personalized ads to the visitors of your links.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><i className="fas fa-user-secret text-indigo-500"></i> 4. Data Security</h2>
              <p>We use industry-standard encryption and Firebase Authentication to protect your account details. However, please remember that no method of transmission over the internet is 100% secure.</p>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default PrivacyPolicy;
