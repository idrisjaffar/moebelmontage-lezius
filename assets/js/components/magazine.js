/**
 * ==========================================================================
 * MAGAZINE & EDITORIAL LOGIC CORE (v2026.1)
 * ==========================================================================
 * FEATURES:
 * 1. Hardware-Accelerated Parallax (Zero-Jank Scrolling)
 * 2. Magnetic UI Physics for Call-to-Actions
 * 3. Micro-Haptics API Integration
 * 4. Dynamic Scroll Indication Fading
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // --- 1. MICRO-HAPTICS ENGINE ---
    // Provides subtle physical feedback on mobile devices
    const triggerHaptic = (intensity = 10) => {
        if (typeof navigator.vibrate === "function") {
            navigator.vibrate(intensity);
        }
    };

    // --- 2. MAGNETIC UI PHYSICS ---
    // Creates a premium, heavy "pull" effect on buttons when the mouse hovers
    const magneticElements = document.querySelectorAll('.reactive-btn, .mag-action-box button');
    
    magneticElements.forEach(elem => {
        elem.addEventListener('mousemove', (e) => {
            // Only apply on Desktop to avoid mobile touch-drag issues
            if (window.innerWidth > 992) {
                const rect = elem.getBoundingClientRect();
                const h = rect.height;
                const w = rect.width;
                const x = e.clientX - rect.left - w / 2;
                const y = e.clientY - rect.top - h / 2;
                
                // 30% magnetic pull strength
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

        // Only calculate the math if the cover is actually visible on screen
        if (scrollY <= coverHeight) {
            // Move image down at 15% of scroll speed to create deep cinematic depth
            const yPos = -(scrollY * 0.15); 
            
            // Note: the CSS already sets transform to -10% to prevent white gaps at the top
            parallaxImg.style.transform = `translate3d(0, calc(-10% + ${yPos}px), 0)`;
        }
        
        ticking = false;
    };

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
});