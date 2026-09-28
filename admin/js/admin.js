/**
 * Foodie Express - Admin Core Framework
 */

const AdminApp = (() => {
  const getApiBase = () => (typeof FoodieAPI !== 'undefined' && FoodieAPI.BASE_URL) 
    ? FoodieAPI.BASE_URL 
    : ((typeof FoodieApp !== 'undefined' && FoodieApp.API_BASE) ? FoodieApp.API_BASE : 'http://localhost:8080');
  
  const API_BASE = getApiBase();

  /**
   * Check Admin Authentication Guard
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
      const role = (user.role || '').replace('ROLE_', '').toUpperCase();
      if (role !== 'ADMIN') {
        if (window.FoodieApp && FoodieApp.showToast) {
          FoodieApp.showToast('You are not authorized to view the Admin portal.', 'error', 'Access Denied');
        }
        setTimeout(() => {
          if (role === 'SUPERVISOR') {
            window.location.href = '../supervisor/dashboard.html';
          } else {
            window.location.href = '../customer/index.html';
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
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const targetUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    const res = await fetch(targetUrl, {
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
   * Admin Toast Notifications (Routed to Universal FoodieApp Toast)
   */
  const showToast = (msg, type = 'success', title = '') => {
    if (window.FoodieApp && FoodieApp.showToast) {
      FoodieApp.showToast(msg, type, title);
    } else {
      let container = document.getElementById('admin-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'admin-toast-container';
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
   * Logout Admin with redirect
   */
  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  };

  /**
   * Setup Mobile Sidebar Toggle
   */
  const setupMobileNav = () => {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
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
   * Toggle Header Profile Dropdown
   */
  const toggleProfileDropdown = (e) => {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('adminProfileDropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  };

  /**
   * Close dropdown on outside click
   */
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('adminProfileDropdown');
    const toggle = document.getElementById('topbarAvatar');
    if (dropdown && dropdown.classList.contains('show')) {
      if (!dropdown.contains(e.target) && (!toggle || !toggle.contains(e.target))) {
        dropdown.classList.remove('show');
      }
    }
  });

  /**
   * Initialize layout info
   */
  const init = () => {
    const auth = checkAuth();
    if (auth) {
      const name = auth.user.name || 'Foodie Admin';
      const email = auth.user.email || 'admin@foodie.com';
      const roleStr = (auth.user.role || 'ADMIN').replace('ROLE_', '');
      const initial = (name ? name.charAt(0) : 'F').toUpperCase();

      // Sidebar Profile Info
      const adminNameEl = document.getElementById('adminUserName');
      if (adminNameEl) adminNameEl.textContent = name;
      const adminEmailEl = document.getElementById('adminUserEmail');
      if (adminEmailEl) adminEmailEl.textContent = email;
      const adminRoleEl = document.getElementById('adminUserRole');
      if (adminRoleEl) adminRoleEl.textContent = roleStr;
      const initialEl = document.getElementById('adminUserInitial');
      if (initialEl) initialEl.textContent = initial;

      // Topbar Avatar & Dropdown Info
      const topbarAvatarEl = document.getElementById('topbarAvatar');
      if (topbarAvatarEl) topbarAvatarEl.textContent = initial;
      const dropdownAvatarEl = document.getElementById('dropdownAvatar');
      if (dropdownAvatarEl) dropdownAvatarEl.textContent = initial;
      const dropdownNameEl = document.getElementById('dropdownName');
      if (dropdownNameEl) dropdownNameEl.textContent = name;
      const dropdownEmailEl = document.getElementById('dropdownEmail');
      if (dropdownEmailEl) dropdownEmailEl.textContent = email;
      const dropdownRoleEl = document.getElementById('dropdownRole');
      if (dropdownRoleEl) dropdownRoleEl.textContent = roleStr;
    }
    setupMobileNav();
  };

  return {
    API_BASE,
    checkAuth,
    authFetch,
    showToast,
    logout,
    toggleProfileDropdown,
    init
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.endsWith('login.html')) {
    AdminApp.init();
  }
});
