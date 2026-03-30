import React from 'react';

const QuickLink = ({ user }) => {
  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-2">Quick Link</h2>
      <p className="mb-8 text-slate-400">Instant shortening and redirection for simple scripts.</p>

      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-8">
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-4">
          <i className="fas fa-bolt text-indigo-500 text-xl mt-1"></i>
          <div>
            <h4 className="font-bold mb-1" style={{color: 'var(--text-primary)'}}>What is this?</h4>
            <p className="text-sm text-slate-400">Unlike the standard API, the Quick Link endpoint redirects the user immediately.</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-400">Usage</h4>
          <div className="p-4 bg-slate-900/50 border border-[var(--glass-border)] rounded-lg font-mono text-indigo-400 text-sm overflow-x-auto">
             https://go.urlking.site/st?api={user?.api_token || 'YOUR_TOKEN'}&url=yourdestinationlink.com
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-400">Example (HTML Link)</h4>
          <div className="p-4 bg-slate-900/50 border border-[var(--glass-border)] rounded-lg font-mono text-indigo-400 text-sm overflow-x-auto whitespace-pre">
            &lt;a href="https://go.urlking.site/st?api={user?.api_token || 'YOUR_TOKEN'}&url=google.com"&gt;{"\n"}
            {"    "}Go to Google{"\n"}
            &lt;/a&gt;
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickLink;
