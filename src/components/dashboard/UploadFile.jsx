import React, { useState, useEffect, useRef } from 'react';
import { showToast } from '../../toast'; 

const UploadFile = ({ token, user }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [resultLink, setResultLink] = useState('');

  // STATES: Speed, Size, aur Time (ETA) track karne ke liye
  const [loadedSize, setLoadedSize] = useState('0 B');
  const [totalSize, setTotalSize] = useState('0 B');
  const [uploadSpeed, setUploadSpeed] = useState('0 B/s');
  const [eta, setEta] = useState('Calculating...'); 

  // 🟢 NAYA: XHR Request ko store karne ke liye taaki cancel kar sakein
  const xhrRef = useRef(null);

  const API = import.meta.env.VITE_API_URL || "https://go.urlking.site";

  // 🟢 NAYA: Page Close/Reload Protection Alert
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = ''; // Standard way to trigger browser's exit warning
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUploading]);

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

  const startUpload = async () => {
    if (!file) return showToast("Please select a file to upload.", "error");

    setIsUploading(true);
    setProgress(0);
    setTotalSize(formatBytes(file.size));

    try {
      const serverRes = await fetch(`${API}/api/dev/server`, { headers: { Authorization: `Bearer ${token}` } });
      const serverData = await serverRes.json();

      if (!serverData.url) {
        showToast("Could not connect to upload server", "error");
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('sess_id', serverData.sess_id);
      formData.append('utype', 'reg');
      formData.append('file_0', file);

      // XHR setup and saving to Ref
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

            const bytesRemaining = e.total - e.loaded;
            const secondsRemaining = bytesPerSecond > 0 ? bytesRemaining / bytesPerSecond : 0;
            setEta(formatTime(secondsRemaining));

            startTime = now;
            lastLoaded = e.loaded;
          } 

          if (currentPercent === 100) {
            setUploadSpeed('Finishing...');
            setEta('Processing...');
          }
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            let fileCode = Array.isArray(response) && response[0] ? response[0].file_code : response.file_code;

            let fileSizeStr = file.size >= 1048576 
              ? (file.size / 1048576).toFixed(2) + " MB" 
              : (file.size / 1024).toFixed(2) + " KB";

            const finalRes = await fetch(`${API}/api/dev/finalize`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ file_code: fileCode, file_name: file.name, file_size: fileSizeStr })
            });
            const finalData = await finalRes.json();

            setResultLink(`https://go.urlking.site/${finalData.short_id}`);
            showToast("File uploaded & shortened successfully!", "success");

          } catch(e) { 
            showToast("Error finalizing upload: " + e.message, "error"); 
          }
        } else {
          showToast("Upload failed. Server responded with error.", "error");
        }
        setIsUploading(false);
      };

      xhr.onerror = () => { 
        showToast("Upload network error. Check your connection.", "error"); 
        setIsUploading(false); 
      };

      // 🟢 NAYA: Handle Abort event
      xhr.onabort = () => {
        showToast("Upload Cancelled!", "error");
        setIsUploading(false);
        resetUploader(); // Cancel hone par UI clear kar do
      };

      xhr.send(formData);

    } catch (e) {
      showToast(e.message || "An unexpected error occurred", "error");
      setIsUploading(false);
    }
  };

  // 🟢 NAYA: Cancel Upload Function
  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort(); // Ye request ko turant kill kar dega
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultLink);
    showToast("Link Copied Successfully!", "success");
  };

  const resetUploader = () => {
    setFile(null);
    setResultLink('');
    setProgress(0);
    setLoadedSize('0 B');
    setTotalSize('0 B');
    setUploadSpeed('0 B/s');
    setEta('Calculating...');
  };

  if (user?.can_upload !== 1) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/20 bg-[var(--glass-panel)] backdrop-blur-md shadow-2xl text-center max-w-4xl mx-auto fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <i className="fas fa-lock text-4xl text-red-500"></i>
        </div>
        <h3 className="text-2xl font-black mb-3 text-[var(--text-primary)]">Feature Locked</h3>
        <p className="mb-8 max-w-md mx-auto text-slate-400 font-medium">Upload access is currently restricted for your account. Please contact the administrator for permission.</p>
        <a href="https://t.me/vikubhai01" target="_blank" rel="noreferrer" className="inline-flex items-center px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-[0_10px_20px_rgba(239,68,68,0.3)] hover:-translate-y-1">
          <i className="fab fa-telegram-plane text-xl mr-3"></i> Request Access
        </a>
      </div>
    );
  }

  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Upload File</h2>
      </div>

      <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-[#0088cc]/10 to-indigo-900/10 border border-[#0088cc]/30 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 text-center md:text-left shadow-lg">
        <div className="w-16 h-16 rounded-full bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] text-3xl shrink-0 border border-[#0088cc]/30 shadow-[0_0_20px_rgba(0,136,204,0.3)] z-10">
          <i className="fab fa-telegram-plane"></i>
        </div>
        <div className="flex-1 z-10">
          <h3 className="text-xl font-black mb-1 text-[var(--text-primary)]">🔥 UrlKing Uploader BOT</h3>
          <p className="text-sm text-slate-400 font-medium">Upload files, easily shorten any link, and check account info instantly via Telegram.</p>
        </div>
        <a href="https://t.me/URLKINGS_BOT" target="_blank" rel="noreferrer" className="btn-action bg-gradient-to-r from-[#0088cc] to-[#00aaff] px-8 py-4 rounded-xl text-white font-bold flex items-center gap-3 z-10 w-full md:w-auto justify-center shadow-[0_10px_20px_rgba(0,136,204,0.4)] hover:-translate-y-1 transition-transform">
          Visit Bot <i className="fas fa-arrow-right text-sm"></i>
        </a>
      </div>

      <div className="border-animated p-1 mt-8">
        <div className="relative z-10 p-6 md:p-10 glass-panel border-none rounded-[1.2rem]">
          <div className="space-y-8">

            <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
              file ? 'border-indigo-500 bg-indigo-500/5' : 'border-[var(--glass-border)] bg-[var(--nav-hover)] hover:border-indigo-500/50'
            }`}>
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleFileChange} 
                disabled={isUploading || resultLink} 
                title="Select a file to upload"
              />

              {!file ? (
                <div className="pointer-events-none">
                  <div className="w-20 h-20 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-cloud-upload-alt text-4xl text-indigo-500"></i>
                  </div>
                  <p className="text-xl font-bold text-[var(--text-primary)] mb-2">Click or Drag & Drop to Select File</p>
                  <p className="text-sm text-slate-400 font-medium">Maximum allowed size: <span className="text-indigo-400 font-bold">5GB</span></p>
                </div>
              ) : (
                <div className="pointer-events-none">
                  <div className="w-20 h-20 mx-auto bg-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                    <i className="fas fa-file-alt text-4xl text-white"></i>
                  </div>
                  <p className="text-lg font-bold text-[var(--text-primary)] break-all px-4 mb-2">{file.name}</p>
                  
                  {!resultLink ? (
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/30">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Ready to upload</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/30">
                      <i className="fas fa-check text-indigo-500"></i>
                      <span className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Upload Finished</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-4 p-4 md:p-5 glass-panel rounded-xl border border-indigo-500/20">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-spinner fa-spin text-indigo-500"></i> Uploading...
                  </span>
                  <span className="text-indigo-400 text-sm font-black">{progress}%</span>
                </div>

                <div className="h-4 rounded-full overflow-hidden bg-slate-800 border border-slate-700/50 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-300 relative bg-[length:200%_100%] animate-[gradient_2s_linear_infinite]" 
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_infinite]"></div>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap justify-between items-center mt-2 text-[10px] sm:text-[11px] font-bold text-slate-400 font-mono tracking-wide gap-2">
                  <span className="bg-slate-800 px-2.5 py-1.5 rounded-md border border-slate-700 w-full md:w-auto text-center md:text-left">
                    <i className="fas fa-hdd text-slate-500 mr-1"></i> {loadedSize} / {totalSize}
                  </span>

                  <div className="flex gap-2 w-full md:w-auto justify-between md:justify-end">
                    <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1.5 rounded-md border border-blue-500/20 flex-1 text-center md:flex-none">
                      <i className="fas fa-clock mr-1"></i> {eta}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1.5 rounded-md border border-emerald-500/20 flex-1 text-center md:flex-none">
                      <i className="fas fa-tachometer-alt mr-1"></i> {uploadSpeed}
                    </span>
                  </div>
                </div>
                
                {/* 🟢 NAYA: Cancel Button During Upload */}
                <button 
                  onClick={cancelUpload}
                  className="w-full mt-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-times-circle"></i> Cancel Upload
                </button>
              </div>
            )}

            {resultLink && (
              <div className="fade-in space-y-4">
                <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-[0_10px_30px_rgba(16,185,129,0.1)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <p className="text-sm uppercase font-black text-emerald-500 tracking-wider">Upload & Shortening Complete!</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      readOnly 
                      value={resultLink} 
                      className="flex-1 bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] p-4 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500/50 transition-colors" 
                    />
                    <button 
                      onClick={handleCopy} 
                      className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shrink-0 transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                      <i className="far fa-copy"></i> Copy Link
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={resetUploader} 
                  className="w-full py-4 rounded-2xl border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-plus-circle text-lg"></i> Upload Another File
                </button>
              </div>
            )}

            {file && !isUploading && !resultLink && (
              <button 
                onClick={startUpload} 
                className="btn-action w-full py-5 rounded-2xl text-white font-black text-lg shadow-[0_10px_30px_rgba(99,102,241,0.4)] flex items-center justify-center gap-3 hover:-translate-y-1 transition-transform"
              >
                <i className="fas fa-cloud-upload-alt text-xl"></i> Start Upload Now
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border-l-4 border-amber-500 mt-8">
        <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <i className="fas fa-exclamation-triangle"></i> Upload Rules & Guidelines
        </h4>
        <ul className="space-y-2 text-xs md:text-sm text-slate-400">
          <li className="flex gap-2 items-start"><i className="fas fa-check text-emerald-500 mt-1"></i> <span className="flex-1">Maximum allowed file size per upload is <strong>5GB</strong>.</span></li>
          <li className="flex gap-2 items-start"><i className="fas fa-check text-emerald-500 mt-1"></i> <span className="flex-1">Your files are securely encrypted and stored on our high-speed servers.</span></li>
          <li className="flex gap-2 items-start"><i className="fas fa-times text-red-500 mt-1"></i> <span className="flex-1">Pornography, Child Abuse material, or illegal content is <strong>strictly prohibited</strong>. Accounts violating this will be permanently banned.</span></li>
          <li className="flex gap-2 items-start"><i className="fas fa-info-circle text-blue-400 mt-1"></i> <span className="flex-1">Inactive files (files with 0 downloads for 60 days) may be automatically deleted to free up server space.</span></li>
        </ul>
      </div>

    </div>
  );
};

export default UploadFile;
