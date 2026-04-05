import React, { useState, useEffect, useRef } from 'react';
import { showToast } from '../../toast'; 

const UploadFile = ({ token, user }) => {
  // Tabs: 'direct' or 'remote'
  const [activeTab, setActiveTab] = useState('direct');
  const [file, setFile] = useState(null);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [resultLink, setResultLink] = useState('');

  // Stats States
  const [loadedSize, setLoadedSize] = useState('0 B');
  const [totalSize, setTotalSize] = useState('0 B');
  const [uploadSpeed, setUploadSpeed] = useState('0 B/s');
  const [eta, setEta] = useState('Calculating...'); 
  const [statusText, setStatusText] = useState('Ready');

  const xhrRef = useRef(null);
  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  // Page Close Protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUploading]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "Calculating...";
    if (seconds < 60) return Math.floor(seconds) + "s";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  // 🟢 LOGIC: Direct File Upload
  const startDirectUpload = async () => {
    if (!file) return showToast("Please select a file.", "error");

    setIsUploading(true);
    setProgress(0);
    setTotalSize(formatBytes(file.size));
    setStatusText('Uploading to Cloud...');

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
          const currentPercent = Math.floor((e.loaded / e.total) * 100);
          setProgress(currentPercent);
          setLoadedSize(formatBytes(e.loaded));

          const now = Date.now();
          const timeDiff = (now - startTime) / 1000; 
          if (timeDiff >= 0.5) {
            const bytesPerSecond = (e.loaded - lastLoaded) / timeDiff;
            setUploadSpeed(formatBytes(bytesPerSecond) + '/s');
            setEta(formatTime((e.total - e.loaded) / bytesPerSecond));
            startTime = now;
            lastLoaded = e.loaded;
          } 
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const fileCode = Array.isArray(response) ? response[0].file_code : response.file_code;
          finalizeDatabase(fileCode, file.name, formatBytes(file.size));
        } else {
          showToast("Upload failed", "error");
          setIsUploading(false);
        }
      };
      xhr.send(formData);
    } catch (e) {
      showToast(e.message, "error");
      setIsUploading(false);
    }
  };

  // 🟢 LOGIC: Remote URL Upload (Uses same backend logic as Bot)
  const startRemoteUpload = async () => {
    if (!remoteUrl.trim()) return showToast("Please enter a valid URL.", "error");
    
    setIsUploading(true);
    setStatusText('Processing Remote Link...');
    setProgress(10); // Initial Jump

    try {
      const res = await fetch(`${API}/api/dev/remote-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: remoteUrl })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Remote upload failed");

      setResultLink(data.short_link || `${SITE_DOMAIN}/${data.short_id}`);
      showToast("Remote File Processed!", "success");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const finalizeDatabase = async (fileCode, fileName, fileSize) => {
    try {
      const res = await fetch(`${API}/api/dev/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ file_code: fileCode, file_name: fileName, file_size: fileSize })
      });
      const data = await res.json();
      setResultLink(`https://go.urlking.site/${data.short_id}`);
      showToast("Success!", "success");
    } catch (e) {
      showToast("Database error", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => { if (xhrRef.current) xhrRef.current.abort(); };
  const handleCopy = () => { navigator.clipboard.writeText(resultLink); showToast("Copied!", "success"); };
  const resetUploader = () => { setFile(null); setRemoteUrl(''); setResultLink(''); setProgress(0); setIsUploading(false); setStatusText('Ready'); };

  if (user?.can_upload !== 1) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/20 bg-[var(--glass-panel)] backdrop-blur-md shadow-2xl text-center max-w-4xl mx-auto fade-in">
        <i className="fas fa-lock text-5xl text-red-500 mb-4"></i>
        <h3 className="text-2xl font-black mb-3">Access Restricted</h3>
        <p className="text-slate-400 mb-6">Contact admin to enable uploads for your account.</p>
        <a href="https://t.me/vikubhai01" className="px-8 py-3 bg-red-500 rounded-xl font-bold">Request Access</a>
      </div>
    );
  }

  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      {/* HEADER TABS */}
      <div className="flex gap-2 p-1 bg-slate-900/50 rounded-2xl border border-[var(--glass-border)] w-fit mx-auto sm:mx-0">
        <button 
          onClick={() => { resetUploader(); setActiveTab('direct'); }}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'direct' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
        >
          <i className="fas fa-file-upload mr-2"></i> Direct Upload
        </button>
        <button 
          onClick={() => { resetUploader(); setActiveTab('remote'); }}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'remote' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
        >
          <i className="fas fa-link mr-2"></i> Remote Upload
        </button>
      </div>

      <div className="border-animated p-1">
        <div className="relative z-10 p-6 md:p-10 glass-panel border-none rounded-[1.2rem] space-y-8">
          
          {/* TAB 1: DIRECT UPLOAD */}
          {activeTab === 'direct' && !resultLink && (
            <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-[var(--glass-border)] hover:border-indigo-500/50'}`}>
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setFile(e.target.files[0])} disabled={isUploading}/>
              {!file ? (
                <div>
                  <div className="w-16 h-16 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center mb-4"><i className="fas fa-cloud-upload-alt text-3xl text-indigo-500"></i></div>
                  <p className="text-lg font-bold">Click or Drop File Here</p>
                  <p className="text-xs text-slate-500 mt-1">Max Size: 5GB</p>
                </div>
              ) : (
                <div>
                   <i className="fas fa-file-alt text-4xl text-indigo-500 mb-3"></i>
                   <p className="font-bold break-all">{file.name}</p>
                   <p className="text-xs text-slate-400 mt-1">{formatBytes(file.size)}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REMOTE UPLOAD */}
          {activeTab === 'remote' && !resultLink && (
            <div className="space-y-4">
              <div className="glass-panel p-4 rounded-xl border border-indigo-500/20">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Enter Remote URL (Direct, Mediafire, etc.)</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/file.zip" 
                  className="input-premium w-full p-4 rounded-xl"
                  value={remoteUrl}
                  onChange={(e) => setRemoteUrl(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              <p className="text-[10px] text-slate-500 px-2 italic text-center">Supported: Direct Links, Mediafire, DevUploads, URLKing Files</p>
            </div>
          )}

          {/* PROGRESS VIEW */}
          {isUploading && (
            <div className="space-y-4 animate-pulse">
               <div className="flex justify-between text-xs font-bold text-indigo-400">
                  <span>{statusText}</span>
                  <span>{progress}%</span>
               </div>
               <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all" style={{width: `${progress}%`}}></div>
               </div>
               {activeTab === 'direct' && (
                 <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/50 p-3 rounded-lg">
                    <div className="text-center border-r border-slate-700">Size: {loadedSize}</div>
                    <div className="text-center border-r border-slate-700">Speed: {uploadSpeed}</div>
                    <div className="text-center">ETA: {eta}</div>
                 </div>
               )}
               <button onClick={cancelUpload} className="w-full text-red-500 text-xs font-bold hover:underline">Cancel Process</button>
            </div>
          )}

          {/* RESULT VIEW */}
          {resultLink && (
            <div className="space-y-4 fade-in">
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                 <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30"><i className="fas fa-check text-white"></i></div>
                 <h4 className="font-bold text-emerald-500 mb-4">Link Ready!</h4>
                 <div className="flex gap-2">
                    <input type="text" readOnly value={resultLink} className="flex-1 bg-black/30 p-3 rounded-lg text-xs font-mono border border-emerald-500/20"/>
                    <button onClick={handleCopy} className="bg-emerald-500 px-4 rounded-lg text-xs font-bold">Copy</button>
                 </div>
              </div>
              <button onClick={resetUploader} className="w-full py-3 rounded-xl border border-indigo-500 text-indigo-500 text-xs font-bold">Upload More</button>
            </div>
          )}

          {/* START BUTTON */}
          {!isUploading && !resultLink && (
            <button 
              onClick={activeTab === 'direct' ? startDirectUpload : startRemoteUpload}
              className="btn-action w-full py-4 rounded-2xl text-white font-black text-lg shadow-lg hover:-translate-y-1 transition-transform"
            >
              {activeTab === 'direct' ? 'Start Direct Upload' : 'Start Remote Upload'}
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default UploadFile;
