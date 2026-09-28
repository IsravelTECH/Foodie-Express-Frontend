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
   * Sync User Auth State & Check for Staff (Admin/Supervisor) Live Preview
   */
  const syncUserState = () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const headerActions = document.querySelector('.header-actions, .nav-actions');

      // Check role for Staff Banner
      checkStaffLiveMode(user);

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
        const role = (user.role || '').replace('ROLE_', '').toUpperCase();

        let staffDropdownLink = '';
        let staffQuickBtn = '';

        if (role === 'ADMIN') {
          staffQuickBtn = `
            <a href="../admin/dashboard.html" class="btn btn-sm btn-outline" style="border-color: var(--cust-primary); color: var(--cust-primary);">
              <i class="fa-solid fa-arrow-left"></i> Admin Dashboard
            </a>
          `;
          staffDropdownLink = `
            <a href="../admin/dashboard.html" class="dropdown-item-link" style="color: var(--cust-primary); font-weight: 700; background: var(--cust-primary-soft);">
              <i class="fa-solid fa-gauge"></i> Admin Dashboard
            </a>
          `;
        } else if (role === 'SUPERVISOR') {
          staffQuickBtn = `
            <a href="../supervisor/dashboard.html" class="btn btn-sm btn-outline" style="border-color: #0284C7; color: #0284C7;">
              <i class="fa-solid fa-arrow-left"></i> Supervisor Dashboard
            </a>
          `;
          staffDropdownLink = `
            <a href="../supervisor/dashboard.html" class="dropdown-item-link" style="color: #0284C7; font-weight: 700; background: #E0F2FE;">
              <i class="fa-solid fa-truck-ramp-box"></i> Supervisor Dashboard
            </a>
          `;
        }

        headerActions.innerHTML = `
          ${staffQuickBtn}
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
              ${staffDropdownLink}
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
   * Check if Current User is Staff and Display Top Return Banner
   */
  const checkStaffLiveMode = (user) => {
    const existingBanner = document.getElementById('staffRoleLiveBanner');
    if (existingBanner) existingBanner.remove();

    if (!user || !user.role) return;

    const role = user.role.replace('ROLE_', '').toUpperCase();
    if (role !== 'ADMIN' && role !== 'SUPERVISOR') return;

    const banner = document.createElement('div');
    banner.id = 'staffRoleLiveBanner';
    banner.className = `staff-role-banner staff-role-${role.toLowerCase()}`;

    if (role === 'ADMIN') {
      banner.innerHTML = `
        <div class="container banner-inner">
          <div class="staff-info">
            <span class="staff-badge"><i class="fa-solid fa-shield-halved"></i> Admin Mode</span>
            <span class="staff-text">You are previewing the live storefront as an Administrator.</span>
          </div>
          <a href="../admin/dashboard.html" class="staff-return-btn">
            <i class="fa-solid fa-arrow-left"></i> Back to Admin Dashboard
          </a>
        </div>
      `;
    } else {
      banner.innerHTML = `
        <div class="container banner-inner">
          <div class="staff-info">
            <span class="staff-badge"><i class="fa-solid fa-truck-ramp-box"></i> Supervisor Mode</span>
            <span class="staff-text">You are previewing the live storefront as a Supervisor.</span>
          </div>
          <a href="../supervisor/dashboard.html" class="staff-return-btn">
            <i class="fa-solid fa-arrow-left"></i> Back to Supervisor Dashboard
          </a>
        </div>
      `;
    }

    document.body.insertBefore(banner, document.body.firstChild);
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

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user && user.role ? user.role.replace('ROLE_', '').toUpperCase() : '';

    let staffDrawerItem = '';
    if (role === 'ADMIN') {
      staffDrawerItem = `
        <a href="../admin/dashboard.html" class="nav-link" style="background: var(--cust-primary-soft); color: var(--cust-primary); font-weight: 700; margin-bottom: 6px;">
          <i class="fa-solid fa-gauge" style="width: 22px;"></i> Back to Admin Dashboard
        </a>
      `;
    } else if (role === 'SUPERVISOR') {
      staffDrawerItem = `
        <a href="../supervisor/dashboard.html" class="nav-link" style="background: #E0F2FE; color: #0284C7; font-weight: 700; margin-bottom: 6px;">
          <i class="fa-solid fa-truck-ramp-box" style="width: 22px;"></i> Back to Supervisor Portal
        </a>
      `;
    }

    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'mobileAppDrawer';
      drawer.className = 'mobile-drawer';
      document.body.appendChild(drawer);
    }

    drawer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--cust-border); padding-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="images/foodie-logo.png" style="height: 36px; border-radius: 6px;" alt="Logo">
          <strong style="font-size: 1.1rem; color: var(--cust-navy);">Foodie Express</strong>
        </div>
        <button id="closeDrawerBtn" style="font-size: 1.25rem; color: var(--cust-text-muted); cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <nav style="display: flex; flex-direction: column; gap: 6px; margin-top: 14px;">
        ${staffDrawerItem}
        <a href="index.html" class="nav-link"><i class="fa-solid fa-house" style="width: 22px;"></i> Home</a>
        <a href="about.html" class="nav-link"><i class="fa-solid fa-circle-info" style="width: 22px;"></i> About Us</a>
        <div style="padding: 6px 12px; font-size: 0.76rem; font-weight: 800; color: var(--cust-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Cuisines &amp; Menu</div>
        <a href="menu.html" class="nav-link"><i class="fa-solid fa-utensils" style="width: 22px;"></i> All Dishes</a>
        <a href="indian.html" class="nav-link"><i class="fa-solid fa-bowl-food" style="width: 22px;"></i> Indian Cuisine</a>
        <a href="veg.html" class="nav-link"><i class="fa-solid fa-leaf" style="width: 22px; color: #16A34A;"></i> Pure Veg</a>
        <a href="nonveg.html" class="nav-link"><i class="fa-solid fa-drumstick-bite" style="width: 22px; color: #DC2626;"></i> Non-Veg</a>
        <a href="snacks.html" class="nav-link"><i class="fa-solid fa-cookie-bite" style="width: 22px; color: #D97706;"></i> Snacks</a>
        <a href="dessert.html" class="nav-link"><i class="fa-solid fa-ice-cream" style="width: 22px; color: #EC4899;"></i> Desserts</a>
        <div style="padding: 6px 12px; font-size: 0.76rem; font-weight: 800; color: var(--cust-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Quick Actions</div>
        <a href="reservations.html" class="nav-link"><i class="fa-solid fa-calendar-check" style="width: 22px;"></i> Reservations</a>
        <a href="contact.html" class="nav-link"><i class="fa-solid fa-envelope" style="width: 22px;"></i> Contact</a>
      </nav>
    `;

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
    const menuPages = ['menu.html', 'indian.html', 'veg.html', 'nonveg.html', 'snacks.html', 'dessert.html'];

    document.querySelectorAll('.nav-link, .nav-dropdown-item, .mobile-nav-item').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // If current path is one of the menu sub-pages, highlight parent Menu dropdown toggle
    if (menuPages.includes(currentPath)) {
      document.querySelectorAll('.nav-dropdown-toggle').forEach(el => el.classList.add('active'));
    }
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

// Global Video Controllers for Customer Pages
function toggleShowcaseVideoPlay(playerId = 'promoVideoPlayer', btnId = 'videoPlayPauseBtn') {
  const video = typeof playerId === 'string' ? document.getElementById(playerId) : playerId;
  const btn = typeof btnId === 'string' ? document.getElementById(btnId) : btnId;
  if (!video) return;

  const icon = (btn ? btn.querySelector('i') : null) || document.getElementById('videoPlayIcon');
  const text = (btn ? btn.querySelector('span') : null) || document.getElementById('videoPlayText');

  if (video.paused) {
    video.play();
    if (icon) icon.className = 'fa-solid fa-pause';
    if (text) text.textContent = 'Pause';
  } else {
    video.pause();
    if (icon) icon.className = 'fa-solid fa-play';
    if (text) text.textContent = 'Play';
  }
}

function toggleShowcaseVideoMute(playerId = 'promoVideoPlayer', btnId = 'videoMuteToggleBtn') {
  const video = typeof playerId === 'string' ? document.getElementById(playerId) : playerId;
  const btn = typeof btnId === 'string' ? document.getElementById(btnId) : btnId;
  if (!video) return;

  const icon = (btn ? btn.querySelector('i') : null) || document.getElementById('videoMuteIcon');
  const text = (btn ? btn.querySelector('span') : null) || document.getElementById('videoMuteText');

  video.muted = !video.muted;
  if (video.muted) {
    if (icon) icon.className = 'fa-solid fa-volume-xmark';
    if (text) text.textContent = 'Unmute';
  } else {
    if (icon) icon.className = 'fa-solid fa-volume-high';
    if (text) text.textContent = 'Mute';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  CustomerApp.init();
});

