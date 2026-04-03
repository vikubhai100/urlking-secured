import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DMCA = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto px-6 py-32 w-full fade-in">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-2xl text-red-500"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">DMCA <span className="text-red-500">Policy</span></h1>
          <p className="text-slate-400">Report Copyright Infringement & Abuse</p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 p-8 rounded-3xl shadow-xl space-y-6 leading-relaxed text-sm md:text-base">
          <p>
            URL KING is a URL shortener and intermediary service. We do not host any files on our own servers. Files are hosted on third-party cloud servers. However, we take copyright infringement very seriously and will disable or remove any short link that redirects to copyrighted material.
          </p>

          <div className="bg-red-500/5 border-l-4 border-red-500 p-4 rounded-r-lg">
            <h3 className="font-bold text-white mb-2">How to file a DMCA Notice:</h3>
            <p>If you believe that your copyrighted work has been copied and is accessible via a URL KING link in a way that constitutes copyright infringement, please provide us with a written notice containing the following:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-slate-400">
              <li>A physical or electronic signature of the copyright owner.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li><strong>The exact URL KING short link(s)</strong> (e.g., https://go.urlking.site/abcde) pointing to the infringing material.</li>
              <li>Your contact information (Email address).</li>
            </ul>
          </div>

          <p className="text-center mt-8">
            Please send your complete DMCA takedown notice to: <br/>
            <a href="mailto:abuse@urlking.site" className="text-indigo-400 font-bold text-lg hover:underline mt-2 inline-block">abuse@urlking.site</a>
          </p>
          <p className="text-xs text-center text-slate-500 mt-2">Please allow 24-48 hours for our team to review and remove the reported links.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DMCA;
