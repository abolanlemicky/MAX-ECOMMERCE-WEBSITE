// MAX header.js module.
function renderCategoryNavigation() {
  const links = [
    ['Home', 'index.html'],
    ['Categories', 'category.html'],
    ["Today's Deals", 'deals.html#today-deals'],
    ['Flash Sale', 'deals.html#flash-sale'],
    ['New Arrivals', 'shop.html?sort=newest'],
    ['Best Sellers', 'shop.html?sort=popular'],
    ['Electronics', 'category.html?category=electronics'],
    ['Fashion', 'category.html?category=fashion'],
    ['Beauty', 'category.html?category=beauty'],
    ['Phones', 'category.html?category=phones'],
  ];
  const currentUrl = new URL(window.location.href);
  const currentPage = currentUrl.pathname.split('/').pop() || 'index.html';
  const getActiveIndex = () => {
    const exactIndex = links.findIndex(([, href]) => {
      const targetUrl = new URL(href, currentUrl.href);
      if (targetUrl.pathname !== currentUrl.pathname) return false;
      if (targetUrl.hash) return targetUrl.hash === currentUrl.hash;
      return targetUrl.search === currentUrl.search && !currentUrl.hash;
    });
    if (exactIndex !== -1) return exactIndex;
    if (currentPage === 'deals.html') return 2;
    if (currentPage === 'category.html' && !currentUrl.search) return 1;
    if (currentPage === 'shop.html' && !currentUrl.search) return 1;
    if (currentPage === 'index.html') return 0;
    return -1;
  };

  document.querySelectorAll('.category-strip-inner').forEach((navigation) => {
    const activeIndex = getActiveIndex();
    navigation.innerHTML = links
      .map(([label, href], index) => {
        const isActive = index === activeIndex;
        return `<a href="${href}" class="category-item ${isActive ? 'active' : ''}" ${isActive ? 'aria-current="page"' : ''}>${label}</a>`;
      })
      .join('');
    navigation.addEventListener('click', (event) => {
      const selectedLink = event.target.closest('.category-item');
      if (!selectedLink) return;
      navigation.querySelectorAll('.category-item').forEach((link) => {
        const isActive = link === selectedLink;
        link.classList.toggle('active', isActive);
        link.setAttribute('aria-current', isActive ? 'page' : 'false');
      });
      selectedLink.classList.add('active');
    });
  });
  window.addEventListener('hashchange', renderCategoryNavigation, { once: true });
}
function updateHeaderStats() {
  const cartTotal = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistTotal = state.wishlist.length;

  if (elements.cartCount) {
    elements.cartCount.textContent = cartTotal;
    elements.cartCount.hidden = cartTotal === 0;
  }

  if (elements.wishlistCount) {
    elements.wishlistCount.textContent = wishlistTotal;
    elements.wishlistCount.hidden = wishlistTotal === 0;
  }

  if (elements.userNameLabel) {
    elements.userNameLabel.textContent = state.user.name.split(' ')[0];
  }

  if (elements.userAvatar) {
    elements.userAvatar.textContent = state.user.initials;
  }
}

function setupMobileMenu() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  if (!document.querySelector('.mobile-menu-panel')) {
    const panel = document.createElement('div');
    panel.className = 'mobile-menu-panel';
    panel.innerHTML = `
      <nav class="mobile-menu-links" aria-label="Mobile navigation">
        <a href="index.html">Home</a>
        <a href="shop.html">Shop</a>
        <a href="category.html">Collections</a>
        <a href="deals.html">Deals</a>
        <a href="about.html">Story</a>
        <a href="account.html">Account</a>
        <a href="cart.html">Cart</a>
      </nav>
    `;
    header.insertAdjacentElement('afterend', panel);
  }

  const mobileMenuButton = document.querySelector('.mobile-menu-btn');
  const mobileMenuPanel = document.querySelector('.mobile-menu-panel');

  if (!mobileMenuButton || !mobileMenuPanel) return;

  const closeMobileMenu = () => {
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    mobileMenuButton.setAttribute('aria-label', 'Open menu');
    mobileMenuPanel.classList.remove('open');
  };

  mobileMenuButton.setAttribute('aria-expanded', 'false');
  mobileMenuButton.setAttribute('aria-label', 'Open menu');

  mobileMenuButton.addEventListener('click', () => {
    const isOpen = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    mobileMenuButton.setAttribute('aria-expanded', String(!isOpen));
    mobileMenuButton.setAttribute('aria-label', !isOpen ? 'Close menu' : 'Open menu');
    mobileMenuPanel.classList.toggle('open', !isOpen);
  });

  mobileMenuPanel.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      closeMobileMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) {
      closeMobileMenu();
    }
  });
}

function setupEventHandlers() {
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const wishlistToggleBtn = document.getElementById('wishlistToggleBtn');
  const closeWishlistBtn = document.getElementById('closeWishlistBtn');
  const profileButton = document.getElementById('profileButton');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalBackdrop = document.querySelector('[data-close-modal="true"]');
  const categoryFilters = document.getElementById('categoryFilters');

  if (cartToggleBtn) {
    cartToggleBtn.addEventListener('click', () => {
      const isOpen = elements.cartDrawer.classList.contains('open');
      toggleDrawer(elements.cartDrawer, !isOpen);
      if (!isOpen) {
        toggleDrawer(elements.wishlistPanel, false);
      }
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => toggleDrawer(elements.cartDrawer, false));
  }

  if (wishlistToggleBtn) {
    wishlistToggleBtn.addEventListener('click', () => {
      const isOpen = elements.wishlistPanel.classList.contains('open');
      toggleDrawer(elements.wishlistPanel, !isOpen);
      if (!isOpen) {
        toggleDrawer(elements.cartDrawer, false);
      }
    });
  }

  if (closeWishlistBtn) {
    closeWishlistBtn.addEventListener('click', () => toggleDrawer(elements.wishlistPanel, false));
  }

  if (profileButton) {
    profileButton.addEventListener('click', () => {
      state.user = state.user.name === defaultUser.name ? { name: 'Guest User', initials: 'GU' } : defaultUser;
      saveToStorage(STORAGE_KEYS.user, state.user);
      updateHeaderStats();
      showToast(`Signed in as ${state.user.name}`);
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeQuickView);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeQuickView);
  }

  if (categoryFilters) {
    categoryFilters.addEventListener('click', (event) => {
      const filter = event.target.closest('[data-filter]');
      if (!filter) return;
      state.filter = filter.dataset.filter;
      document.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.classList.toggle('active', chip.dataset.filter === state.filter);
      });
      renderProducts();
    });
  }

  document.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.filter = card.dataset.category;
      document.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.classList.toggle('active', chip.dataset.filter === state.filter);
      });
      renderProducts();
      const shopSection = document.getElementById('shop');
      if (shopSection) {
        window.scrollTo({ top: shopSection.offsetTop - 30, behavior: 'smooth' });
      }
    });
  });

  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (event) => {
      state.search = event.target.value.trim();
      renderProducts();
    });
  }

  if (elements.sortSelect) {
    elements.sortSelect.addEventListener('change', (event) => {
      state.sort = event.target.value;
      renderProducts();
    });
  }

  document.addEventListener('click', (event) => {
    const logout = event.target.closest('[data-action="logout"]');
    if (logout) {
      event.preventDefault();
      removeFromStorage(ACCOUNT_STORAGE_KEYS.session);
      window.location.href = 'login.html';
      return;
    }

    const checkoutNext = event.target.closest('[data-checkout-next]');
    if (checkoutNext) {
      if (validateCheckoutStep(checkoutState.step)) setCheckoutStep(checkoutState.step + 1);
      return;
    }

    const checkoutBack = event.target.closest('[data-checkout-back]');
    if (checkoutBack) {
      setCheckoutStep(checkoutState.step - 1);
      return;
    }

    const checkoutSubmit = event.target.closest('[data-checkout-submit]');
    if (checkoutSubmit) {
      placeOrder();
      return;
    }

    const changeDeliveryLocation = event.target.closest('[data-action="change-delivery-location"]');
    if (changeDeliveryLocation) {
      openDeliveryLocationModal();
      return;
    }

    const deliveryClose = event.target.closest('[data-delivery-close]');
    if (deliveryClose) {
      closeDeliveryLocationModal();
      return;
    }

    const productTab = event.target.closest('[data-product-tab]');
    if (productTab) {
      const selectedTab = productTab.dataset.productTab;

      document.querySelectorAll('[data-product-tab]').forEach((tab) => {
        const isSelected = tab === productTab;
        tab.classList.toggle('active', isSelected);
        tab.setAttribute('aria-selected', String(isSelected));
      });

      document.querySelectorAll('[data-product-panel]').forEach((panel) => {
        const isSelected = panel.dataset.productPanel === selectedTab;
        panel.classList.toggle('active', isSelected);
        panel.hidden = !isSelected;
      });
      return;
    }

    const writeReviewButton = event.target.closest('[data-write-review]');
    if (writeReviewButton) {
      const reviewForm = document.querySelector('[data-review-form]');
      if (reviewForm) {
        reviewForm.hidden = false;
        reviewForm.querySelector('input')?.focus();
      }
      return;
    }

    const cancelReviewButton = event.target.closest('[data-cancel-review]');
    if (cancelReviewButton) {
      const reviewForm = document.querySelector('[data-review-form]');
      if (reviewForm) reviewForm.hidden = true;
      return;
    }

    const galleryThumb = event.target.closest('[data-gallery-thumb]');
    if (galleryThumb) {
      updateProductGallerySelection(Number(galleryThumb.dataset.galleryThumb));
      return;
    }

    const galleryNav = event.target.closest('[data-gallery-nav]');
    if (galleryNav) {
      const direction = Number(galleryNav.dataset.galleryNav || 0);
      moveProductGallery(direction);
      return;
    }

    const galleryOpen = event.target.closest('[data-gallery-open]');
    if (galleryOpen) {
      openProductGallery(detailState.activeIndex);
      return;
    }

    const galleryClose = event.target.closest('[data-gallery-close]');
    if (galleryClose) {
      closeProductGallery();
      return;
    }

    const actionEl = event.target.closest('[data-action]');
    if (actionEl) {
      const { action, id } = actionEl.dataset;
      markButtonLoading(actionEl);
      handleActionClick(action, id, actionEl);
      return;
    }

    const productCard = event.target.closest('.product-card[data-id]');
    if (productCard) {
      if (event.target.closest('a, input, select, textarea')) return;
      window.location.href = `product.html?id=${Number(productCard.dataset.id)}`;
      return;
    }
  });

  document.addEventListener('keydown', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (actionEl) return;

    const productCard = event.target.closest('.product-card[data-id]');
    if (!productCard || event.target.closest('button, a, input, select, textarea')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    window.location.href = `product.html?id=${Number(productCard.dataset.id)}`;
  });

  document.addEventListener('submit', (event) => {
    const contactForm = event.target.closest('[data-contact-form]');
    if (contactForm) {
      event.preventDefault();
      const message = contactForm.querySelector('[data-contact-message]');
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      contactForm.reset();
      if (message) {
        message.textContent = 'Thanks. Your message was received by this demo storefront.';
        message.classList.add('success');
      }
      showToast('Message sent');
      return;
    }

    const newsletterForm = event.target.closest('[data-newsletter-form]');
    if (newsletterForm) {
      event.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      const email = String(input?.value || '').trim();
      if (!input || !input.checkValidity()) {
        showToast('Please enter a valid email');
        input?.focus();
        return;
      }
      saveToStorage('max-newsletter-email', email);
      newsletterForm.reset();
      const message = newsletterForm.querySelector('[data-newsletter-message]');
      if (message) message.textContent = 'You are on the list. Watch your inbox for the next drop.';
      showToast('You are subscribed to MAX deals');
      return;
    }

    const authForm = event.target.closest('[data-auth-form]');
    if (authForm) {
      event.preventDefault();
      handleAuthSubmit(authForm);
      return;
    }

    const accountForm = event.target.closest('[data-account-form]');
    if (accountForm) {
      event.preventDefault();
      const account = getAccount();
      const formData = new FormData(accountForm);
      const updatedAccount = { ...account, name: String(formData.get('accountName') || '').trim(), phone: String(formData.get('accountPhone') || '').trim(), city: String(formData.get('accountCity') || '').trim() };
      if (!updatedAccount.name) { showToast('Enter your full name'); return; }
      saveToStorage(ACCOUNT_STORAGE_KEYS.account, updatedAccount);
      state.user = { name: updatedAccount.name, initials: getInitials(updatedAccount.name) };
      saveToStorage(STORAGE_KEYS.user, state.user);
      renderAccountPage();
      showToast('Account details saved');
      return;
    }

    const promoForm = event.target.closest('[data-promo-form]');
    if (promoForm) {
      event.preventDefault();
      applyPromoCode(new FormData(promoForm).get('promoCode') || promoForm.querySelector('[data-promo-input]')?.value);
      return;
    }

    const deliveryForm = event.target.closest('[data-delivery-form]');
    if (deliveryForm) {
      event.preventDefault();
      saveDeliveryLocation(new FormData(deliveryForm).get('deliveryLocation'));
      return;
    }

    const reviewForm = event.target.closest('[data-review-form]');
    if (!reviewForm) return;

    event.preventDefault();
    const formData = new FormData(reviewForm);
    const reviewerName = escapeHtml(formData.get('reviewerName'));
    const reviewRating = Number(formData.get('reviewRating'));
    const reviewText = escapeHtml(formData.get('reviewText'));
    const reviewList = document.querySelector('[data-review-list]');
    if (!reviewerName || !reviewText || !reviewList) return;

    const stars = '★'.repeat(reviewRating) + '<span>' + '★'.repeat(5 - reviewRating) + '</span>';
    const reviewDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    reviewList.insertAdjacentHTML(
      'afterbegin',
      `<article class="customer-review"><div class="customer-review-top"><div><strong>${reviewerName}</strong><span class="verified-badge">Demo Review</span></div><time>${reviewDate}</time></div><div class="customer-review-rating" aria-label="${reviewRating} out of 5 stars">${stars}</div><p>${reviewText}</p></article>`
    );
    reviewForm.reset();
    reviewForm.hidden = true;
    showToast('Your review was added to this demo');
  });
}
