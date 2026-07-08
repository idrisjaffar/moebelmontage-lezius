/* ==========================================================================
   RAPHAEL LEZIUS | SYSTEM SERVICES ENGINE (v2077.1)
   LOCATION: assets/js/components/services.js
   ARCHITECTURE: DYNAMIC HEIGHT CALCULATION | MUTUALLY EXCLUSIVE TOGGLE
   ========================================================================== */

(function() {
    "use strict";

    class AccordionEngine {
        constructor() {
            this.triggers = document.querySelectorAll('.js-accordion-trigger');
            this.init();
        }

        init() {
            if (this.triggers.length === 0) {
                console.warn("[SYS_SERVICES] Engine offline: No accordion triggers found.");
                return;
            }

            // 1. Attach click listeners to all module headers
            this.triggers.forEach(trigger => {
                trigger.addEventListener('click', (e) => this.toggleAccordion(e.currentTarget));
            });

            // 2. Recalculate height on window resize to prevent text clipping
            window.addEventListener('resize', () => {
                const activeContent = document.querySelector('.sys-accordion-item.is-active .sys-accordion-content');
                if (activeContent) {
                    // Instantly update the max-height to accommodate text reflow
                    activeContent.style.maxHeight = activeContent.scrollHeight + "px";
                }
            });

            console.log("[SYS_SERVICES] Blueprint Engine initialized.");
        }

        toggleAccordion(clickedTrigger) {
            const currentItem = clickedTrigger.parentElement;
            const currentContent = clickedTrigger.nextElementSibling;
            const isActive = currentItem.classList.contains('is-active');

            // Close all other modules first (Terminal-style focus)
            this.closeAll();

            // If the clicked module wasn't already active, open it
            if (!isActive) {
                currentItem.classList.add('is-active');
                clickedTrigger.setAttribute('aria-expanded', 'true');
                
                // The magic: calculates exactly how many pixels the hidden content needs
                currentContent.style.maxHeight = currentContent.scrollHeight + "px";
            }
        }

        closeAll() {
            const allItems = document.querySelectorAll('.sys-accordion-item');
            allItems.forEach(item => {
                item.classList.remove('is-active');
                
                const trigger = item.querySelector('.sys-accordion-header');
                const content = item.querySelector('.sys-accordion-content');
                
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
                
                // Collapse the content back to 0px
                if (content) content.style.maxHeight = null; 
            });
        }
    }

    // Boot the engine when the DOM is fully loaded
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => new AccordionEngine());
    } else {
        new AccordionEngine();
    }

})();