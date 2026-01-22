// CORS Proxy wrapper for API calls
const CORS_PROXY = 'https://corsproxy.io/?';
const API_BASE = 'https://universe-api-uabt.onrender.com/api';

/**
 * Make API calls with CORS handling
 * Usage: apiFetch('/stores') instead of fetch('https://universe-api-uabt.onrender.com/api/stores')
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    // Try direct fetch first (works in production)
    const response = await fetch(url, options);
    if (response.ok) return response;
    
    // If CORS error, use proxy
    if (response.status === 0 || !response.ok) {
      throw new Error('Initial fetch failed, trying proxy...');
    }
  } catch (err) {
    // Fall back to CORS proxy for development
    console.warn('Using CORS proxy due to:', err.message);
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    return fetch(proxyUrl, options);
  }
}

// Or use a simple fetch wrapper
window.apiFetch = async function(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  return fetch(url, options);
};
