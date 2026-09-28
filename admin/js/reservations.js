/**
 * Foodie Express - Admin Reservations Controller
 */

const ReservationsAdminController = (() => {
  let allBookings = [];

  const loadReservations = async () => {
    try {
      const res = await AdminApp.authFetch('/api/admin/bookings');
      if (!res.ok) throw new Error('Failed to load bookings');
      allBookings = await res.json();
      renderReservations(allBookings);
    } catch (err) {
      console.error('Bookings error:', err);
      AdminApp.showToast('Unable to load reservations.', 'error');
    }
  };

  const renderReservations = (bookings) => {
    const tbody = document.getElementById('reservationsTbody');
    if (!tbody) return;

    if (bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--admin-text-muted);">No reservations found.</td></tr>`;
      return;
    }

    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td><strong>#RES-${b.id}</strong></td>
        <td>
          <div style="font-weight:600;">${b.name}</div>
          <div style="font-size:0.78rem;color:var(--admin-text-muted);">${b.email} • ${b.phone}</div>
        </td>
        <td><strong>${b.tableNumber || 'Table 1'}</strong></td>
        <td>${b.reservationDate} <span style="font-size:0.8rem;color:var(--admin-text-muted);">(${b.timeSlot || '07:00 PM'})</span></td>
        <td><strong>${b.numberOfPeople} Guests</strong></td>
        <td>
          <select class="admin-select" style="font-size:0.8rem;padding:4px 8px;" onchange="ReservationsAdminController.updateStatus(${b.id}, this.value)">
            <option value="CONFIRMED" ${b.status === 'CONFIRMED' ? 'selected' : ''}>CONFIRMED</option>
            <option value="PENDING" ${b.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
            <option value="REJECTED" ${b.status === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
            <option value="CANCELLED" ${b.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
          </select>
        </td>
        <td>
          <button onclick="ReservationsAdminController.deleteBooking(${b.id})" class="admin-btn admin-btn-danger admin-btn-sm">
            🗑️
          </button>
        </td>
      </tr>
    `).join('');
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await AdminApp.authFetch(`/api/admin/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        AdminApp.showToast('Reservation status updated.', 'success');
        loadReservations();
      }
    } catch (err) {
      console.error('Update reservation error:', err);
    }
  };

  const deleteBooking = async (id) => {
    const confirmed = await FoodieApp.confirmModal({
      title: 'Delete Table Reservation?',
      message: 'Are you sure you want to delete this table booking record?',
      confirmText: 'Delete Reservation',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await AdminApp.authFetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        AdminApp.showToast('Reservation deleted successfully.', 'success', 'Booking Removed');
        loadReservations();
      } else {
        AdminApp.showToast('Failed to delete reservation.', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      AdminApp.showToast('Server error deleting reservation.', 'error');
    }
  };

  const filterReservations = () => {
    const search = document.getElementById('resSearch')?.value.toLowerCase().trim() || '';
    const date = document.getElementById('resDateFilter')?.value || '';

    const filtered = allBookings.filter(b => {
      const matchesSearch = !search ||
        (b.name && b.name.toLowerCase().includes(search)) ||
        (b.email && b.email.toLowerCase().includes(search)) ||
        (b.phone && b.phone.includes(search)) ||
        (b.tableNumber && b.tableNumber.toLowerCase().includes(search));

      const matchesDate = !date || b.reservationDate === date;

      return matchesSearch && matchesDate;
    });

    renderReservations(filtered);
  };

  return {
    loadReservations,
    updateStatus,
    deleteBooking,
    filterReservations
  };
})();
