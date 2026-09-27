/**
 * Foodie Express - Admin Menu Management Controller
 */

const MenuAdminController = (() => {
  let allMenuItems = [];

  const loadMenu = async () => {
    try {
      const res = await AdminApp.authFetch('/api/admin/menu');
      if (!res.ok) throw new Error('Failed to load menu');
      allMenuItems = await res.json();
      renderMenu(allMenuItems);
      loadCategoriesForModal();
    } catch (err) {
      console.error('Menu load error:', err);
      AdminApp.showToast('Unable to load menu items.', 'error');
    }
  };

  const loadCategoriesForModal = async () => {
    try {
      const res = await AdminApp.authFetch('/api/admin/categories');
      if (res.ok) {
        const cats = await res.json();
        const select = document.getElementById('itemCategory');
        if (select) {
          select.innerHTML = cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        }
      }
    } catch (e) {
      console.warn('Category load warning:', e);
    }
  };

  const renderMenu = (items) => {
    const tbody = document.getElementById('menuTbody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--admin-text-muted);">No menu items found.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td>
          <img src="${item.imageUrl || 'images/indianfood.jpg'}" alt="${item.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" onerror="this.src='images/indianfood.jpg'">
        </td>
        <td>
          <div style="font-weight:600;">${item.name}</div>
          <div style="font-size:0.75rem;color:var(--admin-text-muted);max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.description || ''}</div>
        </td>
        <td><span style="font-weight:600;color:var(--admin-text-muted);">${item.category || 'General'}</span></td>
        <td><strong>₹${parseFloat(item.price).toFixed(2)}</strong></td>
        <td>
          <span class="badge-status ${item.foodType === 'NON_VEG' ? 'status-cancelled' : 'status-delivered'}">
            ${item.foodType === 'NON_VEG' ? '🍗 NON-VEG' : item.foodType === 'DESSERT' ? '🍰 DESSERT' : '🟢 VEG'}
          </span>
        </td>
        <td>
          <button onclick="MenuAdminController.toggleAvailability(${item.id})" class="badge-status ${item.available ? 'status-active' : 'status-inactive'}" style="cursor:pointer;border:none;">
            ${item.available ? '✓ In Stock' : '✕ Out of Stock'}
          </button>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button onclick="MenuAdminController.openEditModal(${item.id})" class="admin-btn admin-btn-outline admin-btn-sm">
              ✏️ Edit
            </button>
            <button onclick="MenuAdminController.deleteItem(${item.id})" class="admin-btn admin-btn-danger admin-btn-sm">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  const openAddModal = () => {
    document.getElementById('modalTitle').textContent = 'Add New Dish';
    document.getElementById('dishForm').reset();
    document.getElementById('dishId').value = '';
    document.getElementById('dishModal').classList.add('active');
  };

  const openEditModal = (id) => {
    const item = allMenuItems.find(i => i.id === id);
    if (!item) return;

    document.getElementById('modalTitle').textContent = 'Edit Dish Details';
    document.getElementById('dishId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemDescription').value = item.description || '';
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemCategory').value = item.category || 'Indian';
    document.getElementById('itemFoodType').value = item.foodType || 'VEG';
    document.getElementById('itemImageUrl').value = item.imageUrl || '';
    document.getElementById('itemAvailable').checked = item.available;

    document.getElementById('dishModal').classList.add('active');
  };

  const closeModal = () => {
    document.getElementById('dishModal').classList.remove('active');
  };

  const saveDish = async (e) => {
    e.preventDefault();
    const id = document.getElementById('dishId').value;
    const dishData = {
      name: document.getElementById('itemName').value.trim(),
      description: document.getElementById('itemDescription').value.trim(),
      price: parseFloat(document.getElementById('itemPrice').value),
      category: document.getElementById('itemCategory').value,
      foodType: document.getElementById('itemFoodType').value,
      imageUrl: document.getElementById('itemImageUrl').value.trim() || 'images/indianfood.jpg',
      available: document.getElementById('itemAvailable').checked,
      rating: 4.8
    };

    try {
      const url = id ? `/api/admin/menu/${id}` : '/api/admin/menu';
      const method = id ? 'PUT' : 'POST';

      const res = await AdminApp.authFetch(url, {
        method,
        body: JSON.stringify(dishData)
      });

      if (res.ok) {
        AdminApp.showToast(id ? 'Dish updated successfully!' : 'New dish added successfully!', 'success');
        closeModal();
        loadMenu();
      } else {
        AdminApp.showToast('Failed to save dish.', 'error');
      }
    } catch (err) {
      console.error('Save dish error:', err);
      AdminApp.showToast('Server error saving dish.', 'error');
    }
  };

  const toggleAvailability = async (id) => {
    try {
      const res = await AdminApp.authFetch(`/api/admin/menu/${id}/toggle`, {
        method: 'PUT'
      });
      if (res.ok) {
        AdminApp.showToast('Availability updated.', 'success');
        loadMenu();
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const deleteItem = async (id) => {
    const confirmed = await FoodieApp.confirmModal({
      title: 'Delete Menu Dish?',
      message: 'Are you sure you want to permanently remove this dish from the Foodie Express menu?',
      confirmText: 'Delete Dish',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await AdminApp.authFetch(`/api/admin/menu/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        AdminApp.showToast('Dish deleted successfully.', 'success', 'Item Deleted');
        loadMenu();
      } else {
        AdminApp.showToast('Failed to delete menu item.', 'error');
      }
    } catch (err) {
      console.error('Delete item error:', err);
      AdminApp.showToast('Server error deleting menu item.', 'error');
    }
  };

  const filterMenu = () => {
    const search = document.getElementById('menuSearch')?.value.toLowerCase().trim() || '';
    const cat = document.getElementById('menuCategoryFilter')?.value || 'ALL';

    const filtered = allMenuItems.filter(i => {
      const matchesSearch = !search ||
        (i.name && i.name.toLowerCase().includes(search)) ||
        (i.description && i.description.toLowerCase().includes(search));

      const matchesCat = cat === 'ALL' || (i.category && i.category.toLowerCase() === cat.toLowerCase());

      return matchesSearch && matchesCat;
    });

    renderMenu(filtered);
  };

  return {
    loadMenu,
    openAddModal,
    openEditModal,
    closeModal,
    saveDish,
    toggleAvailability,
    deleteItem,
    filterMenu
  };
})();
