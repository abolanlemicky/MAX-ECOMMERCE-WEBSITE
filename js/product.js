// MAX product.js module.
var detailState = {
  product: null,
  activeIndex: 0,
  deliveryLocation: loadFromStorage('max-delivery-location', {
    area: 'Abeokuta',
    state: 'Ogun State',
    estimate: '2-4 business days',
    fee: 0,
    pickup: 'MAX Abeokuta pickup point',
  }),
};

var deliveryLocations = [
  { area: 'Abeokuta', state: 'Ogun State', estimate: '2-4 business days', fee: 0, pickup: 'MAX Abeokuta pickup point' },
  { area: 'Lagos', state: 'Lagos State', estimate: '1-2 business days', fee: 2500, pickup: 'MAX Ikeja pickup point' },
  { area: 'Abuja', state: 'Federal Capital Territory', estimate: '2-3 business days', fee: 3000, pickup: 'MAX Wuse pickup point' },
  { area: 'Ibadan', state: 'Oyo State', estimate: '2-4 business days', fee: 1800, pickup: 'MAX Ibadan pickup point' },
  { area: 'Port Harcourt', state: 'Rivers State', estimate: '3-5 business days', fee: 3500, pickup: 'MAX Port Harcourt pickup point' },
];

function getDeliveryLocationLabel() {
  const location = detailState.deliveryLocation;
  return `${location.area}, ${location.state}`;
}

function renderDeliveryExperience() {
  const deliveryPanel = document.querySelector('[data-delivery-panel]');
  if (!deliveryPanel) return;

  const location = detailState.deliveryLocation;
  const isFree = location.fee === 0;
  deliveryPanel.innerHTML = `
    <div class="delivery-panel-heading">
      <div>
        <span class="eyebrow">Delivery to</span>
        <strong class="delivery-location">${getDeliveryLocationLabel()}</strong>
      </div>
      <button class="link-btn delivery-change-btn" type="button" data-action="change-delivery-location">Change</button>
    </div>
    <div class="delivery-details">
      <div><span>Estimated delivery</span><strong>${location.estimate}</strong></div>
      <div><span>Delivery fee</span><strong>${isFree ? 'Free' : formatPrice(location.fee)}</strong></div>
      <div><span>Pickup option</span><strong>${location.pickup}</strong></div>
    </div>
    <span class="free-delivery-badge">${isFree ? '✓ Free delivery to this location' : 'Affordable delivery available'}</span>
  `;
}

function openDeliveryLocationModal() {
  const modal = document.getElementById('deliveryLocationModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  modal.querySelector('select')?.focus();
}

function closeDeliveryLocationModal() {
  const modal = document.getElementById('deliveryLocationModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function saveDeliveryLocation(area) {
  const selectedLocation = deliveryLocations.find((location) => location.area === area);
  if (!selectedLocation) return;
  detailState.deliveryLocation = selectedLocation;
  saveToStorage('max-delivery-location', selectedLocation);
  renderDeliveryExperience();
  closeDeliveryLocationModal();
  showToast(`Delivery updated to ${selectedLocation.area}`);
}

function getActiveProductForDetail() {
  const params = new URLSearchParams(window.location.search);
  const requestedId = Number(params.get('id'));
  const product = Number.isInteger(requestedId) && requestedId > 0 ? getProductById(requestedId) : null;
  detailState.product = product;
  detailState.activeIndex = 0;
  return product;
}

function getRelatedProducts(product, offset = 0, limit = 4) {
  if (!product) return [];

  const sameCategory = products.filter((item) => item.id !== product.id && item.category === product.category);
  const otherProducts = products.filter((item) => item.id !== product.id && item.category !== product.category);
  return [...sameCategory, ...otherProducts].slice(offset, offset + limit);
}

function renderProductRecommendations(product) {
  const recommendationsRoot = document.getElementById('productRecommendations');
  if (!recommendationsRoot || !product) return;

  const sections = [
    { title: 'Customers also viewed', eyebrow: `Popular in ${product.category}`, offset: 0 },
    { title: 'You may also like', eyebrow: 'Picked from your interests', offset: 2 },
    { title: 'Similar products', eyebrow: 'Comparable picks', offset: 4 },
    { title: 'Frequently bought together', eyebrow: 'Complete the setup', offset: 1 },
  ];

  recommendationsRoot.innerHTML = sections
    .map((section) => {
      const relatedProducts = getRelatedProducts(product, section.offset, 4);
      return `
        <section class="recommendation-rail" aria-labelledby="${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">
          <div class="recommendation-rail-head">
            <div>
              <span class="eyebrow">${section.eyebrow}</span>
              <h3 id="${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${section.title}</h3>
            </div>
            <span class="recommendation-count">${relatedProducts.length} picks</span>
          </div>
          <div class="recommendation-grid">
            ${relatedProducts.map((relatedProduct) => renderProductCard(relatedProduct, { compact: true, recommendation: true, isWishlisted: state.wishlist.some((item) => item.id === relatedProduct.id) })).join('')}
          </div>
        </section>
      `;
    })
    .join('');

  bindActionButtons(recommendationsRoot);
}

function getProductGalleryImages(product) {
  if (!product) return [];
  const galleryImages = Array.isArray(product.images) && product.images.length ? product.images : [product.image || ''];
  return galleryImages.filter(Boolean);
}

function openProductGallery(index = detailState.activeIndex) {
  const product = detailState.product;
  const modal = document.getElementById('productGalleryModal');
  const images = getProductGalleryImages(product);

  if (!product || !modal || !images.length) return;

  detailState.activeIndex = (index + images.length) % images.length;
  const modalImage = modal.querySelector('.product-gallery-modal-image');
  const modalCounter = modal.querySelector('[data-gallery-counter]');

  if (modalImage) {
    modalImage.src = images[detailState.activeIndex];
    modalImage.alt = `${product.name} image ${detailState.activeIndex + 1}`;
  }

  if (modalCounter) {
    modalCounter.textContent = `${detailState.activeIndex + 1} / ${images.length}`;
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeProductGallery() {
  const modal = document.getElementById('productGalleryModal');
  if (!modal) return;

  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function moveProductGallery(direction) {
  const product = detailState.product;
  const images = getProductGalleryImages(product);
  if (!images.length) return;

  const nextIndex = (detailState.activeIndex + direction + images.length) % images.length;
  detailState.activeIndex = nextIndex;

  const mainImage = document.querySelector('.gallery-main-image');
  if (mainImage) {
    mainImage.src = images[nextIndex];
    mainImage.alt = `${product.name} image ${nextIndex + 1}`;
  }

  document.querySelectorAll('.gallery-thumb').forEach((thumb, index) => {
    thumb.classList.toggle('active', index === nextIndex);
  });

  const modal = document.getElementById('productGalleryModal');
  if (modal && !modal.classList.contains('hidden')) {
    const modalImage = modal.querySelector('.product-gallery-modal-image');
    const modalCounter = modal.querySelector('[data-gallery-counter]');

    if (modalImage) {
      modalImage.src = images[nextIndex];
      modalImage.alt = `${product.name} image ${nextIndex + 1}`;
    }

    if (modalCounter) {
      modalCounter.textContent = `${nextIndex + 1} / ${images.length}`;
    }
  }
}

function renderProductDetailPage() {
  const galleryRoot = document.getElementById('productGallery');
  const infoRoot = document.getElementById('productDetailInfo');
  const breadcrumb = document.getElementById('productBreadcrumb');
  const featuresList = document.getElementById('detailFeaturesList');
  const specsList = document.getElementById('detailSpecsList');
  const descriptionPanel = document.querySelector('[data-product-panel="description"]');
  const specificationsPanel = document.querySelector('[data-product-panel="specifications"]');
  const reviewsPanel = document.querySelector('[data-product-panel="reviews"]');
  const shippingPanel = document.querySelector('[data-product-panel="shipping"]');

  if (!galleryRoot || !infoRoot) return;

  const product = getActiveProductForDetail();
  if (!product) return;

  setSeoMetadata(`MAX | ${product.name}`, `${product.name}: product details, specifications, delivery information, and reviews at MAX.`, 'product');

  if (galleryRoot.dataset.detailReady !== 'true') {
    galleryRoot.dataset.detailReady = 'pending';
    galleryRoot.innerHTML = '<div class="skeleton skeleton-detail-image" aria-label="Loading product image"></div>';
    infoRoot.innerHTML = `<div class="skeleton-detail-copy" aria-label="Loading product details">
      <div class="skeleton skeleton-line short"></div>
      <div class="skeleton skeleton-line long"></div>
      <div class="skeleton skeleton-line medium"></div>
      <div class="skeleton skeleton-price"></div>
      <div class="skeleton skeleton-line long"></div>
      <div class="skeleton skeleton-line medium"></div>
    </div>`;
    window.setTimeout(() => {
      galleryRoot.dataset.detailReady = 'true';
      renderProductDetailPage();
    }, 180);
    return;
  }

  const images = getProductGalleryImages(product);
  const discount = getProductDiscountPercent(product);
  const hasMultipleImages = images.length > 1;

  if (breadcrumb) {
    breadcrumb.textContent = product.name;
  }

  if (featuresList && Array.isArray(product.specifications)) {
    featuresList.innerHTML = product.specifications
      .map((spec) => `<li>• ${spec}</li>`)
      .join('');
  }

  if (specsList && Array.isArray(product.colors)) {
    specsList.innerHTML = `
      <li><span>Brand</span><strong>${product.brand}</strong></li>
      <li><span>Color</span><strong>${product.colors[0] || 'Standard'}</strong></li>
      <li><span>Delivery</span><strong>${product.deliveryInfo || 'Nationwide delivery'}</strong></li>
      <li><span>Stock</span><strong>${product.stock || 0} units</strong></li>
    `;
  }

  if (descriptionPanel) {
    descriptionPanel.innerHTML = `
      <p class="product-tab-lead">${product.description}</p>
      <p>Designed for everyday use, this ${product.name} brings dependable performance and considered details to your routine.</p>
    `;
  }

  if (specificationsPanel) {
    specificationsPanel.innerHTML = `
      <ul class="product-specification-list">
        ${(product.specifications || []).map((specification, index) => `<li><span>Feature ${index + 1}</span><strong>${specification}</strong></li>`).join('')}
        <li><span>Brand</span><strong>${product.brand}</strong></li>
        <li><span>Available colors</span><strong>${(product.colors || ['Standard']).join(', ')}</strong></li>
        <li><span>Stock</span><strong>${product.stock || 0} units</strong></li>
      </ul>
    `;
  }

  if (reviewsPanel) {
    reviewsPanel.innerHTML = `
      <div class="review-header">
        <div>
          <span class="eyebrow">Customer feedback</span>
          <h3>What shoppers are saying</h3>
        </div>
        <button class="primary-btn review-write-btn" type="button" data-write-review>Write a Review</button>
      </div>
      <div class="review-overview">
        <div class="review-summary">
          <div class="review-score">4.6<span>/ 5</span></div>
          <div>
            <div class="review-stars" aria-label="4.6 out of 5 stars">★★★★★</div>
            <p class="muted">Based on ${product.reviewCount || product.reviews || 0} verified reviews</p>
          </div>
        </div>
        <div class="rating-breakdown" aria-label="Rating breakdown">
          ${[
            ['5', '68%'],
            ['4', '20%'],
            ['3', '7%'],
            ['2', '3%'],
            ['1', '2%'],
          ]
            .map(
              ([rating, percentage]) => `
                <div class="rating-breakdown-row">
                  <span>${rating} stars</span>
                  <span class="rating-bar"><span style="width:${percentage}"></span></span>
                  <strong>${percentage}</strong>
                </div>
              `
            )
            .join('')}
        </div>
      </div>
      <form class="review-form" data-review-form hidden>
        <div class="review-form-head">
          <h4>Share your experience</h4>
          <span class="muted">Your review will appear immediately for this demo.</span>
        </div>
        <div class="review-form-grid">
          <label>Name<input name="reviewerName" type="text" placeholder="Your name" required /></label>
          <label>Rating<select name="reviewRating" required><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label>
        </div>
        <label>Review<textarea name="reviewText" rows="4" placeholder="What did you think?" required></textarea></label>
        <div class="review-form-actions"><button class="secondary-btn" type="button" data-cancel-review>Cancel</button><button class="primary-btn" type="submit">Submit Review</button></div>
      </form>
      <div class="review-list" data-review-list>
        <article class="customer-review">
          <div class="customer-review-top"><div><strong>Amara O.</strong><span class="verified-badge">Verified Purchase</span></div><time datetime="2026-08-18">18 Aug 2026</time></div>
          <div class="customer-review-rating" aria-label="5 out of 5 stars">★★★★★</div>
          <p>Everything feels premium, from the finish to the sound. Setup took less than five minutes and the battery easily carried me through a full weekend.</p>
        </article>
        <article class="customer-review">
          <div class="customer-review-top"><div><strong>Daniel K.</strong><span class="verified-badge">Verified Purchase</span></div><time datetime="2026-07-29">29 Jul 2026</time></div>
          <div class="customer-review-rating" aria-label="4 out of 5 stars">★★★★<span>★</span></div>
          <p>Great value and surprisingly rich bass for the size. I would have liked a slightly longer charging cable, but the product itself has been excellent.</p>
        </article>
        <article class="customer-review">
          <div class="customer-review-top"><div><strong>Chinwe E.</strong><span class="verified-badge">Verified Purchase</span></div><time datetime="2026-06-11">11 Jun 2026</time></div>
          <div class="customer-review-rating" aria-label="5 out of 5 stars">★★★★★</div>
          <p>It looks lovely on my desk and connects instantly every time. Delivery was quick and the packaging kept everything protected.</p>
        </article>
      </div>
    `;
  }

  if (shippingPanel) {
    shippingPanel.innerHTML = `
      <ul class="shipping-list">
        <li><strong>Delivery</strong><span>${product.deliveryInfo || 'Nationwide delivery within 2-4 business days.'}</span></li>
        <li><strong>Returns</strong><span>Return within 30 days in original, unused condition.</span></li>
        <li><strong>Warranty</strong><span>12-month limited warranty included.</span></li>
        <li><strong>Seller</strong><span>${product.seller || 'MAX marketplace seller'}${product.location ? `, ${product.location}` : ''}</span></li>
      </ul>
    `;
  }

  galleryRoot.innerHTML = `
    <div class="product-gallery-shell">
      ${hasMultipleImages ? '<button type="button" class="gallery-nav gallery-nav-prev" data-gallery-nav="-1" aria-label="Previous image">‹</button>' : ''}
      <div class="gallery-main-panel">
        <img
          src="${images[0]}"
          alt="${product.name}"
          class="gallery-main-image"
          data-gallery-open="true"
        />
        <button type="button" class="gallery-zoom-btn" data-gallery-open="true" aria-label="Open image viewer">⤢</button>
      </div>
      ${hasMultipleImages ? '<button type="button" class="gallery-nav gallery-nav-next" data-gallery-nav="1" aria-label="Next image">›</button>' : ''}
      <div class="gallery-thumbs">
        ${images
          .map(
            (image, index) => `
              <button
                type="button"
                class="gallery-thumb ${index === 0 ? 'active' : ''}"
                data-gallery-thumb="${index}"
                aria-label="View image ${index + 1}"
              >
                <img src="${image}" alt="${product.name} thumbnail ${index + 1}" loading="lazy" decoding="async" />
              </button>
            `
          )
          .join('')}
      </div>
    </div>
  `;

  bindActionButtons(galleryRoot);

  infoRoot.innerHTML = `
    <div class="product-detail-card">
      <span class="eyebrow">${product.category}</span>
      <h1>${product.name}</h1>
      <p class="product-detail-brand">By ${product.brand}</p>
      <div class="product-price-row" style="justify-content:flex-start; margin: 1rem 0;">
        <div class="product-price">${formatPrice(product.price)} <small>${formatPrice(product.originalPrice || product.oldPrice || product.price)}</small></div>
        <span class="muted">${product.rating} ★ (${product.reviewCount || product.reviews || 0} reviews)</span>
      </div>
      <p class="product-detail-copy">${product.description}</p>
      <div class="variant-stack">
        <div class="variant-row">
          <span>Available colors</span>
          <div class="variant-pills">
            ${(product.colors || ['Standard']).slice(0, 4).map((color) => `<span class="variant-pill">${color}</span>`).join('')}
          </div>
        </div>
        <div class="variant-row">
          <span>Storage</span>
          <div class="variant-pills">
            ${(product.sizes || ['Standard']).slice(0, 4).map((size) => `<span class="variant-pill">${size}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="product-actions" style="justify-content:flex-start; margin-top:1.5rem;">
        <button class="primary-btn" type="button" data-action="add-cart" data-id="${product.id}">Add to cart</button>
        <button class="secondary-btn" type="button" data-action="wishlist" data-id="${product.id}">Add to wishlist</button>
      </div>
      <div class="seller-panel">
        <div class="seller-panel-heading">
          <div>
            <span class="eyebrow">Sold by</span>
            <h3>${product.seller || 'MAX Marketplace Seller'}</h3>
          </div>
          <span class="verified-seller-badge">✓ Verified Seller</span>
        </div>
        <div class="seller-details">
          <div><span>Seller rating</span><strong>4.8 <b>★</b></strong></div>
          <div><span>Location</span><strong>${product.location || 'Nigeria'}</strong></div>
          <div><span>Response rate</span><strong>98%</strong></div>
        </div>
        <button class="secondary-btn small seller-store-btn" type="button" data-action="visit-store" data-id="${product.id}">Visit Store <span aria-hidden="true">→</span></button>
      </div>
      <div class="delivery-panel" data-delivery-panel></div>
      <ul class="info-list" style="margin-top:1.5rem;">
        <li><span>Free delivery</span><strong>${product.deliveryInfo || '2-4 days'}</strong></li>
        <li><span>Warranty</span><strong>12 months</strong></li>
        <li><span>Returns</span><strong>30 days</strong></li>
      </ul>
      ${discount ? `<div class="detail-discount-tag">Save ${discount}% today</div>` : ''}
    </div>
  `;

  bindActionButtons(infoRoot);
  renderDeliveryExperience();
  renderProductRecommendations(product);

  if (!document.getElementById('deliveryLocationModal')) {
    const deliveryModal = document.createElement('div');
    deliveryModal.id = 'deliveryLocationModal';
    deliveryModal.className = 'delivery-location-modal hidden';
    deliveryModal.setAttribute('aria-hidden', 'true');
    deliveryModal.innerHTML = `
      <div class="delivery-modal-backdrop" data-delivery-close="true"></div>
      <div class="delivery-modal-card" role="dialog" aria-modal="true" aria-labelledby="deliveryModalTitle">
        <button class="delivery-modal-close" type="button" data-delivery-close="true" aria-label="Close delivery location dialog">×</button>
        <span class="eyebrow">Delivery location</span>
        <h2 id="deliveryModalTitle">Where should we deliver?</h2>
        <p class="muted">Choose a Nigerian destination to see the estimated delivery details.</p>
        <form data-delivery-form>
          <label for="deliveryLocationSelect">Delivery to</label>
          <select id="deliveryLocationSelect" name="deliveryLocation">
            ${deliveryLocations.map((location) => `<option value="${location.area}" ${location.area === detailState.deliveryLocation.area ? 'selected' : ''}>${location.area}, ${location.state}</option>`).join('')}
          </select>
          <button class="primary-btn full" type="submit">Update delivery</button>
        </form>
      </div>
    `;
    document.body.appendChild(deliveryModal);
  }

  const modal = document.getElementById('productGalleryModal');
  if (!modal) {
    const galleryModal = document.createElement('div');
    galleryModal.id = 'productGalleryModal';
    galleryModal.className = 'product-gallery-modal hidden';
    galleryModal.setAttribute('aria-hidden', 'true');
    galleryModal.innerHTML = `
      <div class="product-gallery-modal-backdrop" data-gallery-close="true"></div>
      <div class="product-gallery-modal-panel" role="dialog" aria-modal="true" aria-label="Product image viewer">
        <button type="button" class="product-gallery-modal-close" data-gallery-close="true" aria-label="Close image viewer">×</button>
        <button type="button" class="product-gallery-modal-nav product-gallery-modal-prev" data-gallery-nav="-1" aria-label="Previous image">‹</button>
        <div class="product-gallery-modal-media">
          <img class="product-gallery-modal-image" src="${images[0]}" alt="${product.name}" />
        </div>
        <button type="button" class="product-gallery-modal-nav product-gallery-modal-next" data-gallery-nav="1" aria-label="Next image">›</button>
        <div class="product-gallery-modal-footer">
          <span data-gallery-counter>${images.length ? '1 / ' + images.length : '1 / 1'}</span>
          <span>${product.name}</span>
        </div>
      </div>
    `;
    document.body.appendChild(galleryModal);
  } else {
    const modalImage = modal.querySelector('.product-gallery-modal-image');
    const modalCounter = modal.querySelector('[data-gallery-counter]');
    if (modalImage) modalImage.src = images[0];
    if (modalCounter) modalCounter.textContent = `1 / ${images.length}`;
  }
}

function updateProductGallerySelection(index) {
  const product = detailState.product;
  const images = getProductGalleryImages(product);
  if (!images.length) return;

  detailState.activeIndex = (index + images.length) % images.length;

  const mainImage = document.querySelector('.gallery-main-image');
  if (mainImage) {
    mainImage.src = images[detailState.activeIndex];
    mainImage.alt = `${product.name} image ${detailState.activeIndex + 1}`;
  }

  document.querySelectorAll('.gallery-thumb').forEach((thumb, thumbIndex) => {
    thumb.classList.toggle('active', thumbIndex === detailState.activeIndex);
  });
}
