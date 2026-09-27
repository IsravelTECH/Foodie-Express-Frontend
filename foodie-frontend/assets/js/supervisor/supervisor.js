/**
 * Foodie Express - Supervisor Core Framework
 */

const SupervisorApp = (() => {
  const getApiBase = () => (typeof FoodieApp !== 'undefined' && FoodieApp.API_BASE) ? FoodieApp.API_BASE : 'http://localhost:8080';
  const API_BASE = getApiBase();

  /**
   * Check Supervisor Authentication Guard
   */
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      window.location.href = 'login.html';
      return null;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'ROLE_SUPERVISOR' && user.role !== 'ROLE_ADMIN') {
        if (window.FoodieToast) {
          FoodieToast.error('You are not authorized to view the Supervisor portal.', 'Access Denied');
        }
        setTimeout(() => {
          if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') {
            window.location.href = 'admin-dashboard.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 800);
        return null;
      }
      return { token, user };
    } catch {
      window.location.href = 'login.html';
      return null;
    }
  };

  /**
   * Authenticated Fetch Helper
   */
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = options.headers || {};
    headers['Authorization'] = `Bearer ${token}`;
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url.startsWith('http') ? url : `${API_BASE}${url}`, {
      ...options,
      headers
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    }

    return res;
  };

  /**
   * Toast Notifications (Routed to Universal FoodieApp Toast)
   */
  const showToast = (msg, type = 'success', title = '') => {
    if (window.FoodieApp && FoodieApp.showToast) {
      FoodieApp.showToast(msg, type, title);
    } else {
      let container = document.getElementById('supervisor-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'supervisor-toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
      const toast = document.createElement('div');
      toast.className = `foodie-toast toast-${type}`;
      toast.innerHTML = `<div class="toast-content"><div class="toast-message">${msg}</div></div>`;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    }
  };

  /**
   * Logout with confirmation modal
   */
  const logout = async () => {
    if (window.FoodieAuth) {
      FoodieAuth.logout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    }
  };

  /**
   * Setup Mobile Navigation Toggle
   */
  const setupMobileNav = () => {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('supervisorSidebar');
    if (!toggleBtn || !sidebar) return;

    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    const openSidebar = () => {
      sidebar.classList.add('open');
      backdrop.classList.add('active');
    };

    const closeSidebar = () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('active');
    };

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    backdrop.addEventListener('click', closeSidebar);
  };

  /**
   * Initialize layout info
   */
  const init = () => {
    const auth = checkAuth();
    if (auth) {
      const nameEl = document.getElementById('supervisorUserName');
      if (nameEl) nameEl.textContent = auth.user.name || 'Supervisor';
      const emailEl = document.getElementById('supervisorUserEmail');
      if (emailEl) emailEl.textContent = auth.user.email || '';
      const initialEl = document.getElementById('supervisorUserInitial');
      if (initialEl) initialEl.textContent = (auth.user.name ? auth.user.name.charAt(0) : 'S').toUpperCase();
      const topbarAvatarEl = document.getElementById('topbarAvatar');
      if (topbarAvatarEl) topbarAvatarEl.textContent = (auth.user.name ? auth.user.name.charAt(0) : 'S').toUpperCase();
    }
    setupMobileNav();
  };

  return {
    API_BASE,
    checkAuth,
    authFetch,
    showToast,
    logout,
    init
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  SupervisorApp.init();
});
