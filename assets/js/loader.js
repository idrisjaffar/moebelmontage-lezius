/**
 * ============================================================
 * FIXJORI | COMPONENT LOADER V1.0
 * Meituan-Style · Dense · Information-Rich · Production-Ready
 * ============================================================
 *
 * This module provides a robust component loading system for
 * the FIXJORI platform. It handles:
 * - Dynamic HTML component loading
 * - Caching with localStorage
 * - Dependency management
 * - Error handling with fallbacks
 * - Component re-initialization
 * - Progress tracking
 * - SSR compatibility
 * - and more...
 *
 * ============================================================
 * USAGE:
 * ============================================================
 *
 * // Load a single component
 * FJLoader.load('nav', 'components/nav.html', '#nav-placeholder');
 *
 * // Load multiple components
 * FJLoader.loadAll([
 *     { id: 'nav', path: 'components/nav.html', target: '#nav-placeholder' },
 *     { id: 'footer', path: 'components/footer.html', target: '#footer-placeholder' },
 * ]);
 *
 * // Load with options
 * FJLoader.load('search', 'components/search.html', '#search-placeholder', {
 *     cache: true,
 *     timeout: 5000,
 *     onSuccess: function() { console.log('Loaded!'); },
 *     onError: function(err) { console.error(err); }
 * });
 *
 * ============================================================
 */

(function(global) {
    'use strict';

    // ──────────────────────────────────────────────────────────────
    // 1. CONFIGURATION
    // ──────────────────────────────────────────────────────────────

    const CONFIG = {
        /** Default cache TTL in milliseconds (5 minutes) */
        cacheTTL: 5 * 60 * 1000,

        /** Component path prefix */
        basePath: 'components/',

        /** Default timeout for fetch requests (10 seconds) */
        timeout: 10000,

        /** Enable localStorage caching */
        enableCache: true,

        /** Enable debug logging */
        debug: false,

        /** Retry attempts for failed loads */
        retries: 2,

        /** Retry delay in milliseconds */
        retryDelay: 500,

        /** Component script re-initialization delay */
        initDelay: 50,
    };

    // ──────────────────────────────────────────────────────────────
    // 2. STATE
    // ──────────────────────────────────────────────────────────────

    /** Registered component cache */
    const componentCache = new Map();

    /** Currently loading components */
    const loadingPromises = new Map();

    /** Loaded components registry */
    const loadedComponents = new Set();

    /** Component event listeners */
    const eventListeners = new Map();

    // ──────────────────────────────────────────────────────────────
    // 3. UTILITY FUNCTIONS
    // ──────────────────────────────────────────────────────────────

    /**
     * Log debug messages
     */
    function debugLog(...args) {
        if (CONFIG.debug) {
            console.log('[FJLoader]', ...args);
        }
    }

    /**
     * Generate a cache key from a path
     */
    function getCacheKey(path) {
        return 'fj_loader_' + btoa(encodeURIComponent(path)).replace(/[^a-zA-Z0-9]/g, '');
    }

    /**
     * Get a component from localStorage cache
     */
    function getFromCache(path) {
        if (!CONFIG.enableCache) return null;

        try {
            const key = getCacheKey(path);
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const data = JSON.parse(cached);
            const now = Date.now();

            // Check TTL
            if (data.timestamp && (now - data.timestamp) > CONFIG.cacheTTL) {
                localStorage.removeItem(key);
                return null;
            }

            return data.html;
        } catch (e) {
            return null;
        }
    }

    /**
     * Store a component in localStorage cache
     */
    function storeInCache(path, html) {
        if (!CONFIG.enableCache) return;

        try {
            const key = getCacheKey(path);
            localStorage.setItem(key, JSON.stringify({
                html: html,
                timestamp: Date.now(),
                path: path,
            }));
        } catch (e) {
            // Ignore cache errors (storage full, etc.)
        }
    }

    /**
     * Invalidate cache for a specific component
     */
    function invalidateCache(path) {
        if (!CONFIG.enableCache) return;

        try {
            const key = getCacheKey(path);
            localStorage.removeItem(key);
            debugLog('Cache invalidated for:', path);
        } catch (e) { /* ignore */ }
    }

    /**
     * Clear all component caches
     */
    function clearAllCache() {
        if (!CONFIG.enableCache) return;

        try {
            const keys = Object.keys(localStorage);
            keys.forEach(function(key) {
                if (key.startsWith('fj_loader_')) {
                    localStorage.removeItem(key);
                }
            });
            debugLog('All cache cleared');
        } catch (e) { /* ignore */ }
    }

    /**
     * Create a DOM element from HTML string
     */
    function htmlToElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }

    /**
     * Extract scripts from HTML
     */
    function extractScripts(html) {
        const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
        const scripts = [];
        let match;

        // Remove script tags from HTML and collect them
        let cleanHtml = html;
        while ((match = scriptRegex.exec(html)) !== null) {
            const scriptContent = match[1].trim();
            if (scriptContent) {
                scripts.push(scriptContent);
            }
            cleanHtml = cleanHtml.replace(match[0], '');
        }

        return { html: cleanHtml, scripts: scripts };
    }

    /**
     * Execute scripts in sequence
     */
    function executeScripts(scripts, context) {
        return new Promise(function(resolve) {
            if (scripts.length === 0) {
                resolve();
                return;
            }

            // Create a container for script execution
            const container = context || document;

            scripts.forEach(function(scriptContent) {
                try {
                    // Use Function constructor for better isolation
                    const func = new Function(scriptContent);
                    func.call(container);
                } catch (e) {
                    console.error('[FJLoader] Script execution error:', e);
                }
            });

            resolve();
        });
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
     * Debounce function
     */
    function debounce(fn, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                fn.apply(this, args);
            }, delay);
        };
    }

    // ──────────────────────────────────────────────────────────────
    // 4. CORE LOADER FUNCTIONS
    // ──────────────────────────────────────────────────────────────

    /**
     * Load a single component
     *
     * @param {string} id - Unique component identifier
     * @param {string} path - Path to the component HTML file
     * @param {string|Element} target - Target selector or element
     * @param {Object} options - Configuration options
     * @returns {Promise<Object>} - Load result
     */
    function loadComponent(id, path, target, options) {
        const opts = deepMerge({
            cache: CONFIG.enableCache,
            timeout: CONFIG.timeout,
            retries: CONFIG.retries,
            retryDelay: CONFIG.retryDelay,
            onSuccess: null,
            onError: null,
            onProgress: null,
            injectScripts: true,
            clearTarget: true,
            preserveChildren: false,
        }, options || {});

        // Check if component is already loading
        if (loadingPromises.has(id)) {
            debugLog('Component already loading:', id);
            return loadingPromises.get(id);
        }

        // Check if component is already loaded
        if (loadedComponents.has(id) && !opts.force) {
            debugLog('Component already loaded:', id);
            return Promise.resolve({
                id: id,
                status: 'cached',
                element: document.querySelector(target),
            });
        }

        // Resolve target element
        let targetEl = target;
        if (typeof target === 'string') {
            targetEl = document.querySelector(target);
        }

        if (!targetEl) {
            const error = new Error('Target element not found: ' + target);
            debugLog(error.message);
            if (opts.onError) opts.onError(error);
            return Promise.reject(error);
        }

        // Create the promise
        const promise = new Promise(function(resolve, reject) {
            // Track progress
            let progress = 0;

            function updateProgress(value) {
                progress = value;
                if (opts.onProgress) opts.onProgress(value, id);
            }

            updateProgress(10);

            // Check cache first
            let cachedHtml = null;
            if (opts.cache) {
                cachedHtml = getFromCache(path);
            }

            if (cachedHtml) {
                updateProgress(50);
                debugLog('Loading from cache:', path);
                renderComponent(id, path, cachedHtml, targetEl, opts, resolve, reject);
                return;
            }

            // Fetch from network with retries
            let attempt = 0;

            function fetchWithRetry() {
                attempt++;
                debugLog('Fetching component (attempt ' + attempt + '):', path);

                const controller = new AbortController();
                const timeoutId = setTimeout(function() {
                    controller.abort();
                }, opts.timeout);

                fetch(path, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'text/html',
                    },
                })
                    .then(function(response) {
                        clearTimeout(timeoutId);

                        if (!response.ok) {
                            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                        }

                        return response.text();
                    })
                    .then(function(html) {
                        updateProgress(70);

                        // Store in cache
                        if (opts.cache) {
                            storeInCache(path, html);
                        }

                        renderComponent(id, path, html, targetEl, opts, resolve, reject);
                    })
                    .catch(function(error) {
                        clearTimeout(timeoutId);

                        if (attempt < opts.retries) {
                            debugLog('Retrying in ' + opts.retryDelay + 'ms...');
                            setTimeout(fetchWithRetry, opts.retryDelay);
                            return;
                        }

                        // Final error
                        const err = new Error('Failed to load component: ' + path + ' - ' + error.message);
                        console.error('[FJLoader]', err.message);

                        if (opts.onError) opts.onError(err);
                        reject(err);
                    });
            }

            fetchWithRetry();
        });

        // Store the promise
        loadingPromises.set(id, promise);

        // Clean up after completion
        promise.finally(function() {
            loadingPromises.delete(id);
        });

        return promise;
    }

    /**
     * Render a component into the target element
     */
    function renderComponent(id, path, html, targetEl, opts, resolve, reject) {
        try {
            // Extract scripts
            const { html: cleanHtml, scripts } = extractScripts(html);

            // Clear or preserve target
            if (opts.clearTarget && !opts.preserveChildren) {
                targetEl.innerHTML = '';
            }

            // Append the HTML
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = cleanHtml;

            // Append children
            if (opts.preserveChildren) {
                // Append new content without replacing existing
                while (tempContainer.firstChild) {
                    targetEl.appendChild(tempContainer.firstChild);
                }
            } else {
                // Replace content
                targetEl.innerHTML = '';
                while (tempContainer.firstChild) {
                    targetEl.appendChild(tempContainer.firstChild);
                }
            }

            // Execute scripts
            if (opts.injectScripts && scripts.length > 0) {
                const context = targetEl.ownerDocument || document;
                // Use setTimeout to allow DOM to update
                setTimeout(function() {
                    executeScripts(scripts, context)
                        .then(function() {
                            finishLoad(id, path, targetEl, opts, resolve);
                        })
                        .catch(function(err) {
                            console.warn('[FJLoader] Script execution error:', err);
                            finishLoad(id, path, targetEl, opts, resolve);
                        });
                }, CONFIG.initDelay);
            } else {
                finishLoad(id, path, targetEl, opts, resolve);
            }
        } catch (error) {
            console.error('[FJLoader] Render error:', error);
            if (opts.onError) opts.onError(error);
            reject(error);
        }
    }

    /**
     * Finish the load process
     */
    function finishLoad(id, path, targetEl, opts, resolve) {
        // Mark as loaded
        loadedComponents.add(id);

        // Dispatch event
        const event = new CustomEvent('fj-component-loaded', {
            detail: {
                id: id,
                path: path,
                element: targetEl,
            },
        });
        document.dispatchEvent(event);

        debugLog('Component loaded:', id);

        if (opts.onSuccess) opts.onSuccess(targetEl, id);

        resolve({
            id: id,
            status: 'loaded',
            element: targetEl,
        });
    }

    // ──────────────────────────────────────────────────────────────
    // 5. BULK LOADING
    // ──────────────────────────────────────────────────────────────

    /**
     * Load multiple components
     *
     * @param {Array} components - Array of component configs
     * @param {Object} options - Global options
     * @returns {Promise<Array>} - Array of load results
     */
    function loadAll(components, options) {
        if (!Array.isArray(components) || components.length === 0) {
            return Promise.resolve([]);
        }

        const opts = options || {};

        // Track overall progress
        const total = components.length;
        let loaded = 0;
        const results = [];

        return new Promise(function(resolve, reject) {
            const promises = components.map(function(config, index) {
                const id = config.id || 'component-' + index;
                const path = config.path || config.src;
                const target = config.target || config.selector;
                const componentOpts = config.options || {};

                // Merge options
                const mergedOpts = deepMerge(opts, componentOpts);

                // Add progress tracking
                if (opts.onProgress) {
                    const originalProgress = mergedOpts.onProgress;
                    mergedOpts.onProgress = function(progress, compId) {
                        if (originalProgress) originalProgress(progress, compId);
                        // Update overall progress
                        const overallProgress = ((loaded + (progress / 100)) / total) * 100;
                        if (opts.onOverallProgress) {
                            opts.onOverallProgress(overallProgress);
                        }
                    };
                }

                return loadComponent(id, path, target, mergedOpts)
                    .then(function(result) {
                        loaded++;
                        if (opts.onOverallProgress) {
                            opts.onOverallProgress((loaded / total) * 100);
                        }
                        results.push(result);
                        return result;
                    })
                    .catch(function(error) {
                        loaded++;
                        if (opts.onError) opts.onError(error, config);
                        // Continue loading other components
                        results.push({ id: id, status: 'error', error: error });
                        return null;
                    });
            });

            Promise.all(promises)
                .then(function() {
                    resolve(results);
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    }

    /**
     * Load components based on data attributes
     */
    function loadFromAttributes(options) {
        const elements = document.querySelectorAll('[data-fj-component]');
        const components = [];

        elements.forEach(function(el) {
            const id = el.dataset.fjComponent || 'component-' + Date.now();
            const path = el.dataset.fjSrc || el.dataset.fjPath;
            const target = el.dataset.fjTarget || el;
            const cache = el.dataset.fjCache !== 'false';
            const timeout = parseInt(el.dataset.fjTimeout) || CONFIG.timeout;

            if (!path) {
                console.warn('[FJLoader] Missing path for component:', id);
                return;
            }

            components.push({
                id: id,
                path: path,
                target: target,
                options: {
                    cache: cache,
                    timeout: timeout,
                },
            });
        });

        if (components.length === 0) return Promise.resolve([]);

        return loadAll(components, options);
    }

    // ──────────────────────────────────────────────────────────────
    // 6. COMPONENT REGISTRATION
    // ──────────────────────────────────────────────────────────────

    /**
     * Register a component for later use
     */
    function registerComponent(id, config) {
        if (componentCache.has(id)) {
            debugLog('Component already registered:', id);
            return false;
        }

        componentCache.set(id, {
            id: id,
            path: config.path || config.src,
            target: config.target || config.selector,
            options: config.options || {},
            dependencies: config.dependencies || [],
            loaded: false,
        });

        debugLog('Component registered:', id);
        return true;
    }

    /**
     * Register multiple components
     */
    function registerComponents(components) {
        const results = [];
        for (const id in components) {
            if (components.hasOwnProperty(id)) {
                const registered = registerComponent(id, components[id]);
                results.push({ id: id, success: registered });
            }
        }
        return results;
    }

    /**
     * Load registered components (including dependencies)
     */
    function loadRegistered(ids) {
        const components = [];

        function collectDependencies(id, visited) {
            if (visited.has(id)) return;
            visited.add(id);

            const config = componentCache.get(id);
            if (!config) {
                debugLog('Component not found:', id);
                return;
            }

            // Load dependencies first
            config.dependencies.forEach(function(depId) {
                collectDependencies(depId, visited);
            });

            components.push({
                id: id,
                path: config.path,
                target: config.target,
                options: config.options,
            });
        }

        const visited = new Set();
        if (ids) {
            ids.forEach(function(id) {
                collectDependencies(id, visited);
            });
        } else {
            // Load all registered components
            componentCache.forEach(function(config, id) {
                collectDependencies(id, visited);
            });
        }

        if (components.length === 0) {
            return Promise.resolve([]);
        }

        return loadAll(components);
    }

    // ──────────────────────────────────────────────────────────────
    // 7. UTILITY FUNCTIONS
    // ──────────────────────────────────────────────────────────────

    /**
     * Check if a component is loaded
     */
    function isLoaded(id) {
        return loadedComponents.has(id);
    }

    /**
     * Get a loaded component's element
     */
    function getComponentElement(id) {
        const config = componentCache.get(id);
        if (!config) return null;

        const target = config.target;
        if (typeof target === 'string') {
            return document.querySelector(target);
        }
        return target || null;
    }

    /**
     * Reload a component
     */
    function reloadComponent(id, force) {
        const config = componentCache.get(id);
        if (!config) {
            debugLog('Component not registered:', id);
            return Promise.reject(new Error('Component not registered: ' + id));
        }

        // Clear cache if forced
        if (force) {
            invalidateCache(config.path);
        }

        // Remove from loaded set to force reload
        loadedComponents.delete(id);

        // Also clear any pending promises
        if (loadingPromises.has(id)) {
            loadingPromises.delete(id);
        }

        return loadComponent(id, config.path, config.target, config.options);
    }

    /**
     * Refresh all loaded components
     */
    function refreshAll() {
        const ids = Array.from(loadedComponents);
        const promises = ids.map(function(id) {
            return reloadComponent(id, true);
        });
        return Promise.all(promises);
    }

    /**
     * Get loader status
     */
    function getStatus() {
        return {
            loaded: Array.from(loadedComponents),
            loading: Array.from(loadingPromises.keys()),
            registered: Array.from(componentCache.keys()),
            cacheEnabled: CONFIG.enableCache,
            debug: CONFIG.debug,
        };
    }

    // ──────────────────────────────────────────────────────────────
    // 8. EVENT SYSTEM
    // ──────────────────────────────────────────────────────────────

    /**
     * Add event listener for component events
     */
    function on(event, callback) {
        if (!eventListeners.has(event)) {
            eventListeners.set(event, []);
        }
        eventListeners.get(event).push(callback);
        return function() {
            const listeners = eventListeners.get(event);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }

    /**
     * Trigger an event
     */
    function trigger(event, data) {
        const listeners = eventListeners.get(event);
        if (listeners) {
            listeners.forEach(function(callback) {
                try {
                    callback(data);
                } catch (e) {
                    console.error('[FJLoader] Event handler error:', e);
                }
            });
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 9. AUTO-INITIALIZATION
    // ──────────────────────────────────────────────────────────────

    /**
     * Initialize the loader
     */
    function init(options) {
        if (options) {
            if (options.debug !== undefined) CONFIG.debug = options.debug;
            if (options.cache !== undefined) CONFIG.enableCache = options.cache;
            if (options.cacheTTL) CONFIG.cacheTTL = options.cacheTTL;
            if (options.timeout) CONFIG.timeout = options.timeout;
            if (options.retries !== undefined) CONFIG.retries = options.retries;
            if (options.basePath) CONFIG.basePath = options.basePath;
        }

        debugLog('Loader initialized with config:', CONFIG);

        // Auto-load from data attributes if enabled
        if (options && options.autoLoad !== false) {
            // Use requestIdleCallback or setTimeout
            const schedule = window.requestIdleCallback || window.setTimeout;
            schedule(function() {
                loadFromAttributes()
                    .then(function() {
                        debugLog('Auto-load completed');
                    })
                    .catch(function(err) {
                        console.warn('[FJLoader] Auto-load error:', err);
                    });
            }, 100);
        }

        // Dispatch init event
        document.dispatchEvent(new CustomEvent('fj-loader-ready', {
            detail: { config: CONFIG }
        }));

        return this;
    }

    // ──────────────────────────────────────────────────────────────
    // 10. PUBLIC API
    // ──────────────────────────────────────────────────────────────

    const FJLoader = {
        // Core loading
        load: loadComponent,
        loadAll: loadAll,
        loadFromAttributes: loadFromAttributes,

        // Registration
        register: registerComponent,
        registerAll: registerComponents,
        loadRegistered: loadRegistered,

        // Utility
        isLoaded: isLoaded,
        getElement: getComponentElement,
        reload: reloadComponent,
        refreshAll: refreshAll,
        getStatus: getStatus,

        // Cache management
        invalidateCache: invalidateCache,
        clearCache: clearAllCache,

        // Events
        on: on,
        trigger: trigger,

        // Initialization
        init: init,

        // Configuration
        config: function(key, value) {
            if (value !== undefined && typeof value !== 'undefined') {
                if (key === 'debug') CONFIG.debug = value;
                else if (key === 'cache') CONFIG.enableCache = value;
                else if (key === 'cacheTTL') CONFIG.cacheTTL = value;
                else if (key === 'timeout') CONFIG.timeout = value;
                else if (key === 'retries') CONFIG.retries = value;
                else if (key === 'basePath') CONFIG.basePath = value;
            }
            return CONFIG[key];
        },

        // Version
        version: '1.0.0',

        // Debug flag for external use
        debug: CONFIG.debug,
    };

    // ──────────────────────────────────────────────────────────────
    // 11. EXPOSE TO GLOBAL
    // ──────────────────────────────────────────────────────────────

    // Expose to global scope
    global.FJLoader = FJLoader;

    // Also support AMD/CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = FJLoader;
    }

    // ──────────────────────────────────────────────────────────────
    // 12. AUTO-INIT (if DOM is ready)
    // ──────────────────────────────────────────────────────────────

    // Auto-initialize on DOM ready
    function autoInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                // Check if auto-init is enabled via meta tag
                const meta = document.querySelector('meta[name="fj-loader-auto"]');
                const enabled = meta ? meta.getAttribute('content') !== 'false' : true;

                if (enabled) {
                    FJLoader.init({ autoLoad: true });
                }
            });
        } else {
            // DOM already ready
            const meta = document.querySelector('meta[name="fj-loader-auto"]');
            const enabled = meta ? meta.getAttribute('content') !== 'false' : true;

            if (enabled) {
                FJLoader.init({ autoLoad: true });
            }
        }
    }

    autoInit();

    // ──────────────────────────────────────────────────────────────
    // 13. MEITUAN-STYLE PROGRESS INDICATOR
    // ──────────────────────────────────────────────────────────────

    /**
     * Create a progress indicator for component loading
     * (Meituan-style dense progress bar)
     */
    FJLoader.createProgressIndicator = function(options) {
        const opts = deepMerge({
            container: document.body,
            position: 'top', // 'top' | 'bottom' | 'fixed'
            height: '3px',
            color: 'var(--fj-teal)',
            backgroundColor: 'var(--fj-border)',
            showPercentage: false,
            showLabel: false,
            label: 'Loading...',
            zIndex: 99999,
        }, options || {});

        // Create container
        const wrapper = document.createElement('div');
        wrapper.className = 'fj-loader-progress fj-loader-progress--' + opts.position;
        Object.assign(wrapper.style, {
            position: opts.position === 'fixed' ? 'fixed' : 'relative',
            top: opts.position === 'top' || opts.position === 'fixed' ? '0' : 'auto',
            bottom: opts.position === 'bottom' ? '0' : 'auto',
            left: '0',
            right: '0',
            height: opts.height,
            background: opts.backgroundColor,
            overflow: 'hidden',
            zIndex: opts.zIndex,
            transition: 'opacity 0.3s ease',
            opacity: '0',
        });

        // Create progress bar
        const bar = document.createElement('div');
        Object.assign(bar.style, {
            height: '100%',
            width: '0%',
            background: opts.color,
            transition: 'width 0.4s var(--fj-ease-smooth)',
            borderRadius: '2px',
        });
        wrapper.appendChild(bar);

        // Create label if needed
        let labelEl = null;
        if (opts.showLabel || opts.showPercentage) {
            labelEl = document.createElement('span');
            Object.assign(labelEl.style, {
                position: 'absolute',
                top: '50%',
                right: '8px',
                transform: 'translateY(-50%)',
                fontFamily: 'var(--fj-font-family-mono)',
                fontSize: 'var(--fj-font-size-xs)',
                color: 'var(--fj-dim)',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                opacity: '0.7',
            });
            labelEl.textContent = opts.showLabel ? opts.label : '';
            wrapper.appendChild(labelEl);
        }

        // Add to container
        opts.container.appendChild(wrapper);

        // State
        let currentProgress = 0;
        let isComplete = false;

        // Public API
        const indicator = {
            /**
             * Update progress
             */
            update: function(progress) {
                if (isComplete) return;

                currentProgress = Math.min(Math.max(progress, 0), 100);
                bar.style.width = currentProgress + '%';

                if (labelEl) {
                    if (opts.showPercentage) {
                        labelEl.textContent = Math.round(currentProgress) + '%';
                    }
                }

                // Show if progress > 0
                if (currentProgress > 0 && wrapper.style.opacity !== '1') {
                    wrapper.style.opacity = '1';
                }

                // Hide when complete
                if (currentProgress >= 100) {
                    indicator.complete();
                }

                return indicator;
            },

            /**
             * Mark as complete and hide
             */
            complete: function() {
                isComplete = true;
                bar.style.width = '100%';

                if (labelEl && opts.showPercentage) {
                    labelEl.textContent = '✓ 100%';
                }

                // Fade out after a moment
                setTimeout(function() {
                    wrapper.style.opacity = '0';
                    setTimeout(function() {
                        bar.style.width = '0%';
                        if (labelEl && opts.showPercentage) {
                            labelEl.textContent = '';
                        }
                    }, 300);
                }, 500);

                return indicator;
            },

            /**
             * Show a loading label
             */
            setLabel: function(text) {
                if (labelEl && opts.showLabel) {
                    labelEl.textContent = text;
                }
                return indicator;
            },

            /**
             * Destroy the indicator
             */
            destroy: function() {
                if (wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
            },
        };

        return indicator;
    };

    // ──────────────────────────────────────────────────────────────
    // 14. COMPONENT LOADER WITH PROGRESS (Meituan-style)
    // ──────────────────────────────────────────────────────────────

    /**
     * Load components with a progress indicator
     * (Meituan-style dense progress tracking)
     */
    FJLoader.loadWithProgress = function(components, progressOptions, loadOptions) {
        const indicator = FJLoader.createProgressIndicator(progressOptions);

        let lastProgress = 0;

        const options = deepMerge({
            onOverallProgress: function(progress) {
                // Smooth the progress
                const smoothed = Math.min(progress, lastProgress + 2);
                lastProgress = smoothed;
                indicator.update(smoothed);
            },
            onError: function(error) {
                indicator.setLabel('❌ Fehler: ' + error.message);
                setTimeout(function() {
                    indicator.destroy();
                }, 3000);
            },
        }, loadOptions || {});

        return FJLoader.loadAll(components, options)
            .then(function(results) {
                setTimeout(function() {
                    indicator.complete();
                    setTimeout(function() {
                        indicator.destroy();
                    }, 800);
                }, 300);
                return results;
            })
            .catch(function(error) {
                indicator.setLabel('❌ Fehler: ' + error.message);
                setTimeout(function() {
                    indicator.destroy();
                }, 3000);
                throw error;
            });
    };

    // ──────────────────────────────────────────────────────────────
    // 15. MEITUAN-STYLE DENSE LOADING
    // ──────────────────────────────────────────────────────────────

    /**
     * Dense loading with skeleton placeholders (Meituan-style)
     */
    FJLoader.denseLoad = function(id, path, target, options) {
        const opts = deepMerge({
            skeleton: true,
            skeletonClass: 'fj-skeleton',
            skeletonTemplate: null,
            showLoadingText: true,
            loadingText: 'Lade Komponente...',
        }, options || {});

        const targetEl = typeof target === 'string' ? document.querySelector(target) : target;

        if (!targetEl) {
            return FJLoader.load(id, path, target, opts);
        }

        // Show skeleton if enabled
        if (opts.skeleton) {
            let skeletonHtml = opts.skeletonTemplate;
            if (!skeletonHtml) {
                // Generate default skeleton
                skeletonHtml = `
                    <div class="fj-skeleton-card">
                        <div class="fj-skeleton fj-skeleton-avatar" style="margin-bottom:12px;"></div>
                        <div class="fj-skeleton fj-skeleton-text" style="width:60%;"></div>
                        <div class="fj-skeleton fj-skeleton-text" style="width:80%;"></div>
                        <div class="fj-skeleton fj-skeleton-text" style="width:40%;"></div>
                        <div style="display:flex;gap:8px;margin-top:12px;">
                            <div class="fj-skeleton fj-skeleton-text" style="width:30%;height:30px;"></div>
                            <div class="fj-skeleton fj-skeleton-text" style="width:20%;height:30px;"></div>
                        </div>
                    </div>
                `;
            }

            // Preserve existing content and show skeleton
            targetEl.innerHTML = skeletonHtml;
        } else if (opts.showLoadingText) {
            targetEl.innerHTML = `
                <div style="text-align:center;padding:20px;color:var(--fj-muted);">
                    <i class="fas fa-spinner fa-spin" style="font-size:1.2rem;display:block;margin-bottom:8px;"></i>
                    <span style="font-size:0.85rem;">${opts.loadingText}</span>
                </div>
            `;
        }

        return FJLoader.load(id, path, target, opts);
    };

    // ──────────────────────────────────────────────────────────────
    // 16. CONSOLE LOG (Meituan-style boot message)
    // ──────────────────────────────────────────────────────────────

    console.log('%c🔧 FIXJORI Component Loader v' + FJLoader.version,
        'font-size:16px;font-weight:bold;color:#0D9488;');

    console.log('%c📦 Meituan-Style · Dense · Information-Rich',
        'font-size:12px;color:#94A3B8;');

    console.log('%c⚡ ' + (CONFIG.enableCache ? 'Cache enabled' : 'Cache disabled') +
        ' | ' + (CONFIG.debug ? 'Debug mode' : 'Production mode'),
        'font-size:11px;color:#64748B;');

    debugLog('Loader ready. Use FJLoader.load() to load components.');

    // ──────────────────────────────────────────────────────────────
    // END OF LOADER
    // ──────────────────────────────────────────────────────────────

})(typeof window !== 'undefined' ? window : this);