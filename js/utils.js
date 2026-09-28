/**
 * Foodie Express - Shared Utilities & UI Helpers
 */

const SharedUtils = (() => {
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return `₹${num.toFixed(2)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const showToast = (message, type = 'success', title = '') => {
    if (window.FoodieApp && FoodieApp.showToast) {
      FoodieApp.showToast(message, type, title);
      return;
    }

    let container = document.getElementById('shared-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'shared-toast-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bg = type === 'error' ? '#EF4444' : (type === 'warning' ? '#F59E0B' : '#10B981');
    toast.style.cssText = `background:${bg};color:#fff;padding:12px 20px;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.15);font-size:0.9rem;font-weight:600;pointer-events:auto;animation:fadeIn 0.25s ease;display:flex;align-items:center;gap:8px;`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  return {
    formatCurrency,
    formatDate,
    showToast
  };
})();

window.SharedUtils = SharedUtils;
