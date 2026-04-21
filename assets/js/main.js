/* ==========================================================================
   RAPHAEL LEZIUS | 2026 HUD MASTER ENGINE (main.js)
   ARCHITECTURE: KINETIC 3D, HAPTIC-SENSITIVE, HARDWARE-AWARE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. HARDWARE SENSORS & SYSTEM STATE
    // ==========================================================================
    const state = {
        lowPerformance: false,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        isDesktop: window.matchMedia("(pointer: fine)").matches
    };

    // A. Battery Awareness (Eco Mode)
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const updateEcoMode = () => {
                state.lowPerformance = battery.level < 0.2 && !battery.charging;
                document.body.classList.toggle('eco-mode', state.lowPerformance);
            };
            battery.addEventListener('levelchange', updateEcoMode);
            updateEcoMode();
        });
    }

    // B. Standardized Haptic Engine
    window.triggerHaptic = (pattern) => {
        if (!state.lowPerformance && navigator.vibrate && !state.reducedMotion) {
            navigator.vibrate(pattern);
        }
    };

    // C. Gyroscope Parallax (ID Card Tilt on Mobile)
    const idCard = document.querySelector('.id-card');
    if (idCard && window.DeviceOrientationEvent && !state.isDesktop) {
        window.addEventListener('deviceorientation', (event) => {
            const tiltX = Math.max(-20, Math.min(20, event.beta - 45)); 
            const tiltY = Math.max(-20, Math.min(20, event.gamma));
            requestAnimationFrame(() => {
                idCard.style.transform = `rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
                idCard.style.boxShadow = `${-tiltY}px ${tiltX}px 40px rgba(255,0,127,0.2)`;
            });
        });
    }

    // ==========================================================================
    // 2. NAVIGATION & UI OBSERVERS
    // ==========================================================================
    
    // A. Sticky Navbar Blur Effect
    const nav = document.querySelector('.cyber-navbar');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.style.background = 'rgba(5, 6, 8, 0.98)';
                nav.style.padding = '10px 0';
            } else {
                nav.style.background = 'rgba(5, 6, 8, 0.85)';
                nav.style.padding = '20px 0';
            }
        }, { passive: true });
    }

    // B. Accessible Mobile Hamburger
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isActive = mobileMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
            window.triggerHaptic(isActive ? 20 : [10, 10]);
        });
    }

    // C. Intersection Observer for 120fps Swipe Carousels
    const setupCarousel = (carouselId, indicatorsId) => {
        const carousel = document.getElementById(carouselId);
        const indicators = document.getElementById(indicatorsId);
        if (!carousel || !indicators) return;

        const items = carousel.querySelectorAll('.swipe-item');
        const dots = indicators.querySelectorAll('.dot');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeIndex = Array.from(items).indexOf(entry.target);
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('active', index === activeIndex);
                    });
                }
            });
        }, { root: carousel, threshold: 0.6 }); 

        items.forEach(item => observer.observe(item));
    };

    setupCarousel('philosophyCarousel', 'philosophyIndicators');
    setupCarousel('reviewCarousel', 'reviewIndicators');

    // ==========================================================================
    // 3. INTERACTIVE COMPONENTS (ACCORDIONS & BELTS)
    // ==========================================================================

    // A. CSS-Grid Driven Accordions (FAQ & Sectors)
    window.toggleModule = function(element) {
        const isOpen = element.classList.contains('open') || element.classList.contains('active');
        
        // Close all others
        document.querySelectorAll('.faq-module, .sector-module').forEach(mod => {
            mod.classList.remove('active', 'open');
        });
        
        // Open Clicked
        if (!isOpen) {
            const activeClass = element.classList.contains('sector-module') ? 'active' : 'open';
            element.classList.add(activeClass);
            window.triggerHaptic(10);
        }
    };

    // B. Project Belt Controls
    const belt = document.getElementById('imageBelt');
    if(belt) {
        document.getElementById('prevBelt')?.addEventListener('click', () => { 
            belt.style.animationDirection = 'reverse'; 
            window.triggerHaptic(10); 
        });
        document.getElementById('nextBelt')?.addEventListener('click', () => { 
            belt.style.animationDirection = 'normal'; 
            window.triggerHaptic(10); 
        });
    }

    // ==========================================================================
    // 4. MISSION OS (LEAD CAPTURE FORM WITH A11Y FOCUS TRAP)
    // ==========================================================================
    window.MissionOS = (function() {
        const os = document.getElementById('missionOS');
        const firstInput = os ? os.querySelector('input, button, select, textarea') : null;
        let previouslyFocusedElement = null;

        const handleKeyDown = function(e) {
            if (e.key === 'Escape') closeOS();
            
            if (e.key === 'Tab') {
                const focusable = os.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if(!focusable.length) return;
                
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                
                if (e.shiftKey && document.activeElement === first) { 
                    last.focus(); e.preventDefault(); 
                } else if (!e.shiftKey && document.activeElement === last) { 
                    first.focus(); e.preventDefault(); 
                }
            }
        };

        const openOS = function() {
            if(!os) return;
            previouslyFocusedElement = document.activeElement;
            os.classList.add('system-active');
            document.body.style.overflow = 'hidden';
            
            document.addEventListener('keydown', handleKeyDown);
            if(firstInput) setTimeout(() => firstInput.focus(), 100);
            window.triggerHaptic([10, 30, 10]);
        };

        const closeOS = function() {
            if(!os) return;
            os.classList.remove('system-active');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
            
            if (previouslyFocusedElement) previouslyFocusedElement.focus();
        };

        // Attach close events to backdrop and close button
        os?.querySelector('.os-backdrop')?.addEventListener('click', closeOS);
        os?.querySelector('.case-close')?.addEventListener('click', closeOS);

        return { open: openOS, close: closeOS };
    })();

    // ==========================================================================
    // 5. EXTERNAL PAGE LOGIC (GALLERY & TERMINALS)
    // ==========================================================================

    // A. Gallery Portfolio Rendering
    const grid = document.getElementById('main-gallery-grid');
    if (grid) {
        // Reduced portfolio array for brevity (Keep your full array in actual code)
        const portfolio = [
            { id: 'k1', cat: 'kueche', title: 'Küchen-Sonderbau', files: ['kueche-1-a.webp'] },
            { id: 'w1', cat: 'wohnen', title: 'TV-Board Schwebend', files: ['wohnen-1-a.webp'] },
            { id: 's1', cat: 'schlafen', title: 'IKEA PAX Systemwand', files: ['sz-1-a.webp'] }
            // ADD YOUR FULL PORTFOLIO ARRAY HERE
        ];

        portfolio.forEach((proj, idx) => {
            const item = document.createElement('div');
            item.className = `bento-item ${proj.cat}`;
            item.setAttribute('data-aos', 'fade-up');
            item.setAttribute('data-aos-delay', (idx % 3) * 50);

            let extras = proj.files.slice(1).map(file => `<a data-fslightbox="${proj.id}" href="./assets/images/${file}"></a>`).join('');

            item.innerHTML = `
                <a data-fslightbox="${proj.id}" href="./assets/images/${proj.files[0]}" class="bento-link">
                    <img src="./assets/images/${proj.files[0]}" alt="${proj.title}" class="bento-image" loading="lazy">
                    <div class="bento-overlay">
                        <div class="bento-tags">
                            <span class="bento-tag tag-count">${proj.files.length > 1 ? proj.files.length + ' Winkel' : 'Verifiziert'}</span>
                            <span class="bento-tag tag-premium">PRÄZISION</span>
                        </div>
                        <h3 class="bento-title">${proj.title}</h3>
                        <div class="bento-action"><i class="fas fa-crosshairs"></i> SCAN ÖFFNEN</div>
                    </div>
                </a>
                ${extras}
            `;
            grid.appendChild(item);

            // 3D Hover (Desktop Only)
            if (state.isDesktop && !state.reducedMotion) {
                item.addEventListener('mousemove', (e) => {
                    const rect = item.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
                    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
                    item.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.03, 1.03, 1.03)`;
                });
                item.addEventListener('mouseleave', () => {
                    item.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
                });
            }
        });
        setTimeout(() => { if (typeof refreshFsLightbox !== 'undefined') refreshFsLightbox(); }, 500);
    }

    // B. Gallery Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.triggerHaptic(15);
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const val = btn.getAttribute('data-filter');
            document.querySelectorAll('.bento-item').forEach(item => {
                if (val === 'all' || item.classList.contains(val)) {
                    item.style.display = 'block';
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => { item.style.display = 'none'; }, 300);
                }
            });
        });
    });

    // C. Terminal Feed (Area.html)
    const feedContainer = document.getElementById("live-dispatch-feed");
    if (feedContainer) {
        const messages = [
            { t: "SYS:", m: "BOSCH Professional geladen." },
            { t: "LOG:", m: "HEPA-H13 Absaugung bereit." },
            { t: "DIS:", m: "Auftrag Augsburg erfasst." },
            { t: "SEC:", m: "Haftpflicht-Schutz: AKTIV" }
        ];
        let i = 0;
        const inject = () => {
            if (feedContainer.children.length >= 3) feedContainer.removeChild(feedContainer.firstElementChild);
            const line = document.createElement("div");
            line.className = "stream-line";
            line.innerHTML = `<span class="time">${messages[i].t}</span><span class="msg">${messages[i].m}</span>`;
            feedContainer.appendChild(line);
            i = (i + 1) % messages.length;
            setTimeout(inject, 4000);
        };
        inject();
    }

    // ==========================================================================
    // 6. INITIALIZATION 
    // ==========================================================================
    
    // Init AOS Animations
    setTimeout(() => document.body.classList.remove('no-js-override'), 100);
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, disable: state.reducedMotion, offset: 100 });
    }

    // Dynamic Copyright Year
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.innerText = new Date().getFullYear();

});