/* ==========================================================================
   CAROUSEL ENGINE v2.0 – INDIVIDUAL SLIDE CAROUSELS
   One slide visible at a time with navigation controls
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    "use strict";

    console.log("🔄 CAROUSEL ENGINE v2.0: Initializing...");

    // --- 1. REVIEWS CAROUSEL (15 reviews) ---
    initCarousel({
        trackId: 'reviewCarouselTrack',
        prevBtnId: 'reviewPrevBtn',
        nextBtnId: 'reviewNextBtn',
        dotsId: 'reviewDots',
        autoplay: true,
        autoplayDelay: 5000,
        itemSelector: '.review-card-aurum'
    });

    // --- 2. VIDEO CAROUSEL (3 videos) ---
    initCarousel({
        trackId: 'telemetryCarouselTrack',
        prevBtnId: 'telemetryPrevBtn',
        nextBtnId: 'telemetryNextBtn',
        dotsId: 'telemetryDots',
        autoplay: true,
        autoplayDelay: 6000,
        itemSelector: '.cinematic-card'
    });

    console.log("✅ CAROUSEL ENGINE v2.0: Ready.");
});

/**
 * Initializes a carousel with individual slides.
 */
function initCarousel(config) {
    var track = document.getElementById(config.trackId);
    if (!track) {
        console.warn("⚠️ CAROUSEL: Track #" + config.trackId + " not found.");
        return;
    }

    var items = track.querySelectorAll(config.itemSelector);
    if (items.length === 0) {
        console.warn("⚠️ CAROUSEL: No items found in #" + config.trackId);
        return;
    }

    var currentIndex = 0;
    var totalItems = items.length;
    var autoTimer = null;

    // Set track to display flex, each item takes full width
    track.style.display = 'flex';
    track.style.transition = 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)';
    track.style.willChange = 'transform';

    // Set each item to full width
    items.forEach(function(item) {
        item.style.flex = '0 0 100%';
        item.style.minWidth = '100%';
        item.style.padding = '0 10px';
        item.style.boxSizing = 'border-box';
    });

    function moveToIndex(index) {
        if (index < 0) index = totalItems - 1;
        if (index >= totalItems) index = 0;
        currentIndex = index;

        var offset = -currentIndex * 100;
        track.style.transform = 'translateX(' + offset + '%)';

        // Update dots
        if (config.dotsId) {
            var dots = document.getElementById(config.dotsId);
            if (dots) {
                var dotElements = dots.querySelectorAll('.carousel-dot');
                dotElements.forEach(function(dot, i) {
                    dot.classList.toggle('active', i === currentIndex);
                });
            }
        }

        console.log("🔄 CAROUSEL: " + config.trackId + " moved to index " + currentIndex);
    }

    // Create dots
    if (config.dotsId) {
        var dotsContainer = document.getElementById(config.dotsId);
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (var i = 0; i < totalItems; i++) {
                var dot = document.createElement('div');
                dot.className = 'carousel-dot';
                if (i === 0) dot.classList.add('active');
                dot.setAttribute('role', 'button');
                dot.setAttribute('aria-label', 'Slide ' + (i + 1));
                dot.addEventListener('click', function(index) {
                    return function() {
                        stopAutoplay();
                        moveToIndex(index);
                        startAutoplay();
                    };
                }(i));
                dotsContainer.appendChild(dot);
            }
        }
    }

    // Navigation buttons
    if (config.prevBtnId) {
        var prevBtn = document.getElementById(config.prevBtnId);
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                stopAutoplay();
                moveToIndex(currentIndex - 1);
                startAutoplay();
            });
        }
    }

    if (config.nextBtnId) {
        var nextBtn = document.getElementById(config.nextBtnId);
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                stopAutoplay();
                moveToIndex(currentIndex + 1);
                startAutoplay();
            });
        }
    }

    // Touch swipe support
    var touchStartX = 0;
    var touchEndX = 0;

    track.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            stopAutoplay();
            if (diff > 0) {
                moveToIndex(currentIndex + 1);
            } else {
                moveToIndex(currentIndex - 1);
            }
            startAutoplay();
        }
    }, { passive: true });

    // Mouse drag (desktop)
    var isDragging = false;
    var startX = 0;
    var currentX = 0;

    track.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        track.style.transition = 'none';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        currentX = e.clientX;
        var diff = (startX - currentX) / track.offsetWidth * 100;
        var offset = -currentIndex * 100 - diff;
        track.style.transform = 'translateX(' + offset + '%)';
    });

    document.addEventListener('mouseup', function(e) {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)';

        var diff = startX - currentX;
        if (Math.abs(diff) > 50) {
            stopAutoplay();
            if (diff > 0) {
                moveToIndex(currentIndex + 1);
            } else {
                moveToIndex(currentIndex - 1);
            }
            startAutoplay();
        } else {
            moveToIndex(currentIndex);
        }
    });

    // Pause autoplay on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Autoplay
    function startAutoplay() {
        if (!config.autoplay) return;
        if (totalItems <= 1) return;
        stopAutoplay();
        autoTimer = setInterval(function() {
            moveToIndex(currentIndex + 1);
        }, config.autoplayDelay || 5000);
    }

    function stopAutoplay() {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    }

    // Initialize
    moveToIndex(0);
    if (config.autoplay && totalItems > 1) {
        startAutoplay();
    }

    // Handle window resize
    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            moveToIndex(currentIndex);
        }, 250);
    });

    console.log("✅ CAROUSEL: " + config.trackId + " initialized with " + totalItems + " slides.");
}