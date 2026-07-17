/* ==========================================================================
   COMPONENT: FAQ MAINFRAME ACCORDION (v3.0 – FULLY ROBUST)
   LOCATION: assets/js/components/faq.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log("❓ FAQ ENGINE: Initializing...");

    var faqItems = document.querySelectorAll('.js-faq-item');

    if (faqItems.length === 0) {
        console.warn("❓ FAQ ENGINE: No .js-faq-item elements found. Check your HTML.");
        return;
    }

    console.log("✅ FAQ ENGINE: Found " + faqItems.length + " items.");

    faqItems.forEach(function(item, index) {
        var trigger = item.querySelector('.faq-trigger');
        var content = item.querySelector('.faq-content');

        if (!trigger || !content) {
            console.warn("⚠️ FAQ ENGINE: Item " + index + " missing trigger or content.");
            return;
        }

        // --- Initial state: hidden with smooth transition ---
        content.style.maxHeight = '0px';
        content.style.overflow = 'hidden';
        content.style.transition = 'max-height 0.5s cubic-bezier(0.2, 0, 0.1, 1)';

        // --- Click Handler ---
        trigger.addEventListener('click', function(e) {
            e.preventDefault();

            // Determine if this item is currently open
            var isActive = item.classList.contains('active');

            // --- Close all other open items ---
            faqItems.forEach(function(otherItem) {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    var otherContent = otherItem.querySelector('.faq-content');
                    if (otherContent) {
                        otherContent.style.maxHeight = '0px';
                    }
                    // Update aria-expanded for accessibility
                    var otherTrigger = otherItem.querySelector('.faq-trigger');
                    if (otherTrigger) {
                        otherTrigger.setAttribute('aria-expanded', 'false');
                    }
                }
            });

            // --- Toggle current item ---
            if (isActive) {
                // Close it
                item.classList.remove('active');
                content.style.maxHeight = '0px';
                trigger.setAttribute('aria-expanded', 'false');
                console.log("❓ FAQ ENGINE: Closed item " + index);
            } else {
                // Open it
                item.classList.add('active');

                // Get the natural height of the content (including padding)
                var fullHeight = content.scrollHeight;

                // Animate to full height
                content.style.maxHeight = fullHeight + 'px';
                trigger.setAttribute('aria-expanded', 'true');

                console.log("❓ FAQ ENGINE: Opened item " + index + " (height: " + fullHeight + "px)");

                // After the animation ends, we could set maxHeight to 'none' to allow dynamic content changes,
                // but that would break the transition for closing. So we keep it as the exact value.
                // However, if you want to allow dynamic height changes (e.g., if the content changes after opening),
                // you can uncomment the following lines:
                /*
                setTimeout(function() {
                    content.style.maxHeight = 'none';
                }, 550); // slightly longer than transition duration
                */
            }
        });

        // --- Set initial aria-expanded state ---
        trigger.setAttribute('aria-expanded', 'false');
    });

    console.log("✅ FAQ ENGINE: Fully initialized.");
});