/**
 * Foodie Express - Admin Orders Controller
 */

const OrdersController = (() => {
  let allOrders = [];
  let allSupervisors = [];
  let selectedOrderIds = new Set();
  let targetOrderIdForAssign = null;

  const loadSupervisors = async () => {
    try {
      const res = await AdminApp.authFetch('/api/admin/supervisors');
      if (res.ok) {
        allSupervisors = await res.json();
        populateSupervisorDropdown();
      }
    } catch (err) {
      console.error('Supervisors load error:', err);
    }
  };

  const populateSupervisorDropdown = () => {
    const select = document.getElementById('supervisorSelectInput');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Active Supervisor --</option>' +
      allSupervisors.map(s => `<option value="${s.id}">${s.name} (${s.email})</option>`).join('');

    select.onchange = () => {
      const preview = document.getElementById('supervisorPreviewCard');
      const selectedId = select.value;
      if (!selectedId) {
        if (preview) preview.style.display = 'none';
        return;
      }
      const sup = allSupervisors.find(s => s.id == selectedId);
      if (sup && preview) {
        document.getElementById('prevSupName').textContent = sup.name || 'Supervisor';
        document.getElementById('prevSupEmail').textContent = sup.email || '';
        document.getElementById('prevSupPhone').innerHTML = `<i class="fa-solid fa-phone"></i> ${sup.phone || 'N/A'}`;
        preview.style.display = 'block';
      }
    };
  };

  const loadOrders = async () => {
    try {
      const res = await AdminApp.authFetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to load orders');
      allOrders = await res.json();
      selectedOrderIds.clear();
      updateBulkActionBar();
      renderOrders(allOrders);
    } catch (err) {
      console.error('Orders error:', err);
      AdminApp.showToast('Unable to load orders from server.', 'error');
    }
  };

  const renderOrders = (orders) => {
    const tbody = document.getElementById('ordersTbody');
    if (!tbody) return;

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--admin-text-muted);">No orders match your filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(order => {
      let itemsSummary = '';
      try {
        const cart = typeof order.cartJson === 'string' ? JSON.parse(order.cartJson) : order.cartJson;
        if (Array.isArray(cart)) {
          itemsSummary = cart.map(i => `${i.name} × ${i.quantity}`).join(', ');
        }
      } catch {
        itemsSummary = order.cartJson || 'Order Items';
      }

      const isChecked = selectedOrderIds.has(order.id);
      const supervisorInfo = order.supervisor ? `
        <div style="display:inline-flex;align-items:center;gap:8px;background:#EEF2FF;padding:4px 8px;border-radius:8px;border:1px solid #C7D2FE;">
          <div style="width:22px;height:22px;border-radius:50%;background:#4338CA;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;">
            ${(order.supervisor.name ? order.supervisor.name.charAt(0) : 'S').toUpperCase()}
          </div>
          <div style="text-align:left;">
            <div style="font-weight:700;font-size:0.82rem;color:#312E81;white-space:nowrap;">${order.supervisor.name}</div>
          </div>
        </div>
      ` : `
        <button class="admin-btn admin-btn-outline admin-btn-sm" style="font-size:0.75rem;padding:4px 10px;" onclick="OrdersController.openSingleAssignModal(${order.id})">
          <i class="fa-solid fa-user-plus" style="color:var(--admin-primary);"></i> Assign
        </button>
      `;

      const isCod = (order.paymentMethod || 'COD').toUpperCase() === 'COD';
      const paymentBadge = `<span class="payment-badge ${isCod ? 'cod' : 'online'}"><i class="fa-solid ${isCod ? 'fa-hand-holding-dollar' : 'fa-credit-card'}"></i> ${order.paymentMethod || 'COD'}</span>`;

      return `
        <tr>
          <td>
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="OrdersController.toggleSelectOrder(${order.id}, this.checked)">
          </td>
          <td><strong style="color:var(--admin-navy);">#FE-${order.id}</strong></td>
          <td>
            <div style="font-weight:700;color:#0F172A;">${order.name || 'Customer'}</div>
            <div style="font-size:0.75rem;color:var(--admin-text-muted);">${order.phone || ''}</div>
          </td>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${itemsSummary}">
            ${itemsSummary}
          </td>
          <td><strong style="color:var(--admin-primary);font-size:0.95rem;">₹${parseFloat(order.totalAmount || 0).toFixed(2)}</strong></td>
          <td>${paymentBadge}</td>
          <td>
            <select class="admin-select" style="font-size:0.78rem;padding:4px 8px;border-radius:6px;min-width:130px;" onchange="OrdersController.updateStatus(${order.id}, this.value)">
              <option value="PENDING" ${order.orderStatus === 'PENDING' ? 'selected' : ''}>PENDING</option>
              <option value="CONFIRMED" ${order.orderStatus === 'CONFIRMED' ? 'selected' : ''}>CONFIRMED</option>
              <option value="PREPARING" ${order.orderStatus === 'PREPARING' ? 'selected' : ''}>PREPARING</option>
              <option value="READY" ${order.orderStatus === 'READY' ? 'selected' : ''}>READY</option>
              <option value="OUT_FOR_DELIVERY" ${order.orderStatus === 'OUT_FOR_DELIVERY' ? 'selected' : ''}>OUT FOR DELIVERY</option>
              <option value="DELIVERED" ${order.orderStatus === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
              <option value="CANCELLED" ${order.orderStatus === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
            </select>
          </td>
          <td>${supervisorInfo}</td>
          <td style="font-size:0.78rem;color:var(--admin-text-muted);white-space:nowrap;">
            ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
          </td>
          <td>
            <div style="display:flex;gap:6px;align-items:center;">
              <a href="order-details.html?id=${order.id}" class="admin-btn admin-btn-outline admin-btn-sm" title="View details">
                <i class="fa-solid fa-eye"></i>
              </a>
              <button onclick="OrdersController.deleteOrder(${order.id})" class="admin-btn admin-btn-outline admin-btn-sm" style="color:#DC2626;border-color:#FCA5A5;" title="Delete order">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  const toggleSelectOrder = (orderId, isChecked) => {
    if (isChecked) {
      selectedOrderIds.add(orderId);
    } else {
      selectedOrderIds.delete(orderId);
    }
    updateBulkActionBar();
  };

  const toggleSelectAll = (isChecked) => {
    if (isChecked) {
      allOrders.forEach(o => selectedOrderIds.add(o.id));
    } else {
      selectedOrderIds.clear();
    }
    updateBulkActionBar();
    renderOrders(allOrders);
  };

  const clearSelection = () => {
    selectedOrderIds.clear();
    const selectAllBox = document.getElementById('selectAllCheckbox');
    if (selectAllBox) selectAllBox.checked = false;
    updateBulkActionBar();
    renderOrders(allOrders);
  };

  const updateBulkActionBar = () => {
    const bar = document.getElementById('bulkActionBar');
    const text = document.getElementById('selectedCountText');
    if (!bar || !text) return;

    if (selectedOrderIds.size > 0) {
      text.textContent = `${selectedOrderIds.size} order${selectedOrderIds.size > 1 ? 's' : ''} selected`;
      bar.style.display = 'flex';
    } else {
      bar.style.display = 'none';
    }
  };

  const openSingleAssignModal = (orderId) => {
    targetOrderIdForAssign = orderId;
    const modal = document.getElementById('assignSupervisorModal');
    const title = document.getElementById('assignModalTitle');
    const subtitle = document.getElementById('assignModalSubtitle');
    if (title) title.textContent = `Assign Order #FE-${orderId} to Supervisor`;
    if (subtitle) subtitle.textContent = `Select a supervisor to oversee dispatch and delivery for order #FE-${orderId}.`;
    if (modal) modal.classList.add('active');
  };

  const openBulkAssignModal = () => {
    if (selectedOrderIds.size === 0) return;
    targetOrderIdForAssign = null;
    const modal = document.getElementById('assignSupervisorModal');
    const title = document.getElementById('assignModalTitle');
    const subtitle = document.getElementById('assignModalSubtitle');
    if (title) title.textContent = `Bulk Assign ${selectedOrderIds.size} Orders to Supervisor`;
    if (subtitle) subtitle.textContent = `Assign all selected orders in one click to the chosen supervisor.`;
    if (modal) modal.classList.add('active');
  };

  const closeAssignModal = () => {
    const modal = document.getElementById('assignSupervisorModal');
    if (modal) modal.classList.remove('active');
    targetOrderIdForAssign = null;
  };

  const confirmAssignment = async () => {
    const select = document.getElementById('supervisorSelectInput');
    const supervisorId = select ? select.value : null;

    if (!supervisorId) {
      AdminApp.showToast('Please select a supervisor.', 'error');
      return;
    }

    try {
      let bodyData = {};
      if (targetOrderIdForAssign) {
        bodyData = { orderId: targetOrderIdForAssign, supervisorId: Number(supervisorId) };
      } else if (selectedOrderIds.size > 0) {
        bodyData = { orderIds: Array.from(selectedOrderIds), supervisorId: Number(supervisorId) };
      } else {
        AdminApp.showToast('No orders chosen for assignment.', 'error');
        return;
      }

      const res = await AdminApp.authFetch('/api/admin/orders/assign', {
        method: 'POST',
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        AdminApp.showToast('Order(s) assigned to supervisor successfully!', 'success');
        closeAssignModal();
        clearSelection();
        loadOrders();
      } else {
        const data = await res.json();
        AdminApp.showToast(data.error || 'Failed to assign supervisor.', 'error');
      }
    } catch (err) {
      console.error('Assignment error:', err);
      AdminApp.showToast('Server error assigning supervisor.', 'error');
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await AdminApp.authFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        AdminApp.showToast(`Order #FE-${orderId} status updated to ${newStatus}`, 'success');
        loadOrders();
      } else {
        AdminApp.showToast('Failed to update status.', 'error');
      }
    } catch (err) {
      console.error('Update status error:', err);
      AdminApp.showToast('Server error updating order status.', 'error');
    }
  };

  const deleteOrder = async (orderId) => {
    const confirmed = await FoodieApp.confirmModal({
      title: 'Delete Customer Order?',
      message: `Are you sure you want to permanently delete order #FE-${orderId}? This record cannot be recovered.`,
      confirmText: 'Delete Order',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await AdminApp.authFetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        AdminApp.showToast(`Order #FE-${orderId} deleted successfully.`, 'success', 'Order Deleted');
        loadOrders();
      } else {
        AdminApp.showToast('Failed to delete order.', 'error');
      }
    } catch (err) {
      console.error('Delete order error:', err);
      AdminApp.showToast('Server error deleting order.', 'error');
    }
  };

  const filterOrders = () => {
    const search = document.getElementById('orderSearch')?.value.toLowerCase().trim() || '';
    const status = document.getElementById('orderStatusFilter')?.value || 'ALL';

    const filtered = allOrders.filter(o => {
      const matchesSearch = !search ||
        (o.name && o.name.toLowerCase().includes(search)) ||
        (o.email && o.email.toLowerCase().includes(search)) ||
        (o.phone && o.phone.includes(search)) ||
        (`FE-${o.id}`.toLowerCase().includes(search)) ||
        (o.supervisor && o.supervisor.name && o.supervisor.name.toLowerCase().includes(search));

      const matchesStatus = status === 'ALL' || o.orderStatus === status;

      return matchesSearch && matchesStatus;
    });

    renderOrders(filtered);
  };

  return {
    loadOrders,
    loadSupervisors,
    updateStatus,
    deleteOrder,
    filterOrders,
    toggleSelectOrder,
    toggleSelectAll,
    clearSelection,
    openSingleAssignModal,
    openBulkAssignModal,
    closeAssignModal,
    confirmAssignment
  };
})();

