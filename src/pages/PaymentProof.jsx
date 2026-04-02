import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Particles from '../components/Particles';

const PaymentProof = () => {
  // Methods Data
  const methods = [
    { name: 'Google Pay', region: 'India', icon: 'fab fa-google-pay', hoverColor: 'group-hover:text-[#EA4335]' },
    { name: 'Phone Pe', region: 'India', icon: 'fas fa-mobile-alt', hoverColor: 'group-hover:text-purple-500' },
    { name: 'UPI', region: 'India', icon: 'fas fa-qrcode', hoverColor: 'group-hover:text-orange-500' },
    { name: 'PayPal', region: 'Global', icon: 'fab fa-paypal', hoverColor: 'group-hover:text-[#00457C]' },
    { name: 'bKash', region: 'Bangladesh', icon: 'fas fa-wallet', hoverColor: 'group-hover:text-pink-500' },
    { name: 'Nagad', region: 'Bangladesh', icon: 'fas fa-money-bill-wave', hoverColor: 'group-hover:text-red-500' },
    { name: 'Binance', region: 'Global (Crypto)', icon: 'fab fa-btc', hoverColor: 'group-hover:text-[#F3BA2F]' },
    { name: 'Bank Transfer', region: 'Global', icon: 'fas fa-university', hoverColor: 'group-hover:text-emerald-500' },
    { name: 'Redeem Code', region: 'India', icon: 'fas fa-gift', hoverColor: 'group-hover:text-indigo-400' },
  ];

  // Proofs Data
  const proofs = [
    { id: 1, amount: 'RS:315', img: 'https://i.ibb.co/dR4KH9p/IMG-20260326-172254-536.jpg' },
    { id: 2, amount: 'RS:2000.00', img: 'https://i.ibb.co/fzT5f6Cy/IMG-20260402-152124-640.jpg' },
    { id: 3, amount: 'RS:400.00', img: 'https://i.ibb.co/p6yRqb9G/IMG-20260326-172247-081.jpg' },
    { id: 4, amount: 'RS:430.00', img: 'https://i.ibb.co/yFwjCHMQ/IMG-20260329-WA0017.jpg' },
  ];

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

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28 relative z-10 fade-in mt-16 lg:mt-0">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black mb-4 tracking-tight leading-tight">
            Trusted & Fast <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Payouts</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            We believe in 100% transparency. Withdraw your earnings via your favorite payment method securely and on time.
          </p>
        </div>

        {/* Telegram Banner */}
        <div className="bg-gradient-to-br from-[#0088cc] to-[#005580] rounded-[24px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-white shadow-[0_20px_40px_rgba(0,136,204,0.3)] mb-20 relative overflow-hidden group">
          <i className="fab fa-telegram-plane absolute -right-10 -top-10 text-[15rem] opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500"></i>
          
          <div className="relative z-10 text-center md:text-left mb-6 md:mb-0 max-w-xl">
            <h2 className="text-3xl font-black mb-3">Join Our Telegram Channel</h2>
            <p className="text-lg text-white/90 font-medium">Get daily live payment proofs, high CPM updates, and 24/7 support directly from our team.</p>
          </div>
          
          <a href="https://t.me/+S2vrsykMmQVjMjE9" target="_blank" rel="noreferrer" className="relative z-10 bg-white text-[#0088cc] px-8 py-4 rounded-full font-black text-lg shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(0,0,0,0.2)] transition-all flex items-center gap-3">
            <i className="fab fa-telegram-plane text-xl"></i> Join Now
          </a>
        </div>

        {/* Supported Payment Methods */}
        <h2 className="text-3xl font-black text-center mb-10 text-[var(--text-primary)]">Supported Payment Methods</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-20">
          {methods.map((method, index) => (
            <div key={index} className="glass-panel p-6 md:p-8 rounded-[24px] text-center hover:-translate-y-2 hover:border-indigo-500/50 transition-all duration-300 group cursor-default shadow-lg">
              <i className={`${method.icon} text-4xl mb-4 text-indigo-500 transition-colors duration-300 ${method.hoverColor}`}></i>
              <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1">{method.name}</h4>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{method.region}</div>
            </div>
          ))}
        </div>

        {/* Recent Payouts Gallery */}
        <h2 className="text-3xl font-black text-center mb-10 text-[var(--text-primary)]">Recent Payouts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-md sm:max-w-full mx-auto mb-10">
          {proofs.map((proof) => (
            <div key={proof.id} className="glass-panel p-3 rounded-[24px] hover:-translate-y-2 hover:border-indigo-500/50 transition-all duration-300 group shadow-lg">
              <div className="aspect-[9/16] bg-[var(--nav-hover)] rounded-xl overflow-hidden mb-4 relative">
                <img 
                  src={proof.img} 
                  alt={`Payment Proof ${proof.id}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x700/6366f1/ffffff?text=Proof+Image'; }}
                />
              </div>
              <div className="px-2 pb-2 flex justify-between items-center">
                <span className="font-black text-xl text-emerald-500">{proof.amount}</span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <i className="fas fa-check-circle"></i> Paid
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <p className="text-slate-400 font-medium">Join our Telegram channel to view thousands of daily payout proofs.</p>
        </div>

      </main>

      {/* Standard Footer */}
      <div className="relative z-20 mt-auto">
        <Footer />
      </div>

    </div>
  );
};

export default PaymentProof;
