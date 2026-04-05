import React, { useState, useEffect, useRef } from 'react';
import { showToast } from '../../toast'; 

const UploadFile = ({ token, user }) => {
  const [activeTab, setActiveTab] = useState('direct');
  const [file, setFile] = useState(null);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [resultLink, setResultLink] = useState('');

  // Stats for both Direct & Remote
  const [loadedSize, setLoadedSize] = useState('0 B');
  const [totalSize, setTotalSize] = useState('0 B');
  const [uploadSpeed, setUploadSpeed] = useState('0 B/s');
  const [eta, setEta] = useState('Calculating...'); 
  const [statusText, setStatusText] = useState('Ready');

  const xhrRef = useRef(null);
  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  useEffect(() => {
    const handleBeforeUnload = (e) => { if (isUploading) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUploading]);

  const formatBytes = (bytes) => {
    if (bytes === 0 || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "Calculating...";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  // 🟢 DIRECT UPLOAD LOGIC
  const startDirectUpload = async () => {
    if (!file) return showToast("Please select a file.", "error");
    setIsUploading(true);
    setProgress(0);
    setTotalSize(formatBytes(file.size));
    setStatusText('Pushing to Cloud...');

    try {
      const serverRes = await fetch(`${API}/api/dev/server`, { headers: { Authorization: `Bearer ${token}` } });
      const serverData = await serverRes.json();
      if (!serverData.url) throw new Error("Server connection failed");

      const formData = new FormData();
      formData.append('sess_id', serverData.sess_id);
      formData.append('utype', 'reg');
      formData.append('file_0', file);

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr; 
      xhr.open('POST', serverData.url, true);

      let startTime = Date.now();
      let lastLoaded = 0;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.floor((e.loaded / e.total) * 100);
          setProgress(pct);
          setLoadedSize(formatBytes(e.loaded));
          const now = Date.now();
          const diff = (now - startTime) / 1000;
          if (diff >= 1) {
            const bps = (e.loaded - lastLoaded) / diff;
            setUploadSpeed(formatBytes(bps) + '/s');
            setEta(formatTime((e.total - e.loaded) / bps));
            startTime = now; lastLoaded = e.loaded;
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          finalizeDatabase(Array.isArray(res) ? res[0].file_code : res.file_code, file.name, formatBytes(file.size));
        } else { throw new Error("Upload Failed"); }
      };
      xhr.send(formData);
    } catch (e) { showToast(e.message, "error"); setIsUploading(false); }
  };

  // 🟢 REMOTE UPLOAD LOGIC (With Dynamic Speed/Progress Simulation)
  const startRemoteUpload = async () => {
    if (!remoteUrl.trim()) return showToast("Enter a valid URL.", "error");
    setIsUploading(true);
    setStatusText('Server Leeching Started...');
    
    // Simulate Progress for UX since backend handles download
    let simPct = 0;
    const interval = setInterval(() => {
      simPct += (simPct < 90 ? 1 : 0.1);
      setProgress(Math.floor(simPct));
      setUploadSpeed("Server Link Speed");
      setEta("Processing...");
    }, 1000);

    try {
      const res = await fetch(`${API}/api/dev/remote-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: remoteUrl })
      });
      const data = await res.json();
      clearInterval(interval);
      if (!res.ok) throw new Error(data.error);
      setResultLink(data.short_link);
      showToast("Remote Clone Success!", "success");
    } catch (e) { clearInterval(interval); showToast(e.message, "error"); } finally { setIsUploading(false); }
  };

  const finalizeDatabase = async (code, name, size) => {
    const res = await fetch(`${API}/api/dev/finalize`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ file_code: code, file_name: name, file_size: size })
    });
    const data = await res.json();
    setResultLink(`https://go.urlking.site/${data.short_id}`);
    setIsUploading(false);
  };

  const reset = () => { setFile(null); setRemoteUrl(''); setResultLink(''); setProgress(0); setIsUploading(false); setStatusText('Ready'); };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-0">
      
      {/* 🚀 TAB SWITCHER - NEON STYLE */}
      <div className="flex p-1.5 bg-slate-900/80 rounded-2xl border border-white/5 w-fit shadow-2xl">
        <button onClick={() => { reset(); setActiveTab('direct'); }} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'direct' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'text-slate-400 hover:text-white'}`}>
          <i className="fas fa-upload"></i> Direct
        </button>
        <button onClick={() => { reset(); setActiveTab('remote'); }} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'remote' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'text-slate-400 hover:text-white'}`}>
          <i className="fas fa-bolt"></i> Remote
        </button>
      </div>

      {/* 📦 MAIN UPLOAD CARD */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative glass-panel p-8 md:p-12 rounded-[2rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl">
          
          {!resultLink ? (
            <div className="space-y-8">
              {activeTab === 'direct' ? (
                <div className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-500 ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 bg-slate-800/20 hover:border-indigo-500/50'}`}>
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setFile(e.target.files[0])} disabled={isUploading}/>
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner"><i className={`fas ${file ? 'fa-file-alt' : 'fa-cloud-upload-alt'} text-4xl text-indigo-500`}></i></div>
                    <p className="text-xl font-bold text-white">{file ? file.name : "Choose File or Drag & Drop"}</p>
                    <p className="text-slate-500 text-sm mt-2">{file ? formatBytes(file.size) : "Maximum upload size: 5GB"}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl">
                    <input type="text" placeholder="Paste Remote Link (Direct, MediaFire, DevUploads...)" className="w-full bg-slate-900 p-5 rounded-[0.9rem] text-white focus:outline-none font-medium" value={remoteUrl} onChange={(e) => setRemoteUrl(e.target.value)} disabled={isUploading}/>
                  </div>
                  <div className="flex justify-center gap-4 text-[10px] uppercase tracking-widest font-black text-slate-500">
                    <span className="flex items-center gap-1"><i className="fas fa-check-circle text-indigo-500"></i> Mediafire</span>
                    <span className="flex items-center gap-1"><i className="fas fa-check-circle text-indigo-500"></i> DevUploads</span>
                    <span className="flex items-center gap-1"><i className="fas fa-check-circle text-indigo-500"></i> URLKing</span>
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase font-black text-indigo-400 mb-1 tracking-tighter">{statusText}</p>
                      <p className="text-xs text-slate-400 font-mono">{loadedSize} / {totalSize}</p>
                    </div>
                    <p className="text-3xl font-black text-white italic">{progress}<span className="text-indigo-500 text-lg">%</span></p>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]" style={{width: `${progress}%`}}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center">
                      <p className="text-[9px] text-slate-500 uppercase">Speed</p>
                      <p className="text-sm font-bold text-emerald-400">{uploadSpeed}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center">
                      <p className="text-[9px] text-slate-500 uppercase">ETA</p>
                      <p className="text-sm font-bold text-blue-400">{eta}</p>
                    </div>
                  </div>
                  <button onClick={() => { if(xhrRef.current) xhrRef.current.abort(); reset(); }} className="w-full text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest">Cancel Upload</button>
                </div>
              )}

              {!isUploading && (
                <button onClick={activeTab === 'direct' ? startDirectUpload : startRemoteUpload} className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl text-white font-black text-lg transition-all shadow-[0_10px_25px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3">
                  <i className={`fas ${activeTab === 'direct' ? 'fa-cloud-upload-alt' : 'fa-magic'}`}></i> 
                  {activeTab === 'direct' ? 'Upload Now' : 'Leech & Clone'}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6 fade-in">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/50"><i className="fas fa-check text-4xl text-emerald-500"></i></div>
              <h3 className="text-2xl font-black text-white">File is Ready!</h3>
              <div className="flex bg-slate-900 p-2 rounded-2xl border border-white/10">
                <input type="text" readOnly value={resultLink} className="bg-transparent flex-1 px-4 text-sm font-mono text-indigo-300 outline-none"/>
                <button onClick={() => { navigator.clipboard.writeText(resultLink); showToast("Link Copied!", "success"); }} className="bg-indigo-600 px-6 py-3 rounded-xl font-bold text-sm">Copy</button>
              </div>
              <button onClick={reset} className="w-full py-4 rounded-xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 transition-all">Upload Another</button>
            </div>
          )}
        </div>
      </div>

      {/* ℹ️ STORAGE HELP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5">
          <i className="fas fa-calendar-times text-amber-500 text-2xl mb-4"></i>
          <h4 className="text-white font-bold mb-2">30-Day Expiry</h4>
          <p className="text-xs text-slate-400 leading-relaxed">Files with <strong>0 downloads</strong> for 30 consecutive days will be automatically purged from our cloud storage.</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-blue-500/20 bg-blue-500/5">
          <i className="fas fa-shield-alt text-blue-500 text-2xl mb-4"></i>
          <h4 className="text-white font-bold mb-2">Secure Leeching</h4>
          <p className="text-xs text-slate-400 leading-relaxed">Remote URLs are processed via our high-speed VPS. Your personal IP address is never exposed to source websites.</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
          <i className="fas fa-file-signature text-emerald-500 text-2xl mb-4"></i>
          <h4 className="text-white font-bold mb-2">File Integrity</h4>
          <p className="text-xs text-slate-400 leading-relaxed">We support almost all file formats including APKs, Videos, and Archives up to 5GB per individual file.</p>
        </div>
      </div>

    </div>
  );
};

export default UploadFile;
