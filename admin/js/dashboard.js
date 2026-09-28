/**
 * Foodie Express - Admin Dashboard Controller
 */

const DashboardController = (() => {
  const loadStats = async () => {
    try {
      const res = await AdminApp.authFetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard statistics');
      const data = await res.json();

      // Populate KPI counters
      document.getElementById('statRevenue').textContent = `₹${parseFloat(data.totalRevenue || 0).toLocaleString('en-IN')}`;
      document.getElementById('statOrders').textContent = data.totalOrders || 0;
      document.getElementById('statPending').textContent = data.pendingOrders || 0;
      document.getElementById('statCustomers').textContent = data.totalCustomers || 0;
      document.getElementById('statReservations').textContent = data.totalReservations || 0;
      document.getElementById('statMenu').textContent = data.totalMenuItems || 0;

      // Populate Recent Orders Table
      const ordersTbody = document.getElementById('recentOrdersTbody');
      if (ordersTbody) {
        if (!data.recentOrders || data.recentOrders.length === 0) {
          ordersTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--admin-text-muted);padding:24px;">No recent orders placed yet.</td></tr>`;
        } else {
          ordersTbody.innerHTML = data.recentOrders.map(order => `
            <tr>
              <td><strong>#FE-${order.id}</strong></td>
              <td>
                <div style="font-weight:600;">${order.name || 'Guest'}</div>
                <div style="font-size:0.78rem;color:var(--admin-text-muted);">${order.email || ''}</div>
              </td>
              <td><strong>₹${parseFloat(order.totalAmount || 0).toFixed(2)}</strong></td>
              <td><span style="font-size:0.82rem;font-weight:600;">${order.paymentMethod || 'COD'}</span></td>
              <td>
                <span class="badge-status status-${(order.orderStatus || 'pending').toLowerCase()}">
                  ${order.orderStatus || 'PENDING'}
                </span>
              </td>
              <td>
                <a href="order-details.html?id=${order.id}" class="admin-btn admin-btn-outline admin-btn-sm">
                  View Details
                </a>
              </td>
            </tr>
          `).join('');
        }
      }

      // Populate Recent Bookings Table
      const bookingsTbody = document.getElementById('recentBookingsTbody');
      if (bookingsTbody) {
        if (!data.recentBookings || data.recentBookings.length === 0) {
          bookingsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--admin-text-muted);padding:24px;">No table bookings recorded yet.</td></tr>`;
        } else {
          bookingsTbody.innerHTML = data.recentBookings.map(b => `
            <tr>
              <td><strong>${b.tableNumber || 'Table'}</strong></td>
              <td>
                <div style="font-weight:600;">${b.name}</div>
                <div style="font-size:0.78rem;color:var(--admin-text-muted);">${b.phone}</div>
              </td>
              <td>${b.reservationDate} (${b.timeSlot || '07:00 PM'})</td>
              <td><strong>${b.numberOfPeople} Guests</strong></td>
              <td>
                <span class="badge-status status-${(b.status || 'confirmed').toLowerCase()}">
                  ${b.status || 'CONFIRMED'}
                </span>
              </td>
            </tr>
          `).join('');
        }
      }

    } catch (err) {
      console.error('Dashboard load error:', err);
      AdminApp.showToast('Unable to fetch live dashboard metrics.', 'error');
    }
  };

  return { loadStats };
})();
