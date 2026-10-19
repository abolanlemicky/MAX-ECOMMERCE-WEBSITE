// MAX account.js module.
function getAccount() {
  const storedAccount = loadFromStorage(ACCOUNT_STORAGE_KEYS.account, demoAccount);
  if (!storedAccount || typeof storedAccount !== 'object' || Array.isArray(storedAccount)) return { ...demoAccount };

  const { password, ...safeAccount } = storedAccount;
  if (password) saveToStorage(ACCOUNT_STORAGE_KEYS.account, safeAccount);
  return { ...demoAccount, ...safeAccount };
}
function getOrders() {
  const orders = loadFromStorage(ACCOUNT_STORAGE_KEYS.orders, demoOrders);
  return Array.isArray(orders) ? orders : [];
}
function saveOrders(orders) { saveToStorage(ACCOUNT_STORAGE_KEYS.orders, orders); }
function getInitials(name) { return String(name || 'Guest User').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join(''); }
function formatOrderDate(value) { return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }); }
function getOrderItemCount(order) { return (order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0); }
function getOrderTotal(order) { return order.totals?.total || order.total || 0; }
function getOrderStatusClass(status) { return status === 'Processing' || status === 'Shipped' ? 'pending' : status === 'Cancelled' ? 'cancelled' : ''; }

function renderAccountPage() {
  const root = document.querySelector('[data-account-page]');
  if (!root) return;
  const account = getAccount();
  const orders = getOrders();
  const delivered = orders.filter((order) => order.status === 'Delivered').length;
  const pending = orders.filter((order) => ['Processing', 'Shipped'].includes(order.status)).length;
  const setValue = (selector, value) => { document.querySelectorAll(selector).forEach((element) => { if ('value' in element) element.value = value; else element.textContent = value; }); };
  setValue('[data-account-name]', account.name); setValue('[data-account-email]', account.email); setValue('[data-account-phone]', account.phone || 'Not added'); setValue('[data-account-city]', account.city || 'Not added'); setValue('[data-member-since]', account.memberSince || 'September 2026'); setValue('[data-account-initials]', getInitials(account.name));
  setValue('[data-total-orders]', orders.length); setValue('[data-pending-orders]', pending); setValue('[data-delivered-orders]', delivered); setValue('[data-wishlist-items]', state.wishlist.length); setValue('[data-account-heading]', `Hello, ${account.name.split(' ')[0]}`);
  const nameInput = document.querySelector('[name="accountName"]'); const phoneInput = document.querySelector('[name="accountPhone"]'); const cityInput = document.querySelector('[name="accountCity"]');
  if (nameInput) nameInput.value = account.name; if (phoneInput) phoneInput.value = account.phone || ''; if (cityInput) cityInput.value = account.city || '';
}

function renderOrdersPage() {
  const ordersRoot = document.getElementById('ordersList');
  if (!ordersRoot) return;
  ordersRoot.innerHTML = getOrders().map((order) => `<article class="order-card order-history-card"><div><span class="eyebrow">${escapeHtml(order.number)}</span><h3>Order #${escapeHtml(order.number)}</h3><p>Placed on ${formatOrderDate(order.date)} &middot; ${getOrderItemCount(order)} ${getOrderItemCount(order) === 1 ? 'item' : 'items'}</p></div><div class="order-history-meta"><strong>${formatPrice(getOrderTotal(order))}</strong><span class="status-pill ${getOrderStatusClass(order.status)}">${escapeHtml(order.status)}</span><a class="secondary-btn small" href="order-success.html?order=${encodeURIComponent(order.number)}">View Order</a></div></article>`).join('');
}

function renderAuthState() {
  const account = getAccount();
  document.querySelectorAll('[data-auth-name]').forEach((element) => { element.textContent = account.name; });
}
