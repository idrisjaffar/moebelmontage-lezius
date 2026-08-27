/**
 * ==============================================================================
 * RAPHAEL LEZIUS – PREMIUM ARCHITECTURE v9.1
 * 2026 Masterpiece JS – Built for GitHub Pages, Local Testing & Deep Nesting
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
            rootPath: '', 
            isMobile: window.matchMedia('(max-width: 900px)').matches,
            isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches,
            theme: 'dark'
        }
    };

    // ============================================================
    // 2. FALLBACK HTML (Safety Net for Local Testing / file:///)
    // ============================================================
    const NAV_FALLBACK = `
        <nav class="rl-nav" id="mainNav" role="navigation" aria-label="Hauptnavigation">
          <div class="rl-nav__inner">
            <a href="index.html" class="rl-nav__brand" aria-label="Startseite">Raphael <span>Lezius</span></a>
            <ul class="rl-nav__links">
              <li class="nav-dropdown">
                <a href="#" class="nav-link">Services <i class="fas fa-chevron-down"></i></a>
                <div class="nav-dropdown-content">
                  <a href="services.html"><i class="fas fa-th-list"></i> Übersicht</a>
                  <a href="services/moebel-kuechen.html"><i class="fas fa-couch"></i> Möbel & Küchen</a>
                  <a href="services/usm-haller.html"><i class="fas fa-gem"></i> USM Haller</a>
                  <a href="services/garten-outdoor.html"><i class="fas fa-tree"></i> Garten & Outdoor</a>
                  <a href="services/demontage-umzug.html"><i class="fas fa-truck"></i> Demontage & Umzug</a>
                  <a href="services/buero-objekt.html"><i class="fas fa-building"></i> Büro & Objekt</a>
                  <a href="services/premium-pro.html"><i class="fas fa-crown"></i> Premium Pro</a>
                </div>
              </li>
              <li class="nav-dropdown">
                <a href="#" class="nav-link">Bundles <i class="fas fa-chevron-down"></i></a>
                <div class="nav-dropdown-content">
                  <a href="bundles/index.html"><i class="fas fa-gift"></i> Übersicht</a>
                  <a href="bundles/kuechen-komplett.html"><i class="fas fa-utensils"></i> Küchen-Komplett</a>
                  <a href="bundles/usm-all-in.html"><i class="fas fa-gem"></i> USM All-In</a>
                  <a href="bundles/umzug-premium.html"><i class="fas fa-truck"></i> Umzug Premium</a>
                </div>
              </li>
              <li><a href="about.html" class="nav-link">Über mich</a></li>
              <li><a href="contact.html" class="nav-link">Kontakt</a></li>
            </ul>
            <div class="rl-nav__actions">
              <a href="anfrage/index.html" class="nav-cta magnetic-btn"><i class="fas fa-comment-dots"></i><span>Kostenlos</span></a>
              <button class="theme-toggle" data-theme-toggle aria-label="Design umschalten"><i class="fas fa-moon" data-theme-icon></i></button>
              <button class="rl-nav__hamburger" id="navToggle" aria-expanded="false" aria-label="Menü öffnen"><span></span><span></span><span></span></button>
            </div>
          </div>
        </nav>
        <div class="rl-nav__mobile" id="mobileMenu">
          <div class="mobile-menu-inner">
            <a href="index.html" class="mobile-link">Start</a>
            <a href="services.html" class="mobile-link">Services</a>
            <a href="bundles/index.html" class="mobile-link">Bundles</a>
            <a href="about.html" class="mobile-link">Über mich</a>
            <a href="contact.html" class="mobile-link">Kontakt</a>
            <a href="faq.html" class="mobile-link">FAQ</a>
          </div>
        </div>
    `;

    const FOOTER_FALLBACK = `
        <footer style="border-top:1px solid var(--rl-border);padding:40px 0;background:var(--rl-bg);">
            <div class="container">
                <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:20px;">
                    <div>
                        <div style="font-family:var(--font-head);font-weight:800;font-size:1.2rem;color:var(--rl-text);">
                            Raphael <span style="color:var(--rl-primary);">Lezius</span>
                        </div>
                        <p style="color:var(--rl-muted);font-size:0.85rem;margin-top:4px;">Premium Montage mit Leidenschaft.</p>
                    </div>
                    <div style="display:flex;gap:24px;flex-wrap:wrap;">
                        <a href="legal/impressum.html" style="color:var(--rl-muted);font-family:var(--font-mono);font-size:0.6rem;letter-spacing:1px;transition:color 0.3s;">Impressum</a>
                        <a href="legal/datenschutz.html" style="color:var(--rl-muted);font-family:var(--font-mono);font-size:0.6rem;letter-spacing:1px;transition:color 0.3s;">Datenschutz</a>
                        <a href="legal/agb.html" style="color:var(--rl-muted);font-family:var(--font-mono);font-size:0.6rem;letter-spacing:1px;transition:color 0.3s;">AGB</a>
                    </div>
                    <div style="color:var(--rl-dim);font-size:0.7rem;">&copy; 2026 Raphael Lezius</div>
                </div>
            </div>
        </footer>
    `;

    // ============================================================
    // 3. BULLETPROOF PATH RESOLVER
    // ============================================================
    function calculateRootPath() {
        const script = document.currentScript || document.querySelector('script[src*="main.js"]');
        if (script) {
            const src = script.getAttribute('src');
            App.state.rootPath = src.split('assets/js/main.js')[0];
        }
    }

    function resolveComponentLinks(container) {
        container.querySelectorAll('a[href], img[src], video[src], source[src]').forEach(el => {
            const attr = el.hasAttribute('href') ? 'href' : 'src';
            const link = el.getAttribute(attr);
            
            // Skip anchors, absolute URLs, mailto/tel, and already resolved paths
            if (!link || link.startsWith('#') || link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('/')) {
                return;
            }
            
            el.setAttribute(attr, App.state.rootPath + link);
        });
    }

    // ============================================================
    // 4. COMPONENT LOADER (Nav & Footer)
    // ============================================================
    async function loadComponent(selector, filepath, fallbackHTML) {
        const container = document.querySelector(selector);
        if (!container) return;

        const url = App.state.rootPath + filepath;
        const cacheKey = `rl-cache-${filepath}`;

        // 1. Try Cache First
        const cachedHTML = localStorage.getItem(cacheKey);
        if (cachedHTML) {
            container.innerHTML = cachedHTML;
            resolveComponentLinks(container);
        }

        // 2. Fetch Fresh Data
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
            console.warn(`[System] Fetch failed for ${filepath}. Using Fallback.`);
            // If fetch fails (like on file:///) and we have no cache, use the fallback string
            if (!cachedHTML && fallbackHTML) {
                container.innerHTML = fallbackHTML;
                resolveComponentLinks(container);
            }
        }
    }

    // ============================================================
    // 5. THEME ENGINE
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
            
            if (themeMeta) themeMeta.content = theme === 'dark' ? '#0B0A09' : '#F9F7F2';
        }

        const storedTheme = localStorage.getItem(App.config.themeKey);
        const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        setTheme(storedTheme || (systemPrefersLight ? 'light' : 'dark'));

        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-theme-toggle]')) {
                setTheme(App.state.theme === 'dark' ? 'light' : 'dark');
            }
        });
    }

    // ============================================================
    // 6. NAVIGATION & SCROLL SYSTEMS
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
            
            if (progress) progress.style.width = docHeight > 0 ? `${(currentScroll / docHeight) * 100}%` : '0%';

            if (nav) {
                if (currentScroll > 80) {
                    nav.classList.add('scrolled');
                    if (currentScroll > lastScrollY && currentScroll > 300) {
                        nav.style.transform = 'translateY(-100%)';
                    } else {
                        nav.style.transform = 'translateY(0)';
                    }
                } else {
                    nav.classList.remove('scrolled');
                    nav.style.transform = 'translateY(0)';
                }
            }

            const showFloats = currentScroll > 400;
            if (stickyCta) stickyCta.classList.toggle('visible', showFloats);
            if (backTop) backTop.classList.toggle('visible', showFloats);

            lastScrollY = currentScroll;
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        document.addEventListener('click', (e) => {
            const toggle = e.target.closest('.rl-nav__hamburger');
            const menu = document.getElementById('mobileMenu');
            
            if (toggle && menu) {
                const isOpen = menu.classList.toggle('open');
                toggle.setAttribute('aria-expanded', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            }

            if (e.target.closest('.mobile-link') && menu) {
                menu.classList.remove('open');
                document.body.style.overflow = '';
                document.querySelector('.rl-nav__hamburger')?.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ============================================================
    // 7. HIGH-PERFORMANCE INTERACTIONS (Cursor & Magnetics)
    // ============================================================
    function initInteractions() {
        if (App.state.isTouch) {
            document.querySelectorAll('.cursor-dot, .cursor-ring').forEach(el => el.style.display = 'none');
            return;
        }

        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            if (dot) dot.style.transform = `translate3d(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%), 0)`;

            document.querySelectorAll('.magnetic-btn').forEach(btn => {
                const rect = btn.getBoundingClientRect();
                const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
                const dx = mouseX - cx, dy = mouseY - cy, dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < App.config.magneticDistance) {
                    const pull = (App.config.magneticDistance - dist) / App.config.magneticDistance;
                    btn.style.transform = `translate3d(${dx * pull * 0.3}px, ${dy * pull * 0.3}px, 0) scale(1.02)`;
                } else {
                    btn.style.transform = `translate3d(0, 0, 0) scale(1)`;
                }
            });
        });

        function renderCursor() {
            if (ring) {
                ringX += (mouseX - ringX) * 0.15; ringY += (mouseY - ringY) * 0.15;
                ring.style.transform = `translate3d(calc(${ringX}px - 50%), calc(${ringY}px - 50%), 0)`;
            }
            requestAnimationFrame(renderCursor);
        }
        requestAnimationFrame(renderCursor);

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('a, button, .magnetic-btn, .video-card, .avatar-frame')) {
                dot?.classList.add('hovering'); ring?.classList.add('hovering');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('a, button, .magnetic-btn, .video-card, .avatar-frame')) {
                dot?.classList.remove('hovering'); ring?.classList.remove('hovering');
            }
        });
    }

    // ============================================================
    // 8. OBSERVERS (Reveals & Counters)
    // ============================================================
    function initObservers() {
        function animateCounter(el) {
            const target = parseInt(el.getAttribute('data-count'), 10);
            if (isNaN(target)) return;
            const start = performance.now();
            function update(time) {
                const progress = Math.min((time - start) / App.config.counterDuration, 1);
                const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                el.textContent = Math.floor(easeOutExpo * target).toLocaleString('de-DE') + (target >= 100 ? '+' : '');
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.querySelectorAll('.number[data-count]').forEach(counter => {
                        if (!counter.classList.contains('counted')) {
                            counter.classList.add('counted');
                            animateCounter(counter);
                        }
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // ============================================================
    // 9. PAGE SPECIFIC FEATURES (Lightbox, Flip, FAQ)
    // ============================================================
    function initPageFeatures() {
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
                    player.pause(); player.removeAttribute('src');
                }
            }
        });

        const flipCard = document.getElementById('flipCard');
        if (flipCard) flipCard.addEventListener('click', () => flipCard.classList.toggle('flipped'));

        document.addEventListener('click', (e) => {
            const question = e.target.closest('.faq-question');
            if (question) {
                const item = question.closest('.faq-item');
                const isOpen = item.classList.contains('open');
                document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('open'));
                if (!isOpen) item.classList.add('open');
            }
        });
    }

    // ============================================================
    // 10. SYSTEM BOOTSTRAP
    // ============================================================
    async function boot() {
        calculateRootPath();
        initTheme();
        
        // Pass the Fallback strings so it renders even on local file:// tests!
        await Promise.all([
            loadComponent('#nav-placeholder', App.config.navPath, NAV_FALLBACK),
            loadComponent('#footer-placeholder', App.config.footerPath, FOOTER_FALLBACK)
        ]);

        initNavigation();
        initInteractions();
        initObservers();
        initPageFeatures();

        document.dispatchEvent(new CustomEvent('SystemReady'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();