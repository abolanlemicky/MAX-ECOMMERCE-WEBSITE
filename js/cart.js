// MAX cart.js module.
function addToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const existingItem = state.cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({ id: productId, quantity: 1 });
  }

  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
  updateHeaderStats();
  pulseElement(document.querySelector('.header-action[href="cart.html"]'), 'cart-added');
  if (elements.cartDrawer) {
    toggleDrawer(elements.wishlistPanel, false);
    toggleDrawer(elements.cartDrawer, true);
  }
  showToast(`Added to cart: ${product.name}`);
}

function getCartTotals() {
  const subtotal = state.cart.reduce((sum, entry) => {
    const product = getProductById(entry.id);
    return sum + (product ? product.price * entry.quantity : 0);
  }, 0);
  const deliveryFee = detailState?.deliveryLocation?.fee || 0;
  const promoCode = String(state.promo || '').toUpperCase();
  const discount = promoCode === 'WELCOME10' ? subtotal * 0.1 : promoCode === 'SAVE20' ? subtotal * 0.2 : 0;
  const adjustedDeliveryFee = promoCode === 'FREESHIP' ? 0 : deliveryFee;
  const tax = (subtotal - discount) * 0.07;

  return {
    subtotal,
    deliveryFee: adjustedDeliveryFee,
    discount,
    tax,
    total: subtotal - discount + adjustedDeliveryFee + tax,
  };
}

function renderPromoState() {
  const promoCode = String(state.promo || '').toUpperCase();
  const message = promoCode ? `${promoCode} applied` : '';
  document.querySelectorAll('[data-promo-message]').forEach((element) => {
    element.textContent = message;
    element.classList.toggle('success', Boolean(message));
  });
  document.querySelectorAll('[data-promo-input]').forEach((input) => {
    input.value = promoCode;
  });
}

function applyPromoCode(code) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const validCodes = ['WELCOME10', 'SAVE20', 'FREESHIP'];
  if (!validCodes.includes(normalizedCode)) {
    state.promo = '';
    saveToStorage(STORAGE_KEYS.promo, state.promo);
    renderCart();
    document.querySelectorAll('[data-promo-message]').forEach((element) => {
      element.textContent = 'Invalid code. Try WELCOME10, SAVE20, or FREESHIP.';
      element.classList.remove('success');
    });
    showToast('Enter a valid promo code');
    return;
  }

  state.promo = normalizedCode;
  saveToStorage(STORAGE_KEYS.promo, state.promo);
  renderCart();
  showToast(`Promo code applied: ${normalizedCode}`);
}

function clearPromoCode() {
  state.promo = '';
  saveToStorage(STORAGE_KEYS.promo, state.promo);
  renderCart();
}

function renderCart() {
  if (!elements.cartItems) return;

  if (!state.cart.length) {
    elements.cartItems.innerHTML = renderEmptyState({
      icon: '🛒',
      title: 'Your cart is waiting for something special.',
      message: 'Discover useful finds and add the ones you love to your bag.',
      primaryLabel: 'Start shopping',
      primaryHref: 'shop.html',
      secondaryLabel: 'Browse deals',
      secondaryHref: 'deals.html',
    });
    if (elements.cartSubtotal) elements.cartSubtotal.textContent = formatPrice(0);
    if (elements.cartDeliveryFee) elements.cartDeliveryFee.textContent = formatPrice(0);
    if (elements.cartDiscount) elements.cartDiscount.textContent = formatPrice(0);
    if (elements.cartTax) elements.cartTax.textContent = formatPrice(0);
    if (elements.cartTotal) elements.cartTotal.textContent = formatPrice(0);
    renderPromoState();
    return;
  }

  const cartItems = state.cart
    .map((entry) => {
      const product = getProductById(entry.id);
      if (!product) return null;
      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" />
          <div>
            <h4>${product.name}</h4>
            <p>${product.category}</p>
            <div class="cart-meta">
              <div class="cart-qty">
                <button data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity">−</button>
                <span>${entry.quantity}</span>
                <button data-action="increase" data-id="${product.id}" aria-label="Increase quantity">+</button>
              </div>
              <strong>${formatPrice(product.price * entry.quantity)}</strong>
            </div>
            <button class="link-btn cart-save-btn" data-action="save-for-later" data-id="${product.id}">Save for later</button>
          </div>
          <button class="close-btn" data-action="remove-cart" data-id="${product.id}" aria-label="Remove from cart">×</button>
        </div>
      `;
    })
    .filter(Boolean)
    .join('');

  const totals = getCartTotals();

  elements.cartItems.innerHTML = cartItems;
  bindActionButtons(elements.cartItems);
  if (elements.cartSubtotal) {
    elements.cartSubtotal.textContent = formatPrice(totals.subtotal);
  }
  if (elements.cartDeliveryFee) elements.cartDeliveryFee.textContent = formatPrice(totals.deliveryFee);
  if (elements.cartDiscount) elements.cartDiscount.textContent = totals.discount ? `-${formatPrice(totals.discount)}` : formatPrice(0);
  if (elements.cartTax) elements.cartTax.textContent = formatPrice(totals.tax);
  if (elements.cartTotal) elements.cartTotal.textContent = formatPrice(totals.total);
  pulseElement(elements.cartTotal, 'price-updated', 520);
  renderPromoState();
}

function moveCartItemToWishlist(productId) {
  const numericId = Number(productId);
  if (!state.wishlist.some((item) => item.id === numericId)) state.wishlist.push({ id: numericId });
  state.cart = state.cart.filter((item) => item.id !== numericId);
  saveToStorage(STORAGE_KEYS.cart, state.cart);
  saveToStorage(STORAGE_KEYS.wishlist, state.wishlist);
  renderCart();
  renderWishlist();
  updateHeaderStats();
  showToast('Added to wishlist');
}

function moveWishlistItemToCart(productId) {
  const numericId = Number(productId);
  const existingItem = state.cart.find((item) => item.id === numericId);
  if (existingItem) existingItem.quantity += 1;
  else state.cart.push({ id: numericId, quantity: 1 });
  state.wishlist = state.wishlist.filter((item) => item.id !== numericId);
  saveToStorage(STORAGE_KEYS.cart, state.cart);
  saveToStorage(STORAGE_KEYS.wishlist, state.wishlist);
  renderCart();
  renderWishlist();
  updateHeaderStats();
  if (elements.cartDrawer) {
    toggleDrawer(elements.wishlistPanel, false);
    toggleDrawer(elements.cartDrawer, true);
  }
  showToast('Moved to cart');
}

function changeCartQuantity(productId, delta) {
  const entry = state.cart.find((item) => item.id === Number(productId));
  if (!entry) return;

  updateCartQuantity(productId, entry.quantity + delta);
}

function updateCartQuantity(productId, quantity) {
  const numericId = Number(productId);
  const nextQuantity = Number(quantity);
  const entry = state.cart.find((item) => item.id === numericId);

  if (!entry) return;

  if (nextQuantity <= 0) {
    state.cart = state.cart.filter((item) => item.id !== numericId);
  } else {
    entry.quantity = nextQuantity;
  }

  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
  updateHeaderStats();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.id !== Number(productId));
  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
  updateHeaderStats();
  showToast('Removed from cart');
}

function clearCart() {
  state.cart = [];
  state.promo = '';
  saveToStorage(STORAGE_KEYS.cart, state.cart);
  saveToStorage(STORAGE_KEYS.promo, state.promo);
  renderCart();
  updateHeaderStats();
  showToast('Cart cleared');
}
