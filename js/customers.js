/**
 * Foodie Express - Admin Customers Controller
 */

const CustomersAdminController = (() => {
  let allCustomers = [];

  const loadCustomers = async () => {
    try {
      const res = await AdminApp.authFetch('/api/admin/customers');
      if (!res.ok) throw new Error('Failed to load customers');
      allCustomers = await res.json();
      renderCustomers(allCustomers);
    } catch (err) {
      console.error('Customers error:', err);
      AdminApp.showToast('Unable to load customer list.', 'error');
    }
  };

  const renderCustomers = (customers) => {
    const tbody = document.getElementById('customersTbody');
    if (!tbody) return;

    if (customers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--admin-text-muted);">No registered customers found.</td></tr>`;
      return;
    }

    tbody.innerHTML = customers.map(c => `
      <tr>
        <td><strong>#CUST-${c.id}</strong></td>
        <td>
          <div style="font-weight:600;">${c.name}</div>
          <div style="font-size:0.78rem;color:var(--admin-text-muted);">${c.email}</div>
        </td>
        <td>${c.phone || 'N/A'}</td>
        <td>${c.location || 'N/A'}</td>
        <td>
          <span class="badge-status ${c.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}">
            ${c.status || 'ACTIVE'}
          </span>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button onclick="CustomersAdminController.toggleStatus(${c.id})" class="admin-btn admin-btn-outline admin-btn-sm">
              ${c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
            <button onclick="CustomersAdminController.deleteCustomer(${c.id})" class="admin-btn admin-btn-danger admin-btn-sm">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  const toggleStatus = async (id) => {
    try {
      const res = await AdminApp.authFetch(`/api/admin/customers/${id}/toggle-status`, { method: 'PUT' });
      if (res.ok) {
        AdminApp.showToast('Customer status updated.', 'success');
        loadCustomers();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const deleteCustomer = async (id) => {
    const confirmed = await FoodieApp.confirmModal({
      title: 'Remove Customer Account?',
      message: 'Are you sure you want to delete this customer account? All associated profile data will be permanently removed.',
      confirmText: 'Delete Customer',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await AdminApp.authFetch(`/api/admin/customers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        AdminApp.showToast('Customer account removed.', 'success', 'Customer Deleted');
        loadCustomers();
      } else {
        AdminApp.showToast('Failed to delete customer.', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      AdminApp.showToast('Server error deleting customer.', 'error');
    }
  };

  const filterCustomers = () => {
    const query = document.getElementById('customerSearch')?.value.toLowerCase().trim() || '';
    const filtered = allCustomers.filter(c => 
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(query)) ||
      (c.location && c.location.toLowerCase().includes(query))
    );
    renderCustomers(filtered);
  };

  return {
    loadCustomers,
    toggleStatus,
    deleteCustomer,
    filterCustomers
  };
})();
