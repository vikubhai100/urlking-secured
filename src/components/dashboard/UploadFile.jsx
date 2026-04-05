import React, { useState, useEffect, useRef } from 'react';
import { showToast } from '../../toast'; 

const UploadFile = ({ token, user }) => {
  const [activeTab, setActiveTab] = useState('direct');
  const [file, setFile] = useState(null);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [resultLink, setResultLink] = useState('');

  // Stats State (Inhe globally rakha hai taaki tab change pe delete na ho)
  const [stats, setStats] = useState({ progress: 0, loaded: '0 B', total: '0 B', speed: '0 B/s', eta: '...', status: 'Ready' });

  const xhrRef = useRef(null);
  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  const formatBytes = (b) => {
    if (!b || b === 0) return '0 B';
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return (b / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
  };

  const startDirectUpload = async () => {
    if (!file) return showToast("Select file!", "error");
    setIsUploading(true);
    setStats(prev => ({ ...prev, total: formatBytes(file.size), status: 'Uploading...' }));

    const serverRes = await fetch(`${API}/api/dev/server`, { headers: { Authorization: `Bearer ${token}` } });
    const serverData = await serverRes.json();

    const formData = new FormData();
    formData.append('sess_id', serverData.sess_id);
    formData.append('utype', 'reg');
    formData.append('file_0', file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open('POST', serverData.url, true);

    let lastTime = Date.now();
    let lastLoaded = 0;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.floor((e.loaded / e.total) * 100);
        const now = Date.now();
        const diff = (now - lastTime) / 1000;
        let speed = stats.speed;
        if (diff >= 1) {
          speed = formatBytes((e.loaded - lastLoaded) / diff) + '/s';
          lastTime = now; lastLoaded = e.loaded;
        }
        setStats({ progress: pct, loaded: formatBytes(e.loaded), total: formatBytes(e.total), speed, status: 'Uploading...' });
      }
    };

    xhr.onload = async () => {
      const res = JSON.parse(xhr.responseText);
      const code = Array.isArray(res) ? res[0].file_code : res.file_code;
      const final = await fetch(`${API}/api/dev/finalize`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ file_code: code, file_name: file.name, file_size: formatBytes(file.size) })
      }).then(r => r.json());
      setResultLink(`https://go.urlking.site/${final.short_id}`);
      setIsUploading(false);
    };
    xhr.send(formData);
  };

  const startRemoteUpload = async () => {
    if (!remoteUrl) return showToast("Enter URL", "error");
    setIsUploading(true);
    setStats(prev => ({ ...prev, status: 'Server Leeching...' }));

    try {
        const res = await fetch(`${API}/api/dev/remote-upload`, {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ url: remoteUrl })
        });
        const data = await res.json();
        if (res.ok) setResultLink(data.short_link);
        else throw new Error(data.error);
    } catch (e) { showToast(e.message, "error"); }
    setIsUploading(false);
  };

  const handleCancel = async () => {
    if (activeTab === 'direct' && xhrRef.current) xhrRef.current.abort();
    if (activeTab === 'remote') await fetch(`${API}/api/dev/remote-cancel`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    setIsUploading(false);
    setStats({ progress: 0, loaded: '0 B', total: '0 B', speed: '0 B/s', eta: '...', status: 'Ready' });
    showToast("Upload Cancelled", "info");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tab Switcher - Ab ye upload ke beech mein bhi kaam karega */}
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl w-fit mx-auto border border-slate-200 dark:border-white/5 shadow-sm">
        <button onClick={() => setActiveTab('direct')} className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'direct' ? 'bg-white dark:bg-indigo-600 shadow-md text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Direct</button>
        <button onClick={() => setActiveTab('remote')} className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'remote' ? 'bg-white dark:bg-indigo-600 shadow-md text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Remote</button>
      </div>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-md">
        {!resultLink ? (
          <div className="space-y-8">
            {/* Direct Tab Content */}
            {activeTab === 'direct' && !isUploading && (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center hover:border-indigo-500 transition-colors relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files[0])}/>
                <i className="fas fa-cloud-upload-alt text-5xl text-indigo-500 mb-4"></i>
                <p className="font-bold text-slate-700 dark:text-white text-lg">{file ? file.name : "Select File"}</p>
                <p className="text-slate-400 text-sm mt-1">Maximum Size: 5GB</p>
              </div>
            )}

            {/* Remote Tab Content */}
            {activeTab === 'remote' && !isUploading && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                    <input type="text" placeholder="Paste link here..." className="w-full bg-transparent p-4 outline-none text-slate-700 dark:text-white" value={remoteUrl} onChange={e => setRemoteUrl(e.target.value)}/>
                </div>
                <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span><i className="fas fa-link text-indigo-500 mr-1"></i> Mediafire</span>
                    <span><i className="fas fa-link text-indigo-500 mr-1"></i> DevUploads</span>
                </div>
              </div>
            )}

            {/* LIVE PROGRESS - Dono tabs ke liye shared */}
            {isUploading && (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-indigo-500/10 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black uppercase text-indigo-500 tracking-tighter">{stats.status}</span>
                    <span className="text-2xl font-black italic text-slate-700 dark:text-white">{stats.progress}%</span>
                </div>
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-indigo-600 transition-all duration-500" style={{width: `${stats.progress}%`}}></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl text-center border border-slate-100 dark:border-white/5 shadow-sm">
                        <p className="text-[9px] uppercase text-slate-400 font-bold mb-1">Speed</p>
                        <p className="text-sm font-black text-emerald-500">{stats.speed}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl text-center border border-slate-100 dark:border-white/5 shadow-sm">
                        <p className="text-[9px] uppercase text-slate-400 font-bold mb-1">Data</p>
                        <p className="text-sm font-black text-blue-500">{stats.loaded} / {stats.total}</p>
                    </div>
                </div>
                <button onClick={handleCancel} className="w-full mt-6 text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500">Cancel Upload</button>
              </div>
            )}

            {!isUploading && (
              <button onClick={activeTab === 'direct' ? startDirectUpload : startRemoteUpload} className="w-full bg-indigo-600 py-5 rounded-2xl text-white font-black text-lg shadow-lg shadow-indigo-600/20 hover:-translate-y-1 transition-all">
                {activeTab === 'direct' ? 'Start Upload' : 'Leech & Clone'}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-500/30">
                <i className="fas fa-check text-4xl text-emerald-500"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-700 dark:text-white">Ready to Share!</h2>
            <div className="bg-slate-50 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200 dark:border-white/10 flex">
                <input type="text" readOnly value={resultLink} className="bg-transparent flex-1 px-4 text-sm font-mono text-indigo-500 outline-none w-full"/>
                <button onClick={() => {navigator.clipboard.writeText(resultLink); showToast("Copied", "success")}} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">Copy</button>
            </div>
            <button onClick={() => {setResultLink(''); setFile(null); setRemoteUrl('')}} className="w-full text-slate-400 font-bold hover:text-indigo-500 transition-colors">Upload Another One</button>
          </div>
        )}
      </div>
      
      {/* Guidelines updated with white theme support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50 dark:bg-amber-500/5 p-5 rounded-3xl border border-amber-200 dark:border-amber-500/10">
              <h4 className="text-amber-600 dark:text-amber-500 font-bold text-sm mb-1"><i className="fas fa-history mr-2"></i> 30-Day Retention</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Files without downloads for 30 days are automatically deleted.</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-500/5 p-5 rounded-3xl border border-indigo-200 dark:border-indigo-500/10">
              <h4 className="text-indigo-600 dark:text-indigo-500 font-bold text-sm mb-1"><i className="fas fa-shield-alt mr-2"></i> Private Leech</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs">All remote uploads are proxied through our encrypted VPS.</p>
          </div>
      </div>
    </div>
  );
};

export default UploadFile;
