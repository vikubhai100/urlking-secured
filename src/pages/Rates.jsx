import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Particles from '../components/Particles';

const Rates = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // 🟢 Payout Rates Data (Optimized based on AdSense RPM)
  const ratesData = [
    { code: 'us', name: 'United States', cpm: 5.00, specialNote: true },
    { code: 'gb', name: 'United Kingdom', cpm: 5.00, specialNote: true },
    { code: 'ca', name: 'Canada', cpm: 5.00, specialNote: true },
    { code: 'au', name: 'Australia', cpm: 5.00, specialNote: true },
    { code: 'de', name: 'Germany', cpm: 4.00 },
    { code: 'ch', name: 'Switzerland', cpm: 4.00 },
    { code: 'fr', name: 'France', cpm: 3.50 },
    { code: 'se', name: 'Sweden', cpm: 3.50 },
    { code: 'nl', name: 'Netherlands', cpm: 3.00 },
    { code: 'no', name: 'Norway', cpm: 3.00 },
    { code: 'dk', name: 'Denmark', cpm: 3.00 },
    { code: 'fi', name: 'Finland', cpm: 3.00 },
    { code: 'es', name: 'Spain', cpm: 3.00 },
    { code: 'it', name: 'Italy', cpm: 3.00 },
    { code: 'nz', name: 'New Zealand', cpm: 3.00 },
    { code: 'ae', name: 'United Arab Emirates', cpm: 3.00 },
    { code: 'sa', name: 'Saudi Arabia', cpm: 3.00 },
    { code: 'sg', name: 'Singapore', cpm: 3.00 },
    { code: 'za', name: 'South Africa', cpm: 3.00 },
    { code: 'in', name: 'India', cpm: 3.00 },
    { code: 'br', name: 'Brazil', cpm: 3.00 },
    { code: 'mx', name: 'Mexico', cpm: 3.00 },
    { code: 'id', name: 'Indonesia', cpm: 3.00 },
    { code: 'pk', name: 'Pakistan', cpm: 3.00 },
    { code: 'bd', name: 'Bangladesh', cpm: 3.00 },
    { code: 'ph', name: 'Philippines', cpm: 3.00 },
    { code: 'ng', name: 'Nigeria', cpm: 3.00 },
    { code: 'tr', name: 'Turkey', cpm: 3.00 },
    { code: 'eg', name: 'Egypt', cpm: 3.00 },
    { code: 'vn', name: 'Vietnam', cpm: 3.00 },
    { code: 'ru', name: 'Russia', cpm: 3.00 },
    { code: 'th', name: 'Thailand', cpm: 3.00 },
    { code: 'my', name: 'Malaysia', cpm: 3.00 },
    { code: 'ar', name: 'Argentina', cpm: 3.00 },
    { code: 'co', name: 'Colombia', cpm: 3.00 },
    { code: 'pe', name: 'Peru', cpm: 3.00 },
    { code: 've', name: 'Venezuela', cpm: 3.00 },
    { code: 'cl', name: 'Chile', cpm: 3.00 }
  ];

  // Search Filter Logic
  const filteredRates = ratesData.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-body)] text-[var(--text-primary)] transition-colors duration-300">

      {/* Ambient Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles />
      </div>

      {/* Standard Header */}
      <div className="relative z-20">
        <Header />
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-20 md:py-28 relative z-10 fade-in mt-16 lg:mt-0">

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black mb-4 tracking-tight leading-tight">
            Publisher <span className="text-indigo-500">Payout Rates</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Our rates are calculated per 1000 unique downloads. Quality traffic is rewarded with the industry's best CPM.
          </p>
        </div>

        {/* 🟢 SPECIAL NOTE FOR HIGH TIER COUNTRIES (USA, UK, etc.) */}
        <div className="max-w-xl mx-auto mb-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex gap-3 text-sm md:text-base">
          <i className="fas fa-info-circle text-blue-400 mt-1"></i>
          <div>
            <strong className="text-blue-400 block mb-1">Notice for US, UK, CA, and AU Users:</strong>
            <span className="text-slate-300">If your main traffic is from high-tier countries (marked with ★), please <a href="https://t.me/vikubhai01" target="_blank" rel="noreferrer" className="text-white font-bold underline hover:text-indigo-300 transition-colors">Contact Support</a> after creating your account to get your premium rates unlocked.</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-10">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
            <i className="fas fa-search text-lg"></i>
          </div>
          <input 
            type="text" 
            placeholder="Search for your country..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-[var(--input-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] rounded-full focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all font-medium text-base shadow-lg"
          />
        </div>

        {/* Rates Table */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-[var(--glass-border)]">
          <div className="max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 bg-[var(--bg-card)] backdrop-blur-xl z-10 shadow-sm border-b border-[var(--glass-border)]">
                <tr>
                  <th className="py-5 px-6 font-bold text-slate-400 uppercase tracking-wider text-xs">Country</th>
                  <th className="py-5 px-6 font-bold text-slate-400 uppercase tracking-wider text-xs">Desktop CPM</th>
                  <th className="py-5 px-6 font-bold text-slate-400 uppercase tracking-wider text-xs">Mobile / Tablet CPM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)] text-sm">

                {/* Render Searched Countries */}
                {filteredRates.length > 0 ? (
                  filteredRates.map((country) => (
                    <tr key={country.code} className="hover:bg-[var(--nav-hover)] transition-colors">
                      <td className="py-4 px-6 font-bold flex items-center gap-3 text-[var(--text-primary)] text-base">
                        <img 
                          src={`https://flagcdn.com/w40/${country.code}.png`} 
                          alt={`${country.name} flag`} 
                          className="w-8 rounded shadow-sm"
                        />
                        {country.name} 
                        {/* Star icon for special note countries */}
                        {country.specialNote && <i className="fas fa-star text-amber-400 text-xs ml-1" title="Special Premium Rate"></i>}
                      </td>
                      <td className="py-4 px-6 font-black text-indigo-500 text-lg">
                        ${country.cpm.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 font-black text-indigo-500 text-lg">
                        ${country.cpm.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  /* No Results State */
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-slate-400">
                      <i className="fas fa-globe text-4xl mb-4 opacity-30 text-[var(--text-primary)]"></i>
                      <p className="text-lg">No country found matching "<span className="text-[var(--text-primary)] font-bold">{searchQuery}</span>"</p>
                      <p className="mt-2 text-sm">Don't worry, it falls under our Worldwide Deal.</p>
                    </td>
                  </tr>
                )}

                {/* Worldwide Deal (Always visible at the bottom) */}
                <tr className="bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors border-t border-[var(--glass-border)]">
                  <td className="py-5 px-6 font-black flex items-center gap-3 text-[var(--text-primary)] text-base">
                    <div className="w-8 flex justify-center items-center">
                      <i className="fas fa-globe-americas text-2xl text-indigo-500"></i>
                    </div>
                    Worldwide Deal (All Others)
                  </td>
                  <td className="py-5 px-6 font-black text-indigo-500 text-lg">
                    $3.00
                  </td>
                  <td className="py-5 px-6 font-black text-indigo-500 text-lg">
                    $3.00
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Standard Footer */}
      <div className="relative z-20 mt-auto">
        <Footer />
      </div>

    </div>
  );
};

export default Rates;
