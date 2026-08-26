/**
 * ============================================================
 * FIXJORI | SEARCH FUNCTIONALITY V1.0
 * Meituan-Style · Dense · Information-Rich · Production-Ready
 * ============================================================
 *
 * This module provides a complete search system for the FIXJORI platform,
 * featuring:
 * - Autocomplete with suggestions
 * - Category filtering
 * - Recent searches (localStorage)
 * - Popular searches with counts
 * - Keyboard navigation (arrow keys, Enter, Escape)
 * - Debounced search input
 * - Real-time results rendering
 * - Meituan-style dense UI
 * - Mobile-friendly
 * - Accessibility (ARIA)
 *
 * ============================================================
 * USAGE:
 * ============================================================
 *
 * // Initialize search on an element
 * FJSearch.init({
 *     container: '#search-component',
 *     onSearch: function(query, category) {
 *         // Perform search
 *         console.log('Searching:', query, category);
 *     },
 *     onSelect: function(item) {
 *         // Handle selection
 *         console.log('Selected:', item);
 *     }
 * });
 *
 * // Or use the HTML component approach:
 * <div class="fj-search-component" data-fj-search>
 *     <input type="text" placeholder="Suchen..." />
 *     <button class="fj-search-submit">Suchen</button>
 * </div>
 *
 * ============================================================
 */

(function(global) {
    'use strict';

    // ──────────────────────────────────────────────────────────────
    // 1. CONFIGURATION
    // ──────────────────────────────────────────────────────────────

    const CONFIG = {
        /** Debounce delay in milliseconds */
        debounceDelay: 300,

        /** Minimum characters before showing suggestions */
        minChars: 2,

        /** Maximum number of suggestions to show */
        maxSuggestions: 8,

        /** Maximum recent searches to store */
        maxRecentSearches: 8,

        /** Storage key for recent searches */
        storageKey: 'fj_search_history',

        /** Storage key for saved searches */
        savedSearchesKey: 'fj_saved_searches',

        /** Enable debug logging */
        debug: false,

        /** Enable keyboard navigation */
        keyboardNavigation: true,

        /** Enable autocomplete */
        autocomplete: true,

        /** Enable recent searches */
        recentSearches: true,

        /** Enable popular searches */
        popularSearches: true,

        /** Enable category filters */
        categoryFilters: true,

        /** Show search count in results */
        showResultCount: true,

        /** Show suggestion categories */
        showSuggestionCategories: true,

        /** Meituan-style dense mode */
        denseMode: true,
    };

    // ──────────────────────────────────────────────────────────────
    // 2. STATE
    // ──────────────────────────────────────────────────────────────

    /** Search instances registry */
    const instances = new Map();

    /** Global search data */
    let searchData = {
        suggestions: [],
        popular: [],
        categories: [],
        results: [],
    };

    /** Current search query */
    let currentQuery = '';

    /** Current category filter */
    let currentCategory = 'all';

    /** Active suggestion index for keyboard navigation */
    let activeIndex = -1;

    /** Debounce timer reference */
    let debounceTimer = null;

    /** Is the search dropdown open */
    let isOpen = false;

    /** Recent searches */
    let recentSearches = [];

    /** Saved searches */
    let savedSearches = [];

    // ──────────────────────────────────────────────────────────────
    // 3. UTILITY FUNCTIONS
    // ──────────────────────────────────────────────────────────────

    /**
     * Log debug messages
     */
    function debugLog(...args) {
        if (CONFIG.debug) {
            console.log('[FJSearch]', ...args);
        }
    }

    /**
     * Debounce function
     */
    function debounce(fn, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        };
    }

    /**
     * Escape HTML entities
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Highlight matching text
     */
    function highlightMatch(text, query) {
        if (!query || !text) return escapeHtml(text);
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);
        if (index === -1) return escapeHtml(text);
        return escapeHtml(text.substring(0, index)) +
            '<span class="fj-search-highlight">' +
            escapeHtml(text.substring(index, index + query.length)) +
            '</span>' +
            escapeHtml(text.substring(index + query.length));
    }

    /**
     * Get initials from name
     */
    function getInitials(name) {
        if (!name) return '';
        return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2);
    }

    /**
     * Generate a unique ID
     */
    function generateId() {
        return 'fj-search-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    }

    /**
     * Check if element is a child of container
     */
    function isChildOf(element, container) {
        return container.contains ? container.contains(element) : false;
    }

    /**
     * Create a DOM element from HTML
     */
    function createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }

    /**
     * Get the current location from the nav component
     */
    function getCurrentLocation() {
        try {
            const locationEl = document.querySelector('#currentLocation');
            if (locationEl) {
                return locationEl.textContent.trim();
            }
            // Fallback: try to get from localStorage
            return localStorage.getItem('fjori_location') || 'Augsburg';
        } catch (e) {
            return 'Augsburg';
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 4. DATA MANAGEMENT
    // ──────────────────────────────────────────────────────────────

    /**
     * Load recent searches from localStorage
     */
    function loadRecentSearches() {
        try {
            const stored = localStorage.getItem(CONFIG.storageKey);
            recentSearches = stored ? JSON.parse(stored) : [];
            if (!Array.isArray(recentSearches)) recentSearches = [];
            // Limit
            if (recentSearches.length > CONFIG.maxRecentSearches) {
                recentSearches = recentSearches.slice(0, CONFIG.maxRecentSearches);
            }
        } catch (e) {
            recentSearches = [];
        }
        return recentSearches;
    }

    /**
     * Save recent searches to localStorage
     */
    function saveRecentSearches() {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(recentSearches));
        } catch (e) { /* ignore */ }
    }

    /**
     * Add a search to recent searches
     */
    function addRecentSearch(query) {
        query = query.trim();
        if (!query) return;

        // Remove if exists
        recentSearches = recentSearches.filter(item => item.toLowerCase() !== query.toLowerCase());
        // Add to front
        recentSearches.unshift(query);
        // Limit
        if (recentSearches.length > CONFIG.maxRecentSearches) {
            recentSearches = recentSearches.slice(0, CONFIG.maxRecentSearches);
        }
        saveRecentSearches();
    }

    /**
     * Remove a search from recent searches
     */
    function removeRecentSearch(query) {
        recentSearches = recentSearches.filter(item => item !== query);
        saveRecentSearches();
    }

    /**
     * Clear all recent searches
     */
    function clearRecentSearches() {
        recentSearches = [];
        saveRecentSearches();
    }

    /**
     * Load saved searches
     */
    function loadSavedSearches() {
        try {
            const stored = localStorage.getItem(CONFIG.savedSearchesKey);
            savedSearches = stored ? JSON.parse(stored) : [];
            if (!Array.isArray(savedSearches)) savedSearches = [];
        } catch (e) {
            savedSearches = [];
        }
        return savedSearches;
    }

    /**
     * Save a search
     */
    function saveSearch(query, category) {
        const entry = {
            query: query.trim(),
            category: category || 'all',
            timestamp: Date.now(),
        };
        // Remove duplicate
        savedSearches = savedSearches.filter(s => s.query.toLowerCase() !== entry.query.toLowerCase());
        savedSearches.unshift(entry);
        // Limit to 20 saved searches
        if (savedSearches.length > 20) {
            savedSearches = savedSearches.slice(0, 20);
        }
        try {
            localStorage.setItem(CONFIG.savedSearchesKey, JSON.stringify(savedSearches));
        } catch (e) { /* ignore */ }
    }

    // ──────────────────────────────────────────────────────────────
    // 5. SUGGESTION DATA (Meituan-style)
    // ──────────────────────────────────────────────────────────────

    /**
     * Default suggestion data - can be overridden by API
     */
    const DEFAULT_SUGGESTIONS = {
        services: [
            { label: 'USM Haller Montage', category: 'Service', icon: 'fa-couch', count: 342 },
            { label: 'Küchenmontage', category: 'Service', icon: 'fa-kitchen-set', count: 287 },
            { label: 'Smart Home Installation', category: 'Service', icon: 'fa-microchip', count: 215 },
            { label: 'Badrenovierung', category: 'Service', icon: 'fa-bath', count: 189 },
            { label: 'Malerarbeiten', category: 'Service', icon: 'fa-paint-brush', count: 156 },
            { label: 'Sanitärinstallation', category: 'Service', icon: 'fa-faucet-drip', count: 134 },
            { label: 'Elektroinstallation', category: 'Service', icon: 'fa-bolt', count: 112 },
            { label: 'Garten Landschaftsbau', category: 'Service', icon: 'fa-tree', count: 98 },
            { label: 'Bodenverlegung', category: 'Service', icon: 'fa-carpet', count: 76 },
            { label: 'Trockenbau', category: 'Service', icon: 'fa-cubes', count: 65 },
        ],
        handymen: [
            { label: 'Raphael Lezius', category: 'Handwerker', icon: 'fa-user-tie', count: 124 },
            { label: 'Jaffar Shariff', category: 'Handwerker', icon: 'fa-user-tie', count: 85 },
            { label: 'Anna Schmidt', category: 'Handwerker', icon: 'fa-user-tie', count: 43 },
            { label: 'Michael Weber', category: 'Handwerker', icon: 'fa-user-tie', count: 62 },
        ],
        locations: [
            { label: 'Augsburg', category: 'Standort', icon: 'fa-map-marker-alt', count: 0 },
            { label: 'München', category: 'Standort', icon: 'fa-map-marker-alt', count: 0 },
            { label: 'Berlin', category: 'Standort', icon: 'fa-map-marker-alt', count: 0 },
            { label: 'Hamburg', category: 'Standort', icon: 'fa-map-marker-alt', count: 0 },
            { label: 'Köln', category: 'Standort', icon: 'fa-map-marker-alt', count: 0 },
            { label: 'Frankfurt am Main', category: 'Standort', icon: 'fa-map-marker-alt', count: 0 },
            { label: 'Stuttgart', category: 'Standort', icon: 'fa-map-marker-alt', count: 0 },
            { label: 'Düsseldorf', category: 'Standort', icon: 'fa-map-marker-alt', count: 0 },
        ],
        popular: [
            { label: 'USM Haller Montage', count: 342, icon: 'fa-couch' },
            { label: 'Küchenmontage', count: 287, icon: 'fa-kitchen-set' },
            { label: 'Smart Home', count: 215, icon: 'fa-microchip' },
            { label: 'Badrenovierung', count: 189, icon: 'fa-bath' },
            { label: 'Malerarbeiten', count: 156, icon: 'fa-paint-brush' },
            { label: 'Sanitärinstallation', count: 134, icon: 'fa-faucet-drip' },
            { label: 'Elektroinstallation', count: 112, icon: 'fa-bolt' },
            { label: 'Gartenbau', count: 98, icon: 'fa-tree' },
        ],
        categories: [
            { id: 'all', label: 'Alle', icon: 'fa-th-list', count: 1200 },
            { id: 'montage', label: 'Montage & Möbel', icon: 'fa-couch', count: 342 },
            { id: 'elektro', label: 'Elektro & Smart', icon: 'fa-bolt', count: 256 },
            { id: 'sanitaer', label: 'Sanitär & Wasser', icon: 'fa-faucet-drip', count: 189 },
            { id: 'garten', label: 'Garten & Outdoor', icon: 'fa-tree', count: 134 },
            { id: 'renovierung', label: 'Renovierung & Malerei', icon: 'fa-paint-roller', count: 278 },
            { id: 'premium', label: 'Premium Pro', icon: 'fa-crown', count: 48 },
        ],
    };

    // Merge with user-provided data
    let suggestionData = { ...DEFAULT_SUGGESTIONS };

    /**
     * Set suggestion data
     */
    function setSuggestionData(data) {
        suggestionData = { ...DEFAULT_SUGGESTIONS, ...data };
        if (data.categories) {
            suggestionData.categories = data.categories;
        }
        if (data.popular) {
            suggestionData.popular = data.popular;
        }
        if (data.services) {
            suggestionData.services = data.services;
        }
        if (data.handymen) {
            suggestionData.handymen = data.handymen;
        }
        if (data.locations) {
            suggestionData.locations = data.locations;
        }
    }

    /**
     * Get suggestions based on query
     */
    function getSuggestions(query) {
        if (!query || query.length < CONFIG.minChars) {
            return [];
        }

        const lowerQuery = query.toLowerCase();
        const results = [];

        // Search in services
        suggestionData.services.forEach(item => {
            if (item.label.toLowerCase().includes(lowerQuery)) {
                results.push({
                    label: item.label,
                    category: item.category || 'Service',
                    icon: item.icon || 'fa-tools',
                    count: item.count || 0,
                });
            }
        });

        // Search in handymen
        suggestionData.handymen.forEach(item => {
            if (item.label.toLowerCase().includes(lowerQuery)) {
                results.push({
                    label: item.label,
                    category: item.category || 'Handwerker',
                    icon: item.icon || 'fa-user-tie',
                    count: item.count || 0,
                });
            }
        });

        // Search in locations
        suggestionData.locations.forEach(item => {
            if (item.label.toLowerCase().includes(lowerQuery)) {
                results.push({
                    label: item.label,
                    category: item.category || 'Standort',
                    icon: item.icon || 'fa-map-marker-alt',
                    count: item.count || 0,
                });
            }
        });

        // Sort: exact matches first, then by length
        results.sort((a, b) => {
            const aExact = a.label.toLowerCase() === lowerQuery;
            const bExact = b.label.toLowerCase() === lowerQuery;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return a.label.length - b.label.length;
        });

        // Limit
        return results.slice(0, CONFIG.maxSuggestions);
    }

    /**
     * Get popular searches
     */
    function getPopularSearches() {
        return suggestionData.popular || [];
    }

    /**
     * Get categories
     */
    function getCategories() {
        return suggestionData.categories || [];
    }

    // ──────────────────────────────────────────────────────────────
    // 6. SEARCH INSTANCE CLASS
    // ──────────────────────────────────────────────────────────────

    class SearchInstance {
        constructor(options) {
            this.id = options.id || generateId();
            this.container = options.container || document.body;
            this.input = options.input || null;
            this.submitBtn = options.submitBtn || null;
            this.categoryBtns = options.categoryBtns || null;
            this.resultContainer = options.resultContainer || null;
            this.suggestionContainer = options.suggestionContainer || null;

            this.options = options || {};
            this.isOpen = false;
            this.activeIndex = -1;
            this.suggestions = [];
            this.query = '';

            // Callbacks
            this.onSearch = options.onSearch || null;
            this.onSelect = options.onSelect || null;
            this.onCategoryChange = options.onCategoryChange || null;
            this.onOpen = options.onOpen || null;
            this.onClose = options.onClose || null;

            // Debounced search function
            this.debouncedSearch = debounce(this.handleSearch.bind(this), CONFIG.debounceDelay);

            this.init();
        }

        init() {
            this.setupElements();
            this.setupEventListeners();
            this.setupKeyboardNavigation();
            this.renderCategories();
            this.renderRecentSearches();
            this.renderPopularSearches();
            debugLog('Search instance initialized:', this.id);
        }

        setupElements() {
            // If no input provided, find it in container
            if (!this.input) {
                this.input = this.container.querySelector('input[type="text"]');
            }
            if (!this.submitBtn) {
                this.submitBtn = this.container.querySelector('.fj-search-submit');
            }
            if (!this.resultContainer) {
                this.resultContainer = this.container.querySelector('.fj-search-dropdown');
            }
            if (!this.categoryBtns) {
                this.categoryBtns = this.container.querySelectorAll('.fj-search-category');
            }
            if (!this.suggestionContainer) {
                this.suggestionContainer = this.container.querySelector('.fj-search-suggestions');
            }
        }

        setupEventListeners() {
            // Input events
            if (this.input) {
                this.input.addEventListener('focus', () => {
                    this.open();
                });

                this.input.addEventListener('input', (e) => {
                    this.query = e.target.value.trim();
                    if (this.query.length >= CONFIG.minChars) {
                        this.debouncedSearch();
                    } else {
                        this.renderRecentSearches();
                        this.renderPopularSearches();
                        this.clearSuggestions();
                    }
                    this.updateClearButton();
                });

                this.input.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.close();
                    }
                });
            }

            // Submit button
            if (this.submitBtn) {
                this.submitBtn.addEventListener('click', () => {
                    this.submitSearch();
                });
            }

            // Category buttons
            if (this.categoryBtns) {
                this.categoryBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const category = btn.dataset.category || 'all';
                        this.setCategory(category);
                        if (this.query) {
                            this.submitSearch();
                        }
                    });
                });
            }

            // Click outside to close
            document.addEventListener('click', (e) => {
                if (this.container && !isChildOf(e.target, this.container)) {
                    this.close();
                }
            });

            // Close on Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            // Window resize
            window.addEventListener('resize', () => {
                // Adjust dropdown position if needed
            });
        }

        setupKeyboardNavigation() {
            if (!CONFIG.keyboardNavigation) return;

            document.addEventListener('keydown', (e) => {
                if (!this.isOpen) return;
                if (!this.input || document.activeElement !== this.input) return;

                const items = this.getSuggestionItems();
                if (items.length === 0) return;

                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        this.activeIndex = Math.min(this.activeIndex + 1, items.length - 1);
                        this.updateActiveItem();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.activeIndex = Math.max(this.activeIndex - 1, -1);
                        this.updateActiveItem();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (this.activeIndex >= 0 && this.activeIndex < items.length) {
                            const item = this.suggestions[this.activeIndex];
                            if (item) {
                                this.selectSuggestion(item);
                            }
                        } else {
                            this.submitSearch();
                        }
                        break;
                }
            });
        }

        getSuggestionItems() {
            if (!this.suggestionContainer) return [];
            return this.suggestionContainer.querySelectorAll('.fj-search-suggestion-item');
        }

        updateActiveItem() {
            const items = this.getSuggestionItems();
            items.forEach((item, index) => {
                item.classList.toggle('is-active', index === this.activeIndex);
                if (index === this.activeIndex) {
                    item.scrollIntoView({ block: 'nearest' });
                }
            });
        }

        // ── UI Rendering ──

        renderCategories() {
            const categories = getCategories();
            const container = this.container.querySelector('.fj-search-categories');
            if (!container) return;

            container.innerHTML = '';
            categories.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'fj-search-category' + (cat.id === currentCategory ? ' is-active' : '');
                btn.dataset.category = cat.id;
                btn.innerHTML = `
                    <i class="fas ${cat.icon}"></i>
                    ${cat.label}
                    <span class="fj-search-category-count">(${cat.count})</span>
                `;
                btn.addEventListener('click', () => {
                    this.setCategory(cat.id);
                    if (this.query) {
                        this.submitSearch();
                    }
                });
                container.appendChild(btn);
            });
            this.categoryBtns = container.querySelectorAll('.fj-search-category');
        }

        renderRecentSearches() {
            const container = this.container.querySelector('.fj-search-recent-list');
            if (!container || !CONFIG.recentSearches) return;

            loadRecentSearches();
            const section = this.container.querySelector('.fj-search-recent-section');
            if (section) {
                if (recentSearches.length === 0) {
                    section.style.display = 'none';
                    return;
                }
                section.style.display = 'block';
            }

            container.innerHTML = '';
            recentSearches.forEach(query => {
                const item = document.createElement('div');
                item.className = 'fj-search-recent-item';
                item.innerHTML = `
                    <span class="fj-search-recent-icon"><i class="fas fa-clock"></i></span>
                    <span class="fj-search-recent-text">${escapeHtml(query)}</span>
                    <button class="fj-search-recent-remove" data-query="${escapeHtml(query)}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.fj-search-recent-remove')) return;
                    if (this.input) this.input.value = query;
                    this.query = query;
                    this.submitSearch();
                    this.close();
                });
                const removeBtn = item.querySelector('.fj-search-recent-remove');
                if (removeBtn) {
                    removeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const q = removeBtn.dataset.query;
                        removeRecentSearch(q);
                        this.renderRecentSearches();
                    });
                }
                container.appendChild(item);
            });
        }

        renderPopularSearches() {
            const container = this.container.querySelector('.fj-search-popular-tags');
            if (!container || !CONFIG.popularSearches) return;

            const popular = getPopularSearches();
            const section = this.container.querySelector('.fj-search-popular-section');
            if (section) {
                if (popular.length === 0) {
                    section.style.display = 'none';
                    return;
                }
                section.style.display = 'block';
            }

            container.innerHTML = '';
            popular.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'fj-search-popular-tag';
                span.innerHTML = `
                    <i class="fas ${tag.icon || 'fa-search'} fj-search-tag-icon"></i>
                    ${escapeHtml(tag.label)}
                    <span class="fj-search-tag-count">(${tag.count})</span>
                `;
                span.addEventListener('click', () => {
                    if (this.input) this.input.value = tag.label;
                    this.query = tag.label;
                    this.submitSearch();
                    this.close();
                });
                container.appendChild(span);
            });
        }

        renderSuggestions(suggestions) {
            this.suggestions = suggestions || [];
            const container = this.suggestionContainer;
            if (!container) return;

            const section = this.container.querySelector('.fj-search-suggestions-section');
            if (section) {
                if (suggestions.length === 0) {
                    section.style.display = 'none';
                    const empty = this.container.querySelector('.fj-search-empty');
                    if (empty) empty.style.display = 'block';
                    return;
                }
                section.style.display = 'block';
                const empty = this.container.querySelector('.fj-search-empty');
                if (empty) empty.style.display = 'none';
            }

            container.innerHTML = '';
            this.activeIndex = -1;

            suggestions.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'fj-search-suggestion-item';
                div.dataset.index = index;

                const displayText = this.query ?
                    highlightMatch(item.label, this.query) :
                    escapeHtml(item.label);

                div.innerHTML = `
                    <span class="fj-search-suggestion-icon"><i class="fas ${item.icon || 'fa-search'}"></i></span>
                    <span class="fj-search-suggestion-text">${displayText}</span>
                    ${CONFIG.showSuggestionCategories && item.category ? `<span class="fj-search-suggestion-category">${escapeHtml(item.category)}</span>` : ''}
                `;

                div.addEventListener('click', () => {
                    this.selectSuggestion(item);
                });

                div.addEventListener('mouseenter', () => {
                    this.activeIndex = index;
                    this.updateActiveItem();
                });

                container.appendChild(div);
            });
        }

        clearSuggestions() {
            if (this.suggestionContainer) {
                this.suggestionContainer.innerHTML = '';
            }
            this.suggestions = [];
            this.activeIndex = -1;
            const section = this.container.querySelector('.fj-search-suggestions-section');
            if (section) section.style.display = 'none';
        }

        updateClearButton() {
            const clearBtn = this.container.querySelector('.fj-search-clear');
            if (clearBtn) {
                clearBtn.classList.toggle('is-visible', this.query.length > 0);
            }
        }

        // ── Search Actions ──

        handleSearch() {
            const query = this.query;
            if (!query || query.length < CONFIG.minChars) {
                this.clearSuggestions();
                return;
            }

            const suggestions = getSuggestions(query);
            this.renderSuggestions(suggestions);

            // If there are no suggestions, show recent/popular
            if (suggestions.length === 0) {
                this.renderRecentSearches();
                this.renderPopularSearches();
            }
        }

        submitSearch() {
            const query = this.query || (this.input ? this.input.value.trim() : '');
            if (!query) return;

            // Add to recent searches
            addRecentSearch(query);

            // Save search
            saveSearch(query, currentCategory);

            // Trigger callback
            if (this.onSearch) {
                this.onSearch(query, currentCategory);
            }

            // Close dropdown
            this.close();

            // Navigate to search results
            const location = getCurrentLocation();
            const url = `directory/index.html?q=${encodeURIComponent(query)}&category=${encodeURIComponent(currentCategory)}&location=${encodeURIComponent(location)}`;
            window.location.href = url;
        }

        selectSuggestion(item) {
            if (!item) return;

            const query = item.label;
            if (this.input) this.input.value = query;
            this.query = query;

            // Add to recent searches
            addRecentSearch(query);

            // Trigger callback
            if (this.onSelect) {
                this.onSelect(item);
            }

            // Submit search
            this.submitSearch();
        }

        setCategory(category) {
            currentCategory = category || 'all';
            if (this.categoryBtns) {
                this.categoryBtns.forEach(btn => {
                    btn.classList.toggle('is-active', btn.dataset.category === category);
                });
            }
            if (this.onCategoryChange) {
                this.onCategoryChange(category);
            }
        }

        // ── Dropdown Control ──

        open() {
            if (this.isOpen) return;
            this.isOpen = true;
            const dropdown = this.resultContainer || this.container.querySelector('.fj-search-dropdown');
            if (dropdown) {
                dropdown.classList.add('is-open');
            }
            if (this.input) {
                this.input.setAttribute('aria-expanded', 'true');
            }

            // Render recent and popular searches
            this.renderRecentSearches();
            this.renderPopularSearches();
            this.clearSuggestions();

            if (this.onOpen) {
                this.onOpen();
            }
        }

        close() {
            if (!this.isOpen) return;
            this.isOpen = false;
            const dropdown = this.resultContainer || this.container.querySelector('.fj-search-dropdown');
            if (dropdown) {
                dropdown.classList.remove('is-open');
            }
            if (this.input) {
                this.input.setAttribute('aria-expanded', 'false');
            }
            this.activeIndex = -1;
            if (this.onClose) {
                this.onClose();
            }
        }

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        // ── Public API ──

        setQuery(query) {
            this.query = query || '';
            if (this.input) {
                this.input.value = this.query;
            }
            this.updateClearButton();
            if (this.query.length >= CONFIG.minChars) {
                this.handleSearch();
            } else {
                this.clearSuggestions();
                this.renderRecentSearches();
                this.renderPopularSearches();
            }
            return this;
        }

        getQuery() {
            return this.query;
        }

        getCategory() {
            return currentCategory;
        }

        destroy() {
            // Clean up event listeners
            // (In a real app, we'd remove all listeners)
            instances.delete(this.id);
            debugLog('Search instance destroyed:', this.id);
        }

        // ── Dense Mode (Meituan-style) ──

        setDenseMode(enabled) {
            CONFIG.denseMode = enabled;
            if (this.container) {
                this.container.classList.toggle('fj-search-dense', enabled);
            }
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 7. FACTORY & INITIALIZATION
    // ──────────────────────────────────────────────────────────────

    /**
     * Create a search instance
     */
    function createSearch(options) {
        const instance = new SearchInstance(options);
        instances.set(instance.id, instance);
        return instance;
    }

    /**
     * Initialize search on a container
     */
    function init(options) {
        const container = typeof options === 'string' ?
            document.querySelector(options) :
            options.container || options;

        if (!container) {
            console.error('[FJSearch] Container not found');
            return null;
        }

        // If container already has a search instance, return it
        const existing = instances.get(container.dataset.fjSearchId);
        if (existing) {
            debugLog('Search already initialized on container');
            return existing;
        }

        // Build options
        const searchOptions = {
            container: container,
            input: container.querySelector('input[type="text"]') || options.input,
            submitBtn: container.querySelector('.fj-search-submit') || options.submitBtn,
            resultContainer: container.querySelector('.fj-search-dropdown') || options.resultContainer,
            suggestionContainer: container.querySelector('.fj-search-suggestions-list') || options.suggestionContainer,
            onSearch: options.onSearch || null,
            onSelect: options.onSelect || null,
            onCategoryChange: options.onCategoryChange || null,
            onOpen: options.onOpen || null,
            onClose: options.onClose || null,
            id: options.id || container.dataset.fjSearchId || generateId(),
        };

        // Store ID on container
        container.dataset.fjSearchId = searchOptions.id;

        // Create instance
        const instance = new SearchInstance(searchOptions);

        // Apply dense mode
        if (CONFIG.denseMode) {
            container.classList.add('fj-search-dense');
        }

        return instance;
    }

    /**
     * Get a search instance by ID or container
     */
    function getInstance(id) {
        if (typeof id === 'string') {
            return instances.get(id) || null;
        }
        // If element, find by data attribute
        if (id && id.nodeType) {
            const searchId = id.dataset.fjSearchId;
            return searchId ? instances.get(searchId) : null;
        }
        return null;
    }

    /**
     * Destroy a search instance
     */
    function destroy(id) {
        const instance = getInstance(id);
        if (instance) {
            instance.destroy();
            return true;
        }
        return false;
    }

    /**
     * Set global configuration
     */
    function configure(options) {
        Object.assign(CONFIG, options);
        debugLog('Configuration updated:', CONFIG);
        return CONFIG;
    }

    /**
     * Get configuration
     */
    function getConfig() {
        return { ...CONFIG };
    }

    /**
     * Set suggestion data
     */
    function setData(data) {
        setSuggestionData(data);
    }

    /**
     * Get suggestion data
     */
    function getData() {
        return { ...suggestionData };
    }

    /**
     * Perform a search programmatically
     */
    function search(query, category) {
        const location = getCurrentLocation();
        const url = `directory/index.html?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category || 'all')}&location=${encodeURIComponent(location)}`;
        window.location.href = url;
    }

    // ──────────────────────────────────────────────────────────────
    // 8. AUTO-INITIALIZATION
    // ──────────────────────────────────────────────────────────────

    /**
     * Auto-initialize all search components on the page
     */
    function autoInit() {
        const searchComponents = document.querySelectorAll('[data-fj-search]');
        searchComponents.forEach(container => {
            // Check if already initialized
            if (container.dataset.fjSearchId) return;

            const options = {
                container: container,
                id: container.dataset.fjSearchId || container.id || generateId(),
                onSearch: container.dataset.fjSearchOnSearch ? window[container.dataset.fjSearchOnSearch] : null,
            };

            // Parse options from data attributes
            if (container.dataset.fjSearchDebounce) {
                CONFIG.debounceDelay = parseInt(container.dataset.fjSearchDebounce) || 300;
            }
            if (container.dataset.fjSearchMinChars) {
                CONFIG.minChars = parseInt(container.dataset.fjSearchMinChars) || 2;
            }
            if (container.dataset.fjSearchDense === 'false') {
                CONFIG.denseMode = false;
            } else {
                CONFIG.denseMode = true;
            }

            init(options);
        });
    }

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    // ──────────────────────────────────────────────────────────────
    // 9. PUBLIC API
    // ──────────────────────────────────────────────────────────────

    const FJSearch = {
        // Core
        init: init,
        create: createSearch,
        getInstance: getInstance,
        destroy: destroy,

        // Configuration
        configure: configure,
        getConfig: getConfig,

        // Data
        setData: setData,
        getData: getData,

        // Search
        search: search,

        // Recent searches
        getRecent: loadRecentSearches,
        addRecent: addRecentSearch,
        removeRecent: removeRecentSearch,
        clearRecent: clearRecentSearches,

        // Saved searches
        getSaved: loadSavedSearches,
        save: saveSearch,

        // Suggestions
        getSuggestions: getSuggestions,
        getPopular: getPopularSearches,
        getCategories: getCategories,

        // Utils
        getLocation: getCurrentLocation,

        // Version
        version: '1.0.0',

        // Debug
        debug: CONFIG.debug,
    };

    // ──────────────────────────────────────────────────────────────
    // 10. EXPOSE TO GLOBAL
    // ──────────────────────────────────────────────────────────────

    global.FJSearch = FJSearch;

    // Also support AMD/CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = FJSearch;
    }

    // ──────────────────────────────────────────────────────────────
    // 11. MEITUAN-STYLE CONSOLE BANNER
    // ──────────────────────────────────────────────────────────────

    console.log('%c🔍 FIXJORI Search Engine v' + FJSearch.version,
        'font-size:16px;font-weight:bold;color:#0D9488;');

    console.log('%c📊 Meituan-Style · Dense · Information-Rich',
        'font-size:12px;color:#94A3B8;');

    console.log('%c⚡ ' + (CONFIG.autocomplete ? 'Autocomplete ON' : 'Autocomplete OFF') +
        ' | ' + (CONFIG.recentSearches ? 'Recent ON' : 'Recent OFF') +
        ' | ' + (CONFIG.popularSearches ? 'Popular ON' : 'Popular OFF'),
        'font-size:11px;color:#64748B;');

    debugLog('Search engine ready. Use FJSearch.init() to create search instances.');

    // ──────────────────────────────────────────────────────────────
    // END OF SEARCH
    // ──────────────────────────────────────────────────────────────

})(typeof window !== 'undefined' ? window : this);