import React from 'react';
import { showToast } from '../../toast'; 

const FullPageScript = ({ user, isActive }) => {
  if (!isActive) return null;

  const apiToken = user?.api_token || "YOUR_API_KEY";
  
  const scriptCode = `<script type="text/javascript">
  var urlking_api = '${apiToken}';
  var urlking_domains = ['example.com', 'test.com']; 
</script>
<script src="https://go.urlking.site/js/fullpage.js"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    showToast("Script copied to clipboard!", "success");
  };

  return (
    <div className="fade-in max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
          <i className="fas fa-globe text-green-500"></i> Full Page Script
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Monetize your entire website instantly! Add this script to your website's <code className="text-white bg-black/20 px-1 rounded">&lt;head&gt;</code> or <code className="text-white bg-black/20 px-1 rounded">&lt;body&gt;</code> tag. It will automatically convert all external links on your site into URL King short links.
        </p>
      </div>

      <div className="bg-[var(--glass-card)] border border-[var(--glass-border)] p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Your Custom Script</h3>
        
        <div className="relative">
          <textarea 
            rows="5" 
            readOnly 
            className="w-full p-4 input-premium rounded-xl text-sm font-mono text-indigo-300 bg-slate-900/80 resize-none border border-slate-700/50" 
            value={scriptCode}
          ></textarea>
          <button 
            onClick={copyToClipboard}
            className="absolute right-4 top-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md"
          >
            <i className="fas fa-copy mr-1"></i> Copy
          </button>
        </div>

        <div className="mt-6 space-y-3 bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
          <h4 className="text-sm font-bold text-blue-400"><i className="fas fa-info-circle mr-1"></i> How to use:</h4>
          <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
            <li>Your API token is already included in the script.</li>
            <li>Replace <code className="text-white bg-black/20 px-1 rounded">['example.com', 'test.com']</code> with the domains you <b>DO NOT</b> want to shorten. (Usually your own domain).</li>
            <li>If you want to shorten <b>EVERY</b> link, leave the array empty: <code className="text-white bg-black/20 px-1 rounded">[]</code>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FullPageScript;
