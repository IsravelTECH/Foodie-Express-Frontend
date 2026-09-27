/**
 * Foodie Express - Wishlist Management Module
 */

const WishlistService = (() => {
  const getWishlist = () => {
    try {
      return JSON.parse(localStorage.getItem('wishlist')) || [];
    } catch {
      return [];
    }
  };

  const saveWishlist = (list) => {
    localStorage.setItem('wishlist', JSON.stringify(list));
    if (typeof syncWishlistBadge === 'function') syncWishlistBadge();
  };

  const isFavorite = (name) => {
    const list = getWishlist();
    return list.some(item => item.name.trim().toLowerCase() === name.trim().toLowerCase());
  };

  /**
   * Toggle Wishlist Item
   */
  const toggleFavorite = (btn, name, price = 199, image = null) => {
    let list = getWishlist();
    const index = list.findIndex(item => item.name.trim().toLowerCase() === name.trim().toLowerCase());

    const itemImg = image || (typeof FoodieApp !== 'undefined' ? FoodieApp.getDishImage(name) : 'images/indian-desserts.jpg');

    if (index > -1) {
      list.splice(index, 1);
      if (btn) {
        btn.classList.remove('active');
        btn.innerHTML = '♡';
      }
      if (typeof FoodieApp !== 'undefined') {
        FoodieApp.showToast(`💔 "${name}" removed from wishlist`, 'info');
      }
    } else {
      list.push({
        name: name.trim(),
        price: parseFloat(price),
        image: itemImg
      });
      if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '❤️';
      }
      if (typeof FoodieApp !== 'undefined') {
        FoodieApp.showToast(`❤️ "${name}" added to wishlist!`, 'success');
      }
    }

    saveWishlist(list);
  };

  /**
   * Remove item from wishlist
   */
  const removeFromWishlist = (name) => {
    let list = getWishlist();
    list = list.filter(item => item.name.trim().toLowerCase() !== name.trim().toLowerCase());
    saveWishlist(list);
    if (typeof FoodieApp !== 'undefined') {
      FoodieApp.showToast(`"${name}" removed from wishlist`, 'info');
    }
    renderWishlistPage();
  };

  /**
   * Move item from wishlist to cart
   */
  const moveToCart = (name, price, image) => {
    CartService.addToCart(name, price, 1, image);
    removeFromWishlist(name);
  };

  /**
   * Render Wishlist Items on wishlist.html
   */
  const renderWishlistPage = () => {
    const container = document.getElementById('wishlistContainer');
    const emptyState = document.getElementById('wishlistEmptyState');
    if (!container) return;

    const list = getWishlist();

    if (list.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = list.map(item => {
      const itemImg = item.image || (typeof FoodieApp !== 'undefined' ? FoodieApp.getDishImage(item.name) : 'images/indian-desserts.jpg');
      const itemPrice = item.price ? parseFloat(item.price).toFixed(2) : '199.00';

      return `
        <div class="food-card animate-fade-in">
          <div class="food-card-image-wrap">
            <img src="${itemImg}" alt="${item.name}" onerror="this.src='images/indian-desserts.jpg'">
            <button class="card-wishlist-btn active" onclick="WishlistService.removeFromWishlist('${item.name}')" title="Remove from wishlist">
              ❤️
            </button>
          </div>
          <div class="food-card-body">
            <div class="food-card-header">
              <h3 class="food-card-title">${item.name}</h3>
              <div class="food-card-rating">★ 4.8</div>
            </div>
            <p class="food-card-desc">Delicious handcrafted favorite delicacy fresh to order.</p>
            <div class="food-card-footer">
              <div class="food-price">
                <span class="food-price-label">Price</span>
                <span class="food-price-val"><span>₹</span>${itemPrice}</span>
              </div>
              <button class="btn btn-primary btn-sm" onclick="WishlistService.moveToCart('${item.name}', ${itemPrice}, '${itemImg}')">
                🛒 Move to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  return {
    getWishlist,
    isFavorite,
    toggleFavorite,
    removeFromWishlist,
    moveToCart,
    renderWishlistPage
  };
})();

// Helper function for inline toggleFav(button, itemName)
function toggleFav(btn, itemName, price = 199, img = null) {
  WishlistService.toggleFavorite(btn, itemName, price, img);
}

function removeFromWishlist(name) {
  WishlistService.removeFromWishlist(name);
}

