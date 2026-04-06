export const showToast = (message, type = 'success') => {
  let container = document.getElementById('toast-container');

  // Create container if it doesn't exist (Top-Center positioning)
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  
  const isSuccess = type === 'success';
  const icon = isSuccess ? 'fa-check-circle' : 'fa-times-circle'; // More compact icons
  const iconColor = isSuccess ? 'text-emerald-500' : 'text-rose-500';
  const borderGlow = isSuccess ? 'border-emerald-500/30' : 'border-rose-500/30';
  const shadowGlow = isSuccess ? 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'shadow-[0_0_20px_rgba(244,63,94,0.15)]';

  // 🚀 Premium Compact Pill Design with Glassmorphism
  toast.className = `flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[var(--bg-body)] border ${borderGlow} ${shadowGlow} backdrop-blur-md transform -translate-y-10 scale-90 opacity-0 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] max-w-[90vw]`;

  // Construct HTML (Smaller text, precise alignment)
  toast.innerHTML = `
    <i class="fas ${icon} ${iconColor} text-base drop-shadow-md"></i>
    <span class="text-sm font-bold text-[var(--text-primary)] tracking-wide truncate">${message}</span>
  `;

  // Add to container
  container.appendChild(toast);

  // Trigger Spring bounce-in animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.remove('-translate-y-10', 'scale-90', 'opacity-0');
      toast.classList.add('translate-y-0', 'scale-100', 'opacity-100');
    });
  });

  // Trigger smooth fade-out after 3 seconds
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'scale-100', 'opacity-100');
    toast.classList.add('-translate-y-10', 'scale-90', 'opacity-0');

    // Remove from DOM cleanly
    setTimeout(() => toast.remove(), 400); 
  }, 3000);
};
