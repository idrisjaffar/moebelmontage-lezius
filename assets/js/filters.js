/**
 * ============================================================
 * FIXJORI | FILTERS ENGINE V1.0
 * Meituan-Style · Dense · Information-Rich · Production-Ready
 * ============================================================
 *
 * This module provides a complete filtering system for the FIXJORI platform,
 * featuring:
 * - Multi-category filtering
 * - Price range with slider
 * - Rating filtering (stars)
 * - Availability toggles
 * - Location filtering
 * - Sorting (relevance, price, rating, distance)
 * - Active filter chips (Meituan-style)
 * - URL parameter persistence
 * - localStorage persistence
 * - Real-time filtering with debouncing
 * - Mobile-friendly filter drawer
 * - Filter counts
 * - Accessibility (ARIA)
 *
 * ============================================================
 * USAGE:
 * ============================================================
 *
 * // Initialize filters on a container
 * FJFilters.init({
 *     container: '#filter-container',
 *     resultsContainer: '#results-container',
 *     data: items, // Array of items to filter
 *     onFilter: function(filteredItems) {
 *         // Render filtered items
 *     },
 *     fields: {
 *         category: { type: 'select', options: [...] },
 *         price: { type: 'range', min: 0, max: 1000 },
 *         rating: { type: 'rating' },
 *         availability: { type: 'toggle' },
 *         location: { type: 'text' },
 *         sort: { type: 'sort', options: [...] }
 *     }
 * });
 *
 * // Or use data attributes:
 * <div data-fj-filters>
 *     <select data-filter="category">...</select>
 *     <input type="range" data-filter="price" />
 *     <div data-filter="rating">...</div>
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

        /** Enable URL parameter persistence */
        urlPersistence: true,

        /** Enable localStorage persistence */
        storagePersistence: true,

        /** Storage key for filter state */
        storageKey: 'fj_filter_state',

        /** Enable debug logging */
        debug: false,

        /** Meituan-style dense mode */
        denseMode: true,

        /** Show filter counts */
        showCounts: true,

        /** Auto-apply filters on change */
        autoApply: true,

        /** Preserve filter state on page load */
        preserveState: true,

        /** Maximum price for range slider */
        maxPrice: 10000,

        /** Default sort field */
        defaultSort: 'relevance',

        /** Sort options */
        sortOptions: [
            { value: 'relevance', label: 'Relevanz' },
            { value: 'price-asc', label: 'Preis aufsteigend' },
            { value: 'price-desc', label: 'Preis absteigend' },
            { value: 'rating', label: 'Beste Bewertung' },
            { value: 'distance', label: 'Entfernung' },
        ],
    };

    // ──────────────────────────────────────────────────────────────
    // 2. STATE
    // ──────────────────────────────────────────────────────────────

    /** Filter instances registry */
    const instances = new Map();

    /** Current filter state */
    let filterState = {
        category: 'all',
        priceMin: 0,
        priceMax: 1000,
        rating: 0,
        availability: false,
        location: '',
        sort: 'relevance',
        page: 1,
        perPage: 20,
        // Additional dynamic filters
        custom: {},
    };

    /** Original data */
    let originalData = [];

    /** Filtered data */
    let filteredData = [];

    /** Active filter chips */
    let activeFilters = [];

    /** Is filter drawer open (mobile) */
    let isDrawerOpen = false;

    // ──────────────────────────────────────────────────────────────
    // 3. UTILITY FUNCTIONS
    // ──────────────────────────────────────────────────────────────

    /**
     * Log debug messages
     */
    function debugLog(...args) {
        if (CONFIG.debug) {
            console.log('[FJFilters]', ...args);
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
     * Deep merge objects
     */
    function deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = deepMerge(target[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    }

    /**
     * Get URL parameters as an object
     */
    function getUrlParams() {
        const params = {};
        const url = new URL(window.location.href);
        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

    /**
     * Set URL parameters without reload
     */
    function setUrlParams(params, replace) {
        const url = new URL(window.location.href);
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                    url.searchParams.set(key, params[key]);
                } else {
                    url.searchParams.delete(key);
                }
            }
        }
        const method = replace ? 'replaceState' : 'pushState';
        window.history[method]({}, '', url.toString());
    }

    /**
     * Load filter state from URL
     */
    function loadStateFromUrl() {
        const params = getUrlParams();
        const state = { ...filterState };

        const mappings = {
            cat: 'category',
            price_min: 'priceMin',
            price_max: 'priceMax',
            rating: 'rating',
            avail: 'availability',
            loc: 'location',
            sort: 'sort',
            page: 'page',
            per_page: 'perPage',
        };

        for (const [key, value] of Object.entries(params)) {
            if (key in mappings) {
                const stateKey = mappings[key];
                if (stateKey === 'availability') {
                    state[stateKey] = value === 'true';
                } else if (stateKey === 'priceMin' || stateKey === 'priceMax' || stateKey === 'rating' || stateKey ===
                    'page' || stateKey === 'perPage') {
                    state[stateKey] = parseFloat(value) || 0;
                } else {
                    state[stateKey] = value;
                }
            }
        }

        return state;
    }

    /**
     * Load filter state from localStorage
     */
    function loadStateFromStorage() {
        if (!CONFIG.storagePersistence) return null;

        try {
            const stored = localStorage.getItem(CONFIG.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                if (data && typeof data === 'object') {
                    return data;
                }
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    /**
     * Save filter state to localStorage
     */
    function saveStateToStorage(state) {
        if (!CONFIG.storagePersistence) return;

        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
        } catch (e) { /* ignore */ }
    }

    /**
     * Generate a unique ID
     */
    function generateId() {
        return 'fj-filter-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    }

    /**
     * Check if value is a number
     */
    function isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }

    /**
     * Clamp a number between min and max
     */
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
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

    // ──────────────────────────────────────────────────────────────
    // 4. FILTER ENGINE
    // ──────────────────────────────────────────────────────────────

    /**
     * Apply all filters to the data
     */
    function applyFilters(data, state) {
        let result = [...data];

        // ── Category filter ──
        if (state.category && state.category !== 'all') {
            result = result.filter(item =>
                item.category === state.category ||
                (item.categories && item.categories.includes(state.category))
            );
        }

        // ── Price range filter ──
        const minPrice = isNumber(state.priceMin) ? state.priceMin : 0;
        const maxPrice = isNumber(state.priceMax) ? state.priceMax : Infinity;
        if (minPrice > 0 || maxPrice < Infinity) {
            result = result.filter(item => {
                const price = item.price || 0;
                return price >= minPrice && price <= maxPrice;
            });
        }

        // ── Rating filter ──
        if (state.rating > 0) {
            result = result.filter(item => (item.rating || 0) >= state.rating);
        }

        // ── Availability filter ──
        if (state.availability) {
            result = result.filter(item => item.available === true);
        }

        // ── Location filter ──
        if (state.location && state.location.trim()) {
            const loc = state.location.trim().toLowerCase();
            result = result.filter(item =>
                (item.location && item.location.toLowerCase().includes(loc)) ||
                (item.city && item.city.toLowerCase().includes(loc)) ||
                (item.address && item.address.toLowerCase().includes(loc))
            );
        }

        // ── Custom filters ──
        if (state.custom) {
            for (const [key, value] of Object.entries(state.custom)) {
                if (value !== null && value !== undefined && value !== '') {
                    result = result.filter(item => {
                        const itemValue = item[key] || item.customFields?.[key];
                        if (typeof itemValue === 'string') {
                            return itemValue.toLowerCase().includes(String(value).toLowerCase());
                        }
                        return itemValue === value;
                    });
                }
            }
        }

        // ── Sorting ──
        result = applySorting(result, state.sort);

        return result;
    }

    /**
     * Apply sorting to filtered data
     */
    function applySorting(data, sort) {
        const sorted = [...data];

        switch (sort) {
            case 'price-asc':
                sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-desc':
                sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'distance':
                sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999));
                break;
            case 'name':
                sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'relevance':
            default:
                // Keep original order or sort by relevance score
                if (sorted.every(item => typeof item.relevance === 'number')) {
                    sorted.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
                }
                break;
        }

        return sorted;
    }

    /**
     * Build active filters list for chips
     */
    function buildActiveFilters(state, fields) {
        const filters = [];

        // Category
        if (state.category && state.category !== 'all') {
            const categoryField = fields?.category;
            const categoryLabel = categoryField?.options?.find(o => o.value === state.category)?.label || state.category;
            filters.push({
                id: 'category',
                label: categoryLabel,
                value: state.category,
                type: 'category',
                remove: () => { state.category = 'all'; },
            });
        }

        // Price range
        if (state.priceMin > 0 || (state.priceMax && state.priceMax < CONFIG.maxPrice)) {
            const label = state.priceMin > 0 && state.priceMax < CONFIG.maxPrice ?
                `€${state.priceMin} – €${state.priceMax}` :
                state.priceMin > 0 ?
                `ab €${state.priceMin}` :
                `bis €${state.priceMax}`;
            filters.push({
                id: 'price',
                label: label,
                value: { min: state.priceMin, max: state.priceMax },
                type: 'price',
                remove: () => {
                    state.priceMin = 0;
                    state.priceMax = CONFIG.maxPrice;
                },
            });
        }

        // Rating
        if (state.rating > 0) {
            filters.push({
                id: 'rating',
                label: `${state.rating}★+`,
                value: state.rating,
                type: 'rating',
                remove: () => { state.rating = 0; },
            });
        }

        // Availability
        if (state.availability) {
            filters.push({
                id: 'availability',
                label: '🟢 Verfügbar',
                value: true,
                type: 'availability',
                remove: () => { state.availability = false; },
            });
        }

        // Location
        if (state.location && state.location.trim()) {
            filters.push({
                id: 'location',
                label: `📍 ${state.location.trim()}`,
                value: state.location,
                type: 'location',
                remove: () => { state.location = ''; },
            });
        }

        // Custom filters
        if (state.custom) {
            for (const [key, value] of Object.entries(state.custom)) {
                if (value !== null && value !== undefined && value !== '') {
                    const field = fields?.custom?.[key];
                    const label = field?.options?.find(o => o.value === value)?.label || String(value);
                    filters.push({
                        id: `custom_${key}`,
                        label: label,
                        value: value,
                        type: 'custom',
                        key: key,
                        remove: () => { delete state.custom[key]; },
                    });
                }
            }
        }

        return filters;
    }

    // ──────────────────────────────────────────────────────────────
    // 5. FILTER INSTANCE CLASS
    // ──────────────────────────────────────────────────────────────

    class FilterInstance {
        constructor(options) {
            this.id = options.id || generateId();
            this.container = options.container || document.body;
            this.resultsContainer = options.resultsContainer || null;
            this.data = options.data || [];
            this.fields = options.fields || {};
            this.callbacks = {
                onFilter: options.onFilter || null,
                onUpdate: options.onUpdate || null,
                onReset: options.onReset || null,
                onError: options.onError || null,
            };

            this.state = { ...filterState };
            this.filtered = [];
            this.isInitialized = false;
            this.debouncedFilter = debounce(this.filter.bind(this), CONFIG.debounceDelay);

            this.init();
        }

        init() {
            // Load persisted state
            if (CONFIG.preserveState) {
                const urlState = loadStateFromUrl();
                const storageState = loadStateFromStorage();

                // Merge: URL > Storage > Default
                if (storageState) {
                    this.state = deepMerge(this.state, storageState);
                }
                if (urlState) {
                    this.state = deepMerge(this.state, urlState);
                }

                // Validate price range
                if (this.state.priceMax === 0 || this.state.priceMax > CONFIG.maxPrice) {
                    this.state.priceMax = CONFIG.maxPrice;
                }
            }

            this.setupElements();
            this.setupEventListeners();
            this.renderFilterChips();
            this.initialFilter();
            this.isInitialized = true;

            debugLog('Filter instance initialized:', this.id);
        }

        setupElements() {
            // Find filter elements in container
            this.elements = {
                category: this.container.querySelector('[data-filter="category"]'),
                priceMin: this.container.querySelector('[data-filter="price-min"]'),
                priceMax: this.container.querySelector('[data-filter="price-max"]'),
                priceSlider: this.container.querySelector('[data-filter="price-slider"]'),
                rating: this.container.querySelector('[data-filter="rating"]'),
                availability: this.container.querySelector('[data-filter="availability"]'),
                location: this.container.querySelector('[data-filter="location"]'),
                sort: this.container.querySelector('[data-filter="sort"]'),
                search: this.container.querySelector('[data-filter="search"]'),
                reset: this.container.querySelector('[data-filter="reset"]'),
                apply: this.container.querySelector('[data-filter="apply"]'),
                chipContainer: this.container.querySelector('.fj-filter-chips'),
                count: this.container.querySelector('.fj-filter-count'),
                drawerToggle: this.container.querySelector('[data-filter-drawer-toggle]'),
                drawer: this.container.querySelector('.fj-filter-drawer'),
                drawerClose: this.container.querySelector('[data-filter-drawer-close]'),
            };

            // Build fields from elements
            this.buildFieldsFromElements();
        }

        buildFieldsFromElements() {
            // If fields are already provided, use them
            if (Object.keys(this.fields).length > 0) return;

            // Otherwise, build from data attributes
            const fields = {};

            // Category select
            const categoryEl = this.elements.category;
            if (categoryEl && categoryEl.tagName === 'SELECT') {
                const options = [];
                categoryEl.querySelectorAll('option').forEach(opt => {
                    options.push({
                        value: opt.value,
                        label: opt.textContent.trim(),
                    });
                });
                fields.category = {
                    type: 'select',
                    options: options,
                    default: 'all',
                };
            }

            // Price range
            if (this.elements.priceSlider) {
                const slider = this.elements.priceSlider;
                fields.price = {
                    type: 'range',
                    min: parseFloat(slider.min) || 0,
                    max: parseFloat(slider.max) || CONFIG.maxPrice,
                    step: parseFloat(slider.step) || 1,
                };
            }

            // Rating (stars)
            if (this.elements.rating) {
                fields.rating = {
                    type: 'rating',
                    max: 5,
                };
            }

            // Availability toggle
            if (this.elements.availability) {
                fields.availability = {
                    type: 'toggle',
                };
            }

            // Sort
            if (this.elements.sort) {
                const sortEl = this.elements.sort;
                const options = [];
                sortEl.querySelectorAll('option').forEach(opt => {
                    options.push({
                        value: opt.value,
                        label: opt.textContent.trim(),
                    });
                });
                fields.sort = {
                    type: 'sort',
                    options: options.length ? options : CONFIG.sortOptions,
                    default: CONFIG.defaultSort,
                };
            }

            this.fields = fields;
        }

        setupEventListeners() {
            // ── Category ──
            if (this.elements.category) {
                this.elements.category.addEventListener('change', (e) => {
                    this.state.category = e.target.value;
                    this.handleChange();
                });
            }

            // ── Price slider ──
            if (this.elements.priceSlider) {
                const slider = this.elements.priceSlider;
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.state.priceMax = value;
                    // Update display
                    this.updatePriceDisplay();
                    this.handleChange();
                });
            }

            // ── Price min/max inputs ──
            if (this.elements.priceMin) {
                this.elements.priceMin.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value) || 0;
                    this.state.priceMin = clamp(value, 0, this.state.priceMax);
                    this.handleChange();
                });
            }

            if (this.elements.priceMax) {
                this.elements.priceMax.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value) || CONFIG.maxPrice;
                    this.state.priceMax = clamp(value, this.state.priceMin, CONFIG.maxPrice);
                    this.handleChange();
                });
            }

            // ── Rating (stars) ──
            if (this.elements.rating) {
                this.elements.rating.querySelectorAll('[data-rating-value]').forEach(star => {
                    star.addEventListener('click', () => {
                        const value = parseInt(star.dataset.ratingValue) || 0;
                        this.state.rating = value;
                        this.renderRating();
                        this.handleChange();
                    });

                    star.addEventListener('mouseenter', () => {
                        const value = parseInt(star.dataset.ratingValue) || 0;
                        this.hoverRating(value);
                    });

                    star.addEventListener('mouseleave', () => {
                        this.hoverRating(this.state.rating);
                    });
                });
            }

            // ── Availability toggle ──
            if (this.elements.availability) {
                const toggle = this.elements.availability;
                if (toggle.type === 'checkbox') {
                    toggle.addEventListener('change', () => {
                        this.state.availability = toggle.checked;
                        this.handleChange();
                    });
                } else {
                    toggle.addEventListener('click', () => {
                        this.state.availability = !this.state.availability;
                        if (toggle.type === 'checkbox') {
                            toggle.checked = this.state.availability;
                        }
                        this.handleChange();
                    });
                }
            }

            // ── Location ──
            if (this.elements.location) {
                this.elements.location.addEventListener('input', debounce((e) => {
                    this.state.location = e.target.value;
                    this.handleChange();
                }, CONFIG.debounceDelay));
            }

            // ── Sort ──
            if (this.elements.sort) {
                this.elements.sort.addEventListener('change', (e) => {
                    this.state.sort = e.target.value;
                    this.handleChange();
                });
            }

            // ── Search (free text) ──
            if (this.elements.search) {
                this.elements.search.addEventListener('input', debounce((e) => {
                    const value = e.target.value.trim();
                    if (value) {
                        this.state.custom.search = value;
                    } else {
                        delete this.state.custom.search;
                    }
                    this.handleChange();
                }, CONFIG.debounceDelay));
            }

            // ── Reset button ──
            if (this.elements.reset) {
                this.elements.reset.addEventListener('click', () => {
                    this.reset();
                });
            }

            // ── Apply button (for manual apply mode) ──
            if (this.elements.apply) {
                this.elements.apply.addEventListener('click', () => {
                    this.applyFilters();
                });
            }

            // ── Drawer toggle (mobile) ──
            if (this.elements.drawerToggle) {
                this.elements.drawerToggle.addEventListener('click', () => {
                    this.toggleDrawer();
                });
            }

            if (this.elements.drawerClose) {
                this.elements.drawerClose.addEventListener('click', () => {
                    this.closeDrawer();
                });
            }

            // ── Chip removal ──
            // (Handled in renderFilterChips)

            // ── URL navigation (back/forward) ──
            window.addEventListener('popstate', () => {
                if (CONFIG.urlPersistence) {
                    const urlState = loadStateFromUrl();
                    if (Object.keys(urlState).length > 0) {
                        this.state = deepMerge(this.state, urlState);
                        this.syncUI();
                        this.filter();
                    }
                }
            });
        }

        // ── UI Sync ──

        syncUI() {
            // Category
            if (this.elements.category) {
                this.elements.category.value = this.state.category || 'all';
            }

            // Price
            this.updatePriceDisplay();

            // Rating
            this.renderRating();

            // Availability
            if (this.elements.availability) {
                if (this.elements.availability.type === 'checkbox') {
                    this.elements.availability.checked = this.state.availability;
                }
                this.elements.availability.classList.toggle('is-active', this.state.availability);
            }

            // Location
            if (this.elements.location) {
                this.elements.location.value = this.state.location || '';
            }

            // Sort
            if (this.elements.sort) {
                this.elements.sort.value = this.state.sort || CONFIG.defaultSort;
            }

            // Search
            if (this.elements.search) {
                this.elements.search.value = this.state.custom?.search || '';
            }

            // Chips
            this.renderFilterChips();

            // Count
            this.updateCount();
        }

        updatePriceDisplay() {
            const min = this.state.priceMin || 0;
            const max = this.state.priceMax || CONFIG.maxPrice;

            if (this.elements.priceMin) {
                this.elements.priceMin.value = min;
            }
            if (this.elements.priceMax) {
                this.elements.priceMax.value = max;
            }
            if (this.elements.priceSlider) {
                this.elements.priceSlider.value = max;
                this.elements.priceSlider.min = 0;
                this.elements.priceSlider.max = CONFIG.maxPrice;

                // Update slider background (Meituan-style)
                const percent = (max / CONFIG.maxPrice) * 100;
                this.elements.priceSlider.style.background =
                    `linear-gradient(to right, var(--fj-teal) 0%, var(--fj-teal) ${percent}%, var(--fj-border) ${percent}%, var(--fj-border) 100%)`;
            }

            // Update labels
            const label = this.container.querySelector('.fj-price-label');
            if (label) {
                if (min === 0 && max === CONFIG.maxPrice) {
                    label.textContent = 'Jeder Preis';
                } else if (min === 0) {
                    label.textContent = `bis €${max}`;
                } else if (max === CONFIG.maxPrice) {
                    label.textContent = `ab €${min}`;
                } else {
                    label.textContent = `€${min} – €${max}`;
                }
            }
        }

        renderRating() {
            const container = this.elements.rating;
            if (!container) return;

            const currentRating = this.state.rating || 0;

            container.querySelectorAll('[data-rating-value]').forEach(el => {
                const value = parseInt(el.dataset.ratingValue) || 0;
                el.classList.toggle('is-active', value <= currentRating);
                el.classList.toggle('is-hover', value <= this._hoverRating);
                el.setAttribute('aria-checked', value <= currentRating ? 'true' : 'false');
            });

            // Update label
            const label = container.querySelector('.fj-rating-label');
            if (label) {
                const labels = {
                    0: 'Alle Bewertungen',
                    1: '1★ und mehr',
                    2: '2★ und mehr',
                    3: '3★ und mehr',
                    4: '4★ und mehr',
                    5: '5★ nur',
                };
                label.textContent = labels[currentRating] || labels[0];
            }
        }

        hoverRating(value) {
            this._hoverRating = value || 0;
            const container = this.elements.rating;
            if (!container) return;

            container.querySelectorAll('[data-rating-value]').forEach(el => {
                const val = parseInt(el.dataset.ratingValue) || 0;
                el.classList.toggle('is-hover', val <= this._hoverRating);
            });
        }

        renderFilterChips() {
            const container = this.elements.chipContainer;
            if (!container) return;

            const filters = buildActiveFilters(this.state, this.fields);
            activeFilters = filters;

            if (filters.length === 0) {
                container.innerHTML = '';
                container.style.display = 'none';
                return;
            }

            container.style.display = 'flex';

            let html = '';
            filters.forEach(filter => {
                html += `
                    <span class="fj-filter-chip" data-filter-id="${filter.id}">
                        <span class="fj-filter-chip-label">${escapeHtml(filter.label)}</span>
                        <button class="fj-filter-chip-remove" data-filter-id="${filter.id}" aria-label="Filter entfernen: ${escapeHtml(filter.label)}">
                            <i class="fas fa-times"></i>
                        </button>
                    </span>
                `;
            });

            // Add clear all button
            if (filters.length > 1) {
                html += `
                    <button class="fj-filter-chip-clear" data-filter-clear-all>
                        Alle zurücksetzen
                    </button>
                `;
            }

            container.innerHTML = html;

            // Add event listeners for chip removal
            container.querySelectorAll('.fj-filter-chip-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.filterId;
                    const filter = filters.find(f => f.id === id);
                    if (filter && filter.remove) {
                        filter.remove();
                        this.handleChange();
                    }
                });
            });

            const clearAllBtn = container.querySelector('[data-filter-clear-all]');
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', () => {
                    this.reset();
                });
            }
        }

        updateCount() {
            const el = this.elements.count;
            if (!el) return;

            const count = this.filtered.length;
            const total = this.data.length;

            if (CONFIG.showCounts) {
                el.textContent = `${count} von ${total}`;
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        }

        // ── Filter Operations ──

        filter() {
            this.filtered = applyFilters(this.data, this.state);

            // Apply pagination
            if (this.state.page && this.state.perPage) {
                const start = (this.state.page - 1) * this.state.perPage;
                const end = start + this.state.perPage;
                // Store full filtered for count, but slice for display
                this._fullFiltered = this.filtered;
                this.filtered = this.filtered.slice(start, end);
            } else {
                this._fullFiltered = this.filtered;
            }

            // Trigger callback
            if (this.callbacks.onFilter) {
                this.callbacks.onFilter(this.filtered, this._fullFiltered);
            }

            // Update UI
            this.renderFilterChips();
            this.updateCount();

            // Save state
            if (CONFIG.storagePersistence) {
                saveStateToStorage(this.state);
            }
            if (CONFIG.urlPersistence) {
                this.updateUrl();
            }

            debugLog('Filter applied, results:', this.filtered.length);
            return this.filtered;
        }

        applyFilters() {
            return this.filter();
        }

        initialFilter() {
            this.filter();
        }

        handleChange() {
            if (CONFIG.autoApply) {
                this.debouncedFilter();
            } else {
                // Just update UI but don't filter
                this.syncUI();
            }
        }

        updateUrl() {
            const params = {};
            const state = this.state;

            if (state.category && state.category !== 'all') {
                params.cat = state.category;
            }
            if (state.priceMin > 0) {
                params.price_min = state.priceMin;
            }
            if (state.priceMax > 0 && state.priceMax < CONFIG.maxPrice) {
                params.price_max = state.priceMax;
            }
            if (state.rating > 0) {
                params.rating = state.rating;
            }
            if (state.availability) {
                params.avail = 'true';
            }
            if (state.location && state.location.trim()) {
                params.loc = state.location.trim();
            }
            if (state.sort && state.sort !== CONFIG.defaultSort) {
                params.sort = state.sort;
            }
            if (state.page > 1) {
                params.page = state.page;
            }
            if (state.perPage && state.perPage !== 20) {
                params.per_page = state.perPage;
            }

            setUrlParams(params, true);
        }

        // ── Reset ──

        reset() {
            // Reset state
            this.state = {
                category: 'all',
                priceMin: 0,
                priceMax: CONFIG.maxPrice,
                rating: 0,
                availability: false,
                location: '',
                sort: CONFIG.defaultSort,
                page: 1,
                perPage: 20,
                custom: {},
            };

            // Reset UI
            this.syncUI();

            // Clear storage
            if (CONFIG.storagePersistence) {
                try {
                    localStorage.removeItem(CONFIG.storageKey);
                } catch (e) { /* ignore */ }
            }

            // Clear URL
            if (CONFIG.urlPersistence) {
                setUrlParams({}, true);
            }

            // Trigger callback
            if (this.callbacks.onReset) {
                this.callbacks.onReset();
            }

            this.filter();

            debugLog('Filters reset');
            return this;
        }

        // ── Drawer (mobile) ──

        toggleDrawer() {
            if (isDrawerOpen) {
                this.closeDrawer();
            } else {
                this.openDrawer();
            }
        }

        openDrawer() {
            isDrawerOpen = true;
            const drawer = this.elements.drawer;
            if (drawer) {
                drawer.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            }
        }

        closeDrawer() {
            isDrawerOpen = false;
            const drawer = this.elements.drawer;
            if (drawer) {
                drawer.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        }

        // ── Data Management ──

        setData(data) {
            this.data = data || [];
            this.filter();
            return this;
        }

        setState(state) {
            this.state = deepMerge(this.state, state);
            this.syncUI();
            this.filter();
            return this;
        }

        getState() {
            return { ...this.state };
        }

        getResults() {
            return [...this.filtered];
        }

        getTotalResults() {
            return this._fullFiltered ? this._fullFiltered.length : this.filtered.length;
        }

        // ── Destroy ──

        destroy() {
            // Clean up event listeners (simplified)
            instances.delete(this.id);
            debugLog('Filter instance destroyed:', this.id);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 6. FACTORY & INITIALIZATION
    // ──────────────────────────────────────────────────────────────

    /**
     * Create a filter instance
     */
    function createFilter(options) {
        const instance = new FilterInstance(options);
        instances.set(instance.id, instance);
        return instance;
    }

    /**
     * Initialize filters on a container
     */
    function init(options) {
        const container = typeof options === 'string' ?
            document.querySelector(options) :
            options.container || options;

        if (!container) {
            console.error('[FJFilters] Container not found');
            return null;
        }

        // If container already has a filter instance, return it
        const existing = instances.get(container.dataset.fjFiltersId);
        if (existing) {
            debugLog('Filters already initialized on container');
            return existing;
        }

        const filterOptions = {
            container: container,
            resultsContainer: options.resultsContainer || container.querySelector('.fj-results') || null,
            data: options.data || [],
            fields: options.fields || {},
            onFilter: options.onFilter || null,
            onUpdate: options.onUpdate || null,
            onReset: options.onReset || null,
            onError: options.onError || null,
            id: options.id || container.dataset.fjFiltersId || generateId(),
        };

        container.dataset.fjFiltersId = filterOptions.id;

        const instance = new FilterInstance(filterOptions);

        // Apply dense mode
        if (CONFIG.denseMode) {
            container.classList.add('fj-filter-dense');
        }

        return instance;
    }

    /**
     * Get a filter instance by ID or container
     */
    function getInstance(id) {
        if (typeof id === 'string') {
            return instances.get(id) || null;
        }
        if (id && id.nodeType) {
            const filterId = id.dataset.fjFiltersId;
            return filterId ? instances.get(filterId) : null;
        }
        return null;
    }

    /**
     * Destroy a filter instance
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
     * Filter data without initializing UI
     */
    function filterData(data, state, fields) {
        return applyFilters(data, state);
    }

    /**
     * Sort data
     */
    function sortData(data, sort) {
        return applySorting(data, sort);
    }

    /**
     * Get active filters from state
     */
    function getActiveFilters(state, fields) {
        return buildActiveFilters(state, fields);
    }

    // ──────────────────────────────────────────────────────────────
    // 7. AUTO-INITIALIZATION
    // ──────────────────────────────────────────────────────────────

    /**
     * Auto-initialize all filter components on the page
     */
    function autoInit() {
        const filterComponents = document.querySelectorAll('[data-fj-filters]');
        filterComponents.forEach(container => {
            if (container.dataset.fjFiltersId) return;

            const dataAttr = container.dataset.fjFiltersData;
            let data = [];
            if (dataAttr) {
                try {
                    data = JSON.parse(dataAttr);
                } catch (e) { /* ignore */ }
            }

            init({
                container: container,
                data: data,
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    // ──────────────────────────────────────────────────────────────
    // 8. PUBLIC API
    // ──────────────────────────────────────────────────────────────

    const FJFilters = {
        // Core
        init: init,
        create: createFilter,
        getInstance: getInstance,
        destroy: destroy,

        // Configuration
        configure: configure,
        getConfig: getConfig,

        // Data filtering
        filter: filterData,
        sort: sortData,
        getActiveFilters: getActiveFilters,

        // State management
        getState: () => ({ ...filterState }),
        setState: (state) => {
            filterState = deepMerge(filterState, state);
            return filterState;
        },

        // Utilities
        getUrlParams: getUrlParams,
        setUrlParams: setUrlParams,

        // Version
        version: '1.0.0',

        // Debug
        debug: CONFIG.debug,
    };

    // ──────────────────────────────────────────────────────────────
    // 9. EXPOSE TO GLOBAL
    // ──────────────────────────────────────────────────────────────

    global.FJFilters = FJFilters;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = FJFilters;
    }

    // ──────────────────────────────────────────────────────────────
    // 10. MEITUAN-STYLE CONSOLE BANNER
    // ──────────────────────────────────────────────────────────────

    console.log('%c🔧 FIXJORI Filters Engine v' + FJFilters.version,
        'font-size:16px;font-weight:bold;color:#0D9488;');

    console.log('%c📊 Meituan-Style · Dense · Information-Rich',
        'font-size:12px;color:#94A3B8;');

    console.log('%c⚡ ' + (CONFIG.urlPersistence ? 'URL Persistence ON' : 'URL Persistence OFF') +
        ' | ' + (CONFIG.storagePersistence ? 'Storage ON' : 'Storage OFF') +
        ' | ' + (CONFIG.autoApply ? 'Auto-Apply ON' : 'Auto-Apply OFF'),
        'font-size:11px;color:#64748B;');

    debugLog('Filters engine ready. Use FJFilters.init() to create filter instances.');

    // ──────────────────────────────────────────────────────────────
    // END OF FILTERS
    // ──────────────────────────────────────────────────────────────

})(typeof window !== 'undefined' ? window : this);