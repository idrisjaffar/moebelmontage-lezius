/* ==========================================================================
   SYSTEM SERVICES ACCORDION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const triggers = document.querySelectorAll('.js-accordion-trigger');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const item = this.parentElement;
            const content = this.nextElementSibling;
            const isActive = item.classList.contains('is-active');

            // Close all other accordions first 
            document.querySelectorAll('.sys-accordion-item').forEach(otherItem => {
                otherItem.classList.remove('is-active');
                otherItem.querySelector('.sys-accordion-header').setAttribute('aria-expanded', 'false');
                otherItem.querySelector('.sys-accordion-content').style.maxHeight = null;
            });

            // Toggle current accordion
            if (!isActive) {
                item.classList.add('is-active');
                this.setAttribute('aria-expanded', 'true');
                // Calculate exact height needed for smooth animation
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});