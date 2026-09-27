/**
 * Foodie Express - Admin Categories Controller
 */

const CategoriesAdminController = (() => {
  let allCategories = [];

  const loadCategories = async () => {
    try {
      const res = await AdminApp.authFetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      allCategories = await res.json();
      renderCategories(allCategories);
    } catch (err) {
      console.error('Categories error:', err);
      AdminApp.showToast('Unable to load categories.', 'error');
    }
  };

  const renderCategories = (cats) => {
    const tbody = document.getElementById('categoriesTbody');
    if (!tbody) return;

    if (cats.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--admin-text-muted);">No categories created yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = cats.map(c => `
      <tr>
        <td><span style="font-size:1.6rem;">${c.icon || '🍽️'}</span></td>
        <td><strong>${c.name}</strong></td>
        <td style="color:var(--admin-text-muted);font-size:0.85rem;">${c.description || ''}</td>
        <td>
          <span class="badge-status ${c.active ? 'status-active' : 'status-inactive'}">
            ${c.active ? 'Active' : 'Disabled'}
          </span>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button onclick="CategoriesAdminController.openEditModal(${c.id})" class="admin-btn admin-btn-outline admin-btn-sm">
              ✏️ Edit
            </button>
            <button onclick="CategoriesAdminController.deleteCategory(${c.id})" class="admin-btn admin-btn-danger admin-btn-sm">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  const openAddModal = () => {
    document.getElementById('catModalTitle').textContent = 'Add Category';
    document.getElementById('catForm').reset();
    document.getElementById('catId').value = '';
    document.getElementById('catModal').classList.add('active');
  };

  const openEditModal = (id) => {
    const cat = allCategories.find(c => c.id === id);
    if (!cat) return;

    document.getElementById('catModalTitle').textContent = 'Edit Category';
    document.getElementById('catId').value = cat.id;
    document.getElementById('catName').value = cat.name;
    document.getElementById('catDescription').value = cat.description || '';
    document.getElementById('catIcon').value = cat.icon || '🍽️';
    document.getElementById('catActive').checked = cat.active;

    document.getElementById('catModal').classList.add('active');
  };

  const closeModal = () => {
    document.getElementById('catModal').classList.remove('active');
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    const id = document.getElementById('catId').value;
    const catData = {
      name: document.getElementById('catName').value.trim(),
      description: document.getElementById('catDescription').value.trim(),
      icon: document.getElementById('catIcon').value.trim() || '🍽️',
      active: document.getElementById('catActive').checked
    };

    try {
      const url = id ? `/api/admin/categories/${id}` : '/api/admin/categories';
      const method = id ? 'PUT' : 'POST';

      const res = await AdminApp.authFetch(url, {
        method,
        body: JSON.stringify(catData)
      });

      if (res.ok) {
        AdminApp.showToast(id ? 'Category updated!' : 'Category created!', 'success');
        closeModal();
        loadCategories();
      } else {
        AdminApp.showToast('Failed to save category.', 'error');
      }
    } catch (err) {
      console.error('Save category error:', err);
    }
  };

  const deleteCategory = async (id) => {
    const confirmed = await FoodieApp.confirmModal({
      title: 'Delete Category?',
      message: 'Are you sure you want to delete this menu category? Dishes in this category may become unassigned.',
      confirmText: 'Delete Category',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await AdminApp.authFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        AdminApp.showToast('Category deleted successfully.', 'success', 'Category Removed');
        loadCategories();
      } else {
        AdminApp.showToast('Failed to delete category.', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      AdminApp.showToast('Server error deleting category.', 'error');
    }
  };

  return {
    loadCategories,
    openAddModal,
    openEditModal,
    closeModal,
    saveCategory,
    deleteCategory
  };
})();
