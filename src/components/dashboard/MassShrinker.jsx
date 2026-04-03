import React, { useState } from 'react';
import { showToast } from '../../toast'; 

const MassShrinker = ({ token, isActive }) => {
  const [urls, setUrls] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  const handleMassShrink = async () => {
    // Khaali lines aur spaces hata do
    const urlList = urls.split('\n').map(url => url.trim()).filter(url => url !== '');

    if (urlList.length === 0) {
      return showToast("Please enter at least one URL", "error");
    }
    if (urlList.length > 20) {
      return showToast("You can only shrink up to 20 URLs at a time", "error");
    }

    setIsLoading(true);
    setShortenedUrls('');

    try {
      const res = await fetch(`${API}/api/mass-create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ urls: urlList })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to shrink URLs");

      // Result ko wapas string banayenge textarea me dikhane ke liye
      const resultString = data.shortLinks.join('\n');
      setShortenedUrls(resultString);
      showToast("All links shrunk successfully!", "success");

    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shortenedUrls) return;
    navigator.clipboard.writeText(shortenedUrls);
    showToast("Copied to clipboard!", "success");
  };

  if (!isActive) return null;

  return (
    <div className="fade-in max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
          <i className="fas fa-compress-arrows-alt text-indigo-500"></i> Mass Shrinker
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Shrink up to 20 URLs at once. Paste one URL per line.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Area */}
        <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] p-6 rounded-2xl shadow-sm">
          <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Original URLs</label>
          <textarea 
            rows="10" 
            placeholder="https://example.com&#10;https://google.com" 
            className="w-full p-4 input-premium rounded-xl text-sm font-mono whitespace-nowrap overflow-x-auto resize-none"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
          ></textarea>
          <button 
            onClick={handleMassShrink}
            disabled={isLoading || !urls}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-lg flex justify-center items-center gap-2"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
            {isLoading ? "Shrinking..." : "Shrink All Links"}
          </button>
        </div>

        {/* Output Area */}
        <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-[var(--text-primary)]">Shortened URLs</label>
            <button onClick={copyToClipboard} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
              <i className="fas fa-copy mr-1"></i> Copy All
            </button>
          </div>
          <textarea 
            rows="10" 
            readOnly 
            placeholder="Your short links will appear here..." 
            className="w-full p-4 input-premium rounded-xl text-sm font-mono text-green-400 whitespace-nowrap overflow-x-auto resize-none bg-slate-900/50"
            value={shortenedUrls}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default MassShrinker;
