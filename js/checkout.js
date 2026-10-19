// MAX checkout.js module.
var nigerianStates = [
  'Abia State', 'Adamawa State', 'Akwa Ibom State', 'Anambra State', 'Bauchi State', 'Bayelsa State',
  'Benue State', 'Borno State', 'Cross River State', 'Delta State', 'Ebonyi State', 'Edo State',
  'Ekiti State', 'Enugu State', 'Gombe State', 'Imo State', 'Jigawa State', 'Kaduna State',
  'Kano State', 'Katsina State', 'Kebbi State', 'Kogi State', 'Kwara State', 'Lagos State',
  'Nasarawa State', 'Niger State', 'Ogun State', 'Ondo State', 'Osun State', 'Oyo State',
  'Plateau State', 'Rivers State', 'Sokoto State', 'Taraba State', 'Yobe State', 'Zamfara State',
  'Federal Capital Territory',
];

var checkoutState = {
  step: 1,
};

function getCheckoutForm() {
  return document.getElementById('checkoutForm');
}

function getCheckoutDetails() {
  const form = getCheckoutForm();
  if (!form) return {};
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

function renderCheckoutSummary() {
  const productsRoot = document.getElementById('checkoutSummaryProducts');
  const totals = getCheckoutTotals();
  if (productsRoot) {
    productsRoot.innerHTML = state.cart.length
      ? state.cart
          .map((entry) => {
            const product = getProductById(entry.id);
            if (!product) return '';
            return `<div class="checkout-summary-product"><img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" /><div><strong>${product.name}</strong><span>Qty: ${entry.quantity}</span></div><b>${formatPrice(product.price * entry.quantity)}</b></div>`;
          })
          .join('')
      : '<p class="muted">Your cart is empty.</p>';
  }
  const subtotal = document.getElementById('checkoutSubtotal');
  const discount = document.getElementById('checkoutDiscount');
  const delivery = document.getElementById('checkoutDelivery');
  const total = document.getElementById('checkoutTotal');
  if (subtotal) subtotal.textContent = formatPrice(totals.subtotal);
  if (discount) discount.textContent = totals.discount ? `-${formatPrice(totals.discount)}` : formatPrice(0);
  if (delivery) delivery.textContent = formatPrice(totals.deliveryFee);
  if (total) total.textContent = formatPrice(totals.total);
  document.querySelectorAll('[data-promo-message]').forEach((element) => {
    element.textContent = state.promo ? `${state.promo} applied` : '';
  });
}

function getCheckoutTotals() {
  const totals = getCartTotals();
  const stateName = getCheckoutDetails().state;
  const deliveryFees = { 'Lagos State': 2500, 'Federal Capital Territory': 3000, 'Oyo State': 1800, 'Rivers State': 3500 };
  const deliveryFee = Object.prototype.hasOwnProperty.call(deliveryFees, stateName) ? deliveryFees[stateName] : 0;
  return { ...totals, deliveryFee, total: totals.subtotal - totals.discount + deliveryFee + totals.tax };
}

function renderCheckoutReview() {
  const reviewRoot = document.getElementById('checkoutReview');
  if (!reviewRoot) return;
  const details = getCheckoutDetails();
  const paymentMethod = details.paymentMethod || 'Card';
  reviewRoot.innerHTML = `
    <div class="checkout-review-block"><span>Customer</span><strong>${escapeHtml(details.fullName || 'Not provided')}</strong><small>${escapeHtml(details.email || '')} · ${escapeHtml(details.phone || '')}</small></div>
    <div class="checkout-review-block"><span>Delivery address</span><strong>${escapeHtml(details.address || 'Not provided')}</strong><small>${escapeHtml(details.city || '')}, ${escapeHtml(details.state || '')}</small></div>
    <div class="checkout-review-block"><span>Payment method</span><strong>${escapeHtml(paymentMethod)}</strong><small>Frontend demo only. No payment will be processed or card details stored.</small></div>
  `;
}

function setCheckoutStep(step) {
  checkoutState.step = Math.min(4, Math.max(1, step));
  document.querySelectorAll('[data-checkout-panel]').forEach((panel) => {
    const active = Number(panel.dataset.checkoutPanel) === checkoutState.step;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });
  document.querySelectorAll('[data-checkout-step-indicator]').forEach((indicator) => {
    const indicatorStep = Number(indicator.dataset.checkoutStepIndicator);
    indicator.classList.toggle('active', indicatorStep === checkoutState.step);
    indicator.classList.toggle('complete', indicatorStep < checkoutState.step);
  });
  pulseElement(document.querySelector('.checkout-steps'), 'checkout-progress-updated', 520);
  const backButton = document.querySelector('[data-checkout-back]');
  const nextButton = document.querySelector('[data-checkout-next]');
  if (backButton) backButton.hidden = checkoutState.step === 1;
  if (nextButton) nextButton.hidden = checkoutState.step === 4;
  if (checkoutState.step === 4) renderCheckoutReview();
}

function validateCheckoutStep(step) {
  const panel = document.querySelector(`[data-checkout-panel="${step}"]`);
  if (!panel) return true;
  const fields = [...panel.querySelectorAll('input, select, textarea')];
  const valid = fields.every((field) => field.checkValidity());
  if (!valid) fields.find((field) => !field.checkValidity())?.reportValidity();
  return valid;
}

function placeOrder() {
  if (!state.cart.length) {
    showToast('Add a product before checking out');
    return;
  }
  for (let step = 1; step <= 3; step += 1) {
    if (!validateCheckoutStep(step)) {
      setCheckoutStep(step);
      return;
    }
  }

  const details = getCheckoutDetails();
  const totals = getCheckoutTotals();
  const order = {
    number: `MAX-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString(),
    customer: details.fullName,
    email: details.email,
    phone: details.phone,
    address: details.address,
    city: details.city,
    state: details.state,
    paymentMethod: details.paymentMethod,
    estimatedDelivery: getCheckoutDeliveryEstimate(details.state),
    items: state.cart.map((entry) => ({ ...entry })),
    totals,
  };
  saveToStorage('max-last-order', order);
  saveOrders([{ ...order, total: totals.total, status: 'Processing' }, ...getOrders()]);
  clearCart();
  window.location.href = 'order-success.html';
}

function getCheckoutDeliveryEstimate(stateName) {
  const estimates = { 'Lagos State': '1-2 business days', 'Federal Capital Territory': '2-3 business days', 'Oyo State': '2-4 business days', 'Rivers State': '3-5 business days' };
  return estimates[stateName] || '2-6 business days';
}

function renderCheckoutPage() {
  const form = getCheckoutForm();
  if (!form) return;
  const stateSelect = document.getElementById('checkoutState');
  if (stateSelect && stateSelect.options.length === 1) {
    stateSelect.insertAdjacentHTML('beforeend', nigerianStates.map((stateName) => `<option value="${stateName}">${stateName}</option>`).join(''));
  }
  stateSelect?.addEventListener('change', renderCheckoutSummary);
  renderCheckoutSummary();
  setCheckoutStep(1);
}

function renderOrderSuccessPage() {
  const orderNumber = document.getElementById('successOrderNumber');
  if (!orderNumber) return;
  const requestedOrderNumber = new URLSearchParams(window.location.search).get('order');
  const order = requestedOrderNumber ? getOrders().find((entry) => entry.number === requestedOrderNumber) : loadFromStorage('max-last-order', null);
  if (!order) return;
  const date = new Date(order.date);
  const address = document.getElementById('successDeliveryAddress');
  const total = document.getElementById('successOrderTotal');
  const dateElement = document.getElementById('successOrderDate');
  const estimate = document.getElementById('successDeliveryEstimate');
  const productsRoot = document.getElementById('successOrderProducts');
  orderNumber.textContent = `Order #${order.number}`;
  if (dateElement) dateElement.textContent = date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  if (address) address.textContent = order.address ? `${order.address}, ${order.city}, ${order.state}` : 'Address saved with this order';
  if (total) total.textContent = formatPrice(getOrderTotal(order));
  if (estimate) estimate.textContent = order.estimatedDelivery || '2-6 business days';
  if (productsRoot) {
    productsRoot.innerHTML = order.items
      .map((entry) => {
        const product = getProductById(entry.id);
        return product ? `<div class="checkout-summary-product"><img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" /><div><strong>${product.name}</strong><span>Qty: ${entry.quantity}</span></div><b>${formatPrice(product.price * entry.quantity)}</b></div>` : '';
      })
      .join('');
  }
}
