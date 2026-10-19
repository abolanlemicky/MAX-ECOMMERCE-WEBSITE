// MAX wishlist.js module.
function toggleWishlist(productId) {
  const exists = state.wishlist.some((item) => item.id === Number(productId));
  if (exists) removeFromWishlist(productId);
  else addToWishlist(productId);
}

function addToWishlist(productId) {
  const numericId = Number(productId);
  if (state.wishlist.some((item) => item.id === numericId)) return;

  state.wishlist.push({ id: numericId });
  saveToStorage(STORAGE_KEYS.wishlist, state.wishlist);
  updateHeaderStats();
  renderProducts();
  renderWishlist();
  pulseElement(document.querySelector(`[data-action="wishlist"][data-id="${numericId}"]`), 'wishlist-pop');
  showToast('Added to wishlist');
}

function removeFromWishlist(productId) {
  const numericId = Number(productId);
  state.wishlist = state.wishlist.filter((item) => item.id !== numericId);

  saveToStorage(STORAGE_KEYS.wishlist, state.wishlist);
  updateHeaderStats();
  renderProducts();
  renderWishlist();
  showToast('Removed from wishlist');
}

function clearWishlist() {
  state.wishlist = [];
  saveToStorage(STORAGE_KEYS.wishlist, state.wishlist);
  updateHeaderStats();
  renderProducts();
  renderWishlist();
  showToast('Wishlist cleared');
}

function renderWishlist() {
  if (!elements.wishlistItems) return;

  if (!state.wishlist.length) {
    elements.wishlistItems.innerHTML = renderEmptyState({
      icon: '♡',
      title: 'Save products you love here.',
      message: 'Tap the heart on any product to keep it close for later.',
      primaryLabel: 'Explore products',
      primaryHref: 'shop.html',
      secondaryLabel: 'Browse categories',
      secondaryHref: 'category.html',
    });
    return;
  }

  const wishlistCards = state.wishlist
    .map((entry) => {
      const product = getProductById(entry.id);
      if (!product) return null;
      return `
        <div class="wishlist-item">
          <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" />
          <div>
            <h4>${product.name}</h4>
            <p>${product.category}</p>
            <div class="wishlist-meta">
              <strong>${formatPrice(product.price)}</strong>
              <button class="primary-btn small" data-action="move-to-cart" data-id="${product.id}">Move to cart</button>
              <button class="close-btn" data-action="wishlist" data-id="${product.id}" aria-label="Remove from wishlist">×</button>
            </div>
          </div>
        </div>
      `;
    })
    .filter(Boolean)
    .join('');

  elements.wishlistItems.innerHTML = wishlistCards;
  bindActionButtons(elements.wishlistItems);
}
