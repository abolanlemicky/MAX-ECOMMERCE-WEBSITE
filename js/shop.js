// MAX shop.js module.
function getProductById(productId) {
  return products.find((product) => product.id === Number(productId));
}

function getDiscountPercent(product) {
  if (!product.originalPrice || product.originalPrice <= product.price) return 0;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
}

function getInstallmentAmount(product) {
  return Math.max(16, Math.round(product.price / 4));
}

function getStockStatus(product) {
  if (product.id % 5 === 0) return 'Low stock';
  if (product.id % 3 === 0) return 'Almost sold out';
  if (product.id % 2 === 0) return 'In stock';
  return 'Ready to ship';
}

function renderProductCard(product, options = {}) {
  const { isWishlisted = false, compact = false, recommendation = false } = options;
  const discountPercent = getDiscountPercent(product);
  const installmentPrice = getInstallmentAmount(product);
  const stockStatus = getStockStatus(product);
  const imageHeightClass = compact ? 'compact-image' : '';

  return `
    <article class="product-card ${compact ? 'compact-card' : ''}" data-id="${product.id}" tabindex="0" role="link" aria-label="View ${product.name}">
      <div class="product-image-wrap ${imageHeightClass}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" />
        <span class="product-badge">${product.badge}</span>
        <button class="favorite-btn ${isWishlisted ? 'active' : ''}" data-action="wishlist" data-id="${product.id}" aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}">
          ${isWishlisted ? '♥' : '♡'}
        </button>
        <div class="product-card-hover">
          <button class="hover-quick-view" data-action="quick-view" data-id="${product.id}">Quick View</button>
          <button class="hover-add-cart" data-action="add-cart" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
      <div class="product-body">
        <div class="product-meta">
          <span>${product.brand}</span>
          <span>${product.category}</span>
        </div>
        <h3>${product.name}</h3>
        <div class="rating-row">
          <span class="stars">★★★★★</span>
          <strong>${product.rating}</strong>
          <span>(${product.reviews})</span>
        </div>
        <div class="price-row">
          <div class="price-box">
            <strong>${formatPrice(product.price)}</strong>
            <div class="price-inline">
              <span>${formatPrice(product.originalPrice)}</span>
              <em>-${discountPercent}%</em>
            </div>
          </div>
        </div>
        <div class="payment-row">or ${formatPrice(installmentPrice)}/mo</div>
        <div class="product-stock-row">
          <span class="stock-dot"></span>
          <span>${stockStatus}</span>
        </div>
        <div class="card-actions">
          <button class="add-btn" data-action="add-cart" data-id="${product.id}">Add to Cart</button>
          ${recommendation ? `<button class="link-btn recommendation-view-btn" type="button" data-action="view-product" data-id="${product.id}">View product</button>` : ''}
        </div>
      </div>
    </article>
  `;
}

function normalizeCategoryKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getCategorySlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getCategoryBySlug(slug) {
  const normalized = getCategorySlug(slug);
  return categoryCatalog.find((category) => {
    const matchesSlug = getCategorySlug(category.slug) === normalized;
    const matchesName = getCategorySlug(category.name) === normalized;
    const matchesAlias = category.aliases.some((alias) => getCategorySlug(alias) === normalized);
    return matchesSlug || matchesName || matchesAlias;
  });
}

function getCategoryProductCount(categoryName) {
  const normalized = normalizeCategoryKey(categoryName);
  return products.filter((product) => normalizeCategoryKey(product.category) === normalized).length;
}

function renderHomepageCategories() {
  const container = document.getElementById('homepageCategories');
  if (!container) return;

  container.innerHTML = categoryCatalog
    .map((category) => {
      const productCount = getCategoryProductCount(category.name);
      return `
        <a class="category-card" href="category.html?category=${encodeURIComponent(category.slug)}" data-category="${category.slug}">
          <div class="category-visual ${['orange', 'turquoise', 'purple', 'blue', 'red', 'yellow', 'orange', 'turquoise', 'purple', 'blue', 'red', 'yellow'][categoryCatalog.indexOf(category)]}">
            <span>${category.icon}</span>
          </div>
          <div class="category-card-body">
            <h3>${category.name}</h3>
            <p>${productCount} products</p>
          </div>
        </a>
      `;
    })
    .join('');
}

function getProductsForCategory(categorySlugOrName) {
  const category = getCategoryBySlug(categorySlugOrName) || categoryCatalog.find((item) => normalizeCategoryKey(item.name) === normalizeCategoryKey(categorySlugOrName));
  if (!category) {
    return products;
  }

  const target = normalizeCategoryKey(category.name);
  return products.filter((product) => normalizeCategoryKey(product.category) === target);
}

function renderCategoryPage() {
  const categoryGrid = document.getElementById('categoryGrid');
  const productsGrid = document.getElementById('categoryProductsGrid');
  const heading = document.getElementById('categoryHeading');
  if (!categoryGrid || !productsGrid) return;

  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get('category');
  const activeCategory = requestedCategory ? getCategoryBySlug(requestedCategory) : null;
  const categorySection = categoryGrid.closest('section');
  const productSection = productsGrid.closest('section');
  const sectionHeading = heading?.closest('.section-head');
  const selectedProducts = activeCategory ? getProductsForCategory(activeCategory.slug) : [];

  state.filter = activeCategory ? activeCategory.name : 'all';

  categoryGrid.hidden = Boolean(activeCategory);
  categoryGrid.setAttribute('aria-hidden', String(Boolean(activeCategory)));
  if (categorySection) categorySection.hidden = Boolean(activeCategory);
  productsGrid.hidden = !activeCategory;
  if (productSection) productSection.hidden = !activeCategory;

  if (heading) {
    heading.textContent = activeCategory
      ? `${activeCategory.name} (${selectedProducts.length} products)`
      : 'All collections';
  }

  setSeoMetadata(
    activeCategory ? `MAX | ${activeCategory.name} Collection` : 'MAX | Categories',
    activeCategory
      ? `Shop ${selectedProducts.length} products in the MAX ${activeCategory.name} collection.`
      : 'Browse MAX product collections by lifestyle and need.'
  );

  if (sectionHeading) {
    const existingBackLink = sectionHeading.querySelector('[data-category-back]');
    if (existingBackLink) existingBackLink.remove();
    if (activeCategory) {
      sectionHeading.insertAdjacentHTML(
        'beforeend',
        '<a class="secondary-btn small" href="category.html" data-category-back>All collections</a>'
      );
    }
  }

  const categoryEntries = categoryCatalog.map((category) => {
    const count = getCategoryProductCount(category.name);
    const isActive = activeCategory && getCategorySlug(category.name) === getCategorySlug(activeCategory.name);
    return `
      <a class="category-card ${isActive ? 'active' : ''}" href="category.html?category=${encodeURIComponent(category.slug)}" data-category="${category.slug}">
        <div class="category-visual ${['orange', 'turquoise', 'purple', 'blue', 'red', 'yellow', 'orange', 'turquoise', 'purple', 'blue', 'red', 'yellow'][categoryCatalog.indexOf(category)]}">
          <span>${category.icon}</span>
        </div>
        <div class="category-card-body">
          <h3>${category.name}</h3>
          <p>${count} products</p>
        </div>
      </a>
    `;
  });

  categoryGrid.innerHTML = categoryEntries.join('');

  const filteredProducts = sortProducts(selectedProducts, state.sort);

  renderWithLoading(productsGrid, 'card', () => {
    if (!activeCategory) {
      productsGrid.innerHTML = '';
      return;
    }

    if (!filteredProducts.length) {
      productsGrid.innerHTML = renderEmptyState({
        icon: '▦',
        title: 'This collection is taking a little break.',
        message: 'Explore another category to find your next favorite.',
        primaryLabel: 'Browse categories',
        primaryHref: 'category.html',
        secondaryLabel: 'Shop all products',
        secondaryHref: 'shop.html',
      });
      return;
    }

    productsGrid.innerHTML = filteredProducts
      .map((product) => renderProductCard(product, { isWishlisted: state.wishlist.some((item) => item.id === product.id) }))
      .join('');
    bindActionButtons(productsGrid);
  }, Math.min(8, Math.max(4, filteredProducts.length)));
}

function getProductDiscountPercent(product) {
  const basePrice = Number(product.originalPrice ?? product.oldPrice ?? product.price ?? 0);
  const currentPrice = Number(product.price ?? 0);

  if (!basePrice || basePrice <= currentPrice) {
    return 0;
  }

  return Math.round(((basePrice - currentPrice) / basePrice) * 100);
}

function sortProducts(items, sortMode = 'recommended') {
  const sorted = [...items];

  switch (sortMode) {
    case 'popular':
      sorted.sort((a, b) => {
        const reviewDiff = Number(b.reviews ?? b.reviewCount ?? 0) - Number(a.reviews ?? a.reviewCount ?? 0);
        if (reviewDiff !== 0) return reviewDiff;
        return Number(b.rating ?? 0) - Number(a.rating ?? 0);
      });
      break;
    case 'newest':
      sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || Number(b.id) - Number(a.id));
      break;
    case 'price-low':
      sorted.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case 'price-high':
      sorted.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case 'highest-rated':
    case 'rating':
      sorted.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0) || Number(b.reviews ?? b.reviewCount ?? 0) - Number(a.reviews ?? a.reviewCount ?? 0));
      break;
    case 'biggest-discount':
    case 'discount':
      sorted.sort((a, b) => getProductDiscountPercent(b) - getProductDiscountPercent(a) || Number(b.rating ?? 0) - Number(a.rating ?? 0));
      break;
    case 'featured':
    case 'recommended':
    default:
      sorted.sort((a, b) => {
        const featureDiff = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
        if (featureDiff !== 0) return featureDiff;
        const bestsellerDiff = Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller));
        if (bestsellerDiff !== 0) return bestsellerDiff;
        return Number(b.rating ?? 0) - Number(a.rating ?? 0);
      });
      break;
  }

  return sorted;
}

function getFilteredProducts() {
  let filtered = [...products];

  if (state.filter !== 'all') {
    filtered = filtered.filter((product) => product.category === state.filter);
  }

  if (state.search) {
    const term = state.search.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term)
    );
  }

  return sortProducts(filtered, state.sort);
}

function filterProducts() {
  return getFilteredProducts();
}

function setupFilterDrawer() {
  const sidebar = document.querySelector('.filter-sidebar');
  const toolbar = document.querySelector('.catalog-toolbar');
  if (!sidebar || !toolbar || sidebar.dataset.drawerReady === 'true') return;

  sidebar.dataset.drawerReady = 'true';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'secondary-btn small mobile-filter-toggle';
  toggle.textContent = 'Filters';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'shopFilterPanel');
  toolbar.appendChild(toggle);

  const panel = sidebar.querySelector('.filter-panel');
  if (!panel) return;
  panel.id = 'shopFilterPanel';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'filter-panel-close';
  close.textContent = 'Close';
  close.setAttribute('aria-label', 'Close filters');
  panel.querySelector('.filter-head')?.appendChild(close);

  const setOpen = (isOpen) => {
    sidebar.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('filter-drawer-open', isOpen);
  };

  toggle.addEventListener('click', () => setOpen(!sidebar.classList.contains('open')));
  close.addEventListener('click', () => setOpen(false));
  sidebar.addEventListener('click', (event) => {
    if (event.target === sidebar) setOpen(false);
  });
}

function getWishlistItemProductIds() {
  return state.wishlist.map((item) => item.id);
}

function renderProducts() {
  if (!elements.productGrid) return;

  const filtered = getFilteredProducts();
  const wishlistIds = getWishlistItemProductIds();

  renderWithLoading(elements.productGrid, 'card', () => {
    if (!filtered.length) {
      elements.productGrid.innerHTML = renderEmptyState({
        icon: '⌕',
        title: 'No products match your filter.',
        message: 'Try another search or reset the category selection.',
        primaryLabel: 'Shop all products',
        primaryHref: 'shop.html',
        secondaryLabel: 'Browse categories',
        secondaryHref: 'category.html',
      });
      return;
    }

    elements.productGrid.innerHTML = filtered
      .map((product) => renderProductCard(product, { isWishlisted: wishlistIds.includes(product.id) }))
      .join('');
    bindActionButtons(elements.productGrid);
  }, Math.min(8, Math.max(4, filtered.length)));
}
