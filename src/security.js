/**
 * 🔒 Frontend Security Utilities for URLKING
 * 
 * These utilities provide client-side security hardening without
 * requiring any backend changes. They supplement server-side security.
 */

// ─── INPUT SANITIZATION ────────────────────────────────────────
/**
 * Sanitize user input to prevent XSS when rendering in DOM.
 * Uses DOM-based escaping for maximum safety.
 */
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

/**
 * Validate URL format to prevent javascript: protocol injection
 */
export const isValidUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    // Only allow http/https protocols
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

/**
 * Validate username format (alphanumeric, underscore, hyphen only)
 */
export const isValidUsername = (username) => {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ─── SECURITY HEADERS FOR FETCH ────────────────────────────────
/**
 * Get standard security headers for API requests.
 * Adds X-Requested-With to prevent CSRF via cross-origin requests.
 */
export const getSecureHeaders = (token = null) => {
  const headers = {
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ─── TOKEN SECURITY ────────────────────────────────────────────
/**
 * Check if a JWT token is expired (front-end only check).
 * Returns true if token is expired or malformed.
 */
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch {
    return false; // Let API decide if token is invalid
  }
};

/**
 * Securely clear all auth data from storage
 */
export const secureLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('refreshToken');
  sessionStorage.clear();
};

// ─── RATE LIMITING ─────────────────────────────────────────────
/**
 * Simple client-side rate limiter.
 * Prevents brute-force attacks on login/register forms.
 */
export class RateLimiter {
  constructor(minIntervalMs = 2000, maxAttempts = 5, windowMs = 60000) {
    this.minInterval = minIntervalMs;
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = [];
  }

  canProceed() {
    const now = Date.now();
    // Clean old attempts outside the window
    this.attempts = this.attempts.filter(t => now - t < this.windowMs);
    
    if (this.attempts.length >= this.maxAttempts) {
      return false; // Too many attempts
    }
    if (this.attempts.length > 0 && now - this.attempts[this.attempts.length - 1] < this.minInterval) {
      return false; // Too soon
    }
    return true;
  }

  recordAttempt() {
    this.attempts.push(Date.now());
  }

  getRemainingTime() {
    const now = Date.now();
    if (this.attempts.length < this.maxAttempts) {
      return Math.max(0, this.minInterval - (now - (this.attempts[this.attempts.length - 1] || 0)));
    }
    // Window cooldown
    const oldestInWindow = this.attempts[0];
    return Math.max(0, this.windowMs - (now - oldestInWindow));
  }
}
