/**
 * Foodie Express - Shared API Client & Environment Configuration
 */

const FoodieAPI = (() => {
  const getBaseUrl = () => {
    if (window.__FOODIE_CONFIG__ && window.__FOODIE_CONFIG__.API_BASE_URL) {
      return window.__FOODIE_CONFIG__.API_BASE_URL;
    }
    const customUrl = localStorage.getItem('FOODIE_API_BASE_URL');
    if (customUrl) return customUrl;

    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || window.location.protocol === 'file:') {
      return 'http://localhost:8080';
    }
    return 'https://foodie-express-backend-production.up.railway.app';
  };

  const API_BASE_URL = getBaseUrl();

  /**
   * Universal Fetch Wrapper with Auth Header & Error Handling
   */
  const request = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    const headers = { ...options.headers };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        console.warn('API 401 Unauthorized encountered on:', endpoint);
        // Dispatch global unauthorized event
        window.dispatchEvent(new CustomEvent('foodie:unauthorized'));
      }

      return response;
    } catch (error) {
      console.error('FoodieAPI Network Error:', error);
      throw error;
    }
  };

  return {
    BASE_URL: API_BASE_URL,
    request,
    get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body: (body instanceof FormData ? body : JSON.stringify(body)) }),
    put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body: (body instanceof FormData ? body : JSON.stringify(body)) }),
    delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
  };
})();

// Global alias for compatibility
window.FoodieAPI = FoodieAPI;
window.API_BASE_URL = FoodieAPI.BASE_URL;
