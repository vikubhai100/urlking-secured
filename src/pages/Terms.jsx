import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto px-6 py-32 w-full fade-in">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Terms of <span className="text-indigo-500">Service</span></h1>
          <p className="text-slate-400">Rules and Guidelines for using URL KING</p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 p-8 rounded-3xl shadow-xl space-y-8 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By registering an account and using URL KING (including our Web Dashboard and Telegram Bot), you agree to comply with these Terms of Service. If you do not agree, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Prohibited Content</h2>
            <p>You are strictly prohibited from shortening links or uploading files that contain:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-red-400">
              <li>Child exploitation material (Zero-tolerance policy).</li>
              <li>Malware, viruses, or phishing scams.</li>
              <li>Terrorist or extremist content.</li>
              <li>Illegal drugs or weapon sales.</li>
            </ul>
            <p className="mt-2 text-xs">Accounts violating this rule will be permanently banned without payout.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Earnings and Payouts</h2>
            <p>URL KING pays publishers for valid clicks on their short links. We use a strict fraud-detection system. Attempting to manipulate views using bots, proxies, VPNs, or iframe traffic will result in account suspension. Payouts are processed within the time frame specified on your dashboard once the minimum threshold is met.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Limitation of Liability</h2>
            <p>URL KING is provided "as is". We are not responsible for any data loss, server downtime, or loss of revenue. Users are responsible for maintaining backups of their own uploaded files.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
