/* ==========================================================================
   PHASE 12: REVIEWS & TRUST SYSTEM - INTERACTION LOGIC
   AUTO-SCROLL & INTERACTION HANDLING
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.swipe-carousel');
    
    if (!carousel) return;

    let isPaused = false;

    // Smooth Auto-Scroll Logic
    const autoScroll = () => {
        if (isPaused) return;

        // Scroll by the width of one card
        const cardWidth = carousel.querySelector('.rev-card').offsetWidth + 30;
        
        if (carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - 10) {
            // Reset to start if at the end
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
    };

    // Cycle reviews every 5 seconds
    let scrollInterval = setInterval(autoScroll, 5000);

    // Pause on user interaction (hover or touch)
    const pauseInteraction = () => { isPaused = true; };
    const resumeInteraction = () => { isPaused = false; };

    carousel.addEventListener('mouseenter', pauseInteraction);
    carousel.addEventListener('mouseleave', resumeInteraction);
    carousel.addEventListener('touchstart', pauseInteraction);
    carousel.addEventListener('touchend', resumeInteraction);
});