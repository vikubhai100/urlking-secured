export const showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  const color = type === 'success' ? 'text-green-500' : 'text-red-500';
  
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icon} ${color} text-xl"></i><span class="font-medium text-sm">${message}</span>`;
  
  container.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add('show'));
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
};
