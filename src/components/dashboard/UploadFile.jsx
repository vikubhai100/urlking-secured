import React, { useState, useEffect, useRef } from 'react';
import { showToast } from '../../toast'; 

const UploadFile = ({ token, user }) => {
  // 🟢 TAB STATE (Local vs Remote)
  const [uploadMode, setUploadMode] = useState('local'); // 'local' or 'remote'

  // --- LOCAL UPLOAD STATES ---
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [resultLink, setResultLink] = useState('');
  const [loadedSize, setLoadedSize] = useState('0 B');
  const [totalSize, setTotalSize] = useState('0 B');
  const [uploadSpeed, setUploadSpeed] = useState('0 B/s');
  const [eta, setEta] = useState('Calculating...'); 
  const xhrRef = useRef(null);

  // --- REMOTE UPLOAD STATES ---
  const [remoteUrl, setRemoteUrl] = useState('');
  const [remoteStatus, setRemoteStatus] = useState('idle'); // idle, fetching, ready, processing, done
  const [remoteInfo, setRemoteInfo] = useState(null);
  const [newRemoteName, setNewRemoteName] = useState('');

  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isUploading || remoteStatus === 'processing') {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUploading, remoteStatus]);

  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes || isNaN(bytes)) return '0 B';
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

  // ==========================================
  // 📁 LOCAL FILE UPLOAD LOGIC
  // ==========================================
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      resetUploader(false);
    }
  };

  const startUpload = async () => {
    if (!file) return showToast("Please select a file to upload.", "error");
    setIsUploading(true);
    setProgress(0);
    setTotalSize(formatBytes(file.size));

    try {
      const serverRes = await fetch(`${API}/api/dev/server`, { headers: { Authorization: `Bearer ${token}` } });
      const serverData = await serverRes.json();
      if (!serverData.url) throw new Error("Could not connect to upload server");

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

          if (timeDiff >= 0.5 && currentPercent < 100) {
            const bytesPerSecond = (e.loaded - lastLoaded) / timeDiff;
            setUploadSpeed(formatBytes(bytesPerSecond) + '/s');
            const secondsRemaining = bytesPerSecond > 0 ? (e.total - e.loaded) / bytesPerSecond : 0;
            setEta(formatTime(secondsRemaining));
            startTime = now;
            lastLoaded = e.loaded;
          } 
          if (currentPercent === 100) { setUploadSpeed('Finishing...'); setEta('Processing...'); }
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            let fileCode = Array.isArray(response) && response[0] ? response[0].file_code : response.file_code;
            let fileSizeStr = file.size >= 1048576 ? (file.size / 1048576).toFixed(2) + " MB" : (file.size / 1024).toFixed(2) + " KB";

            const finalRes = await fetch(`${API}/api/dev/finalize`, {
              method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ file_code: fileCode, file_name: file.name, file_size: fileSizeStr })
            });
            const finalData = await finalRes.json();
            setResultLink(`https://go.urlking.site/${finalData.short_id}`);
            showToast("File uploaded & shortened successfully!", "success");
          } catch(e) { showToast("Error finalizing: " + e.message, "error"); }
        } else { showToast("Upload failed.", "error"); }
        setIsUploading(false);
      };

      xhr.onerror = () => { showToast("Upload network error.", "error"); setIsUploading(false); };
      xhr.onabort = () => { showToast("Upload Cancelled!", "error"); setIsUploading(false); resetUploader(false); };
      xhr.send(formData);

    } catch (e) {
      showToast(e.message || "An error occurred", "error");
      setIsUploading(false);
    }
  };

  const cancelUpload = () => { if (xhrRef.current) xhrRef.current.abort(); };

  // ==========================================
  // 🌐 REMOTE URL UPLOAD LOGIC
  // ==========================================
  const fetchRemoteDetails = async () => {
    if (!remoteUrl) return showToast("Please enter a valid URL.", "error");
    setRemoteStatus('fetching');

    try {
      const res = await fetch(`${API}/api/remote/info`, {
        method: 'POST',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: remoteUrl })
      });
      const data = await res.json();
      if (data.ok) {
        setRemoteInfo(data);
        setNewRemoteName(data.originalName);
        setRemoteStatus('ready');
        showToast("Link details fetched!", "success");
      } else {
        throw new Error(data.error || "Failed to fetch link details.");
      }
    } catch (e) {
      showToast(e.message, "error");
      setRemoteStatus('idle');
    }
  };

  const processRemoteUrl = async () => {
    if (!remoteInfo) return;
    setRemoteStatus('processing');

    try {
      const res = await fetch(`${API}/api/remote/process`, {
        method: 'POST',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...remoteInfo, newName: newRemoteName })
      });
      const data = await res.json();
      if (data.ok) {
        setResultLink(data.short_link);
        setRemoteStatus('done');
        showToast("Remote URL Processed Successfully!", "success");
      } else {
        throw new Error(data.error || "Failed to process URL.");
      }
    } catch (e) {
      showToast(e.message, "error");
      setRemoteStatus('ready');
    }
  };

  // ==========================================
  // UTILS
  // ==========================================
  const handleCopy = () => { navigator.clipboard.writeText(resultLink); showToast("Link Copied!", "success"); };

  const resetUploader = (clearFile = true) => {
    if (clearFile) setFile(null);
    setResultLink(''); setProgress(0); setLoadedSize('0 B'); setTotalSize('0 B'); setUploadSpeed('0 B/s'); setEta('Calculating...');
    setRemoteUrl(''); setRemoteStatus('idle'); setRemoteInfo(null); setNewRemoteName('');
  };

  if (user?.can_upload !== 1) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/20 bg-[var(--glass-panel)] text-center max-w-4xl mx-auto">
        <h3 className="text-2xl font-black mb-3 text-[var(--text-primary)]">Feature Locked</h3>
        <p className="text-slate-400 font-medium">Upload access is currently restricted.</p>
      </div>
    );
  }

  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      
      {/* 🔴 TAB CHANGER UI */}
      <div className="flex bg-[var(--nav-hover)] p-1.5 rounded-xl border border-[var(--glass-border)] shadow-inner">
        <button 
          onClick={() => { setUploadMode('local'); resetUploader(); }}
          className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${uploadMode === 'local' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-[var(--text-primary)]'}`}
        >
          <i className="fas fa-desktop"></i> Local Device
        </button>
        <button 
          onClick={() => { setUploadMode('remote'); resetUploader(); }}
          className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${uploadMode === 'remote' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-[var(--text-primary)]'}`}
        >
          <i className="fas fa-cloud-download-alt"></i> Remote URL
        </button>
      </div>

      <div className="border-animated p-1 mt-4">
        <div className="relative z-10 p-6 md:p-10 glass-panel border-none rounded-[1.2rem]">
          
          {/* ==============================================
              💻 LOCAL FILE MODE
          ============================================== */}
          {uploadMode === 'local' && (
            <div className="space-y-6">
              <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-[var(--glass-border)] hover:border-indigo-500/50'}`}>
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} disabled={isUploading || resultLink} />
                {!file ? (
                  <div>
                    <div className="w-16 h-16 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center mb-4"><i className="fas fa-cloud-upload-alt text-3xl text-indigo-500"></i></div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">Select Local File</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 mx-auto bg-indigo-500 rounded-full flex items-center justify-center mb-4"><i className="fas fa-file-alt text-3xl text-white"></i></div>
                    <p className="text-lg font-bold text-[var(--text-primary)] break-all">{file.name}</p>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="space-y-4 p-5 glass-panel rounded-xl border border-indigo-500/20">
                  <div className="flex justify-between text-xs font-bold text-slate-400"><span className="text-indigo-400">{progress}%</span></div>
                  <div className="h-4 rounded-full bg-slate-800 border"><div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }}></div></div>
                  <div className="flex justify-between text-xs text-slate-400 font-mono"><span>{loadedSize} / {totalSize}</span><span>{uploadSpeed} | ETA: {eta}</span></div>
                  <button onClick={cancelUpload} className="w-full mt-2 py-2 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white">Cancel Upload</button>
                </div>
              )}

              {file && !isUploading && !resultLink && (
                <button onClick={startUpload} className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold">Start Upload Now</button>
              )}
            </div>
          )}

          {/* ==============================================
              🌐 REMOTE URL MODE
          ============================================== */}
          {uploadMode === 'remote' && (
            <div className="space-y-6">
              
              {!resultLink && remoteStatus !== 'processing' && (
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-[var(--text-primary)]">Enter Remote Link (Mediafire, DevUploads, UrlKing)</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="url" placeholder="https://..." 
                      value={remoteUrl} onChange={(e) => setRemoteUrl(e.target.value)}
                      disabled={remoteStatus !== 'idle' && remoteStatus !== 'ready'}
                      className="flex-1 bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] p-4 rounded-xl focus:border-emerald-500"
                    />
                    <button 
                      onClick={fetchRemoteDetails} disabled={!remoteUrl || remoteStatus === 'fetching'}
                      className="px-6 py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      {remoteStatus === 'fetching' ? <i className="fas fa-spinner fa-spin"></i> : "Fetch Info"}
                    </button>
                  </div>
                </div>
              )}

              {remoteInfo && !resultLink && remoteStatus !== 'processing' && (
                <div className="p-6 rounded-2xl bg-[var(--bg-body)] border border-emerald-500/30 space-y-4 fade-in">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xl"><i className="fas fa-link"></i></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-400 font-bold uppercase">Original File</p>
                      <p className="text-[var(--text-primary)] font-mono truncate">{remoteInfo.originalName}</p>
                      <p className="text-xs text-emerald-400 font-bold mt-1">Size: {formatBytes(remoteInfo.fileSize)} | Type: {remoteInfo.type}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--glass-border)]">
                    <label className="block text-xs font-bold text-slate-400 mb-2">Rename File (Optional)</label>
                    <input 
                      type="text" value={newRemoteName} onChange={(e) => setNewRemoteName(e.target.value)}
                      className="w-full bg-[var(--nav-hover)] border border-[var(--glass-border)] text-[var(--text-primary)] p-3 rounded-lg text-sm"
                    />
                  </div>

                  <button onClick={processRemoteUrl} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30">
                    <i className="fas fa-rocket mr-2"></i> Clone & Shorten Link
                  </button>
                </div>
              )}

              {remoteStatus === 'processing' && (
                <div className="p-8 text-center glass-panel rounded-2xl border border-emerald-500/30 fade-in">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Processing Remote Link...</h3>
                  <p className="text-slate-400 text-sm">Cloning from source, saving to server, and generating short link. This might take a minute.</p>
                </div>
              )}
            </div>
          )}

          {/* ==============================================
              🎉 COMMON RESULT CARD
          ============================================== */}
          {resultLink && (
            <div className="fade-in mt-6 space-y-4">
              <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-lg">
                <p className="text-sm font-black text-emerald-500 mb-4"><i className="fas fa-check-circle mr-2"></i> SUCCESSFUL</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" readOnly value={resultLink} className="flex-1 bg-[var(--bg-body)] border border-[var(--glass-border)] text-emerald-400 p-4 rounded-xl text-sm font-mono" />
                  <button onClick={handleCopy} className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold"><i className="far fa-copy"></i> Copy</button>
                </div>
              </div>
              <button onClick={() => resetUploader(true)} className="w-full py-4 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 rounded-2xl font-bold">Upload Another File</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UploadFile;
