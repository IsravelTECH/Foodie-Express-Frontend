/**
 * Foodie Express - Customer Storefront Core Controller
 * Handles Navigation, User Authentication State, Badges, Mobile Drawer, and Shared Customer UI
 */

const CustomerApp = (() => {
  const getApiBase = () => (typeof FoodieApp !== 'undefined' && FoodieApp.API_BASE) ? FoodieApp.API_BASE : 'http://localhost:8080';
  const API_BASE = getApiBase();

  /**
   * Initialize Customer Navbar & User State
   */
  const init = () => {
    syncUserState();
    syncBadges();
    setupMobileDrawer();
    setupDropdownDismissal();
    highlightActiveNavLink();
  };

  /**
   * Sync Cart & Wishlist Badge Counts
   */
  const syncBadges = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalCart = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      document.querySelectorAll('.cart-count-badge, .header-badge.cart-count-badge, #cart-count').forEach(badge => {
        badge.textContent = totalCart;
        badge.style.display = totalCart > 0 ? 'flex' : 'none';
      });

      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      document.querySelectorAll('.wishlist-count-badge, .header-badge.wishlist-count-badge').forEach(badge => {
        badge.textContent = wishlist.length;
        badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
      });
    } catch (e) {
      console.warn('Could not sync customer badges:', e);
    }
  };

  /**
   * Sync User Auth State in Navbar
   */
  const syncUserState = () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const headerActions = document.querySelector('.header-actions, .nav-actions');

      if (!headerActions) return;

      if (!user || !user.name) {
        // Visitor State
        headerActions.innerHTML = `
          <a href="wishlist.html" class="header-icon-btn" title="Wishlist">
            <i class="fa-regular fa-heart"></i>
            <span class="header-badge wishlist-count-badge" style="display: none;">0</span>
          </a>
          <a href="cart.html" class="header-icon-btn" title="Cart">
            <i class="fa-solid fa-bag-shopping"></i>
            <span class="header-badge cart-count-badge" style="display: none;">0</span>
          </a>
          <a href="login.html" class="btn btn-primary btn-sm">
            <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In
          </a>
          <button class="hamburger-btn" id="mobileDrawerBtn" aria-label="Open Navigation">
            <i class="fa-solid fa-bars"></i>
          </button>
        `;
      } else {
        const initial = (user.name ? user.name.charAt(0) : 'U').toUpperCase();
        const firstName = user.name.split(' ')[0];

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
            <button class="user-menu-btn" id="customerDropdownToggle" onclick="CustomerApp.toggleDropdown(event)">
              <div class="user-avatar-circle">${initial}</div>
              <span>${firstName}</span>
              <i class="fa-solid fa-chevron-down" style="font-size: 0.72rem; margin-left: 2px; color: var(--cust-text-muted);"></i>
            </button>
            <div class="customer-profile-dropdown" id="customerProfileDropdown" style="display: none;">
              <div class="dropdown-user-header">
                <strong>${user.name}</strong>
                <span>${user.email}</span>
              </div>
              <a href="profile.html" class="dropdown-item-link">
                <i class="fa-solid fa-user-gear"></i> My Profile
              </a>
              <a href="orders.html" class="dropdown-item-link">
                <i class="fa-solid fa-receipt"></i> My Orders
              </a>
              <a href="reservations.html" class="dropdown-item-link">
                <i class="fa-solid fa-calendar-check"></i> Reservations
              </a>
              <a href="wishlist.html" class="dropdown-item-link">
                <i class="fa-regular fa-heart"></i> Wishlist
              </a>
              <div style="height: 1px; background: var(--cust-border); margin: 6px 0;"></div>
              <button class="dropdown-item-link danger" onclick="CustomerApp.logout()" style="width: 100%; background: none; border: none; cursor: pointer; text-align: left;">
                <i class="fa-solid fa-right-from-bracket"></i> Sign Out
              </button>
            </div>
          </div>
          <button class="hamburger-btn" id="mobileDrawerBtn" aria-label="Open Navigation">
            <i class="fa-solid fa-bars"></i>
          </button>
        `;
      }
      syncBadges();
      setupMobileDrawer();
    } catch (e) {
      console.error('Error syncing customer user state:', e);
    }
  };

  /**
   * Toggle Customer Profile Dropdown
   */
  const toggleDropdown = (e) => {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('customerProfileDropdown');
    if (dropdown) {
      const isVisible = dropdown.style.display === 'block';
      dropdown.style.display = isVisible ? 'none' : 'block';
    }
  };

  /**
   * Close Dropdowns on Click Outside
   */
  const setupDropdownDismissal = () => {
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('customerProfileDropdown');
      const toggleBtn = document.getElementById('customerDropdownToggle');
      if (dropdown && dropdown.style.display === 'block') {
        if (!dropdown.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
          dropdown.style.display = 'none';
        }
      }
    });
  };

  /**
   * Mobile Drawer Setup
   */
  const setupMobileDrawer = () => {
    const toggleBtn = document.getElementById('mobileDrawerBtn');
    let drawer = document.getElementById('mobileAppDrawer');
    let backdrop = document.getElementById('mobileDrawerBackdrop');

    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'mobileAppDrawer';
      drawer.className = 'mobile-drawer';
      drawer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--cust-border); padding-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="images/foodie-logo.png" style="height: 36px; border-radius: 6px;" alt="Logo">
            <strong style="font-size: 1.1rem; color: var(--cust-navy);">Foodie Express</strong>
          </div>
          <button id="closeDrawerBtn" style="font-size: 1.25rem; color: var(--cust-text-muted); cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <nav style="display: flex; flex-direction: column; gap: 8px;">
          <a href="index.html" class="nav-link"><i class="fa-solid fa-house" style="width: 22px;"></i> Home</a>
          <a href="menu.html" class="nav-link"><i class="fa-solid fa-utensils" style="width: 22px;"></i> Full Menu</a>
          <a href="indian.html" class="nav-link"><i class="fa-solid fa-bowl-food" style="width: 22px;"></i> Indian Cuisine</a>
          <a href="veg.html" class="nav-link"><i class="fa-solid fa-leaf" style="width: 22px; color: #16A34A;"></i> Pure Veg</a>
          <a href="nonveg.html" class="nav-link"><i class="fa-solid fa-drumstick-bite" style="width: 22px; color: #DC2626;"></i> Non-Veg</a>
          <a href="snacks.html" class="nav-link"><i class="fa-solid fa-cookie-bite" style="width: 22px; color: #D97706;"></i> Snacks</a>
          <a href="dessert.html" class="nav-link"><i class="fa-solid fa-ice-cream" style="width: 22px; color: #EC4899;"></i> Desserts</a>
          <a href="reservations.html" class="nav-link"><i class="fa-solid fa-calendar-check" style="width: 22px;"></i> Reservations</a>
          <a href="about.html" class="nav-link"><i class="fa-solid fa-circle-info" style="width: 22px;"></i> About Us</a>
          <a href="contact.html" class="nav-link"><i class="fa-solid fa-envelope" style="width: 22px;"></i> Contact</a>
        </nav>
      `;
      document.body.appendChild(drawer);
    }

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'mobileDrawerBackdrop';
      backdrop.className = 'mobile-drawer-backdrop';
      document.body.appendChild(backdrop);
    }

    const openDrawer = () => {
      drawer.classList.add('open');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (toggleBtn) toggleBtn.onclick = openDrawer;
    const closeBtn = document.getElementById('closeDrawerBtn');
    if (closeBtn) closeBtn.onclick = closeDrawer;
    backdrop.onclick = closeDrawer;
  };

  /**
   * Highlight Active Nav Link based on URL
   */
  const highlightActiveNavLink = () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  /**
   * Logout Customer
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (typeof FoodieApp !== 'undefined') {
      FoodieApp.showToast('You have been signed out.', 'info');
    }
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
  };

  return {
    API_BASE,
    init,
    syncBadges,
    syncUserState,
    toggleDropdown,
    logout
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  CustomerApp.init();
});
