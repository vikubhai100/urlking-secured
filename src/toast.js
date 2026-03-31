export const showToast = (message, type = 'success') => {
  let container = document.getElementById('toast-container');
  
  // Agar container nahi hai, toh automatic bana do
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  const colorClass = type === 'success' ? 'text-emerald-500' : 'text-red-500';
  const borderClass = type === 'success' ? 'border-emerald-500' : 'border-red-500';
  
  // Custom UI for Toast
  toast.className = `flex items-center gap-3 px-5 py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] bg-[var(--glass-panel)] backdrop-blur-xl border-l-4 ${borderClass} border-y border-r border-[var(--glass-border)] transform transition-all duration-500 translate-x-full mt-3 min-w-[300px] z-[99999]`;
  
  toast.innerHTML = `
    <i class="fas ${icon} ${colorClass} text-2xl"></i>
    <span class="font-bold text-[var(--text-primary)] tracking-wide">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Slide In Animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-full');
    toast.classList.add('translate-x-0');
  });
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('translate-x-0');
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
};
