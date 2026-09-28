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
   * Universal Dish Image Map & Intelligent Fallback
   */
  const imageMap = {
    // Indian Dishes (Non-Veg & Veg)
    'butter chicken': 'images/indianfood/butterchicken.jpg',
    'butterchicken': 'images/indianfood/butterchicken.jpg',
    'chicken biryani': 'images/indianfood/chickenbiriyani.jpg',
    'chickenbiriyani': 'images/indianfood/chickenbiriyani.jpg',
    'chicken lolipop': 'images/indianfood/chicken lolipop.jpg',
    'chicken lollipop': 'images/indianfood/chicken lolipop.jpg',
    'chicken tikka': 'images/indianfood/chicken tikka.jpg',
    'chicken': 'images/indianfood/chicken.jpg',
    'mutton biryani': 'images/indianfood/mb.jpg',
    'mutton biriyani': 'images/indianfood/mb.jpg',
    'mutton curry': 'images/indianfood/mutton curry.jpg',
    'thalappakatti biriyani': 'images/indianfood/thalapkatti.jpg',
    'thalapkatti': 'images/indianfood/thalapkatti.jpg',
    'fish fry': 'images/indianfood/fish fry.jpg',
    'prawn fry': 'images/indianfood/prawn.jpg',
    'prawn soup': 'images/indianfood/prawn soup.jpg',
    'egg kurma': 'images/indianfood/egg kurma.jpg',
    'egg curry': 'images/indianfood/egg.jpg',
    'egg': 'images/indianfood/egg.jpg',
    'paneer butter masala': 'images/indianfood/pan.jpg',
    'paneer': 'images/indianfood/pan.jpg',
    'palak paneer': 'images/indianfood/palak.jpg',
    'paneer biryani': 'images/indianfood/panner biriyani.jpg',
    'panner biriyani': 'images/indianfood/panner biriyani.jpg',
    'aloo gobi': 'images/indianfood/aloo gobi.jpg',
    'aloo gobi masala': 'images/indianfood/aloo gobi.jpg',
    'chole': 'images/indianfood/chole.jpg',
    'chole bhature': 'images/indianfood/chole.jpg',
    'dosa': 'images/indianfood/dosa.jpg',
    'masala dosa': 'images/indianfood/dosa.jpg',
    'idly': 'images/indianfood/idly.jpg',
    'idli': 'images/indianfood/idly.jpg',
    'sambar rice': 'images/indianfood/sambarice.jpg',
    'sambarice': 'images/indianfood/sambarice.jpg',
    'veg biriyani': 'images/indianfood/veg biriyani.jpg',
    'veg biryani': 'images/indianfood/veg biriyani.jpg',
    'veg kurma': 'images/indianfood/veg kurma.jpg',
    'cheesecake': 'images/indianfood/cheesecake.jpg',
    'cheesebombs': 'images/indianfood/cheesebombs.jpg',

    // Desserts
    'gulab jamun': 'images/desserts/gualab.jpg',
    'gualab': 'images/desserts/gualab.jpg',
    'gulab jamun with rabri': 'images/desserts/gualab.jpg',
    'rasmalai': 'images/desserts/rasmalai.jpg',
    'royal rasmalai': 'images/desserts/rasmalai.jpg',
    'rasgulla': 'images/desserts/rasgulla.jpg',
    'choco mousse': 'images/desserts/chocomouse.jpg',
    'chocomouse': 'images/desserts/chocomouse.jpg',
    'warm fudgy brownie': 'images/desserts/brownie.jpg',
    'brownie': 'images/desserts/brownie.jpg',
    'brownie2': 'images/desserts/brownie2.jpg',
    'choco milkshake': 'images/desserts/chocomilkshake.jpg',
    'chocomilkshake': 'images/desserts/chocomilkshake.jpg',
    'strawberry pastry': 'images/desserts/strawberry cake.jpg',
    'strawberry cake': 'images/desserts/strawberry cake.jpg',
    'cake': 'images/desserts/cake.jpg',
    'classic affogato': 'images/desserts/affogato.jpg',
    'affogato': 'images/desserts/affogato.jpg',
    'cannolicake': 'images/desserts/cannolicake.jpg',
    'carpriccioza': 'images/desserts/carpriccioza.jpg',
    'icebergwedge': 'images/desserts/icebergwedge.jpg',
    'profiteroles': 'images/desserts/profiteroles.jpg',

    // Snacks
    'crispy samosa': 'images/snacks/samosa.jpg',
    'samosa': 'images/snacks/samosa.jpg',
    'crispy cheese burger': 'images/snacks/burger.jpg',
    'burger': 'images/snacks/burger.jpg',
    'hamburger': 'images/snacks/hamburger.jpg',
    'aloo tikki burger': 'images/snacks/burger.jpg',
    'cheese sandwich': 'images/snacks/cheese sand.jpg',
    'sandwich': 'images/snacks/sandwitch.jpg',
    'sandwitch': 'images/snacks/sandwitch.jpg',
    'chicken puffs': 'images/snacks/chickenpuffs.jpg',
    'chickenpuffs': 'images/snacks/chickenpuffs.jpg',
    'egg puffs': 'images/snacks/eggpuffs.jpg',
    'eggpuffs': 'images/snacks/eggpuffs.jpg',
    'veg puffs': 'images/snacks/veg puffs.jpg',
    'croissant': 'images/snacks/croissant.jpg',
    'vada pav': 'images/snacks/vadapav.jpg',
    'vadapav': 'images/snacks/vadapav.jpg',
    'ulunthu vadai': 'images/snacks/ulunthu vadai.jpg',
    'kadalai vadai': 'images/snacks/kadalai vadai.jpg',
    'baji': 'images/snacks/baji.jpg',
    'bread bajji': 'images/snacks/breadbajji.jpg',
    'breadbajji': 'images/snacks/breadbajji.jpg',
    'chili bajji': 'images/snacks/chilibajji.jpg',
    'chilibajji': 'images/snacks/chilibajji.jpg',
    'vazhaigai bajji': 'images/snacks/vazhagaibajji.jpg',
    'vazhagaibajji': 'images/snacks/vazhagaibajji.jpg',
    'bonda': 'images/snacks/bonda.jpg',
    'egg bonda': 'images/snacks/egg bonda.jpg',
    'mysore bonda': 'images/snacks/mysore-bonda.webp',
    'momos': 'images/snacks/momos.jpg',
    'nuggets': 'images/snacks/nuggets.jpg',
    'pani puri': 'images/snacks/panipuri.jpg',
    'panipuri': 'images/snacks/panipuri.jpg',
    'lasagna': 'images/snacks/lasagna.jpg',
    'ravioli': 'images/snacks/ravioli.jpg',
    'japchae': 'images/snacks/japchae.jpg',
    'waffles': 'images/snacks/waffles.jpg',
    'peri peri french fries': 'images/snacks/nuggets.jpg',
    'french fries': 'images/snacks/nuggets.jpg'
  };

  const getDishImage = (dishName) => {
    if (!dishName) return 'images/indianfood.jpg';
    const key = dishName.trim().toLowerCase();
    if (imageMap[key]) return imageMap[key];

    // Intelligent keyword fallback
    if (key.includes('butter chicken') || key.includes('makhani')) return 'images/indianfood/butterchicken.jpg';
    if (key.includes('mutton') || key.includes('lamb')) return 'images/indianfood/mb.jpg';
    if (key.includes('chicken') && key.includes('biryani')) return 'images/indianfood/chickenbiriyani.jpg';
    if (key.includes('chicken') && key.includes('lollipop')) return 'images/indianfood/chicken lolipop.jpg';
    if (key.includes('chicken') && key.includes('tikka')) return 'images/indianfood/chicken tikka.jpg';
    if (key.includes('chicken')) return 'images/indianfood/chicken.jpg';
    if (key.includes('fish')) return 'images/indianfood/fish fry.jpg';
    if (key.includes('prawn')) return 'images/indianfood/prawn.jpg';
    if (key.includes('egg')) return 'images/indianfood/egg.jpg';
    if (key.includes('paneer') && key.includes('biryani')) return 'images/indianfood/panner biriyani.jpg';
    if (key.includes('paneer')) return 'images/indianfood/pan.jpg';
    if (key.includes('palak')) return 'images/indianfood/palak.jpg';
    if (key.includes('gobi') || key.includes('cauliflower')) return 'images/indianfood/aloo gobi.jpg';
    if (key.includes('chole') || key.includes('bhature')) return 'images/indianfood/chole.jpg';
    if (key.includes('dosa')) return 'images/indianfood/dosa.jpg';
    if (key.includes('idly') || key.includes('idli')) return 'images/indianfood/idly.jpg';
    if (key.includes('sambar')) return 'images/indianfood/sambarice.jpg';
    if (key.includes('biryani') || key.includes('biriyani') || key.includes('pulao')) return 'images/indianfood/veg biriyani.jpg';
    if (key.includes('samosa')) return 'images/snacks/samosa.jpg';
    if (key.includes('burger')) return 'images/snacks/burger.jpg';
    if (key.includes('sandwich') || key.includes('sand')) return 'images/snacks/sandwitch.jpg';
    if (key.includes('puff') && key.includes('chicken')) return 'images/snacks/chickenpuffs.jpg';
    if (key.includes('puff') && key.includes('egg')) return 'images/snacks/eggpuffs.jpg';
    if (key.includes('puff')) return 'images/snacks/veg puffs.jpg';
    if (key.includes('momo')) return 'images/snacks/momos.jpg';
    if (key.includes('pani puri') || key.includes('panipuri')) return 'images/snacks/panipuri.jpg';
    if (key.includes('vadapav') || key.includes('vada pav')) return 'images/snacks/vadapav.jpg';
    if (key.includes('vadai') || key.includes('vada')) return 'images/snacks/ulunthu vadai.jpg';
    if (key.includes('baji') || key.includes('bajji')) return 'images/snacks/baji.jpg';
    if (key.includes('bonda')) return 'images/snacks/bonda.jpg';
    if (key.includes('nugget') || key.includes('fries')) return 'images/snacks/nuggets.jpg';
    if (key.includes('waffle')) return 'images/snacks/waffles.jpg';
    if (key.includes('croissant')) return 'images/snacks/croissant.jpg';
    if (key.includes('gulab') || key.includes('jamun')) return 'images/desserts/gualab.jpg';
    if (key.includes('rasmalai')) return 'images/desserts/rasmalai.jpg';
    if (key.includes('rasgulla')) return 'images/desserts/rasgulla.jpg';
    if (key.includes('brownie')) return 'images/desserts/brownie.jpg';
    if (key.includes('mousse')) return 'images/desserts/chocomouse.jpg';
    if (key.includes('milkshake') || key.includes('shake')) return 'images/desserts/chocomilkshake.jpg';
    if (key.includes('cake') || key.includes('pastry')) return 'images/desserts/cake.jpg';
    if (key.includes('affogato')) return 'images/desserts/affogato.jpg';
    if (key.includes('dessert') || key.includes('sweet')) return 'images/desserts/gualab.jpg';
    if (key.includes('snack')) return 'images/snacks/samosa.jpg';
    if (key.includes('veg')) return 'images/indianfood/pan.jpg';

    return 'images/indianfood.jpg';
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

