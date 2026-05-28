import React from 'react';
import { showToast } from '../../toast'; // Premium Toast

const QuickLink = ({ user }) => {
  // Use Env Variables if available, else fallback to hardcoded
  const API_BASE = import.meta.env.VITE_API_URL || "https://go.urlking.site";
  const userToken = user?.api_token || 'YOUR_TOKEN';
  // 🔒 SECURITY: Mask token for display
  const maskedToken = userToken !== 'YOUR_TOKEN' && userToken.length > 12
    ? `${userToken.slice(0, 6)}${'*'.repeat(userToken.length - 10)}${userToken.slice(-4)}`
    : userToken;

  const copyToClipboard = (text, type) => {
    if (!text) return showToast("Nothing to copy", "error");
    navigator.clipboard.writeText(text);
    showToast(`${type} Copied!`, "success");
  };

  // Code Snippets
  const rawLink = `${API_BASE}/st?api=${userToken}&url=yourdestinationlink.com`;

  const htmlExample = `<a href="${API_BASE}/st?api=${userToken}&url=google.com">
    Go to Google
</a>`;

  const phpExample = `<?php
$apiToken = "${userToken}";
$targetUrl = urlencode("https://google.com");
$quickLink = "${API_BASE}/st?api={$apiToken}&url={$targetUrl}";

// Redirect the user immediately to the shortened URL
header("Location: " . $quickLink);
exit();
?>`;

  const nodeExample = `const express = require('express');
const app = express();

app.get('/go-out', (req, res) => {
  const apiToken = "${userToken}";
  const targetUrl = encodeURIComponent("https://google.com");
  const quickLink = \`${API_BASE}/st?api=\${apiToken}&url=\${targetUrl}\`;

  // Redirect the user immediately
  res.redirect(quickLink);
});

app.listen(3000, () => console.log('Server running on port 3000'));`;

  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Quick Link API</h2>
      <p className="mb-8 text-slate-400">Instant shortening and redirection for simple scripts.</p>

      {/* INFO BANNER */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-8">
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-4">
          <i className="fas fa-bolt text-indigo-500 text-xl mt-1"></i>
          <div>
            <h4 className="font-bold mb-1" style={{color: 'var(--text-primary)'}}>What is this?</h4>
            <p className="text-sm text-slate-400">
              Unlike the standard JSON API, the Quick Link endpoint (`/st`) does not return data. Instead, it creates the short link in the background and <strong>redirects the user immediately</strong> to the destination.
            </p>
          </div>
        </div>

        {/* RAW ENDPOINT */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-400">Raw Usage</h4>
          <div className="relative group">
            <button 
              onClick={() => copyToClipboard(rawLink, 'Link')} 
              className="absolute top-1/2 -translate-y-1/2 right-3 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <i className="fas fa-copy text-xs"></i>
            </button>
            <div className="p-4 bg-[#0d1117] border border-[var(--glass-border)] rounded-lg font-mono text-indigo-400 text-sm overflow-x-auto whitespace-nowrap pr-12">
               {API_BASE}/st?api=<span className="text-white">{maskedToken}</span>&url=<span className="text-emerald-400">yourdestinationlink.com</span>
            </div>
          </div>
        </div>

        {/* EXAMPLES GRID */}
        <div className="space-y-6 pt-4 border-t border-[var(--glass-border)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Integration Examples</h3>

          {/* HTML */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-400 flex items-center gap-2">
              <i className="fab fa-html5 text-orange-500 text-lg"></i> HTML (Direct Link)
            </h4>
            <div className="relative group">
              <button 
                onClick={() => copyToClipboard(htmlExample, 'HTML Code')} 
                className="absolute top-3 right-3 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <i className="fas fa-copy text-xs"></i>
              </button>
              <pre className="p-4 bg-[#0d1117] border border-[var(--glass-border)] rounded-lg font-mono text-blue-400 text-sm overflow-x-auto">
                <code>{htmlExample}</code>
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PHP */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-400 flex items-center gap-2">
                <i className="fab fa-php text-indigo-400 text-lg"></i> PHP (Redirection)
              </h4>
              <div className="relative group">
                <button 
                  onClick={() => copyToClipboard(phpExample, 'PHP Code')} 
                  className="absolute top-3 right-3 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fas fa-copy text-xs"></i>
                </button>
                <pre className="p-4 bg-[#0d1117] border border-[var(--glass-border)] rounded-lg font-mono text-slate-300 text-xs overflow-x-auto h-[220px] overflow-y-auto">
                  <code>{phpExample}</code>
                </pre>
              </div>
            </div>

            {/* NODE.JS */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-400 flex items-center gap-2">
                <i className="fab fa-node-js text-green-500 text-lg"></i> Node.js (Express)
              </h4>
              <div className="relative group">
                <button 
                  onClick={() => copyToClipboard(nodeExample, 'Node.js Code')} 
                  className="absolute top-3 right-3 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fas fa-copy text-xs"></i>
                </button>
                <pre className="p-4 bg-[#0d1117] border border-[var(--glass-border)] rounded-lg font-mono text-slate-300 text-xs overflow-x-auto h-[220px] overflow-y-auto">
                  <code>{nodeExample}</code>
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuickLink;
