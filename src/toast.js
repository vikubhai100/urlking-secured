export const showToast = (message, type = 'success') => {
  let container = document.getElementById('toast-container');
  
  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  const colorClass = type === 'success' ? 'text-emerald-500' : 'text-red-500';
  
  // Assign classes from index.css
  toast.className = `toast-original ${type}`;
  
  // Construct inner HTML
  toast.innerHTML = `
    <i class="fas ${icon} ${colorClass} text-2xl"></i>
    <span class="font-bold tracking-wide">${message}</span>
  `;
  
  // Add to container
  container.appendChild(toast);
  
  // Trigger slide-in animation using requestAnimationFrame
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  // Trigger slide-out animation after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    
    // Remove element from DOM after transition completes (400ms)
    setTimeout(() => toast.remove(), 400); 
  }, 3000);
};
