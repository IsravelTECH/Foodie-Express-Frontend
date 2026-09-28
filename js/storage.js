/**
 * Foodie Express - Shared Storage & LocalState Utilities
 */

const SharedStorage = (() => {
  const get = (key, defaultValue = null) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return localStorage.getItem(key) || defaultValue;
    }
  };

  const set = (key, value) => {
    try {
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('Storage set failed:', e);
    }
  };

  const remove = (key) => {
    localStorage.removeItem(key);
  };

  const clear = () => {
    localStorage.clear();
  };

  return {
    get,
    set,
    remove,
    clear
  };
})();

window.SharedStorage = SharedStorage;
