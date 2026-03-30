import React from 'react';

const DeveloperApi = ({ token, user, fetchUserProfile }) => {
  const API = "https://go.urlking.site";

  const handleReset = async () => {
    if (!window.confirm("Reset API Token? Scripts using the old token will break.")) return;
    try {
      const res = await fetch(`${API}/api/regenerate-key`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { alert("New API Key generated!"); fetchUserProfile(); }
      else { alert("Failed to regenerate key"); }
    } catch { alert("Error regenerating key"); }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(user?.api_token || '');
    alert("Token Copied!");
  };

  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-2">Developers API & Quick Link</h2>
      <p className="mb-8 text-slate-400">Integrate URL King into your applications or use direct redirect links.</p>

      <div className="glass-panel rounded-2xl p-6 border-indigo-500/30">
        <h3 className="text-lg font-bold mb-4">Your API Token</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input type="text" readOnly value={user?.api_token || 'Loading...'} className="input-premium w-full p-4 rounded-xl text-indigo-400 font-mono tracking-wide" />
          <button onClick={copyToken} className="btn-action px-6 py-3 rounded-xl font-bold shrink-0">Copy</button>
          <button onClick={handleReset} className="px-6 py-3 rounded-xl border border-[var(--glass-border)] text-slate-400 hover:bg-slate-800 shrink-0">Reset</button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-8 mt-6">
        <h3 className="text-lg font-bold">Standard JSON API</h3>
        <div>
          <h4 className="text-sm font-bold uppercase text-slate-400 mb-2">Endpoint (GET)</h4>
          <div className="p-4 bg-slate-900/50 rounded-lg font-mono text-indigo-400 text-sm overflow-x-auto">
            https://go.urlking.site/api?api={user?.api_token || 'YOUR_TOKEN'}&url=YOUR_URL&alias=CUSTOM_ALIAS
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-8 mt-6">
        <h3 className="text-lg font-bold flex items-center gap-2"><i className="fas fa-bolt text-indigo-500"></i> Quick Link (Direct Redirect)</h3>
        <p className="text-sm text-slate-400">Unlike the JSON API, calling this URL will instantly redirect the user to the destination. Useful for raw HTML integration.</p>
        <div>
          <h4 className="text-sm font-bold uppercase text-slate-400 mb-2">Usage Example</h4>
          <div className="p-4 bg-slate-900/50 rounded-lg font-mono text-indigo-400 text-sm overflow-x-auto whitespace-pre">
            &lt;a href="https://go.urlking.site/st?api={user?.api_token || 'YOUR_TOKEN'}&url=google.com"&gt;{"\n"}
            {"    "}Go to Google{"\n"}
            &lt;/a&gt;
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperApi;
