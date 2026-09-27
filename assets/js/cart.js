/**
 * Foodie Express - Cart Management Module
 */

const CartService = (() => {
  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  };

  const saveCart = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof syncCartBadge === 'function') syncCartBadge();
  };

  /**
   * Add Item to Cart
   */
  const addToCart = (name, price, quantity = 1, image = null) => {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.name.trim().toLowerCase() === name.trim().toLowerCase());

    const dishImg = image || (typeof FoodieApp !== 'undefined' ? FoodieApp.getDishImage(name) : 'images/indian-desserts.jpg');

    if (existingIndex > -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + quantity;
    } else {
      cart.push({
        name: name.trim(),
        price: parseFloat(price),
        quantity: Math.max(1, quantity),
        image: dishImg
      });
    }

    saveCart(cart);

    if (typeof FoodieApp !== 'undefined') {
      FoodieApp.showToast(`🛒 "${name}" added to cart!`, 'success');
    }
  };

  /**
   * Remove item from cart by index
   */
  const removeFromCart = (index) => {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
      const removed = cart.splice(index, 1)[0];
      saveCart(cart);
      if (typeof FoodieApp !== 'undefined') {
        FoodieApp.showToast(`🗑️ "${removed.name}" removed from cart`, 'info');
      }
      renderCartPage();
    }
  };

  /**
   * Update Quantity of an item
   */
  const updateQuantity = (index, delta) => {
    const cart = getCart();
    if (cart[index]) {
      const currentQty = cart[index].quantity || 1;
      const newQty = currentQty + delta;

      if (newQty <= 0) {
        removeFromCart(index);
        return;
      }

      cart[index].quantity = newQty;
      saveCart(cart);
      renderCartPage();
    }
  };

  /**
   * Calculate totals
   */
  const getTotals = () => {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const deliveryFee = subtotal > 0 && subtotal < 500 ? 40 : 0;
    const tax = subtotal * 0.05; // 5% GST
    const total = subtotal + deliveryFee + tax;

    return {
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      count: cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
    };
  };

  /**
   * Render Cart Items on cart.html
   */
  const renderCartPage = () => {
    const cartItemsContainer = document.getElementById('cart-items-list');
    const emptyState = document.getElementById('cart-empty-state');
    const cartContent = document.getElementById('cart-content-layout');

    if (!cartItemsContainer) return;

    const cart = getCart();
    const totals = getTotals();

    if (cart.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (cartContent) cartContent.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';

    cartItemsContainer.innerHTML = cart.map((item, index) => {
      const itemImg = item.image || (typeof FoodieApp !== 'undefined' ? FoodieApp.getDishImage(item.name) : 'images/indian-desserts.jpg');
      const itemTotal = (item.price * (item.quantity || 1)).toFixed(2);

      return `
        <div class="cart-item-row animate-fade-in">
          <div class="cart-item-info">
            <img src="${itemImg}" alt="${item.name}" class="cart-item-img" onerror="this.src='images/indian-desserts.jpg'">
            <div>
              <h4 class="cart-item-name">${item.name}</h4>
              <p class="cart-item-price">₹${item.price.toFixed(2)} each</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="qty-counter">
              <button class="qty-btn" onclick="CartService.updateQuantity(${index}, -1)">−</button>
              <span class="qty-value">${item.quantity || 1}</span>
              <button class="qty-btn" onclick="CartService.updateQuantity(${index}, 1)">+</button>
            </div>
            
            <span class="font-bold" style="min-width: 80px; text-align: right; font-weight: 700;">₹${itemTotal}</span>
            
            <button class="btn btn-ghost btn-sm" onclick="CartService.removeFromCart(${index})" title="Remove Item" style="color: var(--error);">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Update Summary Card
    const subtotalEl = document.getElementById('summary-subtotal');
    const deliveryEl = document.getElementById('summary-delivery');
    const taxEl = document.getElementById('summary-tax');
    const totalEl = document.getElementById('summary-total');
    const totalAmountSpan = document.getElementById('total-amount');

    if (subtotalEl) subtotalEl.textContent = `₹${totals.subtotal}`;
    if (deliveryEl) deliveryEl.textContent = totals.deliveryFee > 0 ? `₹${totals.deliveryFee}` : 'FREE';
    if (taxEl) taxEl.textContent = `₹${totals.tax}`;
    if (totalEl) totalEl.textContent = `₹${totals.total}`;
    if (totalAmountSpan) totalAmountSpan.textContent = totals.total;
  };

  /**
   * Proceed to checkout / payment
   */
  const proceedToCheckout = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const cart = getCart();

    if (!user) {
      FoodieApp.showToast('Please login before proceeding to checkout!', 'warning');
      setTimeout(() => window.location.href = 'login.html', 1200);
      return;
    }

    if (cart.length === 0) {
      FoodieApp.showToast('Your cart is empty! Add delicious food first.', 'warning');
      return;
    }

    const totals = getTotals();

    try {
      // Sync with Spring Boot cart backend if available
      for (let item of cart) {
        try {
          await fetch(`${FoodieApp.API_BASE}/api/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id || 1,
              itemName: item.name,
              price: item.price,
              quantity: item.quantity || 1
            })
          });
        } catch (e) {
          console.warn('Backend cart sync non-critical notice:', e);
        }
      }

      localStorage.setItem('paymentTotal', totals.total);
      localStorage.setItem('pendingOrder', JSON.stringify(cart));

      window.location.href = 'payment.html';
    } catch (err) {
      console.error('Checkout error:', err);
      FoodieApp.showToast('Error preparing your order. Please try again.', 'error');
    }
  };

  return {
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotals,
    renderCartPage,
    proceedToCheckout
  };
})();

// Helper function for quick inline onclick="addToCart(...)"
function addToCart(name, price, qty = 1, img = null) {
  CartService.addToCart(name, price, qty, img);
}

// Helper function for placeOrder() on cart page
function placeOrder() {
  CartService.proceedToCheckout();
}

