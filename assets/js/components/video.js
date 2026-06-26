/* ==========================================================================
   COMPONENT: ASYMMETRIC TELEMETRY LOGIC
   LOCATION: assets/js/components/video.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. HOVER-PLAY ENGINE ---
    const cards = document.querySelectorAll('.cinematic-card');

    cards.forEach(card => {
        const video = card.querySelector('.js-hover-play');
        if (!video) return;

        // Force pause on load to prevent auto-play blocking
        video.pause();

        card.addEventListener('mouseenter', () => {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Telemetry: Autoplay prevented by browser context.", error);
                });
            }
        });

        card.addEventListener('mouseleave', () => {
            video.pause();
        });
    });

    // --- 2. UPLINK MODAL (LIGHTBOX) ---
    const triggers = document.querySelectorAll('.js-lightbox-trigger');
    const lightbox = document.getElementById('cinematicLightbox');
    const closeBtn = document.getElementById('closeCinematicLightbox');
    const player = document.getElementById('lightboxVideoPlayer');
    const videoSource = document.getElementById('lightboxVideoSource');

    if (!lightbox || !player || !videoSource) return;

    // Open Lightbox
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const src = trigger.getAttribute('data-video-src');
            
            if (src) {
                videoSource.src = src;
                player.load(); // Force load new source
                lightbox.classList.add('is-active');
                document.body.style.overflow = 'hidden'; // Stop background scrolling
                
                player.play().catch(err => console.log("User interaction required for audio playback."));
            }
        });
    });

    // Close Lightbox
    const closeUplink = () => {
        lightbox.classList.remove('is-active');
        document.body.style.overflow = ''; 
        player.pause();
        videoSource.src = ""; // Clear memory
    };

    if (closeBtn) closeBtn.addEventListener('click', closeUplink);

    lightbox.addEventListener('click', (e) => {
        if (e.target.classList.contains('lightbox-backdrop')) {
            closeUplink();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
            closeUplink();
        }
    });
});