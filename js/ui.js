// MAX ui.js module.
function getSkeletonMarkup(type = 'card', count = 4) {
  if (type === 'detail') {
    return `<div class="skeleton-detail" aria-label="Loading product details">
      <div class="skeleton skeleton-detail-image"></div>
      <div class="skeleton-detail-copy">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line long"></div>
        <div class="skeleton skeleton-line medium"></div>
        <div class="skeleton skeleton-price"></div>
        <div class="skeleton skeleton-line long"></div>
        <div class="skeleton skeleton-line medium"></div>
      </div>
    </div>`;
  }

  const cardClass = type === 'search' ? 'skeleton-search' : '';
  return Array.from({ length: count }, () => `<article class="skeleton-card ${cardClass}" aria-hidden="true">
    <div class="skeleton skeleton-card-image"></div>
    <div class="skeleton-card-body">
      <div class="skeleton skeleton-line short"></div>
      <div class="skeleton skeleton-line long"></div>
      <div class="skeleton skeleton-line medium"></div>
      <div class="skeleton skeleton-price"></div>
    </div>
  </article>`).join('');
}

function renderWithLoading(container, type, renderContent, count = 4, delay = 180) {
  if (!container) return;
  const renderToken = String(Number(container.dataset.loadingToken || 0) + 1);
  container.dataset.loadingToken = renderToken;
  container.classList.add('loading-grid');
  container.innerHTML = getSkeletonMarkup(type, count);
  window.setTimeout(() => {
    if (container.dataset.loadingToken !== renderToken) return;
    renderContent();
    container.classList.remove('loading-grid');
  }, delay);
}

function renderEmptyState({ icon, title, message, primaryLabel, primaryHref, secondaryLabel, secondaryHref }) {
  return `<div class="empty-state" style="grid-column: 1 / -1;">
    <div class="empty-state-icon" aria-hidden="true">${icon}</div>
    <h3>${title}</h3>
    <p>${message}</p>
    <div class="empty-state-actions">
      ${primaryLabel && primaryHref ? `<a class="primary-btn small" href="${primaryHref}">${primaryLabel}</a>` : ''}
      ${secondaryLabel && secondaryHref ? `<a class="secondary-btn small" href="${secondaryHref}">${secondaryLabel}</a>` : ''}
    </div>
  </div>`;
}

function enhanceAccessibilityAndPerformance() {
  const main = document.querySelector('main');
  if (main) {
    main.id ||= 'main-content';
    if (!document.querySelector('.skip-link')) {
      const skipLink = document.createElement('a');
      skipLink.className = 'skip-link';
      skipLink.href = `#${main.id}`;
      skipLink.textContent = 'Skip to main content';
      document.body.prepend(skipLink);
    }
  }

  document.querySelectorAll('img').forEach((image, index) => {
    const isHeroImage = image.closest('.hero-visual, .product-highlight, .showcase-card');
    if (!image.hasAttribute('loading')) image.loading = isHeroImage ? 'eager' : 'lazy';
    if (!image.hasAttribute('fetchpriority') && isHeroImage) image.fetchPriority = 'high';
    if (!image.hasAttribute('decoding')) image.decoding = 'async';
    if (!image.alt) image.alt = `MAX product image ${index + 1}`;
  });
}

function renderDealsPage() {
  const dealsRoot = document.querySelector('[data-deals-page]');
  if (!dealsRoot) return;

  const budgetDemoDeals = [
    { name: 'Braided USB-C Cable', category: 'Everyday tech', price: 4500, originalPrice: 7000, discount: 36, stock: 42, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80' },
    { name: 'Compact Phone Stand', category: 'Desk essentials', price: 6500, originalPrice: 9000, discount: 28, stock: 28, image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80' },
    { name: 'Travel Cable Pouch', category: 'Organisers', price: 8900, originalPrice: 12000, discount: 26, stock: 19, image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80' },
  ];

  const collections = {
    flash: products.filter((product) => product.isFlashSale).slice(0, 6),
    mega: products.filter((product) => product.isFeatured || product.isBestSeller).sort((a, b) => getProductDiscountPercent(b) - getProductDiscountPercent(a)).slice(0, 6),
    budget: products.filter((product) => product.price < 10000).sort((a, b) => a.price - b.price).slice(0, 6),
    discounts: [...products].sort((a, b) => getProductDiscountPercent(b) - getProductDiscountPercent(a)).slice(0, 6),
    stock: products.filter((product) => product.stock && product.stock <= 25).sort((a, b) => a.stock - b.stock).slice(0, 6),
  };
  if (!collections.budget.length) collections.budget = budgetDemoDeals;

  const renderCollection = (id, items) => {
    const root = document.getElementById(id);
    if (!root) return;
    root.innerHTML = items.length ? items.map((product) => {
      const discount = getProductDiscountPercent(product);
      const productId = product.id || '';
      const action = productId ? `<button class="primary-btn small" type="button" data-action="add-cart" data-id="${productId}">Add to cart</button>` : '<span class="deal-demo-label">Frontend demo deal</span>';
      return `<article class="deal-product-card" data-id="${productId}"><div class="deal-product-image"><img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" /><span class="deal-discount-badge">-${discount}%</span></div><div class="deal-product-body"><span class="product-meta">${escapeHtml(product.category)}</span><h3>${escapeHtml(product.name)}</h3><div class="deal-price-row"><strong>${formatPrice(product.price)}</strong><del>${formatPrice(product.originalPrice)}</del></div><span class="deal-stock">${product.stock <= 25 ? `Only ${product.stock} left` : 'Available now'}</span>${action}</div></article>`;
    }).join('') : '<div class="empty-state"><p>No deals available in this collection right now.</p></div>';
  };

  renderCollection('flashDealsGrid', collections.flash);
  renderCollection('megaDealsGrid', collections.mega);
  renderCollection('budgetDealsGrid', collections.budget);
  renderCollection('discountDealsGrid', collections.discounts);
  renderCollection('stockDealsGrid', collections.stock);
  dealsRoot.querySelectorAll('.deal-product-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('[data-action]')) return;
      if (card.dataset.id) window.location.href = `product.html?id=${Number(card.dataset.id)}`;
    });
  });
}

function showToast(message) {
  if (!elements.toast) {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    elements.toast = toast;
  }

  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 1800);
}

function pulseElement(element, className, duration = 650) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), duration);
}

function markButtonLoading(button, duration = 520) {
  if (!button || button.dataset.loading === 'true') return;
  button.dataset.loading = 'true';
  button.setAttribute('aria-busy', 'true');
  window.setTimeout(() => {
    button.dataset.loading = 'false';
    button.removeAttribute('aria-busy');
  }, duration);
}

var pendingDeleteAction = null;

function createReusableModal(id, title, content) {
  if (document.getElementById(id)) return document.getElementById(id);
  const modal = document.createElement('div');
  modal.id = id;
  modal.className = 'reusable-modal hidden';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `<div class="reusable-modal-backdrop" data-modal-close></div><div class="reusable-modal-panel" role="dialog" aria-modal="true" aria-labelledby="${id}Title"><button class="reusable-modal-close" type="button" data-modal-close aria-label="Close dialog">×</button><span class="eyebrow">MAX</span><h2 id="${id}Title">${title}</h2>${content}</div>`;
  document.body.appendChild(modal);
  return modal;
}

function openReusableModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modal.querySelector('input, button:not([data-modal-close])')?.focus();
}

function closeReusableModals() {
  document.querySelectorAll('.reusable-modal:not(.hidden), .modal:not(.hidden), .delivery-location-modal:not(.hidden), .product-gallery-modal:not(.hidden)').forEach((modal) => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  });
  document.body.classList.remove('modal-open');
}

function setupReusableModals() {
  createReusableModal('loginModal', 'Login to MAX', '<form data-auth-form="login" novalidate><div class="form-group"><label>Email</label><input name="email" type="email" autocomplete="email" required placeholder="you@example.com" /></div><div class="form-group"><label>Password</label><input name="password" type="password" autocomplete="current-password" minlength="8" required placeholder="Your password" /></div><div class="auth-options"><label><input name="remember" type="checkbox" /> Remember me</label><a class="inline-link" href="register.html">Forgot password?</a></div><p class="form-message" data-form-message aria-live="polite"></p><button class="primary-btn full" type="submit">Login</button></form>');
  createReusableModal('newsletterModal', 'Get the best deals first.', '<p class="muted">Join the MAX edit for fresh drops and private savings.</p><form data-newsletter-form novalidate><div class="form-group"><label>Email address</label><input name="email" type="email" autocomplete="email" required placeholder="you@example.com" /></div><p class="newsletter-message" data-newsletter-message aria-live="polite"></p><button class="primary-btn full" type="submit">Subscribe</button></form>');
  createReusableModal('deleteModal', 'Remove this item?', '<p class="muted">This frontend demo action cannot be undone.</p><div class="modal-actions"><button class="secondary-btn" type="button" data-modal-close>Cancel</button><button class="primary-btn" type="button" data-confirm-delete>Remove</button></div>');
  document.querySelectorAll('.header-action[href="account.html"]').forEach((link) => {
    if (link.closest('.auth-shell')) return;
    link.addEventListener('click', (event) => { event.preventDefault(); openReusableModal('loginModal'); });
  });
  document.querySelectorAll('.mobile-menu-links a[href="account.html"]').forEach((link) => {
    link.addEventListener('click', (event) => { event.preventDefault(); openReusableModal('loginModal'); });
  });
  document.querySelectorAll('[data-newsletter-modal]').forEach((trigger) => trigger.addEventListener('click', () => openReusableModal('newsletterModal')));
  if (!document.querySelector('.mobile-bottom-nav')) {
    const nav = document.createElement('nav');
    nav.className = 'mobile-bottom-nav';
    nav.setAttribute('aria-label', 'Mobile navigation');
    nav.innerHTML = '<a href="index.html"><span aria-hidden="true">⌂</span>Home</a><a href="category.html"><span aria-hidden="true">▦</span>Categories</a><button type="button" data-mobile-search><span aria-hidden="true">⌕</span>Search</button><a href="wishlist.html"><span aria-hidden="true">♡</span>Wishlist</a><a href="cart.html"><span aria-hidden="true">🛒</span>Cart</a>';
    document.body.appendChild(nav);
    nav.querySelector('[data-mobile-search]')?.addEventListener('click', () => document.querySelector('.header-search input, .search-box input')?.focus());
  }
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.mobile-bottom-nav a').forEach((link) => link.classList.toggle('active', link.getAttribute('href') === currentPage));
}

function setupModalDismissals() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeReusableModals();
      return;
    }

    if (event.key !== 'Tab') return;
    const modal = document.querySelector('.reusable-modal:not(.hidden), .modal:not(.hidden), .delivery-location-modal:not(.hidden), .product-gallery-modal:not(.hidden)');
    if (!modal) return;
    const focusable = [...modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  document.addEventListener('click', (event) => {
    const deleteTrigger = event.target.closest('[data-action="clear-cart"], [data-action="clear-wishlist"]');
    if (deleteTrigger && !pendingDeleteAction) {
      event.preventDefault();
      event.stopImmediatePropagation();
      pendingDeleteAction = deleteTrigger.dataset.action === 'clear-cart' ? clearCart : clearWishlist;
      openReusableModal('deleteModal');
      return;
    }

    if (event.target.closest('[data-modal-close], [data-delivery-close], [data-gallery-close]')) {
      closeReusableModals();
      pendingDeleteAction = null;
    }
    if (event.target.closest('[data-confirm-delete]')) {
      closeReusableModals();
      pendingDeleteAction?.();
      pendingDeleteAction = null;
    }
  });
}

function renderGlobalMarketingSections() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  if (!document.querySelector('[data-newsletter-form]')) {
    footer.insertAdjacentHTML('beforebegin', '<section class="newsletter-section container" aria-labelledby="global-newsletter-heading"><div class="newsletter-copy"><span class="eyebrow">The MAX edit</span><h2 id="global-newsletter-heading">Get the best deals first.</h2><p>Be first to hear about fresh drops, private savings, and limited-time offers.</p><button class="secondary-btn small" type="button" data-newsletter-modal>Open newsletter signup</button></div><form class="newsletter-form" data-newsletter-form novalidate><label for="globalNewsletterEmail">Email address</label><div class="newsletter-form-row"><input id="globalNewsletterEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com" required /><button class="primary-btn" type="submit">Subscribe</button></div><p class="newsletter-message" data-newsletter-message aria-live="polite"></p></form></section>');
  }
  if (footer.classList.contains('professional-footer')) return;
  footer.classList.add('professional-footer');
  footer.innerHTML = '<div class="container footer-inner"><div class="footer-brand-column"><div class="brand footer-brand"><span class="brand-mark">M</span><span class="brand-copy"><span class="brand-word">MAX</span></span></div><p>Curated finds for the modern life.</p><div class="payment-placeholders" aria-label="Accepted payment methods"><span>VISA</span><span>Mastercard</span><span>Verve</span><span>Paystack</span></div></div><div><h4>About</h4><ul><li><a href="about.html">About Us</a></li><li><a href="about.html">Careers</a></li><li><a href="contact.html">Contact</a></li><li><a href="#">Terms</a></li><li><a href="#">Privacy</a></li></ul></div><div><h4>Customer Service</h4><ul><li><a href="faq.html">Help Center</a></li><li><a href="faq.html">Returns</a></li><li><a href="faq.html">Shipping</a></li><li><a href="faq.html">FAQs</a></li></ul></div><div><h4>Categories</h4><ul><li><a href="category.html?category=electronics">Electronics</a></li><li><a href="category.html?category=fashion">Fashion</a></li><li><a href="category.html?category=beauty">Beauty</a></li><li><a href="category.html?category=home">Home</a></li><li><a href="category.html?category=phones">Phones</a></li></ul></div><div><h4>Social</h4><ul><li><a href="#">Facebook</a></li><li><a href="#">Instagram</a></li><li><a href="#">X</a></li><li><a href="#">TikTok</a></li><li><a href="#">YouTube</a></li></ul></div></div>';
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function toggleDrawer(drawer, isOpen) {
  if (!drawer) return;

  drawer.classList.toggle('open', isOpen);
}

function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;
  const quickViewModal = elements.quickViewModal || createReusableModal('productDetailsModal', 'Product details', '<div id="productDetailsModalBody"></div>');
  const quickViewBody = elements.quickViewBody || document.getElementById('productDetailsModalBody');
  if (!quickViewBody) return;

  quickViewBody.innerHTML = `
    <div class="quick-view">
      <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" />
      <div>
        <span class="eyebrow">${product.category}</span>
        <h2>${product.name}</h2>
        <div class="rating-row">
          <span>★</span>
          <strong>${product.rating}</strong>
          <span>(${product.reviews} reviews)</span>
        </div>
        <div class="price-box">
          <strong>${formatPrice(product.price)}</strong>
          <span>${formatPrice(product.originalPrice)}</span>
        </div>
        <p>${product.description}</p>
        <div class="cta-row">
          <button class="primary-btn" data-action="add-cart" data-id="${product.id}">Add to cart</button>
          <button class="secondary-btn" data-action="wishlist" data-id="${product.id}">Save item</button>
        </div>
      </div>
    </div>
  `;
  bindActionButtons(quickViewBody);
  if (elements.quickViewModal) {
    elements.quickViewModal.classList.remove('hidden');
    elements.quickViewModal.setAttribute('aria-hidden', 'false');
  } else {
    openReusableModal('productDetailsModal');
  }
}

function closeQuickView() {
  if (!elements.quickViewModal) return;

  elements.quickViewModal.classList.add('hidden');
  elements.quickViewModal.setAttribute('aria-hidden', 'true');
}

function handleActionClick(action, productId, trigger = null) {
  if (!action) return;

  if (action === 'clear-cart') {
    pendingDeleteAction = clearCart;
    openReusableModal('deleteModal');
    return;
  }

  if (action === 'clear-wishlist') {
    pendingDeleteAction = clearWishlist;
    openReusableModal('deleteModal');
    return;
  }

  if (action === 'save-for-later') {
    moveCartItemToWishlist(productId);
    return;
  }

  if (action === 'move-to-cart') {
    moveWishlistItemToCart(productId);
    return;
  }

  if (action === 'visit-store') {
    const sellerProduct = getProductById(productId);
    if (sellerProduct) showToast(`Opening ${sellerProduct.seller || 'seller'} store`);
    return;
  }

  if (action === 'view-product') {
    window.location.href = `product.html?id=${Number(productId)}`;
    return;
  }

  if (!productId && productId !== 0) return;

  const numericId = Number(productId);

  if (action === 'add-cart') addToCart(numericId);
  if (action === 'wishlist') toggleWishlist(numericId);
  if (action === 'quick-view') openQuickView(numericId);
  if (action === 'increase') changeCartQuantity(numericId, 1);
  if (action === 'decrease') changeCartQuantity(numericId, -1);
  if (action === 'remove-cart') removeFromCart(numericId);
}

function bindActionButtons(root = document) {
  return root;
}
