import React, { useState, useEffect } from 'react';
import { showToast } from '../../toast'; // Premium Toast Import kiya gaya hai

const LinkHistory = ({ token }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Example logic for fetching links (Aap apne backend ke hisaab se adjust kar sakte hain)
  /*
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://go.urlking.site/api/links", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLinks(data.links || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  */

  // Dummy data for visual representation (Jab tak original API connect na ho)
  const dummyLinks = [
    { id: 1, shortUrl: 'https://look.mypdftools.site/aB3x9', originalUrl: 'https://youtube.com/watch?v=123', clicks: 1450, date: '29/03/2026' },
    { id: 2, shortUrl: 'https://look.mypdftools.site/kL9p2', originalUrl: 'https://drive.google.com/file/d/abc', clicks: 890, date: '28/03/2026' },
    { id: 3, shortUrl: 'https://look.mypdftools.site/mZ8x1', originalUrl: 'https://mega.nz/file/xyz', clicks: 3200, date: '25/03/2026' }
  ];

  const displayLinks = links.length > 0 ? links : dummyLinks;

  // TOAST FIX: Copy function
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    showToast("Link Copied Successfully!", "success"); // NATIVE ALERT REMOVED
  };

  // TOAST FIX: Delete function
  const handleDelete = (id) => {
    // Yahan API delete logic aayega
    showToast("Link moved to trash", "success");
  };

  return (
    <div className="glass-panel p-6 rounded-[24px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Links History</h2>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <i className="fas fa-search"></i>
          </div>
          <input 
            type="text" 
            placeholder="Search links..." 
            className="w-full pl-10 pr-4 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[var(--glass-border)] text-slate-400 text-xs uppercase tracking-wider">
              <th className="pb-3 px-4 font-semibold">Short Link</th>
              <th className="pb-3 px-4 font-semibold">Original URL</th>
              <th className="pb-3 px-4 font-semibold text-center">Clicks</th>
              <th className="pb-3 px-4 font-semibold">Date</th>
              <th className="pb-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayLinks.map((link) => (
              <tr key={link.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--nav-hover)] transition-colors">
                {/* Short Link */}
                <td className="py-4 px-4 text-sm font-medium text-indigo-400">
                  <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                    {link.shortUrl.replace('https://', '')}
                    <i className="fas fa-external-link-alt text-xs"></i>
                  </a>
                </td>
                
                {/* Original URL (Truncated) */}
                <td className="py-4 px-4 text-sm text-slate-400 max-w-[200px] truncate" title={link.originalUrl}>
                  {link.originalUrl}
                </td>
                
                {/* Clicks */}
                <td className="py-4 px-4 text-sm font-bold text-[var(--text-primary)] text-center">
                  <div className="inline-flex items-center gap-1.5 bg-[var(--nav-hover)] px-2.5 py-1 rounded-lg border border-[var(--glass-border)]">
                    <i className="fas fa-chart-line text-emerald-400 text-xs"></i>
                    {link.clicks.toLocaleString()}
                  </div>
                </td>
                
                {/* Date */}
                <td className="py-4 px-4 text-sm text-slate-400">
                  {link.date}
                </td>
                
                {/* Actions */}
                <td className="py-4 px-4 flex justify-end gap-2">
                  <button onClick={() => copyToClipboard(link.shortUrl)} className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center tooltip-trigger" title="Copy Link">
                    <i className="far fa-copy"></i>
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors flex items-center justify-center tooltip-trigger" title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(link.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center tooltip-trigger" title="Delete">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {displayLinks.length === 0 && !loading && (
          <div className="py-10 text-center text-slate-400">
            <i className="fas fa-link text-4xl mb-3 opacity-20"></i>
            <p>No links found. Create your first short link!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkHistory;
