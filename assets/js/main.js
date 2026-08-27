/**
 * ==============================================================================
 * RAPHAEL LEZIUS – PREMIUM ARCHITECTURE v9.0
 * 2026 Masterpiece JS – Built for GitHub Pages & Deeply Nested Architectures
 * ==============================================================================
 */

(function () {
    'use strict';

    // ============================================================
    // 1. CORE SYSTEM & CONFIGURATION
    // ============================================================
    const App = {
        config: {
            navPath: 'components/nav.html',
            footerPath: 'components/footer.html',
            themeKey: 'rl-theme',
            magneticDistance: 100,
            counterDuration: 2000,
        },
        state: {
            rootPath: '', // Will dynamically calculate the path to the root folder
            isMobile: window.matchMedia('(max-width: 900px)').matches,
            isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches,
            theme: 'dark'
        },
        elements: {}
    };

    // ============================================================
    // 2. BULLETPROOF PATH RESOLVER (The GitHub Pages Fix)
    // ============================================================
    /*
     * Because your pages are nested (e.g., /services/usm-haller.html), 
     * this function finds out exactly how many folders deep we are by looking 
     * at how the main.js file was loaded, ensuring fetch() and <a> tags never break.
     */
    function calculateRootPath() {
        const script = document.currentScript || document.querySelector('script[src*="main.js"]');
        if (script) {
            const src = script.getAttribute('src');
            // If src is "../assets/js/main.js", the rootPath becomes "../"
            App.state.rootPath = src.split('assets/js/main.js')[0];
        }
    }

    /* Fixes relative links inside loaded components (Nav/Footer) */
    function resolveComponentLinks(container) {
        container.querySelectorAll('a[href], img[src], video[src], source[src]').forEach(el => {
            const attr = el.hasAttribute('href') ? 'href' : 'src';
            const link = el.getAttribute(attr);
            
            // Skip anchors, absolute URLs, and mailto/tel
            if (!link || link.startsWith('#') || link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('/')) {
                return;
            }
            
            // Prepend the dynamic root path to fix the link
            el.setAttribute(attr, App.state.rootPath + link);
        });
    }

    // ============================================================
    // 3. COMPONENT LOADER (Nav & Footer)
    // ============================================================
    async function loadComponent(selector, filepath) {
        const container = document.querySelector(selector);
        if (!container) return;

        const url = App.state.rootPath + filepath;
        const cacheKey = `rl-cache-${filepath}`;

        // 1. Inject cached version instantly to prevent flashing
        const cachedHTML = localStorage.getItem(cacheKey);
        if (cachedHTML) {
            container.innerHTML = cachedHTML;
            resolveComponentLinks(container);
        }

        // 2. Fetch fresh version in the background
        try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Failed to load ${filepath}`);
            const html = await response.text();
            
            if (html.trim() !== cachedHTML) {
                container.innerHTML = html;
                localStorage.setItem(cacheKey, html);
                resolveComponentLinks(container);
            }
        } catch (error) {
            console.error(`[System] Loader Error:`, error);
        }
    }

    // ============================================================
    // 4. THEME ENGINE
    // ============================================================
    function initTheme() {
        const html = document.documentElement;
        const themeMeta = document.getElementById('themeColorMeta');

        function setTheme(theme) {
            App.state.theme = theme;
            html.setAttribute('data-theme', theme);
            localStorage.setItem(App.config.themeKey, theme);
            
            document.querySelectorAll('[data-theme-icon]').forEach(icon => {
                icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            });
            
            if (themeMeta) {
                themeMeta.content = theme === 'dark' ? '#0B0A09' : '#F9F7F2';
            }
        }

        // Determine Initial Theme
        const storedTheme = localStorage.getItem(App.config.themeKey);
        const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        setTheme(storedTheme || (systemPrefersLight ? 'light' : 'dark'));

        // Bind Toggle Buttons (Event Delegation for dynamically loaded navs)
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-theme-toggle]')) {
                setTheme(App.state.theme === 'dark' ? 'light' : 'dark');
            }
        });
    }

    // ============================================================
    // 5. NAVIGATION & SCROLL SYSTEMS
    // ============================================================
    function initNavigation() {
        const nav = document.querySelector('.rl-nav');
        const progress = document.getElementById('scrollProgress');
        const stickyCta = document.getElementById('stickyCta');
        const backTop = document.getElementById('backToTop');
        
        let lastScrollY = window.scrollY;

        function handleScroll() {
            const currentScroll = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            
            // 1. Scroll Progress Bar
            if (progress) {
                progress.style.width = docHeight > 0 ? `${(currentScroll / docHeight) * 100}%` : '0%';
            }

            // 2. Smart Nav Hide/Show
            if (nav) {
                if (currentScroll > 80) {
                    nav.classList.add('scrolled');
                    if (currentScroll > lastScrollY && currentScroll > 300) {
                        nav.style.transform = 'translateY(-100%)'; // Hide on scroll down
                    } else {
                        nav.style.transform = 'translateY(0)'; // Show on scroll up
                    }
                } else {
                    nav.classList.remove('scrolled');
                    nav.style.transform = 'translateY(0)';
                }
            }

            // 3. Floating Buttons
            const showFloats = currentScroll > 400;
            if (stickyCta) stickyCta.classList.toggle('visible', showFloats);
            if (backTop) backTop.classList.toggle('visible', showFloats);

            lastScrollY = currentScroll;
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Trigger on load

        // Back to Top functionality
        backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        // Mobile Menu Logic (Event Delegation)
        document.addEventListener('click', (e) => {
            const toggle = e.target.closest('.rl-nav__hamburger');
            const menu = document.getElementById('mobileMenu');
            
            if (toggle && menu) {
                const isOpen = menu.classList.toggle('open');
                toggle.setAttribute('aria-expanded', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            }

            // Close menu if clicking a link inside it
            if (e.target.closest('.mobile-link') && menu) {
                menu.classList.remove('open');
                document.body.style.overflow = '';
                document.querySelector('.rl-nav__hamburger')?.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ============================================================
    // 6. HIGH-PERFORMANCE INTERACTIONS (Cursor & Magnetics)
    // ============================================================
    function initInteractions() {
        if (App.state.isTouch) {
            // Hide custom cursors on touch devices
            document.querySelectorAll('.cursor-dot, .cursor-ring').forEach(el => el.style.display = 'none');
            return;
        }

        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

        // 1. Mouse Tracking
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (dot) {
                dot.style.transform = `translate3d(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%), 0)`;
            }

            // Magnetic Buttons Logic
            document.querySelectorAll('.magnetic-btn').forEach(btn => {
                const rect = btn.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = mouseX - cx;
                const dy = mouseY - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < App.config.magneticDistance) {
                    const pull = (App.config.magneticDistance - dist) / App.config.magneticDistance;
                    btn.style.transform = `translate3d(${dx * pull * 0.3}px, ${dy * pull * 0.3}px, 0) scale(1.02)`;
                } else {
                    btn.style.transform = `translate3d(0, 0, 0) scale(1)`;
                }
            });
        });

        // 2. Smooth Ring Interpolation (Lerp)
        function renderCursor() {
            if (ring) {
                ringX += (mouseX - ringX) * 0.15;
                ringY += (mouseY - ringY) * 0.15;
                ring.style.transform = `translate3d(calc(${ringX}px - 50%), calc(${ringY}px - 50%), 0)`;
            }
            requestAnimationFrame(renderCursor);
        }
        requestAnimationFrame(renderCursor);

        // 3. Hover States
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('a, button, .magnetic-btn, .video-card, .avatar-frame')) {
                dot?.classList.add('hovering');
                ring?.classList.add('hovering');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('a, button, .magnetic-btn, .video-card, .avatar-frame')) {
                dot?.classList.remove('hovering');
                ring?.classList.remove('hovering');
            }
        });
    }

    // ============================================================
    // 7. OBSERVERS (Reveals & Counters)
    // ============================================================
    function initObservers() {
        // Animation for numbers
        function animateCounter(el) {
            const target = parseInt(el.getAttribute('data-count'), 10);
            if (isNaN(target)) return;
            
            const start = performance.now();
            
            function update(time) {
                const progress = Math.min((time - start) / App.config.counterDuration, 1);
                const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const current = Math.floor(easeOutExpo * target);
                
                el.textContent = current.toLocaleString('de-DE') + (target >= 100 ? '+' : '');
                
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }

        // Single powerful IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 1. Reveal Elements
                    entry.target.classList.add('visible');
                    
                    // 2. Trigger Counters if they exist inside the revealed element
                    entry.target.querySelectorAll('.number[data-count]').forEach(counter => {
                        if (!counter.classList.contains('counted')) {
                            counter.classList.add('counted');
                            animateCounter(counter);
                        }
                    });

                    // 3. Unobserve after reveal to save performance
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // ============================================================
    // 8. PAGE SPECIFIC FEATURES (Video, FAQ, 3D Flip)
    // ============================================================
    function initPageFeatures() {
        
        // 1. Video Lightbox
        const lightbox = document.getElementById('videoLightbox');
        const player = document.getElementById('lightboxPlayer');
        
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.js-lightbox-trigger');
            if (trigger && lightbox && player) {
                player.src = trigger.getAttribute('data-video');
                lightbox.classList.add('active');
                player.play().catch(() => {});
            }

            if (e.target.closest('.close-lightbox') || e.target === lightbox) {
                if (lightbox && player) {
                    lightbox.classList.remove('active');
                    player.pause();
                    player.removeAttribute('src');
                }
            }
        });

        // 2. 3D Flip Card
        const flipCard = document.getElementById('flipCard');
        if (flipCard) {
            flipCard.addEventListener('click', () => flipCard.classList.toggle('flipped'));
        }

        // 3. FAQ Accordion
        document.addEventListener('click', (e) => {
            const question = e.target.closest('.faq-question');
            if (question) {
                const item = question.closest('.faq-item');
                const isOpen = item.classList.contains('open');
                
                // Close all others
                document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('open'));
                
                // Toggle clicked
                if (!isOpen) item.classList.add('open');
            }
        });
    }

    // ============================================================
    // 9. SYSTEM BOOTSTRAP
    // ============================================================
    async function boot() {
        console.log('🚀 Booting Raphael Lezius Premium Engine v9.0...');
        
        calculateRootPath();
        initTheme();
        
        // Await components so UI binds correctly to them
        await Promise.all([
            loadComponent('#nav-placeholder', App.config.navPath),
            loadComponent('#footer-placeholder', App.config.footerPath)
        ]);

        initNavigation();
        initInteractions();
        initObservers();
        initPageFeatures();

        // Dispatch a custom event in case specific pages need to know the system is ready
        document.dispatchEvent(new CustomEvent('SystemReady'));
    }

    // Start engine when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();