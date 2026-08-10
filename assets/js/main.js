document.addEventListener('DOMContentLoaded', function() {
    
    // 1. DYNAMIC COMPONENT LOADER
    function loadComponent(id, file) {
        const el = document.getElementById(id);
        if (!el) return;
        fetch(file)
            .then(r => r.text())
            .then(html => {
                el.innerHTML = html;
                if (id === 'global-nav') initNav();
                if (id === 'global-footer') initFooter();
            })
            .catch(err => console.warn(`Error loading ${file}:`, err));
    }

    loadComponent('global-nav', 'components/nav.html');
    loadComponent('global-footer', 'components/footer.html');
    loadComponent('global-os', 'components/mission_os.html');

    // 2. NAVIGATION LOGIC & MOBILE MENU
    function initNav() {
        const hamburger = document.getElementById('mobileMenuToggle');
        const menu = document.getElementById('fluidMobileMenu');
        
        if (hamburger && menu) {
            // Display toggle button on mobile
            if (window.innerWidth <= 992) {
                hamburger.style.display = 'flex';
            }

            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('is-active');
                menu.classList.toggle('is-open');
                
                // Toggle lines transformation
                const line1 = hamburger.querySelector('.line-1');
                const line2 = hamburger.querySelector('.line-2');
                if (hamburger.classList.contains('is-active')) {
                    line1.style.transform = 'translateY(9px) rotate(45deg)';
                    line2.style.transform = 'translateY(-9px) rotate(-45deg)';
                } else {
                    line1.style.transform = 'none';
                    line2.style.transform = 'none';
                }
                
                document.body.style.overflow = menu.classList.contains('is-open') ? 'hidden' : '';
            });
        }
        
        // Fix anchor links if not on index.html
        const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
        if (!isHome) {
            document.querySelectorAll('.capsule-link[href^="#"]').forEach(link => {
                const hash = link.getAttribute('href');
                link.setAttribute('href', 'index.html' + hash);
            });
        }
    }

    // 3. FOOTER LOGIC (Back to Top & Dynamic Year)
    function initFooter() {
        const yearEl = document.getElementById('currentYear');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
        
        const btt = document.getElementById('backToTop');
        if (btt) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 400) {
                    btt.style.opacity = '1';
                    btt.style.visibility = 'visible';
                    btt.style.transform = 'translateY(0)';
                } else {
                    btt.style.opacity = '0';
                    btt.style.visibility = 'hidden';
                    btt.style.transform = 'translateY(20px)';
                }
            });
            btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }
    }

    // 4. 3D FLIP CARD LOGIC (About Section)
    const flipCard = document.getElementById('flipCard');
    if (flipCard) {
        flipCard.addEventListener('click', () => flipCard.classList.toggle('flipped'));
    }

    // 5. NATIVE SWIPE CAROUSEL (Project Belt)
    const viewer = document.getElementById('beltViewer');
    const prevBtn = document.getElementById('beltPrev');
    const nextBtn = document.getElementById('beltNext');
    const indexText = document.getElementById('beltIndex');
    const dotsContainer = document.getElementById('beltDots');
    const filterBtns = document.querySelectorAll('.belt-filters button');

    if (viewer) {
        let slides = Array.from(viewer.querySelectorAll('.belt-slide'));
        let visibleSlides = slides;
        
        function buildDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            visibleSlides.forEach((_, i) => {
                const dot = document.createElement('span');
                if (i === 0) dot.classList.add('active');
                dotsContainer.appendChild(dot);
            });
        }
        buildDots();

        // Button Controls
        if (nextBtn) nextBtn.addEventListener('click', () => {
            viewer.scrollBy({ left: viewer.offsetWidth, behavior: 'smooth' });
        });
        if (prevBtn) prevBtn.addEventListener('click', () => {
            viewer.scrollBy({ left: -viewer.offsetWidth, behavior: 'smooth' });
        });

        // Scroll Tracker (Updates counter and dots on native swipe/scroll)
        viewer.addEventListener('scroll', () => {
            const scrollPos = viewer.scrollLeft;
            const slideWidth = viewer.offsetWidth;
            // Calculate current index based on scroll position
            const currentIndex = Math.round(scrollPos / slideWidth);
            
            if (indexText) indexText.textContent = `${currentIndex + 1} / ${visibleSlides.length}`;
            
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('span');
                dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
            }
        });

        // Filter Logic
        if (filterBtns) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    const filter = e.target.dataset.filter;
                    slides.forEach(s => s.style.display = 'none');
                    
                    if (filter === 'all') {
                        visibleSlides = slides;
                    } else {
                        visibleSlides = slides.filter(s => s.dataset.sector === filter);
                    }
                    
                    visibleSlides.forEach(s => s.style.display = 'block');
                    viewer.scrollLeft = 0;
                    buildDots();
                    if (indexText) indexText.textContent = `1 / ${visibleSlides.length}`;
                });
            });
        }
    }

    // 6. ACCORDION & FAQ LOGIC
    const accordions = document.querySelectorAll('.accordion-header, .faq-item .trigger');
    accordions.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all siblings
            const parentList = item.parentElement;
            Array.from(parentList.children).forEach(sibling => {
                sibling.classList.remove('active');
            });

            // Open clicked item if it wasn't already open
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // 7. INITIALIZE ANIMATIONS (AOS)
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 600, once: true, offset: 40 });
    }
});