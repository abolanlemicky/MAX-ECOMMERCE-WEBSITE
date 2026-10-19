// MAX search.js module.
function normalizeSearchTerm(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
}

function getRecentSearches() {
  const recent = loadFromStorage(searchConfig.recentStorageKey, []);
  return Array.isArray(recent) ? recent.filter((entry) => typeof entry === 'string' && entry.trim()).slice(0, 5) : [];
}

function saveRecentSearch(term) {
  const cleaned = String(term || '').trim();
  if (!cleaned) return;

  const recent = getRecentSearches();
  const nextRecent = [cleaned, ...recent.filter((entry) => entry.toLowerCase() !== cleaned.toLowerCase())].slice(0, 5);
  saveToStorage(searchConfig.recentStorageKey, nextRecent);
}

function getAutocompleteSuggestions(query) {
  const normalized = normalizeSearchTerm(query);
  const sourceEntries = [
    ...products.map((product) => product.name),
    ...products.map((product) => product.brand),
    ...products.map((product) => product.category),
    ...searchConfig.productSuggestions,
    ...searchConfig.categorySuggestions,
    ...searchConfig.popularSearches,
    ...['phones', 'iphone', 'iphone cases', 'iphone chargers', 'wireless', 'smart home', 'audio', 'wellness'],
  ];

  if (!normalized) {
    return [...searchConfig.popularSearches, ...searchConfig.productSuggestions].slice(0, 8);
  }

  return [...new Set(sourceEntries.filter((entry) => normalizeSearchTerm(entry).includes(normalized)))].slice(0, 8);
}

function renderSearchSuggestions(input, panel) {
  const query = input.value.trim();
  const suggestions = getAutocompleteSuggestions(query);

  if (!query) {
    const recent = getRecentSearches();
    const popular = searchConfig.popularSearches;
    const upcoming = [...recent, ...popular].filter(Boolean).slice(0, 6);

    panel.innerHTML = `
      <div class="search-panel-group">
        <div class="search-panel-label">Recent searches</div>
        <div class="search-panel-list">
          ${upcoming
            .map(
              (entry) => `
                <button type="button" class="search-suggestion-button" data-search-value="${entry}">${entry}</button>
              `
            )
            .join('') || '<span class="search-panel-empty">No recent searches yet.</span>'}
        </div>
      </div>
      <div class="search-panel-group">
        <div class="search-panel-label">Popular searches</div>
        <div class="search-panel-list">
          ${searchConfig.popularSearches
            .map(
              (entry) => `
                <button type="button" class="search-suggestion-button" data-search-value="${entry}">${entry}</button>
              `
            )
            .join('')}
        </div>
      </div>
      <div class="search-panel-group">
        <div class="search-panel-label">Suggested products</div>
        <div class="search-panel-list">
          ${searchConfig.productSuggestions
            .slice(0, 4)
            .map(
              (entry) => `
                <button type="button" class="search-suggestion-button" data-search-value="${entry}">${entry}</button>
              `
            )
            .join('')}
        </div>
      </div>
      <div class="search-panel-group">
        <div class="search-panel-label">Suggested categories</div>
        <div class="search-panel-list">
          ${searchConfig.categorySuggestions
            .map(
              (entry) => `
                <button type="button" class="search-suggestion-button" data-search-value="${entry}">${entry}</button>
              `
            )
            .join('')}
        </div>
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    <div class="search-panel-group">
      <div class="search-panel-label">Autocomplete</div>
      <div class="search-panel-list">
        ${suggestions
          .map(
            (entry) => `
              <button type="button" class="search-suggestion-button" data-search-value="${entry}">${entry}</button>
            `
          )
          .join('') || '<span class="search-panel-empty">No matches found.</span>'}
      </div>
    </div>
  `;
}

function attachSearchExperience(input) {
  if (!input || input.dataset.searchReady === 'true') return;

  const container = input.closest('.header-search, .search-box');
  if (!container) return;

  input.dataset.searchReady = 'true';

  const panel = document.createElement('div');
  panel.className = 'search-suggestions';
  container.appendChild(panel);

  const hidePanel = () => panel.classList.remove('open');
  const showPanel = () => {
    renderSearchSuggestions(input, panel);
    panel.classList.add('open');
  };

  const submitSearch = (value) => {
    const cleanedValue = String(value || '').trim();
    if (!cleanedValue) return;

    saveRecentSearch(cleanedValue);
    input.value = cleanedValue;
    window.location.href = `search.html?q=${encodeURIComponent(cleanedValue)}`;
  };

  input.addEventListener('focus', showPanel);
  input.addEventListener('input', showPanel);
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    submitSearch(input.value);
  });

  const searchButton = container.querySelector('.search-action');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      submitSearch(input.value);
    });
  }

  panel.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-search-value]');
    if (!btn) return;
    const value = btn.dataset.searchValue.trim();
    submitSearch(value);
  });

  input.addEventListener('blur', () => setTimeout(hidePanel, 120));
}

function getMatchingProducts(query) {
  const normalized = normalizeSearchTerm(query);
  if (!normalized) return products;

  return products.filter((product) => {
    const haystack = [
      product.name,
      product.category,
      product.brand,
      product.description,
      ...(product.keywords || []),
    ]
      .join(' ')
      .toLowerCase();

    const terms = normalized.split(/\s+/).filter(Boolean);
    return terms.every((term) => haystack.includes(term));
  });
}

function searchProducts(query) {
  return getMatchingProducts(query);
}

function renderSearchResultsPage() {
  const resultsGrid = document.getElementById('searchResultsGrid');
  if (!resultsGrid) return;

  const searchHeading = document.querySelector('[data-search-heading]');
  const searchSummary = document.querySelector('[data-search-summary]');
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  const normalized = normalizeSearchTerm(query);
  const matches = getMatchingProducts(query);
  const fallbackResultCount = searchConfig.resultCountLookup[normalized] || 0;
  const totalResults = matches.length || fallbackResultCount;

  if (searchHeading) {
    searchHeading.textContent = query ? `Results for “${query}”` : 'Results';
  }

  if (searchSummary) {
    searchSummary.textContent = query
      ? `We found ${totalResults} result${totalResults === 1 ? '' : 's'} for “${query}”.`
      : 'Start searching to discover products and categories.';
  }

  setSeoMetadata(
    query ? `MAX | Search: ${query}` : 'MAX | Search Results',
    query ? `Search MAX products for ${query}.` : 'Search MAX products by name, brand, category, or keyword.'
  );

  renderWithLoading(resultsGrid, 'search', () => {
    if (!matches.length) {
      resultsGrid.innerHTML = renderEmptyState({
        icon: '⌕',
        title: 'We couldn’t find what you’re looking for.',
        message: 'Try a different product name, brand, category, or keyword.',
        primaryLabel: 'Continue shopping',
        primaryHref: 'shop.html',
        secondaryLabel: 'Browse categories',
        secondaryHref: 'category.html',
      });
      return;
    }

    resultsGrid.innerHTML = matches
      .map((product) => renderProductCard(product, { isWishlisted: state.wishlist.some((item) => item.id === product.id) }))
      .join('');
    bindActionButtons(resultsGrid);
  }, Math.min(6, Math.max(2, matches.length)));
}
