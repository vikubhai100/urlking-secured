import React, { useState } from 'react';

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
    if (!file) return alert("Please select a file.");
    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Get Server
      const serverRes = await fetch(`${API}/api/dev/server`, { headers: { Authorization: `Bearer ${token}` } });
      const serverData = await serverRes.json();
      if (!serverData.url) throw new Error("Could not get upload server");

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
            
            let fileSizeStr = file.size >= 1048576 ? (file.size / 1048576).toFixed(2) + " MB" : (file.size / 1024).toFixed(2) + " KB";

            // 4. Finalize
            const finalRes = await fetch(`${API}/api/dev/finalize`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ file_code: fileCode, file_name: file.name, file_size: fileSizeStr })
            });
            const finalData = await finalRes.json();
            
            setResultLink(`https://go.urlking.site/${finalData.short_id}`);
            alert("File uploaded & Shortened!");
          } catch(e) { alert("Finalize Error: " + e.message); }
        } else {
          alert("Upload failed");
        }
        setIsUploading(false);
      };

      xhr.onerror = () => { alert("Upload network error"); setIsUploading(false); };
      xhr.send(formData);
    } catch (e) {
      alert(e.message);
      setIsUploading(false);
    }
  };

  if (user?.can_upload !== 1) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center max-w-4xl mx-auto fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
          <i className="fas fa-lock text-3xl text-red-500"></i>
        </div>
        <h3 className="text-xl font-bold mb-2">Feature Locked</h3>
        <p className="mb-6 max-w-md mx-auto text-slate-400">Upload access is currently restricted for your account. Please contact the administrator.</p>
        <a href="https://t.me/vikubhai01" target="_blank" rel="noreferrer" className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all">
          <i className="fab fa-telegram-plane mr-2"></i> Request Access
        </a>
      </div>
    );
  }

  return (
    <div className="fade-in w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Upload File</h2>
      
      {/* Bot Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-[#0088cc]/10 to-indigo-900/10 border-[#0088cc]/30 relative overflow-hidden flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
        <div className="w-14 h-14 rounded-full bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] text-2xl shrink-0 border border-[#0088cc]/30 shadow-[0_0_15px_rgba(0,136,204,0.3)] z-10">
          <i className="fab fa-telegram-plane"></i>
        </div>
        <div className="flex-1 z-10">
          <h3 className="text-xl font-bold mb-1">🔥 UrlKing Uploader BOT</h3>
          <p className="text-sm text-slate-400">File Upload, Easy Short any link, Account Info</p>
        </div>
        <a href="https://t.me/URLKINGS_BOT" target="_blank" rel="noreferrer" className="btn-action bg-[#0088cc] hover:bg-[#0077b5] px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 z-10 w-full md:w-auto justify-center">
          Visit Bot <i className="fas fa-arrow-right text-xs"></i>
        </a>
      </div>

      <div className="border-animated p-1">
        <div className="relative z-10 p-6 md:p-8 glass-panel border-none">
          <div className="space-y-6">
            <div className="relative border-2 border-dashed rounded-xl p-8 text-center transition-colors border-[var(--glass-border)] bg-[var(--nav-hover)] hover:border-indigo-500/50">
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} disabled={isUploading} />
              
              {!file ? (
                <div>
                  <i className="fas fa-file-import text-4xl mb-3 text-slate-500"></i>
                  <p className="font-medium">Click to Select File</p>
                  <p className="text-xs mt-1 text-slate-400">Max size: 5GB</p>
                </div>
              ) : (
                <div>
                  <i className="fas fa-file-alt text-4xl mb-3 text-indigo-400"></i>
                  <p className="font-bold break-all px-2">{file.name}</p>
                  <p className="text-xs mt-1 text-green-500 font-bold uppercase tracking-wider">Ready to upload</p>
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Uploading...</span>
                  <span className="text-indigo-400">{progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-slate-700/50">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {resultLink && (
              <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                <p className="text-xs uppercase font-bold text-green-500 mb-2">Upload Complete!</p>
                <div className="flex gap-2">
                  <input type="text" readOnly value={resultLink} className="input-premium w-full p-2 rounded text-sm font-mono" />
                  <button onClick={() => { navigator.clipboard.writeText(resultLink); alert("Copied!"); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs shrink-0">Copy</button>
                </div>
              </div>
            )}

            {file && !isUploading && !resultLink && (
              <button onClick={startUpload} className="btn-action w-full py-4 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2">
                Start Upload <i className="fas fa-arrow-right"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
