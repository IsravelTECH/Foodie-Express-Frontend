/**
 * Foodie Express - Shared Navigation Component Controller
 * Dynamic header state based on visitor / ROLE_CUSTOMER / ROLE_ADMIN
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  syncCartBadge();
  syncWishlistBadge();
  syncUserState();
  initScrollEffects();
});

/**
 * Initialize Navbar Events & Mobile Drawer
 */
function initNavbar() {
  const headerContainer = document.querySelector('.header-container');
  let hamburgerBtn = document.querySelector('.hamburger-btn');
  const navMenu = document.querySelector('.nav-menu');

  if (headerContainer && navMenu && !hamburgerBtn) {
    hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-btn';
    hamburgerBtn.setAttribute('aria-label', 'Toggle Navigation Menu');
    hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    
    // Insert before header actions or append
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
      headerContainer.insertBefore(hamburgerBtn, headerActions);
    } else {
      headerContainer.appendChild(hamburgerBtn);
    }
  }

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.onclick = (e) => {
      e.stopPropagation();
      const isActive = navMenu.classList.toggle('active');
      hamburgerBtn.classList.toggle('active', isActive);
      hamburgerBtn.innerHTML = isActive ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    };

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });
  }

  // Active Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Sync Cart Badge Count
 */
function syncCartBadge() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badges = document.querySelectorAll('.cart-count-badge, .header-badge.cart-count-badge');
    badges.forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'flex' : 'none';
    });
  } catch (e) {
    console.error('Error syncing cart badge:', e);
  }
}

/**
 * Sync Wishlist Badge Count
 */
function syncWishlistBadge() {
  try {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const badges = document.querySelectorAll('.wishlist-count-badge, .header-badge.wishlist-count-badge');
    badges.forEach(badge => {
      badge.textContent = wishlist.length;
      badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
    });
  } catch (e) {
    console.error('Error syncing wishlist badge:', e);
  }
}

/**
 * Sync User Login State in Navbar (Visitor vs ROLE_CUSTOMER vs ROLE_ADMIN vs ROLE_SUPERVISOR)
 */
function syncUserState() {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const headerActions = document.querySelector('.header-actions');
    const navMenu = document.querySelector('.nav-menu');

    if (!headerActions) return;

    if (!user || !user.name) {
      // 1. PUBLIC VISITOR STATE
      headerActions.innerHTML = `
        <a href="wishlist.html" class="header-icon-btn" title="Wishlist">
          <i class="fa-regular fa-heart"></i>
          <span class="header-badge wishlist-count-badge" style="display: none;">0</span>
        </a>
        <a href="cart.html" class="header-icon-btn" title="Cart">
          <i class="fa-solid fa-bag-shopping"></i>
          <span class="header-badge cart-count-badge" style="display: none;">0</span>
        </a>
        <a href="login.html" class="btn btn-primary btn-sm" style="text-decoration: none; padding: 8px 16px;">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In
        </a>
      `;
      syncCartBadge();
      syncWishlistBadge();
      return;
    }

    const role = user.role || 'ROLE_CUSTOMER';
    const initial = (user.name ? user.name.charAt(0) : 'U').toUpperCase();

    if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
      // 2. ADMIN STOREFRONT NAVIGATION
      headerActions.innerHTML = `
        <a href="admin/dashboard.html" class="btn btn-primary btn-sm" style="text-decoration: none; padding: 8px 14px; background: #E85D04;">
          <i class="fa-solid fa-arrow-left"></i> Admin Dashboard
        </a>
        <button class="header-icon-btn" onclick="AuthService.logout()" title="Sign Out">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      `;
    } else if (role === 'ROLE_SUPERVISOR' || role === 'SUPERVISOR') {
      // 3. SUPERVISOR STOREFRONT NAVIGATION
      headerActions.innerHTML = `
        <a href="supervisor/dashboard.html" class="btn btn-primary btn-sm" style="text-decoration: none; padding: 8px 14px; background: #4338CA;">
          <i class="fa-solid fa-arrow-left"></i> Supervisor Dashboard
        </a>
        <button class="header-icon-btn" onclick="AuthService.logout()" title="Sign Out">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      `;
    } else {
      // 4. CUSTOMER AUTHENTICATED NAVIGATION
      headerActions.innerHTML = `
        <a href="wishlist.html" class="header-icon-btn" title="Wishlist">
          <i class="fa-regular fa-heart"></i>
          <span class="header-badge wishlist-count-badge" style="display: none;">0</span>
        </a>
        <a href="cart.html" class="header-icon-btn" title="Cart">
          <i class="fa-solid fa-bag-shopping"></i>
          <span class="header-badge cart-count-badge" style="display: none;">0</span>
        </a>
        <div style="position: relative; display: inline-block;">
          <button class="user-menu-btn" id="customerDropdownToggle" onclick="toggleCustomerDropdown()">
            <div class="user-avatar-circle">${initial}</div>
            <span>${user.name.split(' ')[0]}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem; margin-left: 4px; color: var(--text-muted);"></i>
          </button>
          <div id="customerHeaderMenu" style="display: none; position: absolute; right: 0; top: calc(100% + 8px); width: 210px; background: #FFFFFF; border: 1px solid var(--border); border-radius: 14px; box-shadow: var(--shadow-lg); padding: 8px; z-index: 1000; animation: fadeIn 0.15s ease;">
            <div style="padding: 10px 12px; border-bottom: 1px solid var(--border); margin-bottom: 6px;">
              <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-dark);">${user.name}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden;">${user.email}</div>
            </div>
            <a href="profile.html" class="dropdown-item-link" style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; font-size: 0.88rem; color: var(--text-dark); text-decoration: none;">
              <i class="fa-regular fa-user" style="width: 16px;"></i> My Profile
            </a>
            <a href="orders.html" class="dropdown-item-link" style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; font-size: 0.88rem; color: var(--text-dark); text-decoration: none;">
              <i class="fa-solid fa-receipt" style="width: 16px;"></i> My Orders
            </a>
            <a href="reservations.html" class="dropdown-item-link" style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; font-size: 0.88rem; color: var(--text-dark); text-decoration: none;">
              <i class="fa-solid fa-calendar-check" style="width: 16px;"></i> Reservations
            </a>
            <a href="wishlist.html" class="dropdown-item-link" style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; font-size: 0.88rem; color: var(--text-dark); text-decoration: none;">
              <i class="fa-regular fa-heart" style="width: 16px;"></i> Wishlist
            </a>
            <div style="border-top: 1px solid var(--border); margin: 6px 0;"></div>
            <button onclick="AuthService.logout()" style="width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; font-size: 0.88rem; color: #DC2626; background: none; border: none; cursor: pointer; text-align: left; font-weight: 600;">
              <i class="fa-solid fa-right-from-bracket" style="width: 16px;"></i> Sign Out
            </button>
          </div>
        </div>
      `;
      syncCartBadge();
      syncWishlistBadge();
    }
  } catch (e) {
    console.error('Error syncing user state:', e);
  }
}

function toggleCustomerDropdown() {
  const menu = document.getElementById('customerHeaderMenu');
  if (menu) {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('customerHeaderMenu');
  const btn = document.getElementById('customerDropdownToggle');
  if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
    menu.style.display = 'none';
  }
});

/**
 * Header Scroll Shadow Effect
 */
function initScrollEffects() {
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}
