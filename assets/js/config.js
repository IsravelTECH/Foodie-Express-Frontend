/**
 * Foodie Express - Client Environment & Runtime Configuration
 * 
 * To override the API Base URL for custom production environments:
 * 1. Set window.__FOODIE_CONFIG__.API_BASE_URL before app.js executes, OR
 * 2. Set localStorage.setItem('FOODIE_API_BASE_URL', 'https://your-custom-backend.com')
 */

window.__FOODIE_CONFIG__ = window.__FOODIE_CONFIG__ || {
  // Update this default backend URL with your live deployed Java hosting instance:
  API_BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
    ? 'http://localhost:8080'
    : 'https://foodie-backend-api.onrender.com',
  APP_NAME: 'Foodie Express',
  VERSION: '1.0.0',
  ENV: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'development' : 'production'
};
