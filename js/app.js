// MAX app.js module.
var products = Array.isArray(window.MAX_PRODUCTS)
  ? window.MAX_PRODUCTS.map((product) => ({
      ...product,
      image: product.image || product.images?.[0] || '',
      originalPrice: product.originalPrice || product.oldPrice || product.price,
      reviews: product.reviews || product.reviewCount || 0,
      badge:
        product.badge ||
        (product.isBestSeller
          ? 'Best seller'
          : product.isFeatured
            ? 'Featured'
            : product.isFlashSale
              ? 'Flash sale'
              : product.isNew
                ? 'New'
                : 'Popular'),
    }))
  : [];

var categoryCatalog = [
  { name: 'Phones', icon: '📱', slug: 'phones', aliases: ['phones', 'phone', 'smartphone', 'device'] },
  { name: 'Laptops', icon: '💻', slug: 'laptops', aliases: ['laptops', 'laptop', 'computer', 'notebook'] },
  { name: 'Accessories', icon: '🧰', slug: 'accessories', aliases: ['accessories', 'accessory', 'gear', 'essentials'] },
  { name: 'Fashion', icon: '👗', slug: 'fashion', aliases: ['fashion', 'apparel', 'clothing', 'wear'] },
  { name: 'Shoes', icon: '👟', slug: 'shoes', aliases: ['shoes', 'sneakers', 'footwear'] },
  { name: 'Watches', icon: '⌚', slug: 'watches', aliases: ['watches', 'watch', 'wearables', 'smartwatch'] },
  { name: 'Beauty', icon: '💄', slug: 'beauty', aliases: ['beauty', 'skincare', 'cosmetics', 'makeup'] },
  { name: 'Home', icon: '🏡', slug: 'home', aliases: ['home', 'household', 'appliances'] },
  { name: 'Kitchen', icon: '🍳', slug: 'kitchen', aliases: ['kitchen', 'home kitchen', 'cookware'] },
  { name: 'Gaming', icon: '🎮', slug: 'gaming', aliases: ['gaming', 'games', 'console', 'playstation', 'xbox'] },
  { name: 'Electronics', icon: '🔌', slug: 'electronics', aliases: ['electronics', 'tech', 'devices', 'tv'] },
];

var STORAGE_KEYS = {
  cart: 'max-cart',
  wishlist: 'max-wishlist',
  promo: 'max-cart-promo',
  user: 'max-user',
  orders: 'max-orders',
  recentSearches: 'max-recent-searches',
};

var LEGACY_STORAGE_KEYS = {
  cart: 'luxora-cart',
  wishlist: 'luxora-wishlist',
  user: 'luxora-user',
};

var defaultUser = {
  name: 'Nia Brooks',
  initials: 'NB',
};

var state = {
  cart: normalizeCart(loadFromStorage(STORAGE_KEYS.cart, [], LEGACY_STORAGE_KEYS.cart)),
  wishlist: normalizeWishlist(loadFromStorage(STORAGE_KEYS.wishlist, [], LEGACY_STORAGE_KEYS.wishlist)),
  promo: normalizePromoCode(loadFromStorage(STORAGE_KEYS.promo, '', null)),
  user: normalizeUser(loadFromStorage(STORAGE_KEYS.user, defaultUser, LEGACY_STORAGE_KEYS.user)),
  filter: 'all',
  sort: 'featured',
  search: '',
};

var elements = {
  productGrid: document.getElementById('productGrid'),
  cartDrawer: document.getElementById('cartDrawer'),
  wishlistPanel: document.getElementById('wishlistPanel'),
  cartCount: document.getElementById('cartCount'),
  wishlistCount: document.getElementById('wishlistCount'),
  cartItems: document.getElementById('cartItems'),
  wishlistItems: document.getElementById('wishlistItems'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  cartDeliveryFee: document.getElementById('cartDeliveryFee'),
  cartDiscount: document.getElementById('cartDiscount'),
  cartTax: document.getElementById('cartTax'),
  cartTotal: document.getElementById('cartTotal'),
  userNameLabel: document.getElementById('userNameLabel'),
  userAvatar: document.getElementById('userAvatar'),
  quickViewModal: document.getElementById('quickViewModal'),
  quickViewBody: document.getElementById('quickViewBody'),
  toast: document.getElementById('toast'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
};

var searchConfig = {
  recentStorageKey: 'max-recent-searches',
  popularSearches: ['iPhone', 'Phones', 'Wireless', 'Audio', 'Home essentials', 'Kitchen', 'Gaming'],
  categorySuggestions: ['Phones', 'Audio', 'Home', 'Wellness', 'Gaming', 'Fashion', 'Kitchen'],
  productSuggestions: [
    'iPhone 15',
    'iPhone 15 Pro',
    'iPhone cases',
    'iPhone chargers',
    'Echo Mini Pro',
    'Aero Smart Lamp',
    'Pulse Smartwatch',
    'Halo Soundbar',
    'Vanta Headset',
    'Drift Bottle',
  ],
  resultCountLookup: {
    phones: 32,
    phone: 32,
    iphone: 24,
    'iphone 15': 18,
    'iphone 15 pro': 12,
    'iphone cases': 16,
    'iphone chargers': 14,
    wireless: 14,
    audio: 11,
    home: 8,
    gaming: 7,
    wellness: 9,
    kitchen: 5,
    fashion: 6,
  },
};

function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({ id: Number(item?.id), quantity: Math.floor(Number(item?.quantity)) }))
    .filter((item) => Number.isFinite(item.id) && item.id > 0 && item.quantity > 0);
}

function normalizeWishlist(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => Number(item?.id)).filter((id) => Number.isFinite(id) && id > 0))].map((id) => ({ id }));
}

function normalizePromoCode(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function normalizeUser(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...defaultUser };
  return { ...defaultUser, ...value };
}

var ACCOUNT_STORAGE_KEYS = { account: 'max-account', session: 'max-session', orders: 'max-orders' };
var demoAccount = { name: 'Nia Brooks', email: 'nia@example.com', phone: '+234 801 234 5678', city: 'Lagos', memberSince: 'June 2024' };
var demoOrders = [
  { number: 'MAX-2048', date: '2026-09-12T10:30:00.000Z', items: [{ id: 2, quantity: 1 }], total: 500760, status: 'Delivered' },
  { number: 'MAX-1821', date: '2026-08-25T13:15:00.000Z', items: [{ id: 3, quantity: 1 }], total: 149000, status: 'Processing' },
  { number: 'MAX-1705', date: '2026-07-15T09:20:00.000Z', items: [{ id: 4, quantity: 2 }, { id: 5, quantity: 1 }], total: 624200, status: 'Shipped' },
  { number: 'MAX-1610', date: '2026-06-28T16:40:00.000Z', items: [{ id: 6, quantity: 1 }], total: 89000, status: 'Cancelled' },
];

function setSeoMetadata(title, description, type = 'website') {
  document.title = title;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.content = description;
  const openGraph = {
    'og:type': type,
    'og:title': title,
    'og:description': description,
  };
  Object.entries(openGraph).forEach(([property, content]) => {
    const meta = document.querySelector(`meta[property="${property}"]`);
    if (meta) meta.content = content;
  });
}

function startFlashSaleCountdown() {
  const dayEl = document.getElementById('flashDays');
  const hourEl = document.getElementById('flashHours');
  const minuteEl = document.getElementById('flashMinutes');
  const secondEl = document.getElementById('flashSeconds');

  if (!dayEl || !hourEl || !minuteEl || !secondEl) return;

  const getNextCountdownMs = () => {
    const baseDuration = 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000 + 36 * 60 * 1000 + 22 * 1000;
    return baseDuration;
  };

  let targetTime = Date.now() + getNextCountdownMs();

  const tick = () => {
    const now = Date.now();
    let diff = targetTime - now;

    if (diff <= 0) {
      targetTime = Date.now() + getNextCountdownMs();
      diff = targetTime - Date.now();
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    dayEl.textContent = String(days).padStart(2, '0');
    hourEl.textContent = String(hours).padStart(2, '0');
    minuteEl.textContent = String(minutes).padStart(2, '0');
    secondEl.textContent = String(seconds).padStart(2, '0');
  };

  tick();
  setInterval(tick, 1000);
}

function initialize() {
  if (!loadFromStorage(ACCOUNT_STORAGE_KEYS.account, null)) saveToStorage(ACCOUNT_STORAGE_KEYS.account, demoAccount);
  const storedOrders = loadFromStorage(ACCOUNT_STORAGE_KEYS.orders, null);
  if (!Array.isArray(storedOrders)) saveOrders(demoOrders);
  renderCategoryNavigation();
  enhanceAccessibilityAndPerformance();
  renderGlobalMarketingSections();
  setupReusableModals();
  setupModalDismissals();
  setupMobileMenu();
  renderHomepageCategories();
  renderCategoryPage();
  renderDealsPage();
  renderProductDetailPage();
  renderCheckoutPage();
  renderOrderSuccessPage();
  renderAccountPage();
  renderOrdersPage();
  renderAuthState();
  renderDemoAuthNotice();
  setupFilterDrawer();
  startFlashSaleCountdown();
  document.querySelectorAll('.header-search input, .search-box input').forEach((input) => attachSearchExperience(input));
  renderSearchResultsPage();

  if (elements.cartCount || elements.wishlistCount || elements.userNameLabel || elements.userAvatar) {
    updateHeaderStats();
  }

  if (elements.productGrid) {
    renderProducts();
  }

  if (elements.cartItems || elements.cartSubtotal) {
    renderCart();
  }

  if (elements.wishlistItems) {
    renderWishlist();
  }

  setupEventHandlers();
}

initialize();