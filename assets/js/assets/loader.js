/**
 * Component Loader – Raphael Lezius
 * Injects nav and footer on ALL pages with working dropdowns
 */
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    console.log('🔄 Component Loader initialized');

    // ---- Configuration ----
    const cacheBust = new Date().getTime();

    // ---- Core Loader ----
    function loadComponent(placeholderId, filePath, callback) {
        const el = document.getElementById(placeholderId);
        if (!el) {
            console.warn('⚠️ Placeholder not found:', placeholderId);
            return;
        }

        const url = filePath + '?_=' + cacheBust;

        fetch(url)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status + ' — ' + url);
                }
                return response.text();
            })
            .then(function(html) {
                el.innerHTML = html;
                console.log('✅ Loaded:', filePath);
                if (callback) callback();
            })
            .catch(function(err) {
                console.warn('❌ Failed to load:', filePath, err);
                el.innerHTML = `
                    <div style="padding:20px;text-align:center;color:#64748b;font-family:monospace;font-size:0.8rem;">
                        ⚠️ Komponente nicht verfügbar
                    </div>
                `;
            });
    }

    // ---- Nav Initialization (with working dropdowns) ----
    function initNav() {
        console.log('🔧 Initializing Nav...');

        // ---- MOBILE MENU ----
        var toggle = document.getElementById('mobileMenuToggle');
        var menu = document.getElementById('mobileMenu');
        var closeBtn = document.getElementById('mobileCloseBtn');

        function openMenu() {
            if (!menu || !toggle) return;
            menu.classList.add('is-open');
            toggle.classList.add('is-active');
            toggle.setAttribute('aria-expanded', 'true');
            menu.setAttribute('aria-hidden', 'false');
            document.body.classList.add('menu-open');
            if (navigator.vibrate) navigator.vibrate(12);
        }

        function closeMenu() {
            if (!menu || !toggle) return;
            menu.classList.remove('is-open');
            toggle.classList.remove('is-active');
            toggle.setAttribute('aria-expanded', 'false');
            menu.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('menu-open');
        }

        if (toggle && menu) {
            toggle.addEventListener('click', function() {
                menu.classList.contains('is-open') ? closeMenu() : openMenu();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }

        if (menu) {
            menu.querySelectorAll('a, .js-open-contact').forEach(function(el) {
                el.addEventListener('click', function() {
                    setTimeout(closeMenu, 120);
                });
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeMenu();
        });

        // ---- DROPDOWNS ----
        var dropdowns = document.querySelectorAll('.nav-dropdown');

        dropdowns.forEach(function(dropdown) {
            var trigger = dropdown.querySelector('.drop-trigger');
            var menuEl = dropdown.querySelector('.dropdown-menu');

            if (trigger && menuEl) {
                // Hover for desktop
                dropdown.addEventListener('mouseenter', function() {
                    if (window.innerWidth > 1050) {
                        menuEl.classList.add('is-open');
                        trigger.setAttribute('aria-expanded', 'true');
                    }
                });

                dropdown.addEventListener('mouseleave', function() {
                    if (window.innerWidth > 1050) {
                        menuEl.classList.remove('is-open');
                        trigger.setAttribute('aria-expanded', 'false');
                    }
                });

                // Click for touch / tablet / mobile
                trigger.addEventListener('click', function(e) {
                    // Only use click behavior on smaller screens or touch devices
                    if (window.innerWidth <= 1050 || 'ontouchstart' in window) {
                        e.preventDefault();
                        var isOpen = menuEl.classList.contains('is-open');

                        // Close all other dropdowns
                        dropdowns.forEach(function(d) {
                            var m = d.querySelector('.dropdown-menu');
                            var t = d.querySelector('.drop-trigger');
                            if (m && m !== menuEl) {
                                m.classList.remove('is-open');
                                if (t) t.setAttribute('aria-expanded', 'false');
                            }
                        });

                        menuEl.classList.toggle('is-open');
                        trigger.setAttribute('aria-expanded', !isOpen);
                    }
                });

                // Also handle click outside to close
                document.addEventListener('click', function(e) {
                    if (window.innerWidth <= 1050) {
                        if (!dropdown.contains(e.target)) {
                            menuEl.classList.remove('is-open');
                            trigger.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
            }
        });

        // ---- SCROLL SHADOW ----
        var nav = document.getElementById('masterNav');
        if (nav) {
            window.addEventListener('scroll', function() {
                nav.classList.toggle('is-scrolled', window.scrollY > 36);
            }, { passive: true });
        }

        // ---- CONTACT SCROLL ----
        document.querySelectorAll('.js-open-contact').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var target = document.getElementById('contact');
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    closeMenu();
                }
            });
        });

        console.log('✅ Nav initialized with working dropdowns');
    }

    // ---- Footer Initialization ----
    function initFooter() {
        console.log('🔧 Initializing Footer...');

        var yearEl = document.getElementById('copyright-year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }

        // Back to Top
        var btt = document.getElementById('footerBackToTop');
        if (btt) {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 400) {
                    btt.classList.add('visible');
                } else {
                    btt.classList.remove('visible');
                }
            }, { passive: true });

            btt.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Newsletter
        var form = document.getElementById('newsletterForm');
        var feedback = document.getElementById('newsletterFeedback');
        var emailInput = document.getElementById('newsletterEmail');

        if (form && feedback && emailInput) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                var email = emailInput.value.trim();
                if (!email || !email.includes('@') || !email.includes('.')) {
                    feedback.innerHTML = '<span style="color:#ff6b6b;"><i class="fas fa-exclamation-circle"></i> Bitte gültige E-Mail eingeben.</span>';
                    feedback.style.display = 'block';
                    return;
                }
                feedback.innerHTML = '<span style="color:#51cf66;"><i class="fas fa-check-circle"></i> Vielen Dank! Sie sind jetzt angemeldet.</span>';
                feedback.style.display = 'block';
                emailInput.value = '';
                setTimeout(function() {
                    feedback.style.display = 'none';
                }, 5000);
            });
        }

        console.log('✅ Footer initialized');
    }

    // ---- Load Everything ----
    loadComponent('nav-placeholder', 'components/nav.html', initNav);
    loadComponent('footer-placeholder', 'components/footer.html', initFooter);

    console.log('🏁 Component loader finished');
});