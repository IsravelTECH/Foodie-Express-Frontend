/**
 * Foodie Express - Menu Filtering, Search & Card Controller
 */

const MenuController = (() => {
  /**
   * Filter dishes by keyword search
   */
  const filterBySearch = (searchInputId, cardSelector = '.food-card') => {
    const input = document.getElementById(searchInputId);
    if (!input) return;

    const query = input.value.trim().toLowerCase();
    const cards = document.querySelectorAll(cardSelector);
    let visibleCount = 0;

    cards.forEach(card => {
      const title = card.querySelector('.food-card-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.food-card-desc')?.textContent.toLowerCase() || '';
      const matches = title.includes(query) || desc.includes(query);

      card.style.display = matches ? 'flex' : 'none';
      if (matches) visibleCount++;
    });

    const noResultsEl = document.getElementById('noResultsMsg');
    if (noResultsEl) {
      noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  /**
   * Filter dishes by category pill tab
   */
  const filterByCategory = (category, pillBtn, cardSelector = '.food-card') => {
    // Update active state on pills
    document.querySelectorAll('.filter-pill').forEach(pill => pill.classList.remove('active'));
    if (pillBtn) pillBtn.classList.add('active');

    const cards = document.querySelectorAll(cardSelector);
    let visibleCount = 0;

    cards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || 'all';
      const matches = category === 'all' || cardCategory.toLowerCase() === category.toLowerCase();

      card.style.display = matches ? 'flex' : 'none';
      if (matches) visibleCount++;
    });

    const noResultsEl = document.getElementById('noResultsMsg');
    if (noResultsEl) {
      noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  /**
   * Sort dishes by price / rating / name
   */
  const sortDishes = (sortSelectId, containerId, cardSelector = '.food-card') => {
    const select = document.getElementById(sortSelectId);
    const container = document.getElementById(containerId);
    if (!select || !container) return;

    const criteria = select.value;
    const cards = Array.from(container.querySelectorAll(cardSelector));

    cards.sort((a, b) => {
      const priceA = parseFloat(a.getAttribute('data-price') || 0);
      const priceB = parseFloat(b.getAttribute('data-price') || 0);
      const ratingA = parseFloat(a.getAttribute('data-rating') || 4.5);
      const ratingB = parseFloat(b.getAttribute('data-rating') || 4.5);
      const nameA = a.querySelector('.food-card-title')?.textContent.trim().toLowerCase() || '';
      const nameB = b.querySelector('.food-card-title')?.textContent.trim().toLowerCase() || '';

      switch (criteria) {
        case 'price-asc': return priceA - priceB;
        case 'price-desc': return priceB - priceA;
        case 'rating-desc': return ratingB - ratingA;
        case 'name-asc': return nameA.localeCompare(nameB);
        default: return 0;
      }
    });

    cards.forEach(card => container.appendChild(card));
  };

  /**
   * Quantity Changer for Card Counter
   */
  const changeCardQty = (btn, delta) => {
    const parent = btn.parentElement;
    const qtySpan = parent.querySelector('.qty-value');
    if (qtySpan) {
      let current = parseInt(qtySpan.textContent) || 1;
      current = Math.max(1, current + delta);
      qtySpan.textContent = current;
    }
  };

  /**
   * Add to cart directly from card with its current quantity
   */
  const addCardToCart = (btn, name, price, image = null) => {
    const card = btn.closest('.food-card');
    const qtySpan = card?.querySelector('.qty-value');
    const qty = qtySpan ? parseInt(qtySpan.textContent) || 1 : 1;

    CartService.addToCart(name, price, qty, image);

    // Visual button feedback
    const originalText = btn.innerHTML;
    btn.innerHTML = '✓ Added!';
    btn.classList.add('btn-secondary');
    btn.classList.remove('btn-primary');

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');
    }, 1200);
  };

  return {
    filterBySearch,
    filterByCategory,
    sortDishes,
    changeCardQty,
    addCardToCart
  };
})();

// Inline helper aliases
function filterDishes() {
  MenuController.filterBySearch('searchBox', '.food-card');
}
function changeQty(btn, delta) {
  MenuController.changeCardQty(btn, delta);
}

