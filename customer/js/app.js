/**
 * Foodie Express - Global App Utilities & Helpers
 */
const FoodieApp = (() => {
  /**
   * Centralized API Base Resolution
   * Adapts dynamically across localhost, preview environments, and production Vercel deployment.
   */
  const getApiBaseUrl = () => {
    // 1. Explicit window global override (e.g. from injected config script)
    if (typeof window !== 'undefined' && window.__FOODIE_CONFIG__ && window.__FOODIE_CONFIG__.API_BASE_URL) {
      return window.__FOODIE_CONFIG__.API_BASE_URL.replace(/\/+$/, '');
    }
    // 2. LocalStorage override for runtime testing/staging toggling
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedOverride = localStorage.getItem('FOODIE_API_BASE_URL');
      if (storedOverride) {
        return storedOverride.replace(/\/+$/, '');
      }
    }
    // 3. Localhost & development environment detection
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || window.location.protocol === 'file:') {
        return 'http://localhost:8080';
      }
    }
    // 4. Production Java Spring Boot Backend Hosting URL
    return 'https://foodie-express-backend-production.up.railway.app';
  };

  const API_BASE = getApiBaseUrl();

  /**
   * Premium Universal Toast System
   * @param {string} message - Message text
   * @param {'success'|'error'|'warning'|'info'} type - Toast type
   * @param {string} [title] - Optional title
   * @param {number} [duration] - Display time in ms
   */
  const showToast = (message, type = 'success', title = '', duration) => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const defaultDurations = {
      success: 3000,
      info: 3000,
      warning: 4000,
      error: 5000
    };
    const toastDuration = duration || defaultDurations[type] || 3500;

    const toast = document.createElement('div');
    toast.className = `foodie-toast toast-${type}`;

    const icons = {
      success: '<i class="fa-solid fa-check"></i>',
      error: '<i class="fa-solid fa-exclamation"></i>',
      warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
      info: '<i class="fa-solid fa-info"></i>'
    };

    const defaultTitles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Notification'
    };
    const toastTitle = title || defaultTitles[type] || 'Notice';

    toast.innerHTML = `
      <div class="toast-icon-wrap">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${toastTitle}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close-btn" aria-label="Close">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    const dismiss = () => {
      toast.style.animation = 'toastSlideOutRight 0.25s forwards';
      setTimeout(() => toast.remove(), 250);
    };
    if (closeBtn) closeBtn.onclick = dismiss;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast && toast.parentElement) {
        dismiss();
      }
    }, toastDuration);
  };

  /**
   * Premium Universal Confirmation Modal
   * @param {Object} options
   * @param {string} options.title - Header title
   * @param {string} options.message - Explanation text
   * @param {string} [options.confirmText='Confirm'] - Confirm button text
   * @param {string} [options.cancelText='Cancel'] - Cancel button text
   * @param {'danger'|'primary'} [options.type='primary'] - Modal visual theme
   * @returns {Promise<boolean>} Resolves true if confirmed, false if cancelled
   */
  const confirmModal = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'primary' }) => {
    return new Promise((resolve) => {
      let overlay = document.getElementById('foodieGlobalConfirmModal');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'foodieGlobalConfirmModal';
        overlay.className = 'foodie-confirm-modal-overlay';
        document.body.appendChild(overlay);
      }

      const iconHtml = type === 'danger'
        ? '<div class="foodie-confirm-icon danger"><i class="fa-solid fa-trash-can"></i></div>'
        : '<div class="foodie-confirm-icon primary"><i class="fa-solid fa-circle-question"></i></div>';

      overlay.innerHTML = `
        <div class="foodie-confirm-dialog">
          ${iconHtml}
          <div class="foodie-confirm-title">${title}</div>
          <div class="foodie-confirm-msg">${message}</div>
          <div class="foodie-confirm-actions">
            <button class="confirm-cancel-btn">${cancelText}</button>
            <button class="confirm-action-btn ${type === 'danger' ? 'btn-danger' : ''}">${confirmText}</button>
          </div>
        </div>
      `;

      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      const cleanup = (result) => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        resolve(result);
      };

      overlay.querySelector('.confirm-cancel-btn').onclick = () => cleanup(false);
      overlay.querySelector('.confirm-action-btn').onclick = () => cleanup(true);
      overlay.onclick = (e) => {
        if (e.target === overlay) cleanup(false);
      };
    });
  };

  /**
   * Modal Manager
   */
  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  /**
   * Universal Dish Image Map Fallback
   */
  const imageMap = {
    // Hot Beverages & Drinks
    'black tea': 'images/juices/black tea.jpg',
    'ginger tea': 'images/juices/ginger tea.jpg',
    'grrentea': 'images/juices/grrentea.jpg',
    'lemon tea': 'images/juices/lemon tea.jpg',
    'masalachai': 'images/juices/masalachai.jpg',
    'turmeric milk': 'images/juices/Turmeric Milk.jpg',
    'badam milk': 'images/juices/badam milk.jpg',
    'fruit punch': 'images/juices/fruit punch.jpg',
    'virginmochito': 'images/juices/virginmochito.jpg',
    'watermaelon aqua fresca': 'images/juices/watermaelon aqua fresca.jpg',
    'lassi': 'images/juices/lassi.jpg',
    'nimbupani': 'images/juices/nimbupani.webp',
    'chaas': 'images/juices/Chaas Recipe (Mattha Recipe).jpg',
    'barleywater': 'images/juices/barleywater.jpg',
    'apple juice': 'images/juices/apple juice.jpg',
    'watermelon juice': 'images/juices/Watermelon Juice.jpg',
    'orange juice': 'images/juices/Orange Juice.jpg',
    'mangojuice': 'images/juices/mangojuice.jpg',
    'dragonfruit juice': 'images/juices/dragonfruit juice.jpg',
    'kiwi': 'images/juices/kiwi.jpg',
    'lemonjuice': 'images/juices/lemonjuice.jpg',
    'rosemilk': 'images/juices/rosemilk.jpg',
    'banana milkshake': 'images/juices/Banana Milkshake.jpg',
    'avocado shake': 'images/juices/avocado Shake.jpg',
    'blueberry smoothie': 'images/juices/Blueberry Smoothie.jpg',
    'strawberry smoothie': 'images/juices/Strawberry Smoothie.jpg',
    'vanilamilkshake': 'images/juices/vanilamilkshake.jpg',
    'chocomilkshake': 'images/desserts/chocomilkshake.jpg',
    'falooda': 'images/juices/Falooda.jpg',
    'cold coffee': 'images/juices/Cold Coffee.jpg',
    'hot chocolate': 'images/juices/Hot Chocolate.jpg',
    'mango mastani': 'images/juices/Mango Mastani.jpg',
    'americano': 'images/juices/americano.jpg',
    'capucchino': 'images/juices/capucchino.jpg',
    'espresso': 'images/juices/espresso.jpg',
    'latte': 'images/juices/latte.jpg',
    'mocha': 'images/juices/mocha.jpg',
    'macchiato': 'images/juices/macchiato.jpg',

    // Desserts
    'affogato': 'images/desserts/affogato.jpg',
    'brownie': 'images/desserts/brownie.jpg',
    'brownie2': 'images/desserts/brownie2.jpg',
    'cake': 'images/desserts/cake.jpg',
    'cannolicake': 'images/desserts/cannolicake.jpg',
    'carpriccioza': 'images/desserts/carpriccioza.jpg',
    'chocomouse': 'images/desserts/chocomouse.jpg',
    'gulab jamun': 'images/desserts/gualab.jpg',
    'gualab': 'images/desserts/gualab.jpg',
    'icebergwedge': 'images/desserts/icebergwedge.jpg',
    'profiteroles': 'images/desserts/profiteroles.jpg',
    'rasgulla': 'images/desserts/rasgulla.jpg',
    'rasmalai': 'images/desserts/rasmalai.jpg',
    'strawberry cake': 'images/desserts/strawberry cake.jpg',

    // Snacks
    'baji': 'images/snacks/baji.jpg',
    'burger': 'images/snacks/burger.jpg',
    'cheese sand': 'images/snacks/cheese sand.jpg',
    'cheese sandwich': 'images/snacks/cheese sand.jpg',
    'chickenpuffs': 'images/snacks/chickenpuffs.jpg',
    'croissant': 'images/snacks/croissant.jpg',
    'hamburger': 'images/snacks/hamburger.jpg',
    'eggpuffs': 'images/snacks/eggpuffs.jpg',
    'japchae': 'images/snacks/japchae.jpg',
    'lasagna': 'images/snacks/lasagna.jpg',
    'creme brulee': 'images/snacks/ravioli.jpg',
    'samosa': 'images/snacks/samosa.jpg',
    'sandwidch': 'images/snacks/sandwitch.jpg',
    'sandwich': 'images/snacks/sandwitch.jpg',
    'vadapav': 'images/snacks/vadapav.jpg',
    'vada pav': 'images/snacks/vadapav.jpg',
    'vazhagaibajji': 'images/snacks/vazhagaibajji.jpg',
    'veg puffs': 'images/snacks/veg puffs.jpg',
    'bonda': 'images/snacks/bonda.jpg',
    'breadbajji': 'images/snacks/breadbajji.jpg',
    'bread bajji': 'images/snacks/breadbajji.jpg',
    'egg bonda': 'images/snacks/egg bonda.jpg',
    'ulunthu vadai': 'images/snacks/ulunthu vadai.jpg',
    'chilibajji': 'images/snacks/chilibajji.jpg',
    'momos': 'images/snacks/momos.jpg',
    'nuggets': 'images/snacks/nuggets.jpg',
    'panipuri': 'images/snacks/panipuri.jpg',
    'pani puri': 'images/snacks/panipuri.jpg',

    // Veg Indian Dishes
    'aloo gobi': 'images/indianfood/aloo gobi.jpg',
    'dosa': 'images/indianfood/dosa.jpg',
    'idly': 'images/indianfood/idly.jpg',
    'palak paneer': 'images/indianfood/palak.jpg',
    'paneer': 'images/indianfood/pan.jpg',
    'paneer butter masala': 'images/indianfood/pan.jpg',
    'sambarice': 'images/indianfood/sambarice.jpg',
    'sambar rice': 'images/indianfood/sambarice.jpg',
    'veg biriyani': 'images/indianfood/veg biriyani.jpg',
    'chole': 'images/indianfood/chole.jpg',
    'chole bhature': 'images/indianfood/chole.jpg',
    'panner biriyani': 'images/indianfood/panner biriyani.jpg',
    'paneer biryani': 'images/indianfood/panner biriyani.jpg',
    'veg kurma': 'images/indianfood/veg kurma.jpg',
    'cheesecake': 'images/indianfood/cheesecake.jpg',
    'cheesebombs': 'images/indianfood/cheesebombs.jpg',

    // Non-Veg Indian Dishes
    'butterchicken': 'images/indianfood/butterchicken.jpg',
    'butter chicken': 'images/indianfood/butterchicken.jpg',
    'chicken lolipop': 'images/indianfood/chicken lolipop.jpg',
    'chicken tikka': 'images/indianfood/chicken tikka.jpg',
    'chicken': 'images/indianfood/chicken.jpg',
    'chickenbiriyani': 'images/indianfood/chickenbiriyani.jpg',
    'chicken biryani': 'images/indianfood/chickenbiriyani.jpg',
    'egg kurma': 'images/indianfood/egg kurma.jpg',
    'egg curry': 'images/indianfood/egg.jpg',
    'fish fry': 'images/indianfood/fish fry.jpg',
    'mutton biriyani': 'images/indianfood/mb.jpg',
    'mutton curry': 'images/indianfood/mutton curry.jpg',
    'prawn soup': 'images/indianfood/prawn soup.jpg',
    'prawn fry': 'images/indianfood/prawn.jpg',
    'thalapkatti biriyani': 'images/indianfood/thalapkatti.jpg'
  };

  const getDishImage = (dishName) => {
    if (!dishName) return 'images/indian-desserts.jpg';
    const key = dishName.trim().toLowerCase();
    return imageMap[key] || 'images/indian-desserts.jpg';
  };

  return {
    API_BASE,
    showToast,
    confirmModal,
    openModal,
    closeModal,
    getDishImage
  };
})();

// Global Aliases for convenience across all modules
window.FoodieToast = {
  success: (msg, title) => FoodieApp.showToast(msg, 'success', title),
  error: (msg, title) => FoodieApp.showToast(msg, 'error', title),
  warning: (msg, title) => FoodieApp.showToast(msg, 'warning', title),
  info: (msg, title) => FoodieApp.showToast(msg, 'info', title)
};

window.FoodieModal = {
  confirm: FoodieApp.confirmModal
};

