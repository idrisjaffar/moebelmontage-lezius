/* ==========================================================================
   VIDEO-CONTROLLER-LOGIC
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.cinematic-card');
    const lightbox = document.getElementById('videoLightbox');
    const player = document.getElementById('lightboxPlayer');

    // Hover Playback
    cards.forEach(card => {
        const vid = card.querySelector('video');
        card.addEventListener('mouseenter', () => vid.play().catch(() => {}));
        card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
        
        // Lightbox Trigger
        card.addEventListener('click', () => {
            const src = card.getAttribute('data-video-src');
            player.src = src;
            lightbox.classList.add('active');
            player.play();
        });
    });

    // Close
    document.getElementById('closeLightbox').addEventListener('click', () => {
        lightbox.classList.remove('active');
        player.pause();
    });
});