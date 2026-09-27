/**
 * Foodie Express - Admin Payments Controller
 */

const PaymentsAdminController = (() => {
  let allPayments = [];

  const loadPayments = async () => {
    try {
      const res = await AdminApp.authFetch('/api/admin/payments');
      if (!res.ok) throw new Error('Failed to load payments');
      allPayments = await res.json();
      renderPayments(allPayments);
    } catch (err) {
      console.error('Payments error:', err);
      AdminApp.showToast('Unable to load payments.', 'error');
    }
  };

  const renderPayments = (payments) => {
    const tbody = document.getElementById('paymentsTbody');
    if (!tbody) return;

    if (payments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--admin-text-muted);">No payment records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = payments.map(p => `
      <tr>
        <td><strong>#PAY-${p.id}</strong></td>
        <td>${p.orderId ? '#FE-' + p.orderId : 'Direct'}</td>
        <td><strong>₹${parseFloat(p.amount || 0).toFixed(2)}</strong></td>
        <td><span style="font-weight:600;">${p.paymentMethod}</span></td>
        <td style="font-size:0.8rem;color:var(--admin-text-muted);">${p.transactionId || 'N/A (Cash)'}</td>
        <td>
          <select class="admin-select" style="font-size:0.8rem;padding:4px 8px;" onchange="PaymentsAdminController.updateStatus(${p.id}, this.value)">
            <option value="SUCCESS" ${p.paymentStatus === 'SUCCESS' ? 'selected' : ''}>SUCCESS</option>
            <option value="PENDING" ${p.paymentStatus === 'PENDING' ? 'selected' : ''}>PENDING</option>
            <option value="FAILED" ${p.paymentStatus === 'FAILED' ? 'selected' : ''}>FAILED</option>
            <option value="REFUNDED" ${p.paymentStatus === 'REFUNDED' ? 'selected' : ''}>REFUNDED</option>
          </select>
        </td>
        <td>
          <button onclick="PaymentsAdminController.deletePayment(${p.id})" class="admin-btn admin-btn-danger admin-btn-sm">
            🗑️
          </button>
        </td>
      </tr>
    `).join('');
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await AdminApp.authFetch(`/api/admin/payments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        AdminApp.showToast('Payment status updated.', 'success');
        loadPayments();
      }
    } catch (err) {
      console.error('Update payment error:', err);
    }
  };

  const deletePayment = async (id) => {
    const confirmed = await FoodieApp.confirmModal({
      title: 'Delete Payment Record?',
      message: 'Are you sure you want to delete this payment transaction record?',
      confirmText: 'Delete Record',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await AdminApp.authFetch(`/api/admin/payments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        AdminApp.showToast('Payment record deleted.', 'success', 'Payment Removed');
        loadPayments();
      } else {
        AdminApp.showToast('Failed to delete payment record.', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      AdminApp.showToast('Server error deleting payment record.', 'error');
    }
  };

  return {
    loadPayments,
    updateStatus,
    deletePayment
  };
})();
