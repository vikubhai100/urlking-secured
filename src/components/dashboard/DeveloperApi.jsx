import React, { useState } from 'react';
import { showToast } from '../../toast'; // Premium Toast

const DeveloperApi = ({ token, user, fetchUserProfile }) => {
  const [resetModal, setResetModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Use Env Variables if available, else fallback to hardcoded
  const API_BASE = import.meta.env.VITE_API_URL || "https://go.urlking.site";
  const userToken = user?.api_token || 'YOUR_TOKEN';
  // 🔒 SECURITY: Mask token for display (show first 6 + last 4 chars)
  const maskedToken = userToken !== 'YOUR_TOKEN' && userToken.length > 12
    ? `${userToken.slice(0, 6)}${'*'.repeat(userToken.length - 10)}${userToken.slice(-4)}`
    : userToken;

  const handleReset = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/regenerate-key`, { 
        method: "POST", 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) { 
        showToast("New API Key generated successfully!", "success"); 
        fetchUserProfile(); 
        setResetModal(false);
      } else { 
        showToast("Failed to regenerate key", "error"); 
      }
    } catch { 
      showToast("Server error while regenerating key", "error"); 
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyToClipboard = (text, type) => {
    if (!text || text === 'Loading...') return showToast("Nothing to copy", "error");
    navigator.clipboard.writeText(text);
    showToast(`${type} Copied!`, "success");
  };

  // Code Snippets
  const responseExample = `{
  "status": "success",
  "shortenedUrl": "${API_BASE}/xyz123",
  "message": "URL shortened successfully"
}`;

  const nodeExample = `fetch("${API_BASE}/api?api=${userToken}&url=https://google.com")
  .then(response => response.json())
  .then(data => {
    if (data.status === "success") {
      console.log("Short URL:", data.shortenedUrl);
    } else {
      console.error("Error:", data.message);
    }
  })
  .catch(err => console.error("Network Error:", err));`;

  const phpExample = `<?php
$api_token = "${userToken}";
$long_url = urlencode("https://google.com");
$api_url = "${API_BASE}/api?api={$api_token}&url={$long_url}";

// Fetch response
$response = file_get_contents($api_url);
$data = json_decode($response, true);

if ($data['status'] === 'success') {
    echo "Short URL: " . $data['shortenedUrl'];
} else {
    echo "Error: " . $data['message'];
}
?>`;

  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Developers API</h2>
      <p className="mb-8 text-slate-400">Integrate URL King into your applications effortlessly.</p>

      {/* API TOKEN SECTION */}
      <div className="glass-panel rounded-2xl p-6 border-indigo-500/30 bg-gradient-to-br from-indigo-900/10 to-slate-900/10">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
          <i className="fas fa-key text-indigo-500"></i> Your API Token
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            readOnly 
            value={maskedToken} 
            className="input-premium w-full p-4 rounded-xl text-indigo-400 font-mono tracking-wide bg-black/20" 
          />
          <button 
            onClick={() => copyToClipboard(userToken, 'Token')} 
            className="btn-action px-6 py-3 rounded-xl font-bold shrink-0 flex items-center justify-center gap-2 text-white"
          >
            <i className="fas fa-copy"></i> Copy
          </button>
          <button 
            onClick={() => setResetModal(true)} 
            className="px-6 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <i className="fas fa-sync-alt"></i> Reset
          </button>
        </div>
      </div>

      {/* STANDARD JSON API & RESPONSE */}
      <div className="glass-panel rounded-2xl p-6 mt-6">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Standard JSON API</h3>
        
        <div className="mb-6">
          <h4 className="text-sm font-bold uppercase text-slate-400 mb-2">Endpoint (GET)</h4>
          <div className="p-4 bg-[var(--table-header-bg)] border border-[var(--glass-border)] rounded-lg font-mono text-indigo-400 text-sm overflow-x-auto whitespace-nowrap">
            {API_BASE}/api?api=<span className="text-white">{maskedToken}</span>&url=<span className="text-emerald-400">YOUR_URL</span>&alias=<span className="text-yellow-400">CUSTOM_ALIAS</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase text-slate-400 mb-2">JSON Response</h4>
          <div className="relative group">
            <button onClick={() => copyToClipboard(responseExample, 'Response format')} className="absolute top-3 right-3 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="fas fa-copy text-xs"></i>
            </button>
            <pre className="p-4 bg-[#0d1117] border border-[var(--glass-border)] rounded-lg font-mono text-green-400 text-sm overflow-x-auto">
              <code>{responseExample}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* CODE EXAMPLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* NODE.JS EXAMPLE */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <i className="fab fa-node-js text-green-500"></i> Node.js Example
          </h3>
          <div className="relative group">
            <button onClick={() => copyToClipboard(nodeExample, 'Node.js code')} className="absolute top-3 right-3 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="fas fa-copy text-xs"></i>
            </button>
            <pre className="p-4 bg-[#0d1117] border border-[var(--glass-border)] rounded-lg font-mono text-slate-300 text-xs overflow-x-auto h-[250px] overflow-y-auto">
              <code>{nodeExample}</code>
            </pre>
          </div>
        </div>

        {/* PHP EXAMPLE */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <i className="fab fa-php text-indigo-400 text-xl"></i> PHP Example
          </h3>
          <div className="relative group">
            <button onClick={() => copyToClipboard(phpExample, 'PHP code')} className="absolute top-3 right-3 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="fas fa-copy text-xs"></i>
            </button>
            <pre className="p-4 bg-[#0d1117] border border-[var(--glass-border)] rounded-lg font-mono text-slate-300 text-xs overflow-x-auto h-[250px] overflow-y-auto">
              <code>{phpExample}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* QUICK LINK */}
      <div className="glass-panel rounded-2xl p-6 mt-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)] mb-2">
          <i className="fas fa-bolt text-yellow-500"></i> Quick Link (Direct Redirect)
        </h3>
        <p className="text-sm text-slate-400 mb-4">Unlike the JSON API, calling this URL will instantly redirect the user to the destination. Useful for raw HTML `href` integration.</p>
        <div>
          <h4 className="text-sm font-bold uppercase text-slate-400 mb-2">Usage Example</h4>
          <div className="relative group">
            <button onClick={() => copyToClipboard(`<a href="${API_BASE}/st?api=${userToken}&url=google.com">\n    Go to Google\n</a>`, 'HTML code')} className="absolute top-3 right-3 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="fas fa-copy text-xs"></i>
            </button>
            <div className="p-4 bg-[#0d1117] border border-[var(--glass-border)] rounded-lg font-mono text-blue-400 text-sm overflow-x-auto whitespace-pre">
              <span className="text-slate-500">&lt;a href="</span>{API_BASE}/st?api={userToken}&url=google.com<span className="text-slate-500">"&gt;</span>{"\n"}
              {"    "}Go to Google{"\n"}
              <span className="text-slate-500">&lt;/a&gt;</span>
            </div>
          </div>
        </div>
      </div>

      {/* RESET TOKEN MODAL */}
      {resetModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-sm text-center border border-red-500/30 bg-gradient-to-b from-red-900/20 to-transparent">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Reset API Token?</h3>
            <p className="text-sm text-slate-400 mb-6">Any existing scripts or applications using your current token will break immediately. This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setResetModal(false)} 
                className="px-4 py-2 text-slate-400 hover:bg-[var(--nav-hover)] rounded"
                disabled={isRegenerating}
              >
                Cancel
              </button>
              <button 
                onClick={handleReset} 
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold flex items-center gap-2"
                disabled={isRegenerating}
              >
                {isRegenerating ? <i className="fas fa-spinner fa-spin"></i> : null}
                Yes, Reset Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperApi;
