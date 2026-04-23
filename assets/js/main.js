/* ==========================================================================
   RAPHAEL LEZIUS | 2026 JS ENGINE (PHASE 3.1)
   CORE SYSTEM, HARDWARE APIS & RESOURCE MANAGEMENT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // ----------------------------------------------------------------------
    // 1. SYSTEM INITIALIZATION
    // Removes the CSS block that hides elements if JS is disabled
    // ----------------------------------------------------------------------
    setTimeout(() => {
        document.body.classList.remove('no-js-override');
    }, 50);


    // ----------------------------------------------------------------------
    // 2. DYNAMIC DATA INJECTION
    // Grabs the exact current date and injects it into the HUD monitor
    // ----------------------------------------------------------------------
    const dateElement = document.getElementById('dynamic-date');
    if (dateElement) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\./g, '/'); // Formats to DD/MM/YYYY for a tech aesthetic
        
        dateElement.textContent = `SYS.${formattedDate}`;
    }


    // ----------------------------------------------------------------------
    // 3. AOS ANIMATION FALLBACK ENGINE
    // Initializes animations, forces visibility if a browser blocks the script
    // ----------------------------------------------------------------------
    if (typeof window.AOS !== 'undefined') {
        try {
            AOS.init({ 
                duration: 800, 
                offset: 30, 
                once: true 
            });
        } catch(e) { 
            console.warn("AOS initialization skipped or failed."); 
        }
    } else {
        // Fallback: manually make all animated elements visible
        document.querySelectorAll('[data-aos]').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.visibility = 'visible';
        });
    }


    // ----------------------------------------------------------------------
    // 4. HAPTIC ENGINE (2026 TACTILE FEEDBACK)
    // Uses pointerdown (works on touch and mouse) to trigger hardware vibration
    // ----------------------------------------------------------------------
    const initHaptics = () => {
        const canVibrate = window.navigator && window.navigator.vibrate;
        if (!canVibrate) return; // Exit if the device doesn't support vibration
        
        document.querySelectorAll('.js-vibrate-heavy').forEach(el => {
            el.addEventListener('pointerdown', () => {
                navigator.vibrate([15, 30]); // Double pulse
            });
        });

        document.querySelectorAll('.js-vibrate-light').forEach(el => {
            el.addEventListener('pointerdown', () => {
                navigator.vibrate(10); // Single light pulse
            });
        });
    };
    initHaptics();


    // ----------------------------------------------------------------------
    // 5. INTELLIGENT RESOURCE MANAGER (INTERSECTION OBSERVER)
    // Pauses background videos when scrolled out of view to save battery/RAM
    // ----------------------------------------------------------------------
    const initVideoObserver = () => {
        const videos = document.querySelectorAll('video.hero-video, video.cinematic-video');
        
        if ('IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target;
                    // Play if at least 10% visible, pause if out of view
                    if (entry.isIntersecting) {
                        video.play().catch(() => {
                            // Silently catch errors on strict browsers blocking autoplay
                        });
                    } else {
                        video.pause();
                    }
                });
            }, { threshold: 0.1 }); 

            videos.forEach(video => videoObserver.observe(video));
        }
    };
    initVideoObserver();

});

// ==========================================================================
    // PHASE 3.2: UI/UX & NAVIGATION (THE INTERFACE)
    // ==========================================================================

    // ----------------------------------------------------------------------
    // 6. SMART NAVBAR (SCROLL PHYSICS)
    // Shrinks the navbar and increases glassmorphism blur when scrolling down
    // ----------------------------------------------------------------------
    const initSmartNavbar = () => {
        const navbar = document.querySelector('.cyber-navbar');
        if (!navbar) return;

        // Using passive: true for scroll events heavily optimizes performance
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('is-scrolled');
            } else {
                navbar.classList.remove('is-scrolled');
            }
        }, { passive: true });
    };
    initSmartNavbar();


    // ----------------------------------------------------------------------
    // 7. MOBILE MENU CONTROLLER & AUTO-CLOSE PROTOCOL
    // Handles the hamburger animation, overlay toggle, and scroll locking
    // ----------------------------------------------------------------------
    const initMobileMenu = () => {
        const hamburger = document.getElementById('hamburgerBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        // Select all links inside the mobile menu that should trigger a close
        const closeTriggers = document.querySelectorAll('.mobile-sub-link, .mobile-cyber-link, .js-close-mobile-menu');

        if (!hamburger || !mobileMenu) return;

        // Core toggle function
        const toggleMenu = () => {
            hamburger.classList.toggle('active');
            const isActive = mobileMenu.classList.toggle('active');
            
            // Lock body scroll when open to prevent background scrolling (Native App Feel)
            document.body.style.overflow = isActive ? 'hidden' : '';
        };

        // Bind toggle to hamburger click
        hamburger.addEventListener('click', toggleMenu);

        // Auto-Close Protocol: Close menu when a link or specific button is tapped
        closeTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                if (mobileMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    };
    initMobileMenu();

    // ==========================================================================
    // PHASE 3.3: INTERACTIVE COMPONENTS (THE MODULES)
    // ==========================================================================

    // ----------------------------------------------------------------------
    // 8. ACCORDION LOGIC (SYSTEM INTEGRATION & FAQ)
    // Smoothly opens modules and auto-closes previously opened ones
    // ----------------------------------------------------------------------
    const initAccordions = () => {
        // System Integration Accordions
        const sectors = document.querySelectorAll('.js-expand-sector');
        sectors.forEach(sector => {
            sector.addEventListener('click', () => {
                const isActive = sector.classList.contains('active');
                sectors.forEach(s => s.classList.remove('active')); // Close all
                if (!isActive) sector.classList.add('active'); // Open clicked
            });
        });

        // FAQ Accordions (Using slightly different classes based on your CSS)
        const faqs = document.querySelectorAll('.js-toggle-faq');
        faqs.forEach(faq => {
            faq.addEventListener('click', () => {
                const isOpen = faq.classList.contains('open');
                faqs.forEach(f => f.classList.remove('open')); // Close all
                if (!isOpen) faq.classList.add('open'); // Open clicked
            });
        });
    };
    initAccordions();


    // ----------------------------------------------------------------------
    // 9. SMART SWIPE CAROUSELS (INSTAGRAM STYLE)
    // Synchronizes the horizontal scroll position with the pagination dots
    // ----------------------------------------------------------------------
    const initCarousels = () => {
        const setupCarousel = (carouselId, indicatorsId) => {
            const carousel = document.getElementById(carouselId);
            const indicators = document.getElementById(indicatorsId);
            
            if (!carousel || !indicators) return;

            const items = carousel.querySelectorAll('.swipe-item');
            const dots = indicators.querySelectorAll('.dot');

            carousel.addEventListener('scroll', () => {
                const scrollPosition = carousel.scrollLeft;
                // Calculate width including the 20px CSS gap
                const itemWidth = items[0].offsetWidth + 20; 
                const activeIndex = Math.round(scrollPosition / itemWidth);

                dots.forEach((dot, index) => {
                    if (index === activeIndex) {
                        dot.classList.add('active', 'gold-active');
                    } else {
                        dot.classList.remove('active', 'gold-active');
                    }
                });
            }, { passive: true }); // Optimized for smooth scrolling
        };

        setupCarousel('philosophyCarousel', 'philosophyIndicators');
        setupCarousel('reviewCarousel', 'reviewIndicators');
    };
    initCarousels();


    // ----------------------------------------------------------------------
    // 10. PROJEKT BELT CONTROLLER (GALLERY)
    // Controls the infinite CSS animation direction and pauses on hover
    // ----------------------------------------------------------------------
    const initBeltController = () => {
        const belt = document.getElementById('imageBelt');
        const prevBtn = document.getElementById('prevBelt');
        const nextBtn = document.getElementById('nextBelt');

        if (!belt) return;

        // Button Controls
        if (prevBtn) prevBtn.addEventListener('click', () => belt.style.animationDirection = 'reverse');
        if (nextBtn) nextBtn.addEventListener('click', () => belt.style.animationDirection = 'normal');

        // Premium UX: Pause the fast-moving belt when the user hovers over it
        belt.addEventListener('mouseenter', () => belt.style.animationPlayState = 'paused');
        belt.addEventListener('mouseleave', () => belt.style.animationPlayState = 'running');
    };
    initBeltController();


    // ----------------------------------------------------------------------
    // 11. MAGNETIC BUTTON PHYSICS (PREMIUM DESKTOP UX)
    // Pulls the button slightly toward the user's cursor on hover
    // ----------------------------------------------------------------------
    const initMagneticButtons = () => {
        const magnetButtons = document.querySelectorAll('.btn-magnetic');
        
        magnetButtons.forEach(btn => {
            // Remove CSS transition during hover so the JS math doesn't lag
            btn.addEventListener('mouseenter', () => {
                btn.style.transition = 'none'; 
            });

            // Calculate gravity pull
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const h = rect.width / 2;
                const v = rect.height / 2;
                const x = e.clientX - rect.left - h;
                const y = e.clientY - rect.top - v;
                
                // Multiplier (0.2) controls the strength of the magnet
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            // Snap back to center with CSS spring physics when mouse leaves
            btn.addEventListener('mouseleave', () => {
                btn.style.transition = 'var(--spring)'; 
                btn.style.transform = `translate(0px, 0px)`;
            });
        });
    };
    // Only initialize magnetic physics on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        initMagneticButtons();
    }

    // ==========================================================================
    // PHASE 3.4: MISSION_OS APP LOGIC (THE LEAD FORM)
    // ==========================================================================

    // ----------------------------------------------------------------------
    // 12. OVERLAY TOGGLE & SCROLL LOCK
    // Opens the MissionOS, locks the background, and plays the entrance animation
    // ----------------------------------------------------------------------
    const initMissionOS = () => {
        const osOverlay = document.getElementById('missionOS');
        const openTriggers = document.querySelectorAll('.js-open-os');
        const closeTriggers = document.querySelectorAll('.js-close-os');

        if (!osOverlay) return;

        const openOS = () => {
            osOverlay.classList.add('system-active');
            document.body.style.overflow = 'hidden'; // Lock background scroll
        };

        const closeOS = () => {
            osOverlay.classList.remove('system-active');
            document.body.style.overflow = ''; // Unlock background scroll
        };

        openTriggers.forEach(trigger => trigger.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor jumps
            openOS();
        }));

        closeTriggers.forEach(trigger => trigger.addEventListener('click', closeOS));
    };
    initMissionOS();


    // ----------------------------------------------------------------------
    // 13. PHASE ROUTING (MULTI-STEP FORM)
    // Seamlessly transitions between form steps and updates the sidebar HUD
    // ----------------------------------------------------------------------
    const initPhaseRouting = () => {
        const navButtons = document.querySelectorAll('.js-phase-nav');
        const phases = document.querySelectorAll('.case-phase');
        const sidebarSteps = document.querySelectorAll('.step-link');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                if (!targetId) return;

                // 1. Hide all phases, show target phase
                phases.forEach(p => p.classList.remove('active'));
                const targetPhase = document.getElementById(targetId);
                if (targetPhase) targetPhase.classList.add('active');

                // 2. Update Sidebar Tracker 
                // Note: We match the sidebar step by looking at its data-target attribute
                sidebarSteps.forEach(step => {
                    if (step.getAttribute('data-target') === targetId) {
                        step.classList.add('active');
                    } else {
                        step.classList.remove('active');
                    }
                });
            });
        });
    };
    initPhaseRouting();


    // ----------------------------------------------------------------------
    // 14. SMART FORM MEMORY (LOCAL STORAGE)
    // Auto-saves user input so data isn't lost if they accidentally close the tab
    // ----------------------------------------------------------------------
    const initFormMemory = () => {
        const form = document.getElementById('leziusCaseForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        const STORAGE_KEY = 'missionOS_draft_data';

        // 1. Load saved data on init
        const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        inputs.forEach(input => {
            if (savedData[input.name]) {
                input.value = savedData[input.name];
            }

            // 2. Save data continuously on input
            input.addEventListener('input', () => {
                savedData[input.name] = input.value;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
            });
        });

        // 3. Clear data on successful submit
        form.addEventListener('submit', () => {
            localStorage.removeItem(STORAGE_KEY);
        });
    };
    initFormMemory();