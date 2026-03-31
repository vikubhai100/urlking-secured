import React, { useState } from 'react';
import { showToast } from '../../toast'; // Premium Toast Import kiya gaya hai

const UploadFile = ({ token, user }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [resultLink, setResultLink] = useState('');
  
  const API = "https://go.urlking.site";

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultLink('');
    }
  };

  const startUpload = async () => {
    // 1. NATIVE ALERT REMOVED
    if (!file) return showToast("Please select a file to upload.", "error");
    
    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Get Server
      const serverRes = await fetch(`${API}/api/dev/server`, { headers: { Authorization: `Bearer ${token}` } });
      const serverData = await serverRes.json();
      
      if (!serverData.url) {
        showToast("Could not connect to upload server", "error");
        setIsUploading(false);
        return;
      }

      // 2. Prepare Form Data
      const formData = new FormData();
      formData.append('sess_id', serverData.sess_id);
      formData.append('utype', 'reg');
      formData.append('file_0', file);

      // 3. XHR for Progress Tracking
      const xhr = new XMLHttpRequest();
      xhr.open('POST', serverData.url, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.floor((e.loaded / e.total) * 100));
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

            // 4. Finalize Request
            const finalRes = await fetch(`${API}/api/dev/finalize`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ file_code: fileCode, file_name: file.name, file_size: fileSizeStr })
            });
            const finalData = await finalRes.json();
            
            setResultLink(`https://go.urlking.site/${finalData.short_id}`);
            
            // 2. SUCCESS TOAST ADDED
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
      
      xhr.send(formData);
      
    } catch (e) {
      showToast(e.message || "An unexpected error occurred", "error");
      setIsUploading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultLink);
    // 3. COPY TOAST ADDED
    showToast("Link Copied Successfully!", "success");
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
      
      {/* Bot Banner - Kept colorful but adapted for theme */}
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
            
            {/* Upload Area */}
            <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
              file ? 'border-indigo-500 bg-indigo-500/5' : 'border-[var(--glass-border)] bg-[var(--nav-hover)] hover:border-indigo-500/50'
            }`}>
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleFileChange} 
                disabled={isUploading} 
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
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Ready to upload</span>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-3 p-4 glass-panel rounded-xl">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-2"><i className="fas fa-spinner fa-spin text-indigo-500"></i> Uploading to secure server...</span>
                  <span className="text-indigo-500">{progress}%</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-[var(--nav-hover)] border border-[var(--glass-border)]">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 relative" 
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_infinite]"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Result Link */}
            {resultLink && (
              <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-[0_10px_30px_rgba(16,185,129,0.1)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <i className="fas fa-check text-sm"></i>
                  </div>
                  <p className="text-sm uppercase font-black text-emerald-500 tracking-wider">Upload & Shortening Complete!</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    readOnly 
                    value={resultLink} 
                    className="flex-1 bg-[var(--bg-body)] border border-[var(--glass-border)] text-[var(--text-primary)] p-4 rounded-xl text-sm font-mono focus:outline-none" 
                  />
                  <button 
                    onClick={handleCopy} 
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shrink-0 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <i className="far fa-copy"></i> Copy Link
                  </button>
                </div>
              </div>
            )}

            {/* Start Upload Button */}
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
    </div>
  );
};

export default UploadFile;
