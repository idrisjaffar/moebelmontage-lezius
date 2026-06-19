/**
 * ==========================================================================
 * HIGH-END EDITORIAL LOGIC CORE (v2026.2)
 * ==========================================================================
 * FEATURES:
 * 1. Hardware-Accelerated Cinematic Parallax (Zero-Jank)
 * 2. Magnetic UI Physics for tactile engagement
 * 3. Micro-Haptics API Integration (Mobile Device Vibration)
 * 4. Dynamic Scroll Indication Fading
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // --- 1. MICRO-HAPTICS ENGINE ---
    // Provides subtle physical feedback on compatible mobile/tablet devices
    const triggerHaptic = (pattern = 10) => {
        if (typeof navigator.vibrate === "function") {
            navigator.vibrate(pattern);
        }
    };

    // --- 2. MAGNETIC UI PHYSICS ---
    // Creates a premium, heavy "pull" effect on call-to-action buttons
    const magneticElements = document.querySelectorAll('.reactive-btn');
    
    magneticElements.forEach(elem => {
        elem.addEventListener('mousemove', (e) => {
            // Only apply on Desktop to avoid interfering with mobile touch-scrolling
            if (window.innerWidth > 992) {
                const rect = elem.getBoundingClientRect();
                const h = rect.height;
                const w = rect.width;
                const x = e.clientX - rect.left - w / 2;
                const y = e.clientY - rect.top - h / 2;
                
                // 30% magnetic pull strength for a smooth, heavy feel
                elem.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
            }
        });

        elem.addEventListener('mouseleave', () => {
            // Snap back to origin
            elem.style.transform = `translate3d(0px, 0px, 0)`;
            triggerHaptic(10);
        });
        
        elem.addEventListener('click', () => triggerHaptic([15, 30]));
    });

    // --- 3. HIGH-PERFORMANCE PARALLAX (HERO COVER) ---
    // Ties the background image to the scroll depth using requestAnimationFrame
    const coverSection = document.querySelector('.mag-cover-section');
    const parallaxImg = document.querySelector('.bg-img-parallax');
    
    let ticking = false;

    const updateParallax = () => {
        if (!coverSection || !parallaxImg) return;
        
        const scrollY = window.scrollY;
        const coverHeight = coverSection.offsetHeight;

        // Only calculate math if the cover is actually visible on screen (saves CPU)
        if (scrollY <= coverHeight) {
            // Move image down at 15% of scroll speed to create deep cinematic depth
            const yPos = -(scrollY * 0.15); 
            
            // translate3d forces the browser to use the GPU instead of the CPU
            parallaxImg.style.transform = `translate3d(0, calc(-10% + ${yPos}px), 0)`;
        }
        
        ticking = false;
    };

    // Use passive: true to tell the browser this listener won't block scrolling
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });

    // --- 4. DYNAMIC SCROLL INDICATOR FADE ---
    // Fades out the "READ_MANIFESTO" mouse icon smoothly once the user begins reading
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 150) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '0.7';
                scrollIndicator.style.pointerEvents = 'auto';
            }
            scrollIndicator.style.transition = 'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
        }, { passive: true });
    }

    // --- 5. MISSION OS MODAL TACTILE BINDING ---
    // Ensures opening the modal provides a premium physical confirmation
    const osTriggers = document.querySelectorAll('.js-open-os');
    osTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            triggerHaptic([20, 40]); // Double pulse on open
        });
    });
});