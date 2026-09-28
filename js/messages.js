/**
 * Foodie Express - Admin Messages Controller
 */

const MessagesAdminController = (() => {
  let allMessages = [];

  const loadMessages = async () => {
    try {
      const res = await AdminApp.authFetch('/api/admin/messages');
      if (!res.ok) throw new Error('Failed to load messages');
      allMessages = await res.json();
      renderMessages(allMessages);
    } catch (err) {
      console.error('Messages error:', err);
      AdminApp.showToast('Unable to load customer inquiries.', 'error');
    }
  };

  const renderMessages = (messages) => {
    const tbody = document.getElementById('messagesTbody');
    if (!tbody) return;

    if (messages.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--admin-text-muted);">No customer inquiries found.</td></tr>`;
      return;
    }

    tbody.innerHTML = messages.map(m => `
      <tr>
        <td><strong>#MSG-${m.id}</strong></td>
        <td>
          <div style="font-weight:600;">${m.name}</div>
          <div style="font-size:0.78rem;color:var(--admin-text-muted);">${m.email}</div>
        </td>
        <td style="max-width:300px;">
          <p style="margin:0;font-size:0.88rem;color:var(--admin-text-main);">${m.message}</p>
        </td>
        <td>
          <span class="badge-status ${m.status === 'UNREAD' ? 'status-unread' : m.status === 'RESOLVED' ? 'status-delivered' : 'status-read'}">
            ${m.status || 'UNREAD'}
          </span>
        </td>
        <td>
          <select class="admin-select" style="font-size:0.8rem;padding:4px 8px;" onchange="MessagesAdminController.updateStatus(${m.id}, this.value)">
            <option value="UNREAD" ${m.status === 'UNREAD' ? 'selected' : ''}>UNREAD</option>
            <option value="READ" ${m.status === 'READ' ? 'selected' : ''}>READ</option>
            <option value="RESOLVED" ${m.status === 'RESOLVED' ? 'selected' : ''}>RESOLVED</option>
          </select>
        </td>
        <td>
          <button onclick="MessagesAdminController.deleteMessage(${m.id})" class="admin-btn admin-btn-danger admin-btn-sm">
            🗑️
          </button>
        </td>
      </tr>
    `).join('');
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await AdminApp.authFetch(`/api/admin/messages/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        AdminApp.showToast('Message status updated.', 'success');
        loadMessages();
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const deleteMessage = async (id) => {
    const confirmed = await FoodieApp.confirmModal({
      title: 'Delete Customer Message?',
      message: 'Are you sure you want to delete this customer inquiry message?',
      confirmText: 'Delete Message',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await AdminApp.authFetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        AdminApp.showToast('Message deleted successfully.', 'success', 'Inquiry Removed');
        loadMessages();
      } else {
        AdminApp.showToast('Failed to delete message.', 'error');
      }
    } catch (err) {
      console.error('Delete message error:', err);
      AdminApp.showToast('Server error deleting message.', 'error');
    }
  };

  return {
    loadMessages,
    updateStatus,
    deleteMessage
  };
})();
