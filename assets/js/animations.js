/**
 * RAPHAEL LEZIUS | SCROLL REVEALS
 * Progressive Enhancement · Safe Fallback · Performance-Optimized
 */
(function() {
    'use strict';

    // ── Add `.js` class to html for CSS targeting ──
    document.documentElement.classList.add('js');

    // ── Check if Intersection Observer is supported ──
    if (!('IntersectionObserver' in window)) {
        // Fallback: show all elements immediately
        document.querySelectorAll('.rl-reveal').forEach(function(el) {
            el.classList.add('is-visible');
        });
        console.log('⚠️ IntersectionObserver not supported – showing all elements.');
        return;
    }

    // ── Get all reveal elements ──
    var reveals = document.querySelectorAll('.rl-reveal');

    if (reveals.length === 0) return;

    // ── Create observer ──
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var target = entry.target;
                // Small delay for smooth appearance
                setTimeout(function() {
                    target.classList.add('is-visible');
                }, 50);
                observer.unobserve(target);
            }
        });
    }, {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05
    });

    // ── Observe all reveal elements ──
    reveals.forEach(function(reveal) {
        observer.observe(reveal);
    });

    // ── Fallback: if elements are still hidden after 3 seconds, show them ──
    setTimeout(function() {
        document.querySelectorAll('.rl-reveal:not(.is-visible)').forEach(function(el) {
            el.classList.add('is-visible');
        });
        console.log('⚠️ Fallback: revealed remaining elements after timeout.');
    }, 3000);

    console.log('✅ Scroll Reveals initialized.');
})();