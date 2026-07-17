/* ==========================================================================
   RAPHAEL LEZIUS | MASTER ENGINE v2026
   ARCHITECTURE: ASYNC BOOT | COMPONENT INJECTION | 2‑SIDED LOGO FLIP
   ========================================================================== */

(function() {
    "use strict";

    // ────────────────────────────────────────────────
    // 1. BOOT SEQUENCE (Runs once DOM is ready)
    // ────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function() {

        console.log('🔄 SYSTEM: Booting Aurum 2077…');

        // --- A. Inject global components (Nav, Footer, OS) ---
        // Try multiple possible paths
        var navPaths = ['nav.html', 'components/nav.html', 'partials/nav.html'];
        var footerPaths = ['footer.html', 'components/footer.html', 'partials/footer.html'];
        var osPaths = ['mission-os.html', 'components/mission-os.html', 'partials/mission-os.html'];

        Promise.all([
            loadComponent('global-nav', navPaths),
            loadComponent('global-footer', footerPaths),
            loadComponent('global-os', osPaths)
        ]).then(function() {
            // AOS refresh (animations on injected content)
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
                console.log('✅ AOS: Refreshed.');
            }
            // Attach event listeners to newly injected elements
            attachEventListeners();
            console.log('✅ SYSTEM: All components loaded and listeners attached.');
        });

        // --- B. Initialize AOS (on static content) ---
        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 1000, once: true, offset: 50 });
        }

        // --- C. Set system date ---
        var dateEl = document.getElementById('dynamic-date');
        if (dateEl) {
            dateEl.textContent = new Date().getFullYear();
        }

        // --- D. Attach listeners to elements already in the DOM ---
        attachEventListeners();

        console.log('✅ SYSTEM: Boot sequence complete.');
    });


    // ────────────────────────────────────────────────
    // 2. COMPONENT INJECTOR (with fallback paths)
    // ────────────────────────────────────────────────
    function loadComponent(id, paths) {
        var target = document.getElementById(id);
        if (!target) {
            console.warn('⚠️ Component container "' + id + '" not found in HTML.');
            return Promise.resolve();
        }

        // Try multiple paths in order
        function tryPath(index) {
            if (index >= paths.length) {
                console.warn('⚠️ Could not load component "' + id + '" from any path.');
                // Fallback content
                if (id === 'global-nav') {
                    target.innerHTML = '<nav style="padding:20px;color:#888;text-align:center;background:#0a0805;border-bottom:1px solid rgba(255,215,0,0.1);">[ Navigation not loaded ]</nav>';
                } else if (id === 'global-footer') {
                    target.innerHTML = '<footer style="padding:40px 20px;color:#666;text-align:center;background:#0a0805;border-top:1px solid rgba(255,215,0,0.1);">[ Footer not loaded ]</footer>';
                } else if (id === 'global-os') {
                    target.innerHTML = '<div style="padding:20px;color:#888;text-align:center;">[ Mission OS not loaded ]</div>';
                }
                return Promise.resolve();
            }

            var path = paths[index];
            return fetch(path)
                .then(function(response) {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    return response.text();
                })
                .then(function(html) {
                    target.innerHTML = html;
                    console.log('✅ Loaded: ' + path);
                    return Promise.resolve();
                })
                .catch(function() {
                    // Try next path
                    return tryPath(index + 1);
                });
        }

        return tryPath(0);
    }


    // ────────────────────────────────────────────────
    // 3. EVENT LISTENERS (Delegated + Direct)
    // ────────────────────────────────────────────────
    function attachEventListeners() {

        // --- A. Magnetic Buttons (hover physics) ---
        document.querySelectorAll('.magnetic-target').forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                var rect = this.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                this.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0, 0)';
            });
        });

        // --- B. FAQ Accordion (delegated to handle dynamic content) ---
        document.addEventListener('click', function(e) {
            var trigger = e.target.closest('.faq-trigger');
            if (!trigger) return;

            var item = trigger.closest('.js-faq-item');
            if (!item) return;

            var content = item.querySelector('.faq-content');
            if (!content) return;

            e.preventDefault();

            var isOpen = item.classList.contains('active');

            // Close all others
            document.querySelectorAll('.js-faq-item').forEach(function(other) {
                if (other !== item) {
                    other.classList.remove('active');
                    var otherContent = other.querySelector('.faq-content');
                    if (otherContent) otherContent.style.maxHeight = null;
                }
            });

            if (isOpen) {
                item.classList.remove('active');
                content.style.maxHeight = '0px';
            } else {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
                trigger.setAttribute('aria-expanded', 'true');
            }
        });

        // --- C. Mission OS Modal ---
        document.addEventListener('click', function(e) {
            var openBtn = e.target.closest('.js-open-os');
            if (openBtn) {
                e.preventDefault();
                var modal = document.getElementById('global-os');
                if (modal) {
                    modal.classList.add('is-active');
                    document.body.style.overflow = 'hidden';
                }
                return;
            }

            var closeBtn = e.target.closest('.js-close-os');
            if (closeBtn) {
                e.preventDefault();
                var modal = document.getElementById('global-os');
                if (modal) {
                    modal.classList.remove('is-active');
                    document.body.style.overflow = '';
                }
                return;
            }

            // Close modal on backdrop click
            var backdrop = e.target.closest('.os-backdrop');
            if (backdrop) {
                var modal = document.getElementById('global-os');
                if (modal) {
                    modal.classList.remove('is-active');
                    document.body.style.overflow = '';
                }
                return;
            }
        });

        // --- D. Mobile Menu Toggle ---
        document.addEventListener('click', function(e) {
            var toggle = e.target.closest('#mobileMenuToggle');
            if (toggle) {
                var menu = document.getElementById('fluidMobileMenu');
                if (menu) {
                    menu.classList.toggle('is-open');
                    toggle.classList.toggle('is-active');
                    document.body.style.overflow = menu.classList.contains('is-open') ? 'hidden' : '';
                }
                return;
            }

            // Close menu on link click
            var link = e.target.closest('.m-link-massive');
            if (link) {
                var menu = document.getElementById('fluidMobileMenu');
                if (menu) menu.classList.remove('is-open');
                var toggle = document.getElementById('mobileMenuToggle');
                if (toggle) toggle.classList.remove('is-active');
                document.body.style.overflow = '';
            }
        });

        // --- E. TWO‑SIDED LOGO FLIP (Profile Avatar) ---
        var avatarFrame = document.querySelector('.avatar-frame');
        if (avatarFrame) {
            avatarFrame.addEventListener('click', function() {
                this.classList.toggle('flipped');
            });
        }
    }

})();