import React, { useState, useEffect } from 'react';
import { showToast } from '../../toast'; // Premium Toast Import

const ManageFiles = ({ token }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch logic here (Assuming you have a fetchFiles function)

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    // NATIVE ALERT HATA DIYA, ORIGINAL TOAST LAGA DIYA
    showToast("Link Copied Successfully!", "success");
  };

  const handleDelete = (id) => {
    // delete logic...
    showToast("File deleted", "success");
  };

  return (
    <div className="glass-panel p-6 rounded-[24px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Manage Uploaded Files</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--glass-border)] text-slate-400 text-xs uppercase tracking-wider">
              <th className="pb-3 px-4 font-semibold">File Name</th>
              <th className="pb-3 px-4 font-semibold">Size</th>
              <th className="pb-3 px-4 font-semibold">Link</th>
              <th className="pb-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Map your files here. Example Row: */}
            <tr className="border-b border-[var(--glass-border)] hover:bg-[var(--nav-hover)] transition-colors">
              <td className="py-4 px-4 text-sm font-medium">example_file.zip</td>
              <td className="py-4 px-4 text-sm text-slate-400">12.5 MB</td>
              <td className="py-4 px-4 text-sm text-indigo-400 hover:underline cursor-pointer">
                <a href="#" target="_blank" rel="noopener noreferrer"><i className="fas fa-external-link-alt mr-1"></i> Link</a>
              </td>
              <td className="py-4 px-4 flex justify-end gap-2">
                <button className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors flex items-center justify-center">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center">
                  <i className="fas fa-trash-alt"></i>
                </button>
                <button onClick={() => copyToClipboard('https://look.mypdftools.site/xxxx')} className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center">
                  <i className="far fa-copy"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageFiles;
