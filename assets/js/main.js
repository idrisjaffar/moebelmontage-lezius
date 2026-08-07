// ============================================================
// MAIN.JS – ALL FUNCTIONALITY
// ============================================================

document.addEventListener('DOMContentLoaded', function() {

    // ===== LOAD COMPONENTS (nav, footer, mission-os) =====
    function loadComponent(placeholderId, filePath) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;
        fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load ' + filePath);
                return response.text();
            })
            .then(html => {
                placeholder.innerHTML = html;
                // After loading, re-init any event listeners that might be needed
                if (placeholderId === 'nav-placeholder') {
                    initNav();
                }
                if (placeholderId === 'footer-placeholder') {
                    // footer init (if any)
                }
                if (placeholderId === 'mission-os-placeholder') {
                    initOs();
                }
            })
            .catch(err => console.warn('Could not load component:', filePath, err));
    }

    // Load all components
    loadComponent('nav-placeholder', 'assets/components/nav.html');
    loadComponent('footer-placeholder', 'assets/components/footer.html');
    loadComponent('mission-os-placeholder', 'assets/components/mission-os.html');

    // ===== AOS INIT =====
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            once: true,
            offset: 40
        });
    }

    // ===== NAVIGATION =====
    function initNav() {
        const hamburger = document.getElementById('hamburgerToggle');
        const mobileMenu = document.getElementById('mobileMenuOverlay');
        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', function() {
                this.classList.toggle('active');
                mobileMenu.classList.toggle('active');
                document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
            });
        }
        // Close mobile menu on link click
        const mobileLinks = document.querySelectorAll('.mobile-menu-overlay a, .mobile-menu-overlay .btn-mobile');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mobileMenu) mobileMenu.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ===== ACCORDION =====
    document.querySelectorAll('.js-accordion-trigger').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const item = this.closest('.accordion-item');
            if (item) {
                const isActive = item.classList.contains('active');
                const parent = item.closest('.accordion');
                if (parent) {
                    parent.querySelectorAll('.accordion-item.active').forEach(function(el) {
                        if (el !== item) el.classList.remove('active');
                    });
                }
                item.classList.toggle('active');
                this.setAttribute('aria-expanded', !isActive);
            }
        });
    });

    // ===== FAQ =====
    document.querySelectorAll('.js-faq-item .trigger').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const item = this.closest('.js-faq-item');
            if (item) {
                const isActive = item.classList.contains('active');
                const parent = item.closest('.faq-list');
                if (parent) {
                    parent.querySelectorAll('.js-faq-item.active').forEach(function(el) {
                        if (el !== item) el.classList.remove('active');
                    });
                }
                item.classList.toggle('active');
            }
        });
    });

    // ===== VIDEO LIGHTBOX =====
    const lightbox = document.getElementById('videoLightbox');
    const lightboxPlayer = document.getElementById('lightboxPlayer');
    const closeLightbox = document.getElementById('closeLightbox');

    document.querySelectorAll('.js-lightbox-trigger').forEach(function(card) {
        card.addEventListener('click', function() {
            const src = this.dataset.video;
            if (src && lightbox && lightboxPlayer) {
                lightboxPlayer.src = src;
                lightboxPlayer.load();
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                document.querySelectorAll('.js-hover-play').forEach(function(v) {
                    if (!v.paused) v.pause();
                });
            }
        });
    });

    if (closeLightbox) {
        closeLightbox.addEventListener('click', function() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            lightboxPlayer.pause();
        });
    }
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === this) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
                lightboxPlayer.pause();
            }
        });
    }

    // ===== VIDEO HOVER PLAY =====
    document.querySelectorAll('.js-hover-play').forEach(function(video) {
        video.addEventListener('mouseenter', function() {
            this.play().catch(function() {});
        });
        video.addEventListener('mouseleave', function() {
            this.pause();
        });
        video.addEventListener('click', function(e) {
            e.stopPropagation();
            if (this.paused) {
                this.play().catch(function() {});
            } else {
                this.pause();
            }
        });
    });

    // ===== PROJECT BELT =====
    const track = document.getElementById('beltTrack');
    const prevBtn = document.getElementById('beltPrev');
    const nextBtn = document.getElementById('beltNext');
    const indexDisplay = document.getElementById('beltIndex');
    const dotsContainer = document.getElementById('beltDots');
    const filterButtons = document.querySelectorAll('#beltFilters button');

    if (track) {
        let slides = track.querySelectorAll('.belt-slide');
        let total = slides.length;
        let current = 0;
        let currentFilter = 'all';
        let filteredSlides = slides;
        let filteredIndex = 0;

        function buildDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            const count = filteredSlides.length;
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('span');
                if (i === filteredIndex) dot.classList.add('active');
                dot.dataset.index = i;
                dot.addEventListener('click', function() {
                    goTo(parseInt(this.dataset.index));
                });
                dotsContainer.appendChild(dot);
            }
        }

        function updateView() {
            if (!track || !indexDisplay) return;
            const count = filteredSlides.length;
            if (count === 0) return;
            if (filteredIndex >= count) filteredIndex = count - 1;
            if (filteredIndex < 0) filteredIndex = 0;
            const slideWidth = filteredSlides[0].offsetWidth || track.offsetWidth;
            track.style.transform = 'translateX(-' + (filteredIndex * slideWidth) + 'px)';
            indexDisplay.textContent = (filteredIndex + 1) + ' / ' + count;
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('span');
                dots.forEach(function(d, i) {
                    d.classList.toggle('active', i === filteredIndex);
                });
            }
        }

        function goTo(index) {
            if (!filteredSlides.length) return;
            if (index < 0) index = filteredSlides.length - 1;
            if (index >= filteredSlides.length) index = 0;
            filteredIndex = index;
            updateView();
        }

        function filterBy(sector) {
            currentFilter = sector;
            slides = track.querySelectorAll('.belt-slide');
            if (sector === 'all') {
                filteredSlides = slides;
            } else {
                filteredSlides = [];
                slides.forEach(function(s) {
                    if (s.dataset.sector === sector) {
                        filteredSlides.push(s);
                    }
                });
            }
            filteredIndex = 0;
            slides.forEach(function(s) {
                s.style.display = 'none';
            });
            filteredSlides.forEach(function(s) {
                s.style.display = 'block';
            });
            buildDots();
            if (track) {
                track.style.transform = 'translateX(0)';
            }
            updateView();
            filterButtons.forEach(function(btn) {
                btn.classList.toggle('active', btn.dataset.filter === sector);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                goTo(filteredIndex - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                goTo(filteredIndex + 1);
            });
        }

        filterButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const filter = this.dataset.filter;
                filterBy(filter);
            });
        });

        // Initial filter: all
        filterBy('all');

        // Recalculate on resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                updateView();
            }, 200);
        });
    }

    // ===== MISSION OS OVERLAY =====
    function initOs() {
        const osOverlay = document.getElementById('osOverlay');
        const openOsBtns = document.querySelectorAll('.js-open-os');
        const closeOsBtns = document.querySelectorAll('.js-close-os');

        function openOs() {
            if (osOverlay) {
                osOverlay.classList.add('active');
                osOverlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }

        function closeOs() {
            if (osOverlay) {
                osOverlay.classList.remove('active');
                osOverlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        }

        openOsBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openOs();
            });
        });
        closeOsBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                closeOs();
            });
        });
        if (osOverlay) {
            osOverlay.addEventListener('click', function(e) {
                if (e.target === this) closeOs();
            });
        }

        // OS Form
        const osForm = document.getElementById('osForm');
        if (osForm) {
            osForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Vielen Dank für Ihre Anfrage! Ich melde mich innerhalb von 24 Stunden bei Ihnen.');
                closeOs();
                this.reset();
            });
        }
    }

    // ===== CURRENT YEAR =====
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ===== KEYBOARD SHORTCUTS =====
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close lightbox
            if (lightbox && lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
                if (lightboxPlayer) lightboxPlayer.pause();
            }
            // Close OS
            const osOverlay = document.getElementById('osOverlay');
            if (osOverlay && osOverlay.classList.contains('active')) {
                osOverlay.classList.remove('active');
                osOverlay.style.display = 'none';
                document.body.style.overflow = '';
            }
            // Close mobile menu
            const mobileMenu = document.getElementById('mobileMenuOverlay');
            const hamburger = document.getElementById('hamburgerToggle');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Re-init nav after load (in case it's loaded after DOMContentLoaded)
    // The nav is loaded via fetch, so we need to call initNav after load.
    // This is done inside loadComponent callback.
    // But we also need to handle cases where nav is already in the page.
    // So we call initNav again after a short delay to ensure it's loaded.
    setTimeout(initNav, 500);

});