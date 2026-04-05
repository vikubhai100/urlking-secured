import React, { useState, useEffect, useRef } from 'react';
import { showToast } from '../../toast'; 

const UploadFile = ({ token, user }) => {
  const [uploadMode, setUploadMode] = useState('local'); 

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
  const [remoteStatus, setRemoteStatus] = useState('idle'); 
  const [remoteInfo, setRemoteInfo] = useState(null);
  const [newRemoteName, setNewRemoteName] = useState('');
  const [processTimer, setProcessTimer] = useState(0); // Live timer for remote processing

  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  // Prevent accidental close
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

  // Live timer logic for Remote Processing
  useEffect(() => {
    let interval;
    if (remoteStatus === 'processing') {
      interval = setInterval(() => {
        setProcessTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setProcessTimer(0);
    }
    return () => clearInterval(interval);
  }, [remoteStatus]);

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

  const formatTimer = (totalSeconds) => {
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // ==========================================
  // 📁 LOCAL FILE UPLOAD LOGIC
  // ==========================================
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultLink('');
      setProgress(0);
      setLoadedSize('0 B');
      setTotalSize('0 B');
      setUploadSpeed('0 B/s');
      setEta('Calculating...');
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
      xhr.onabort = () => { showToast("Upload Cancelled!", "error"); setIsUploading(false); };
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

  const resetAll = () => {
    setFile(null); setResultLink(''); setProgress(0); setLoadedSize('0 B'); setTotalSize('0 B'); setUploadSpeed('0 B/s'); setEta('Calculating...');
    setRemoteUrl(''); setRemoteStatus('idle'); setRemoteInfo(null); setNewRemoteName(''); setProcessTimer(0);
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

      {/* 🤖 TELEGRAM BOT BANNER */}
      <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-[#0088cc]/10 to-indigo-900/10 border border-[#0088cc]/30 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 text-center md:text-left shadow-lg mb-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0088cc] blur-[80px] opacity-20 rounded-full pointer-events-none"></div>
        <div className="w-16 h-16 rounded-full bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] text-3xl shrink-0 border border-[#0088cc]/30 shadow-[0_0_20px_rgba(0,136,204,0.3)] z-10">
          <i className="fab fa-telegram-plane"></i>
        </div>
        <div className="flex-1 z-10">
          <h3 className="text-xl font-black mb-1 text-[var(--text-primary)]">🔥 UrlKing Uploader BOT</h3>
          <p className="text-sm text-slate-400 font-medium">Upload files, bypass links, and manage your account instantly via our powerful Telegram Bot.</p>
        </div>
        <a href="https://t.me/URLKINGS_BOT" target="_blank" rel="noreferrer" className="btn-action bg-gradient-to-r from-[#0088cc] to-[#00aaff] px-8 py-3.5 rounded-xl text-white font-bold flex items-center gap-3 z-10 w-full md:w-auto justify-center shadow-[0_10px_20px_rgba(0,136,204,0.4)] hover:-translate-y-1 transition-transform">
          Start Bot <i className="fas fa-arrow-right text-sm"></i>
        </a>
      </div>

      {/* 🔴 TAB CHANGER UI (NO RESET ON CLICK) */}
      <div className="flex bg-[var(--nav-hover)] p-1.5 rounded-xl border border-[var(--glass-border)] shadow-inner">
        <button 
          onClick={() => setUploadMode('local')}
          className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${uploadMode === 'local' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-[var(--text-primary)]'}`}
        >
          <i className="fas fa-desktop"></i> Local Upload
        </button>
        <button 
          onClick={() => setUploadMode('remote')}
          className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${uploadMode === 'remote' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-[var(--text-primary)]'}`}
        >
          <i className="fas fa-cloud-download-alt"></i> Remote Upload
        </button>
      </div>

      <div className="border-animated p-1 mt-4">
        <div className="relative z-10 p-6 md:p-10 glass-panel border-none rounded-[1.2rem]">

          {/* ==============================================
              💻 LOCAL FILE MODE
          ============================================== */}
          {uploadMode === 'local' && (
            <div className="space-y-6 fade-in">
              <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${file ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-[var(--glass-border)] hover:border-indigo-500/50'}`}>
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} disabled={isUploading || resultLink} />
                {!file ? (
                  <div>
                    <div className="w-16 h-16 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20"><i className="fas fa-cloud-upload-alt text-3xl text-indigo-500"></i></div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">Select Local File</p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Click or Drag & Drop (Max 5GB)</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 mx-auto bg-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/40"><i className="fas fa-file-alt text-3xl text-white"></i></div>
                    <p className="text-lg font-bold text-[var(--text-primary)] break-all">{file.name}</p>
                    <p className="text-sm text-indigo-400 font-bold mt-1">{formatBytes(file.size)}</p>
                  </div>
                )}
              </div>

              {/* ✨ TADRA UPLOAD PROGRESS UI ✨ */}
              {isUploading && (
                <div className="p-5 glass-panel rounded-xl border border-indigo-500/30 bg-gradient-to-b from-[var(--bg-body)] to-indigo-900/10 shadow-[0_10px_30px_rgba(99,102,241,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                      <i className="fas fa-spinner fa-spin text-indigo-500"></i> Uploading...
                    </span>
                    <span className="text-xl font-black text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]">{progress}%</span>
                  </div>
                  
                  <div className="h-3 rounded-full bg-slate-800 border border-slate-700 overflow-hidden mb-4 p-[1px]">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 relative" style={{ width: `${progress}%` }}>
                      <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_infinite]"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    <div className="bg-[var(--nav-hover)] border border-[var(--glass-border)] rounded-lg p-2.5 text-center flex flex-col justify-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Uploaded</span>
                      <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{loadedSize} / {totalSize}</span>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 text-center flex flex-col justify-center">
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1"><i className="fas fa-bolt mr-1"></i> Speed</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{uploadSpeed}</span>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 text-center flex flex-col justify-center col-span-2 md:col-span-1">
                      <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1"><i className="fas fa-clock mr-1"></i> Time Left</span>
                      <span className="text-xs font-mono font-bold text-blue-400">{eta}</span>
                    </div>
                  </div>

                  <button onClick={cancelUpload} className="w-full py-2.5 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <i className="fas fa-times-circle"></i> Cancel Upload
                  </button>
                </div>
              )}

              {file && !isUploading && !resultLink && (
                <button onClick={startUpload} className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-black text-lg shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:-translate-y-1 transition-transform flex items-center justify-center gap-3">
                  <i className="fas fa-rocket"></i> Start Upload Now
                </button>
              )}
            </div>
          )}

          {/* ==============================================
              🌐 REMOTE URL MODE
          ============================================== */}
          {uploadMode === 'remote' && (
            <div className="space-y-6 fade-in">
              
              {!resultLink && remoteStatus !== 'processing' && (
                <div className="space-y-4 relative">
                  <label className="block text-sm font-bold text-[var(--text-primary)]">Enter Remote Link</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className="fas fa-link text-slate-400"></i>
                      </div>
                      <input 
                        type="url" placeholder="Paste DevUploads, MediaFire, or UrlKing link..." 
                        value={remoteUrl} onChange={(e) => setRemoteUrl(e.target.value)}
                        disabled={remoteStatus !== 'idle' && remoteStatus !== 'ready'}
                        className="w-full bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] py-4 pl-11 pr-4 rounded-xl focus:border-emerald-500 transition-colors placeholder:text-slate-500"
                      />
                    </div>
                    <button 
                      onClick={fetchRemoteDetails} disabled={!remoteUrl || remoteStatus === 'fetching'}
                      className="px-8 py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {remoteStatus === 'fetching' ? <><i className="fas fa-spinner fa-spin"></i> Fetching</> : <><i className="fas fa-search"></i> Fetch Info</>}
                    </button>
                  </div>
                  
                  {/* Remote Upload Guide */}
                  <div className="mt-2 bg-[var(--nav-hover)] border border-[var(--glass-border)] rounded-lg p-3 flex gap-3 text-xs text-slate-400">
                    <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
                    <div>
                      <strong className="text-[var(--text-primary)]">Supported Links:</strong> UrlKing & DevUploads (Instant Clone ⚡), MediaFire (Slower 🐢).
                    </div>
                  </div>
                </div>
              )}

              {remoteInfo && !resultLink && remoteStatus !== 'processing' && (
                <div className="p-6 rounded-2xl bg-[var(--bg-body)] border border-emerald-500/30 space-y-5 fade-in relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-bl-lg uppercase tracking-widest">
                    {remoteInfo.type === 'devuploads' || remoteInfo.type === 'urlking' ? '⚡ Instant Clone' : '🐢 Standard Download'}
                  </div>
                  
                  <div className="flex items-center gap-4 pt-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xl"><i className="fas fa-file-archive"></i></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">File Found</p>
                      <p className="text-[var(--text-primary)] font-mono font-bold truncate text-sm">{remoteInfo.originalName}</p>
                      <p className="text-xs text-emerald-400 font-bold mt-1"><i className="fas fa-hdd mr-1"></i> {formatBytes(remoteInfo.fileSize)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--glass-border)]">
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Rename File (Optional)</label>
                    <input 
                      type="text" value={newRemoteName} onChange={(e) => setNewRemoteName(e.target.value)}
                      placeholder={remoteInfo.originalName}
                      className="w-full bg-[var(--nav-hover)] border border-[var(--glass-border)] text-[var(--text-primary)] p-3.5 rounded-lg text-sm focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <button onClick={processRemoteUrl} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-black text-lg shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-transform flex items-center justify-center gap-3">
                    <i className="fas fa-bolt"></i> Process & Shorten Link
                  </button>
                </div>
              )}

              {/* ⏳ MEDIAFIRE / REMOTE PROCESSING ANIMATION */}
              {remoteStatus === 'processing' && (
                <div className="p-8 text-center glass-panel rounded-2xl border border-emerald-500/30 fade-in relative overflow-hidden bg-gradient-to-b from-[var(--bg-body)] to-emerald-900/10">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-[pulse_2s_infinite]"></div>
                  
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-blue-500/20 border-b-blue-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                      <i className="fas fa-cloud-download-alt text-emerald-400 animate-bounce"></i>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 tracking-wide">Processing File...</h3>
                  
                  <div className="inline-flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-mono text-emerald-400 font-bold text-sm">{formatTimer(processTimer)}</span>
                  </div>

                  {remoteInfo?.type === 'mediafire' ? (
                    <div className="text-sm bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-blue-400 font-medium">
                      <i className="fas fa-info-circle mr-2"></i> <b>MediaFire Link:</b> This file is currently downloading to our server. Please do not close this page. Larger files may take a few minutes.
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">Cloning file securely. This will be incredibly fast! ⚡</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==============================================
              🎉 COMMON RESULT CARD
          ============================================== */}
          {resultLink && (
            <div className="fade-in mt-2 space-y-4">
              <div className="p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)] text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-emerald-500/40">
                  <i className="fas fa-check"></i>
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-1">File Ready to Share!</h3>
                <p className="text-sm text-slate-400 mb-6">Your file has been successfully uploaded and securely shortened.</p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" readOnly value={resultLink} className="flex-1 bg-[var(--bg-body)] border border-[var(--glass-border)] text-emerald-400 p-4 rounded-xl text-sm font-mono font-bold text-center sm:text-left focus:outline-none" />
                  <button onClick={handleCopy} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg">
                    <i className="far fa-copy"></i> Copy Link
                  </button>
                </div>
              </div>
              <button onClick={resetAll} className="w-full py-4 border-2 border-[var(--glass-border)] text-slate-400 hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)] rounded-xl font-bold uppercase tracking-wider text-sm transition-all">
                <i className="fas fa-redo-alt mr-2"></i> Upload Another File
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ⚠️ IMPORTANT NOTICE */}
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-amber-500 mt-8 shadow-lg">
        <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <i className="fas fa-shield-alt text-lg"></i> Important Notice & Rules
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm text-slate-400 font-medium">
          <div className="flex gap-3 items-start bg-[var(--nav-hover)] p-3 rounded-lg border border-[var(--glass-border)]">
            <i className="fas fa-hdd text-indigo-400 text-lg mt-0.5"></i>
            <p>Maximum allowed file size per upload is <strong className="text-[var(--text-primary)]">5GB</strong>. Larger files will be rejected.</p>
          </div>
          <div className="flex gap-3 items-start bg-[var(--nav-hover)] p-3 rounded-lg border border-[var(--glass-border)]">
            <i className="fas fa-user-shield text-emerald-400 text-lg mt-0.5"></i>
            <p>Your files are securely encrypted and stored on high-speed private cloud servers.</p>
          </div>
          <div className="flex gap-3 items-start bg-[var(--nav-hover)] p-3 rounded-lg border border-red-500/20">
            <i className="fas fa-ban text-red-500 text-lg mt-0.5"></i>
            <p>Pornography, Child Abuse material, or illegal content is <strong className="text-red-400">strictly prohibited</strong>. Violators will be banned.</p>
          </div>
          <div className="flex gap-3 items-start bg-[var(--nav-hover)] p-3 rounded-lg border border-[var(--glass-border)]">
            <i className="fas fa-trash-alt text-amber-400 text-lg mt-0.5"></i>
            <p>Inactive files (0 downloads for 60 days) may be automatically deleted to save space.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UploadFile;
