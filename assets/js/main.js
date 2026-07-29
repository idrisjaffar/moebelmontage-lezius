/* ==========================================================================
   RAPHAEL LEZIUS | MASTER ENGINE v2026.1
   ARCHITECTURE: ASYNC BOOT | COMPONENT INJECTION | 2‑SIDED LOGO FLIP
   ========================================================================== */

(function() {
    "use strict";

    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔄 SYSTEM: Booting Aurum 2077…');

        var navPaths = ['nav.html', 'components/nav.html', 'partials/nav.html'];
        var footerPaths = ['footer.html', 'components/footer.html', 'partials/footer.html'];
        var osPaths = ['mission-os.html', 'components/mission-os.html', 'partials/mission-os.html'];

        Promise.all([
            loadComponent('global-nav', navPaths),
            loadComponent('global-footer', footerPaths),
            loadComponent('global-os', osPaths)
        ]).then(function() {
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
                console.log('✅ AOS: Refreshed.');
            }
            attachEventListeners();
            console.log('✅ SYSTEM: All components loaded.');
        });

        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 1000, once: true, offset: 50 });
        }

        var dateEl = document.getElementById('dynamic-date');
        if (dateEl) {
            dateEl.textContent = new Date().getFullYear();
        }

        attachEventListeners();
        initScrollDetection();
        console.log('✅ SYSTEM: Boot sequence complete.');
    });

    function loadComponent(id, paths) {
        var target = document.getElementById(id);
        if (!target) {
            console.warn('⚠️ Component container "' + id + '" not found.');
            return Promise.resolve();
        }

        function tryPath(index) {
            if (index >= paths.length) {
                console.warn('⚠️ Could not load "' + id + '" from any path.');
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
                    return tryPath(index + 1);
                });
        }
        return tryPath(0);
    }

    function initScrollDetection() {
        var nav = document.querySelector('.lezius-nav-2026');
        if (!nav) return;
        var scrollThreshold = 80;
        var isScrolled = false;
        window.addEventListener('scroll', function() {
            var scrollY = window.scrollY || window.pageYOffset;
            if (scrollY > scrollThreshold && !isScrolled) {
                nav.classList.add('is-scrolled');
                isScrolled = true;
            } else if (scrollY <= scrollThreshold && isScrolled) {
                nav.classList.remove('is-scrolled');
                isScrolled = false;
            }
        }, { passive: true });
    }

    function attachEventListeners() {
        // Avatar Flip
        var avatarFrame = document.querySelector('.avatar-frame');
        if (avatarFrame) {
            avatarFrame.addEventListener('click', function(e) {
                this.classList.toggle('flipped');
                console.log('🔄 Avatar flipped.');
            });
            avatarFrame.setAttribute('tabindex', '0');
            avatarFrame.setAttribute('role', 'button');
            avatarFrame.setAttribute('aria-label', 'Logo umdrehen – Vorder- und Rückseite anzeigen');
            avatarFrame.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.classList.toggle('flipped');
                }
            });
        }

        // Magnetic Buttons
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

        // Mobile Menu Toggle
        var menuToggle = document.getElementById('mobileMenuToggle');
        var mobileMenu = document.getElementById('fluidMobileMenu');
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                this.classList.toggle('is-active');
                mobileMenu.classList.toggle('is-open');
                document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
                var expanded = this.classList.contains('is-active');
                this.setAttribute('aria-expanded', expanded);
                this.setAttribute('aria-label', expanded ? 'Mobiles Menü schließen' : 'Mobiles Menü öffnen');
            });
            var menuLinks = mobileMenu.querySelectorAll('a, .m-link-massive, .m-srv-card');
            menuLinks.forEach(function(link) {
                link.addEventListener('click', function() {
                    menuToggle.classList.remove('is-active');
                    mobileMenu.classList.remove('is-open');
                    document.body.style.overflow = '';
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.setAttribute('aria-label', 'Mobiles Menü öffnen');
                });
            });
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
                    menuToggle.classList.remove('is-active');
                    mobileMenu.classList.remove('is-open');
                    document.body.style.overflow = '';
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.setAttribute('aria-label', 'Mobiles Menü öffnen');
                    menuToggle.focus();
                }
            });
        }

        // FAQ Accordion
        document.addEventListener('click', function(e) {
            var trigger = e.target.closest('.faq-trigger');
            if (!trigger) return;
            var item = trigger.closest('.js-faq-item');
            if (!item) return;
            var content = item.querySelector('.faq-content');
            if (!content) return;
            e.preventDefault();
            var isOpen = item.classList.contains('active');
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

        // Mission OS Modal
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

        // Service Accordion
        document.addEventListener('click', function(e) {
            var trigger = e.target.closest('.js-accordion-trigger');
            if (!trigger) return;
            var item = trigger.closest('.accordion-item');
            if (!item) return;
            var content = item.querySelector('.accordion-content');
            if (!content) return;
            e.preventDefault();
            var isOpen = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(function(other) {
                if (other !== item) {
                    other.classList.remove('active');
                    var otherContent = other.querySelector('.accordion-content');
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

        // Video Lightbox
        document.addEventListener('click', function(e) {
            var trigger = e.target.closest('.js-lightbox-trigger');
            if (!trigger) return;
            e.preventDefault();
            var lightbox = document.getElementById('cinematicLightbox');
            var player = document.getElementById('lightboxVideoPlayer');
            var videoSource = document.getElementById('lightboxVideoSource');
            if (!lightbox || !player || !videoSource) return;
            var src = trigger.getAttribute('data-video-src');
            if (src) {
                videoSource.src = src;
                player.load();
                lightbox.style.display = 'flex';
                setTimeout(function() {
                    lightbox.classList.add('is-active');
                }, 50);
                document.body.style.overflow = 'hidden';
                player.play().catch(function(err) {
                    console.log('User interaction required for audio playback.');
                });
            }
        });

        // Close Lightbox
        document.addEventListener('click', function(e) {
            var closeBtn = e.target.closest('#closeCinematicLightbox');
            if (closeBtn) {
                e.preventDefault();
                closeLightbox();
                return;
            }
            var backdrop = e.target.closest('.lightbox-backdrop');
            if (backdrop) {
                closeLightbox();
                return;
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var lightbox = document.getElementById('cinematicLightbox');
                if (lightbox && lightbox.classList.contains('is-active')) {
                    closeLightbox();
                }
            }
        });

        function closeLightbox() {
            var lightbox = document.getElementById('cinematicLightbox');
            var player = document.getElementById('lightboxVideoPlayer');
            if (lightbox) {
                lightbox.classList.remove('is-active');
                setTimeout(function() {
                    lightbox.style.display = 'none';
                }, 400);
                document.body.style.overflow = '';
            }
            if (player) {
                player.pause();
                player.currentTime = 0;
            }
            var videoSource = document.getElementById('lightboxVideoSource');
            if (videoSource) {
                videoSource.src = '';
            }
        }

        // Belt Sector Filters
        document.querySelectorAll('.sector-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var sector = this.getAttribute('data-target');
                var items = document.querySelectorAll('.belt-item');
                items.forEach(function(item) {
                    var itemSector = item.getAttribute('data-sector');
                    if (sector === 'all' || itemSector === sector) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
                document.querySelectorAll('.sector-btn').forEach(function(b) {
                    b.classList.remove('active');
                    b.style.background = 'transparent';
                    b.style.color = '#fff';
                    b.style.border = '1px solid #333';
                });
                this.classList.add('active');
                this.style.background = '#00e5ff';
                this.style.color = '#000';
                this.style.border = 'none';
                var track = document.getElementById('imageBelt');
                if (track) {
                    track.style.transform = 'translateX(0%)';
                }
            });
        });

        console.log('✅ All event listeners attached.');
    }

})();