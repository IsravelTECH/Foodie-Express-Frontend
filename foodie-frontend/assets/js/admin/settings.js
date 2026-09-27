/**
 * Foodie Express - Admin Settings Controller
 */

const SettingsAdminController = (() => {
  const loadSettings = async () => {
    try {
      const res = await AdminApp.authFetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const s = await res.json();

      document.getElementById('restName').value = s.restaurantName || '';
      document.getElementById('restPhone').value = s.contactPhone || '';
      document.getElementById('restEmail').value = s.contactEmail || '';
      document.getElementById('restAddress').value = s.address || '';
      document.getElementById('restHours').value = s.openingHours || '';
      document.getElementById('deliveryFee').value = s.deliveryFee || 40;
      document.getElementById('freeDeliveryMin').value = s.freeDeliveryThreshold || 500;
      document.getElementById('taxPercent').value = s.taxPercent || 5;
      document.getElementById('currencySymbol').value = s.currency || '₹';
      document.getElementById('acceptingOrders').checked = s.acceptingOrders !== false;
    } catch (err) {
      console.error('Settings load error:', err);
      AdminApp.showToast('Unable to load restaurant settings.', 'error');
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    const settingsData = {
      restaurantName: document.getElementById('restName').value.trim(),
      contactPhone: document.getElementById('restPhone').value.trim(),
      contactEmail: document.getElementById('restEmail').value.trim(),
      address: document.getElementById('restAddress').value.trim(),
      openingHours: document.getElementById('restHours').value.trim(),
      deliveryFee: parseFloat(document.getElementById('deliveryFee').value),
      freeDeliveryThreshold: parseFloat(document.getElementById('freeDeliveryMin').value),
      taxPercent: parseFloat(document.getElementById('taxPercent').value),
      currency: document.getElementById('currencySymbol').value.trim(),
      acceptingOrders: document.getElementById('acceptingOrders').checked
    };

    try {
      const res = await AdminApp.authFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData)
      });

      if (res.ok) {
        AdminApp.showToast('Restaurant configuration updated successfully!', 'success');
      } else {
        AdminApp.showToast('Failed to save settings.', 'error');
      }
    } catch (err) {
      console.error('Settings save error:', err);
      AdminApp.showToast('Server error saving settings.', 'error');
    }
  };

  return {
    loadSettings,
    saveSettings
  };
})();
