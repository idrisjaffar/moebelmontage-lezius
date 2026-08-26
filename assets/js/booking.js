/**
 * ============================================================
 * FIXJORI | BOOKING FLOW LOGIC V1.0
 * Meituan-Style · Dense · Information-Rich · Production-Ready
 * ============================================================
 *
 * This module provides a complete booking system for the FIXJORI platform,
 * featuring:
 * - Multi-step booking process (3 steps)
 * - Project description with category selection
 * - Handyman selection with comparison
 * - Date/time scheduling
 * - Price calculation & breakdown
 * - Payment method selection
 * - Booking confirmation
 * - Data persistence across steps (sessionStorage)
 * - Form validation with real-time feedback
 * - Integration with search & filters
 * - Accessibility (ARIA)
 *
 * ============================================================
 * USAGE:
 * ============================================================
 *
 * // Initialize booking on a container
 * FJBooking.init({
 *     container: '#booking-container',
 *     steps: ['step1', 'step2', 'step3'],
 *     onComplete: function(bookingData) {
 *         console.log('Booking complete:', bookingData);
 *     },
 *     onStepChange: function(currentStep, data) {
 *         console.log('Step changed:', currentStep);
 *     }
 * });
 *
 * // Or use data attributes:
 * <div data-fj-booking>
 *     <div data-booking-step="1">...</div>
 *     <div data-booking-step="2">...</div>
 *     <div data-booking-step="3">...</div>
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
        /** Storage key for booking data */
        storageKey: 'fj_booking_data',

        /** Default booking steps */
        steps: ['describe', 'select', 'confirm'],

        /** Step labels (Meituan-style) */
        stepLabels: {
            describe: 'Beschreibung',
            select: 'Handwerker',
            confirm: 'Buchung',
        },

        /** Step icons */
        stepIcons: {
            describe: 'fa-edit',
            select: 'fa-user-check',
            confirm: 'fa-check-circle',
        },

        /** Enable debug logging */
        debug: false,

        /** Auto-save progress */
        autoSave: true,

        /** Save interval in milliseconds */
        saveInterval: 5000,

        /** Enable URL parameter persistence */
        urlPersistence: true,

        /** Meituan-style dense mode */
        denseMode: true,

        /** Show step progress bar */
        showProgress: true,

        /** Enable step navigation by clicking on steps */
        clickableSteps: true,

        /** Default payment methods */
        paymentMethods: [
            { id: 'credit_card', label: 'Kreditkarte', icon: 'fa-credit-card' },
            { id: 'paypal', label: 'PayPal', icon: 'fa-paypal' },
            { id: 'bank_transfer', label: 'Banküberweisung', icon: 'fa-university' },
            { id: 'sepa', label: 'SEPA-Lastschrift', icon: 'fa-euro-sign' },
            { id: 'invoice', label: 'Rechnung', icon: 'fa-file-invoice' },
        ],

        /** Service categories for project description */
        categories: [
            { id: 'montage', label: 'Montage & Möbel', icon: 'fa-couch' },
            { id: 'elektro', label: 'Elektro & Smart', icon: 'fa-bolt' },
            { id: 'sanitaer', label: 'Sanitär & Wasser', icon: 'fa-faucet-drip' },
            { id: 'garten', label: 'Garten & Outdoor', icon: 'fa-tree' },
            { id: 'demontage', label: 'Demontage & Umzug', icon: 'fa-tools' },
            { id: 'renovierung', label: 'Renovierung & Malerei', icon: 'fa-paint-roller' },
            { id: 'reinigung', label: 'Reinigung & Pflege', icon: 'fa-spray-can' },
            { id: 'premium', label: 'Premium Pro', icon: 'fa-crown' },
        ],

        /** Default booking data structure */
        defaultData: {
            step: 0,
            project: {
                category: '',
                title: '',
                description: '',
                address: '',
                location: '',
                date: '',
                time: '',
                urgency: 'normal', // 'normal', 'urgent', 'immediate'
                photos: [],
                budget: null,
            },
            handyman: {
                id: null,
                name: '',
                price: 0,
                rating: 0,
                reviewCount: 0,
                skills: [],
                availability: [],
            },
            payment: {
                method: 'invoice',
                total: 0,
                deposit: 0,
                discount: 0,
                tax: 0,
                finalTotal: 0,
            },
            user: {
                name: '',
                email: '',
                phone: '',
                notes: '',
            },
            confirmed: false,
            bookingId: null,
            createdAt: null,
        },
    };

    // ──────────────────────────────────────────────────────────────
    // 2. STATE
    // ──────────────────────────────────────────────────────────────

    /** Booking instances registry */
    const instances = new Map();

    /** Current booking data */
    let bookingData = { ...CONFIG.defaultData };

    /** Current step index */
    let currentStep = 0;

    /** Total number of steps */
    let totalSteps = CONFIG.steps.length;

    /** Is booking in progress */
    let isBooking = false;

    /** Auto-save timer */
    let saveTimer = null;

    /** Validation errors */
    let validationErrors = {};

    // ──────────────────────────────────────────────────────────────
    // 3. UTILITY FUNCTIONS
    // ──────────────────────────────────────────────────────────────

    /**
     * Log debug messages
     */
    function debugLog(...args) {
        if (CONFIG.debug) {
            console.log('[FJBooking]', ...args);
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
     * Generate a unique booking ID
     */
    function generateBookingId() {
        const prefix = 'B-';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return prefix + timestamp + random;
    }

    /**
     * Format currency
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
        }).format(amount);
    }

    /**
     * Format date
     */
    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }

    /**
     * Format time
     */
    function formatTime(time) {
        if (!time) return '';
        return time.substring(0, 5);
    }

    /**
     * Calculate days between dates
     */
    function daysBetween(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
     * Generate a unique ID
     */
    function generateId() {
        return 'fj-booking-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    }

    /**
     * Get URL parameters
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
    function setUrlParams(params) {
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
        window.history.replaceState({}, '', url.toString());
    }

    // ──────────────────────────────────────────────────────────────
    // 4. DATA PERSISTENCE
    // ──────────────────────────────────────────────────────────────

    /**
     * Save booking data to sessionStorage
     */
    function saveData(data) {
        try {
            const storageData = {
                data: data,
                timestamp: Date.now(),
                step: currentStep,
            };
            sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(storageData));
            debugLog('Data saved:', data);
        } catch (e) {
            console.warn('[FJBooking] Failed to save data:', e);
        }
    }

    /**
     * Load booking data from sessionStorage
     */
    function loadData() {
        try {
            const stored = sessionStorage.getItem(CONFIG.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.data) {
                    bookingData = deepMerge(CONFIG.defaultData, parsed.data);
                    if (parsed.step !== undefined) {
                        currentStep = parsed.step;
                    }
                    debugLog('Data loaded:', bookingData);
                    return bookingData;
                }
            }
        } catch (e) {
            console.warn('[FJBooking] Failed to load data:', e);
        }
        return null;
    }

    /**
     * Clear stored booking data
     */
    function clearData() {
        try {
            sessionStorage.removeItem(CONFIG.storageKey);
            debugLog('Data cleared');
        } catch (e) { /* ignore */ }
    }

    /**
     * Auto-save booking data
     */
    function autoSave() {
        if (CONFIG.autoSave && bookingData) {
            saveData(bookingData);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 5. VALIDATION
    // ──────────────────────────────────────────────────────────────

    /**
     * Validate a step
     */
    function validateStep(step) {
        const errors = {};
        const stepIndex = typeof step === 'number' ? step : CONFIG.steps.indexOf(step);

        switch (stepIndex) {
            case 0: // Describe
                if (!bookingData.project.category) {
                    errors.category = 'Bitte wählen Sie eine Kategorie aus.';
                }
                if (!bookingData.project.title || bookingData.project.title.length < 3) {
                    errors.title = 'Bitte geben Sie einen aussagekräftigen Titel ein (mindestens 3 Zeichen).';
                }
                if (!bookingData.project.description || bookingData.project.description.length < 10) {
                    errors.description = 'Bitte beschreiben Sie Ihr Projekt detaillierter (mindestens 10 Zeichen).';
                }
                if (!bookingData.project.address) {
                    errors.address = 'Bitte geben Sie die Adresse an.';
                }
                if (!bookingData.project.date) {
                    errors.date = 'Bitte wählen Sie ein Datum aus.';
                }
                break;

            case 1: // Select
                if (!bookingData.handyman.id) {
                    errors.handyman = 'Bitte wählen Sie einen Handwerker aus.';
                }
                break;

            case 2: // Confirm
                if (!bookingData.user.name || bookingData.user.name.length < 2) {
                    errors.name = 'Bitte geben Sie Ihren vollständigen Namen ein.';
                }
                if (!bookingData.user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.user.email)) {
                    errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
                }
                if (!bookingData.user.phone || bookingData.user.phone.length < 6) {
                    errors.phone = 'Bitte geben Sie Ihre Telefonnummer ein.';
                }
                if (!bookingData.payment.method) {
                    errors.payment = 'Bitte wählen Sie eine Zahlungsmethode aus.';
                }
                break;
        }

        validationErrors = errors;
        return Object.keys(errors).length === 0;
    }

    /**
     * Get validation errors for a step
     */
    function getStepErrors(step) {
        const stepIndex = typeof step === 'number' ? step : CONFIG.steps.indexOf(step);
        validateStep(stepIndex);
        return validationErrors;
    }

    /**
     * Validate all steps
     */
    function validateAll() {
        const allErrors = {};
        for (let i = 0; i < CONFIG.steps.length; i++) {
            const errors = getStepErrors(i);
            if (Object.keys(errors).length > 0) {
                allErrors[CONFIG.steps[i]] = errors;
            }
        }
        return allErrors;
    }

    // ──────────────────────────────────────────────────────────────
    // 6. PRICE CALCULATION
    // ──────────────────────────────────────────────────────────────

    /**
     * Calculate booking price
     */
    function calculatePrice() {
        let basePrice = bookingData.handyman.price || 0;
        let discount = 0;
        let tax = 0;
        let deposit = 0;

        // Urgency surcharge
        if (bookingData.project.urgency === 'urgent') {
            basePrice += basePrice * 0.15; // 15% surcharge
        } else if (bookingData.project.urgency === 'immediate') {
            basePrice += basePrice * 0.30; // 30% surcharge
        }

        // Premium discount (if user has premium)
        // This would come from user context

        // Deposit (20% of total)
        deposit = basePrice * 0.20;

        // Tax (19% VAT in Germany)
        tax = basePrice * 0.19;

        // Calculate final total
        const finalTotal = basePrice + tax - discount;

        bookingData.payment = {
            method: bookingData.payment.method || 'invoice',
            basePrice: basePrice,
            discount: discount,
            tax: tax,
            deposit: deposit,
            finalTotal: finalTotal,
        };

        return bookingData.payment;
    }

    // ──────────────────────────────────────────────────────────────
    // 7. BOOKING INSTANCE CLASS
    // ──────────────────────────────────────────────────────────────

    class BookingInstance {
        constructor(options) {
            this.id = options.id || generateId();
            this.container = options.container || document.body;
            this.steps = options.steps || CONFIG.steps;
            this.totalSteps = this.steps.length;

            this.callbacks = {
                onComplete: options.onComplete || null,
                onStepChange: options.onStepChange || null,
                onProgress: options.onProgress || null,
                onError: options.onError || null,
                onDataChange: options.onDataChange || null,
            };

            this.stepElements = {};
            this.stepContainers = {};

            this.isInitialized = false;

            // Load saved data
            if (CONFIG.autoSave) {
                const saved = loadData();
                if (saved) {
                    // Restore step from saved data
                }
            }

            this.init();
        }

        init() {
            this.setupElements();
            this.setupEventListeners();
            this.renderProgress();
            this.goToStep(currentStep || 0);

            // Auto-save on interval
            if (CONFIG.autoSave && CONFIG.saveInterval > 0) {
                saveTimer = setInterval(() => {
                    this.save();
                }, CONFIG.saveInterval);
            }

            this.isInitialized = true;
            debugLog('Booking instance initialized:', this.id);
        }

        setupElements() {
            // Find step elements
            const container = this.container;

            // Find all step containers
            this.steps.forEach((step, index) => {
                const stepEl = container.querySelector(`[data-booking-step="${index + 1}"]`) ||
                    container.querySelector(`[data-booking-step="${step}"]`);
                if (stepEl) {
                    this.stepElements[step] = stepEl;
                    this.stepContainers[step] = stepEl;
                }
            });

            // Find navigation buttons
            this.navigation = {
                back: container.querySelector('[data-booking-back]'),
                next: container.querySelector('[data-booking-next]'),
                submit: container.querySelector('[data-booking-submit]'),
                cancel: container.querySelector('[data-booking-cancel]'),
                progress: container.querySelector('.fj-booking-progress'),
            };

            // Find form elements
            this.forms = {
                describe: container.querySelector('[data-booking-form="describe"]'),
                select: container.querySelector('[data-booking-form="select"]'),
                confirm: container.querySelector('[data-booking-form="confirm"]'),
            };
        }

        setupEventListeners() {
            const container = this.container;

            // ── Next button ──
            if (this.navigation.next) {
                this.navigation.next.addEventListener('click', () => {
                    this.nextStep();
                });
            }

            // ── Back button ──
            if (this.navigation.back) {
                this.navigation.back.addEventListener('click', () => {
                    this.previousStep();
                });
            }

            // ── Submit button ──
            if (this.navigation.submit) {
                this.navigation.submit.addEventListener('click', () => {
                    this.submit();
                });
            }

            // ── Cancel button ──
            if (this.navigation.cancel) {
                this.navigation.cancel.addEventListener('click', () => {
                    if (confirm('Möchten Sie den Buchungsvorgang abbrechen? Ihre Daten werden nicht gespeichert.')) {
                        this.cancel();
                    }
                });
            }

            // ── Step click (for navigation) ──
            if (CONFIG.clickableSteps) {
                const stepIndicators = container.querySelectorAll('[data-booking-step-indicator]');
                stepIndicators.forEach((el, index) => {
                    el.addEventListener('click', () => {
                        if (index <= currentStep) {
                            this.goToStep(index);
                        }
                    });
                });
            }

            // ── Form inputs ──
            container.querySelectorAll('input, textarea, select').forEach(input => {
                if (input.dataset.bookingField) {
                    input.addEventListener('change', () => {
                        this.updateField(input.dataset.bookingField, input.value);
                    });
                    input.addEventListener('input', debounce(() => {
                        this.updateField(input.dataset.bookingField, input.value);
                    }, 300));
                }
            });

            // ── Category selection ──
            container.querySelectorAll('[data-booking-category]').forEach(el => {
                el.addEventListener('click', () => {
                    const category = el.dataset.bookingCategory;
                    this.selectCategory(category);
                });
            });

            // ── Handyman selection ──
            container.querySelectorAll('[data-booking-handyman]').forEach(el => {
                el.addEventListener('click', () => {
                    const handymanId = el.dataset.bookingHandyman;
                    this.selectHandyman(handymanId);
                });
            });

            // ── Payment method ──
            container.querySelectorAll('[data-booking-payment]').forEach(el => {
                el.addEventListener('click', () => {
                    const method = el.dataset.bookingPayment;
                    this.selectPaymentMethod(method);
                });
            });

            // ── Urgency selection ──
            container.querySelectorAll('[data-booking-urgency]').forEach(el => {
                el.addEventListener('click', () => {
                    const urgency = el.dataset.bookingUrgency;
                    this.setUrgency(urgency);
                });
            });

            // ── Photo upload ──
            const photoInput = container.querySelector('[data-booking-photos]');
            if (photoInput) {
                photoInput.addEventListener('change', (e) => {
                    this.handlePhotoUpload(e.target.files);
                });
            }

            // ── URL parameters ──
            if (CONFIG.urlPersistence) {
                const params = getUrlParams();
                if (params.booking_id) {
                    // Load booking by ID
                    this.loadBooking(params.booking_id);
                }
            }
        }

        // ── Step Navigation ──

        /**
         * Go to a specific step
         */
        goToStep(step) {
            const stepIndex = typeof step === 'number' ? step : this.steps.indexOf(step);
            if (stepIndex < 0 || stepIndex >= this.totalSteps) return;

            // Validate current step before proceeding
            if (stepIndex > currentStep) {
                if (!validateStep(currentStep)) {
                    this.showErrors(validationErrors);
                    return;
                }
            }

            currentStep = stepIndex;
            this.renderSteps();
            this.renderProgress();
            this.updateNavigation();

            // Trigger callback
            if (this.callbacks.onStepChange) {
                this.callbacks.onStepChange(currentStep, this.steps[currentStep], bookingData);
            }

            // Auto-save
            this.save();

            // Scroll to top of container
            this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        /**
         * Go to the next step
         */
        nextStep() {
            if (currentStep < this.totalSteps - 1) {
                // Validate current step
                if (!validateStep(currentStep)) {
                    this.showErrors(validationErrors);
                    return;
                }
                this.goToStep(currentStep + 1);
            } else {
                this.submit();
            }
        }

        /**
         * Go to the previous step
         */
        previousStep() {
            if (currentStep > 0) {
                this.goToStep(currentStep - 1);
            }
        }

        /**
         * Render all steps (show/hide based on current step)
         */
        renderSteps() {
            this.steps.forEach((step, index) => {
                const el = this.stepContainers[step];
                if (el) {
                    el.style.display = index === currentStep ? 'block' : 'none';
                    el.setAttribute('aria-hidden', index !== currentStep);
                    el.classList.toggle('is-active', index === currentStep);
                }
            });

            // Update current step indicator
            const indicators = this.container.querySelectorAll('[data-booking-step-indicator]');
            indicators.forEach((el, index) => {
                el.classList.toggle('is-active', index === currentStep);
                el.classList.toggle('is-completed', index < currentStep);
                el.setAttribute('aria-current', index === currentStep ? 'step' : 'false');
            });
        }

        /**
         * Render progress bar
         */
        renderProgress() {
            const progressEl = this.navigation.progress;
            if (!progressEl) return;

            const progress = ((currentStep + 1) / this.totalSteps) * 100;
            const bar = progressEl.querySelector('.fj-progress-bar-fill');
            if (bar) {
                bar.style.width = progress + '%';
                bar.setAttribute('aria-valuenow', progress);
            }

            const label = progressEl.querySelector('.fj-progress-label');
            if (label) {
                const stepName = CONFIG.stepLabels[this.steps[currentStep]] || this.steps[currentStep];
                label.textContent = `${currentStep + 1} / ${this.totalSteps} · ${stepName}`;
            }

            // Trigger callback
            if (this.callbacks.onProgress) {
                this.callbacks.onProgress(progress, currentStep);
            }
        }

        /**
         * Update navigation buttons
         */
        updateNavigation() {
            const isFirst = currentStep === 0;
            const isLast = currentStep === this.totalSteps - 1;

            if (this.navigation.back) {
                this.navigation.back.style.display = isFirst ? 'none' : 'flex';
                this.navigation.back.disabled = isFirst;
            }

            if (this.navigation.next) {
                this.navigation.next.style.display = isLast ? 'none' : 'flex';
                this.navigation.next.disabled = false;
            }

            if (this.navigation.submit) {
                this.navigation.submit.style.display = isLast ? 'flex' : 'none';
                this.navigation.submit.disabled = false;
            }
        }

        /**
         * Show validation errors
         */
        showErrors(errors) {
            const container = this.container;
            const errorContainer = container.querySelector('.fj-booking-errors');

            if (!errorContainer) return;

            if (Object.keys(errors).length === 0) {
                errorContainer.style.display = 'none';
                errorContainer.innerHTML = '';
                return;
            }

            errorContainer.style.display = 'block';
            let html = '<div class="fj-booking-errors-list">';
            for (const [field, message] of Object.entries(errors)) {
                html += `
                    <div class="fj-booking-error-item" data-field="${field}">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>${escapeHtml(message)}</span>
                    </div>
                `;
                // Highlight the field
                const fieldEl = container.querySelector(`[data-booking-field="${field}"]`);
                if (fieldEl) {
                    fieldEl.classList.add('is-error');
                }
            }
            html += '</div>';
            errorContainer.innerHTML = html;

            // Clear errors on focus
            container.querySelectorAll('[data-booking-field]').forEach(el => {
                el.addEventListener('focus', () => {
                    el.classList.remove('is-error');
                    const field = el.dataset.bookingField;
                    const errorItem = errorContainer.querySelector(`[data-field="${field}"]`);
                    if (errorItem) {
                        errorItem.remove();
                    }
                    if (errorContainer.querySelectorAll('.fj-booking-error-item').length === 0) {
                        errorContainer.style.display = 'none';
                    }
                });
            });
        }

        // ── Data Management ──

        /**
         * Update a field in booking data
         */
        updateField(field, value) {
            const fieldParts = field.split('.');
            let target = bookingData;

            // Navigate to the target object
            for (let i = 0; i < fieldParts.length - 1; i++) {
                if (!target[fieldParts[i]]) {
                    target[fieldParts[i]] = {};
                }
                target = target[fieldParts[i]];
            }

            const lastKey = fieldParts[fieldParts.length - 1];
            target[lastKey] = value;

            // Recalculate price if needed
            if (field === 'handyman.price' || field === 'project.urgency') {
                calculatePrice();
            }

            // Trigger callback
            if (this.callbacks.onDataChange) {
                this.callbacks.onDataChange(field, value, bookingData);
            }

            // Auto-save
            this.save();
        }

        /**
         * Select a category
         */
        selectCategory(categoryId) {
            const category = CONFIG.categories.find(c => c.id === categoryId);
            if (!category) return;

            bookingData.project.category = categoryId;
            this.updateField('project.category', categoryId);

            // Update UI
            const container = this.container;
            container.querySelectorAll('[data-booking-category]').forEach(el => {
                el.classList.toggle('is-active', el.dataset.bookingCategory === categoryId);
            });

            // Also update title if empty
            if (!bookingData.project.title) {
                this.updateField('project.title', category.label + ' - ' + bookingData.project.title);
            }
        }

        /**
         * Select a handyman
         */
        selectHandyman(handymanId) {
            // In a real app, this would fetch handyman data from an API
            // For demo, we'll use mock data
            const mockHandymen = {
                'raphael': {
                    id: 'raphael',
                    name: 'Raphael Lezius',
                    price: 1200,
                    rating: 5.0,
                    reviewCount: 124,
                    skills: ['USM Haller', 'Küchenmontage', 'Akustik'],
                    availability: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
                    avatar: 'RL',
                    premium: true,
                },
                'jaffar': {
                    id: 'jaffar',
                    name: 'Jaffar Shariff',
                    price: 950,
                    rating: 4.9,
                    reviewCount: 85,
                    skills: ['KNX', 'Smart Home', 'Beleuchtung'],
                    availability: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
                    avatar: 'JS',
                    premium: false,
                },
                'michael': {
                    id: 'michael',
                    name: 'Michael Weber',
                    price: 650,
                    rating: 4.8,
                    reviewCount: 62,
                    skills: ['Sanitär', 'Heizung', 'Reparatur'],
                    availability: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
                    avatar: 'MW',
                    premium: false,
                },
                'anna': {
                    id: 'anna',
                    name: 'Anna Schmidt',
                    price: 480,
                    rating: 4.9,
                    reviewCount: 43,
                    skills: ['Malerei', 'Tapete', 'Restaurierung'],
                    availability: ['Di', 'Mi', 'Do', 'Fr', 'Sa'],
                    avatar: 'AS',
                    premium: true,
                },
            };

            const handyman = mockHandymen[handymanId];
            if (!handyman) return;

            bookingData.handyman = {
                id: handyman.id,
                name: handyman.name,
                price: handyman.price,
                rating: handyman.rating,
                reviewCount: handyman.reviewCount,
                skills: handyman.skills,
                availability: handyman.availability,
                avatar: handyman.avatar,
                premium: handyman.premium,
            };

            // Calculate price
            calculatePrice();

            // Update UI
            const container = this.container;
            container.querySelectorAll('[data-booking-handyman]').forEach(el => {
                el.classList.toggle('is-active', el.dataset.bookingHandyman === handymanId);
            });

            // Auto-save
            this.save();

            // Go to next step if handyman selected
            if (this.callbacks.onDataChange) {
                this.callbacks.onDataChange('handyman', handyman, bookingData);
            }
        }

        /**
         * Select a payment method
         */
        selectPaymentMethod(methodId) {
            bookingData.payment.method = methodId;
            this.updateField('payment.method', methodId);

            // Update UI
            const container = this.container;
            container.querySelectorAll('[data-booking-payment]').forEach(el => {
                el.classList.toggle('is-active', el.dataset.bookingPayment === methodId);
            });
        }

        /**
         * Set urgency level
         */
        setUrgency(urgency) {
            bookingData.project.urgency = urgency;
            this.updateField('project.urgency', urgency);

            // Calculate price with urgency surcharge
            calculatePrice();

            // Update UI
            const container = this.container;
            container.querySelectorAll('[data-booking-urgency]').forEach(el => {
                el.classList.toggle('is-active', el.dataset.bookingUrgency === urgency);
            });
        }

        /**
         * Handle photo upload
         */
        handlePhotoUpload(files) {
            const photos = bookingData.project.photos || [];
            const maxPhotos = 5;

            for (const file of files) {
                if (photos.length >= maxPhotos) {
                    alert('Sie können maximal 5 Fotos hochladen.');
                    break;
                }
                // In a real app, upload to server
                const reader = new FileReader();
                reader.onload = (e) => {
                    photos.push(e.target.result);
                    this.updateField('project.photos', photos);
                    this.renderPhotos();
                };
                reader.readAsDataURL(file);
            }
        }

        /**
         * Render uploaded photos
         */
        renderPhotos() {
            const container = this.container;
            const photoContainer = container.querySelector('.fj-booking-photos');
            if (!photoContainer) return;

            const photos = bookingData.project.photos || [];

            if (photos.length === 0) {
                photoContainer.innerHTML = `
                    <div class="fj-booking-photos-empty">
                        <i class="fas fa-camera"></i>
                        <span>Keine Fotos hochgeladen</span>
                    </div>
                `;
                return;
            }

            let html = '';
            photos.forEach((photo, index) => {
                html += `
                    <div class="fj-booking-photo-item">
                        <img src="${escapeHtml(photo)}" alt="Projektfoto ${index + 1}" />
                        <button class="fj-booking-photo-remove" data-photo-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            });

            photoContainer.innerHTML = html;

            // Add remove handlers
            photoContainer.querySelectorAll('.fj-booking-photo-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.dataset.photoIndex);
                    const photos = bookingData.project.photos || [];
                    photos.splice(index, 1);
                    this.updateField('project.photos', photos);
                    this.renderPhotos();
                });
            });
        }

        /**
         * Save current booking data
         */
        save() {
            saveData(bookingData);
        }

        /**
         * Load a booking by ID
         */
        loadBooking(bookingId) {
            // In a real app, this would fetch from an API
            debugLog('Loading booking:', bookingId);
            // For demo, we'll just set the ID
            bookingData.bookingId = bookingId;
            this.save();
        }

        // ── Submission ──

        /**
         * Submit the booking
         */
        submit() {
            // Validate all steps
            const allErrors = validateAll();
            if (Object.keys(allErrors).length > 0) {
                this.showErrors(allErrors);
                return;
            }

            if (isBooking) return;
            isBooking = true;

            // Disable submit button
            if (this.navigation.submit) {
                this.navigation.submit.disabled = true;
                this.navigation.submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gebucht...';
            }

            // Generate booking ID
            bookingData.bookingId = generateBookingId();
            bookingData.createdAt = new Date().toISOString();
            bookingData.confirmed = true;

            // Calculate final price
            calculatePrice();

            // Simulate API call
            setTimeout(() => {
                isBooking = false;

                // Trigger callback
                if (this.callbacks.onComplete) {
                    this.callbacks.onComplete(bookingData);
                }

                // Show success state
                this.showSuccess();

                // Save final data
                this.save();

                debugLog('Booking completed:', bookingData);
            }, 1500);
        }

        /**
         * Show success state
         */
        showSuccess() {
            const container = this.container;

            // Hide all steps
            this.steps.forEach(step => {
                const el = this.stepContainers[step];
                if (el) el.style.display = 'none';
            });

            // Show success message
            const successEl = container.querySelector('.fj-booking-success') ||
                container.querySelector('[data-booking-success]');

            if (successEl) {
                successEl.style.display = 'block';
                successEl.innerHTML = `
                    <div class="fj-booking-success-content">
                        <div class="fj-booking-success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>Buchung erfolgreich!</h3>
                        <p>Ihre Buchungsnummer: <strong>${bookingData.bookingId}</strong></p>
                        <p>Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details.</p>
                        <div class="fj-booking-success-actions">
                            <a href="client/dashboard.html" class="fj-btn fj-btn-primary">
                                <i class="fas fa-tachometer-alt"></i> Zum Dashboard
                            </a>
                            <a href="index.html" class="fj-btn fj-btn-secondary">
                                <i class="fas fa-home"></i> Zur Startseite
                            </a>
                        </div>
                    </div>
                `;
            }

            // Update progress bar to 100%
            const progressEl = this.navigation.progress;
            if (progressEl) {
                const bar = progressEl.querySelector('.fj-progress-bar-fill');
                if (bar) {
                    bar.style.width = '100%';
                }
                const label = progressEl.querySelector('.fj-progress-label');
                if (label) {
                    label.textContent = '✓ Buchung abgeschlossen';
                }
            }

            // Hide navigation
            if (this.navigation.back) this.navigation.back.style.display = 'none';
            if (this.navigation.next) this.navigation.next.style.display = 'none';
            if (this.navigation.submit) this.navigation.submit.style.display = 'none';
            if (this.navigation.cancel) this.navigation.cancel.style.display = 'none';
        }

        /**
         * Cancel the booking
         */
        cancel() {
            clearData();
            bookingData = { ...CONFIG.defaultData };
            currentStep = 0;
            this.renderSteps();
            this.renderProgress();
            this.updateNavigation();
            this.container.querySelectorAll('.is-error').forEach(el => {
                el.classList.remove('is-error');
            });

            // Hide success message
            const successEl = this.container.querySelector('.fj-booking-success');
            if (successEl) {
                successEl.style.display = 'none';
            }

            // Show first step
            this.goToStep(0);

            if (this.callbacks.onError) {
                this.callbacks.onError('Booking cancelled by user');
            }
        }

        /**
         * Get current booking data
         */
        getData() {
            return { ...bookingData };
        }

        /**
         * Get current step
         */
        getStep() {
            return currentStep;
        }

        /**
         * Get step name
         */
        getStepName() {
            return this.steps[currentStep] || '';
        }

        /**
         * Check if booking is complete
         */
        isComplete() {
            return bookingData.confirmed === true;
        }

        /**
         * Destroy the instance
         */
        destroy() {
            if (saveTimer) {
                clearInterval(saveTimer);
                saveTimer = null;
            }
            instances.delete(this.id);
            debugLog('Booking instance destroyed:', this.id);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 8. FACTORY & INITIALIZATION
    // ──────────────────────────────────────────────────────────────

    /**
     * Create a booking instance
     */
    function createBooking(options) {
        const instance = new BookingInstance(options);
        instances.set(instance.id, instance);
        return instance;
    }

    /**
     * Initialize booking on a container
     */
    function init(options) {
        const container = typeof options === 'string' ?
            document.querySelector(options) :
            options.container || options;

        if (!container) {
            console.error('[FJBooking] Container not found');
            return null;
        }

        const existing = instances.get(container.dataset.fjBookingId);
        if (existing) {
            debugLog('Booking already initialized on container');
            return existing;
        }

        const bookingOptions = {
            container: container,
            steps: options.steps || CONFIG.steps,
            onComplete: options.onComplete || null,
            onStepChange: options.onStepChange || null,
            onProgress: options.onProgress || null,
            onError: options.onError || null,
            onDataChange: options.onDataChange || null,
            id: options.id || container.dataset.fjBookingId || generateId(),
        };

        container.dataset.fjBookingId = bookingOptions.id;

        const instance = new BookingInstance(bookingOptions);

        // Apply dense mode
        if (CONFIG.denseMode) {
            container.classList.add('fj-booking-dense');
        }

        return instance;
    }

    /**
     * Get a booking instance
     */
    function getInstance(id) {
        if (typeof id === 'string') {
            return instances.get(id) || null;
        }
        if (id && id.nodeType) {
            const bookingId = id.dataset.fjBookingId;
            return bookingId ? instances.get(bookingId) : null;
        }
        return null;
    }

    /**
     * Destroy a booking instance
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
     * Configure the booking system
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
     * Get booking data
     */
    function getBookingData() {
        return { ...bookingData };
    }

    /**
     * Reset booking data
     */
    function resetBooking() {
        bookingData = { ...CONFIG.defaultData };
        currentStep = 0;
        clearData();
        debugLog('Booking data reset');
        return bookingData;
    }

    // ──────────────────────────────────────────────────────────────
    // 9. AUTO-INITIALIZATION
    // ──────────────────────────────────────────────────────────────

    /**
     * Auto-initialize all booking components on the page
     */
    function autoInit() {
        const bookingComponents = document.querySelectorAll('[data-fj-booking]');
        bookingComponents.forEach(container => {
            if (container.dataset.fjBookingId) return;

            const options = {
                container: container,
                steps: container.dataset.fjBookingSteps ?
                    container.dataset.fjBookingSteps.split(',') :
                    CONFIG.steps,
            };

            init(options);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    // ──────────────────────────────────────────────────────────────
    // 10. PUBLIC API
    // ──────────────────────────────────────────────────────────────

    const FJBooking = {
        // Core
        init: init,
        create: createBooking,
        getInstance: getInstance,
        destroy: destroy,

        // Configuration
        configure: configure,
        getConfig: getConfig,

        // Data
        getData: getBookingData,
        reset: resetBooking,

        // Utilities
        validate: validateStep,
        validateAll: validateAll,
        calculatePrice: calculatePrice,

        // Step management
        goToStep: (step) => { currentStep = step; },
        nextStep: () => { currentStep = Math.min(currentStep + 1, CONFIG.steps.length - 1); },
        previousStep: () => { currentStep = Math.max(currentStep - 1, 0); },

        // Categories
        getCategories: () => [...CONFIG.categories],

        // Payment methods
        getPaymentMethods: () => [...CONFIG.paymentMethods],

        // Version
        version: '1.0.0',

        // Debug
        debug: CONFIG.debug,
    };

    // ──────────────────────────────────────────────────────────────
    // 11. EXPOSE TO GLOBAL
    // ──────────────────────────────────────────────────────────────

    global.FJBooking = FJBooking;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = FJBooking;
    }

    // ──────────────────────────────────────────────────────────────
    // 12. MEITUAN-STYLE CONSOLE BANNER
    // ──────────────────────────────────────────────────────────────

    console.log('%c📋 FIXJORI Booking Engine v' + FJBooking.version,
        'font-size:16px;font-weight:bold;color:#0D9488;');

    console.log('%c📊 Meituan-Style · Dense · Information-Rich · 3-Step Flow',
        'font-size:12px;color:#94A3B8;');

    console.log('%c⚡ ' + (CONFIG.autoSave ? 'Auto-Save ON' : 'Auto-Save OFF') +
        ' | ' + (CONFIG.urlPersistence ? 'URL Persistence ON' : 'URL Persistence OFF') +
        ' | ' + (CONFIG.clickableSteps ? 'Clickable Steps ON' : 'Clickable Steps OFF'),
        'font-size:11px;color:#64748B;');

    debugLog('Booking engine ready. Use FJBooking.init() to start a booking flow.');

    // ──────────────────────────────────────────────────────────────
    // END OF BOOKING
    // ──────────────────────────────────────────────────────────────

})(typeof window !== 'undefined' ? window : this);