/* ==========================================================================
   COMPONENT: ASYMMETRIC TELEMETRY LOGIC (V3.0 - HARD-WIRED)
   LOCATION: assets/js/components/video.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log("📡 TELEMETRY ENGINE: System initialized.");

    // --- 1. HOVER-PLAY ENGINE ---
    const cards = document.querySelectorAll('.cinematic-card');

    cards.forEach(function(card) {
        const video = card.querySelector('.js-hover-play');
        if (!video) return;

        // Force pause on load to prevent auto-play blocking
        video.pause();

        card.addEventListener('mouseenter', function() {
            var playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(function(error) {
                    console.warn("Telemetry: Autoplay prevented by browser context.", error);
                });
            }
        });

        card.addEventListener('mouseleave', function() {
            video.pause();
        });
    });

    // --- 2. UPLINK MODAL (LIGHTBOX) ---
    var triggers = document.querySelectorAll('.js-lightbox-trigger');
    var lightbox = document.getElementById('cinematicLightbox');
    var closeBtn = document.getElementById('closeCinematicLightbox');
    var player = document.getElementById('lightboxVideoPlayer');
    var videoSource = document.getElementById('lightboxVideoSource');

    if (!lightbox || !player || !videoSource) return;

    // Open Lightbox
    triggers.forEach(function(trigger) {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
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
                    console.log("User interaction required for audio playback.");
                });
            }
        });
    });

    // Close Lightbox
    var closeUplink = function() {
        lightbox.classList.remove('is-active');
        setTimeout(function() {
            lightbox.style.display = 'none';
        }, 400);
        document.body.style.overflow = '';
        player.pause();
        videoSource.src = "";
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeUplink);
    }

    lightbox.addEventListener('click', function(e) {
        if (e.target.classList.contains('lightbox-backdrop')) {
            closeUplink();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
            closeUplink();
        }
    });
});