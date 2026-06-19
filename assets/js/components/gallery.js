/**
 * ==========================================================================
 * GALLERY ENGINE (v2026.6)
 * Handles filter toggling and lightbox refreshing
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. FILTER LOGIC
    // This looks for buttons with data-filter and shows/hides cards accordingly
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.bento-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state of buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filter = e.target.dataset.filter;

            // Show/Hide cards
            cards.forEach(card => {
                if (filter === 'all' || card.classList.contains(filter)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });

            // Re-initialize lightbox after filtering
            if (typeof refreshFsLightbox === 'function') {
                refreshFsLightbox();
            }
        });
    });

    // 2. LIGHTBOX INITIALIZATION
    // Ensures FsLightbox is ready for the static HTML images
    if (typeof refreshFsLightbox === 'function') {
        refreshFsLightbox();
    }
});