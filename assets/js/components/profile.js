/* ==========================================================================
   COMPONENT: DIGITAL PROFILE ENGINE (AURUM 2077)
   TWO-SIDED LOGO FLIP | MAGNETIC INTERACTIONS | HUD DYNAMICS
   LOCATION: assets/js/components/profile.js
   ========================================================================== */

(function() {
    "use strict";

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfile);
    } else {
        initProfile();
    }

    /**
     * Main initialization function for the Profile section
     */
    function initProfile() {
        console.log("👤 PROFILE ENGINE: Initializing...");

        // --- 1. TWO-SIDED LOGO FLIP (Avatar) ---
        initAvatarFlip();

        // --- 2. HUD DYNAMIC DATE (Fallback if main.js doesn't handle it) ---
        updateHudDate();

        // --- 3. MAGNETIC BUTTONS (Profile-specific) ---
        initMagneticButtons();

        console.log("✅ PROFILE ENGINE: Ready.");
    }

    // ============================================================
    // 1. TWO-SIDED LOGO FLIP
    // ============================================================

    /**
     * Initializes the avatar flip functionality.
     * Clicking the avatar toggles the 'flipped' class.
     * Also supports keyboard accessibility (Enter/Space).
     */
    function initAvatarFlip() {
        var avatar = document.querySelector('.avatar-frame');

        if (!avatar) {
            console.warn("⚠️ PROFILE ENGINE: .avatar-frame not found.");
            return;
        }

        // --- Click handler ---
        avatar.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('flipped');
            console.log("🔄 PROFILE ENGINE: Avatar flipped.");
        });

        // --- Keyboard accessibility (Enter / Space) ---
        avatar.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('flipped');
                console.log("🔄 PROFILE ENGINE: Avatar flipped via keyboard.");
            }
        });

        // Make the avatar focusable for keyboard users
        avatar.setAttribute('tabindex', '0');
        avatar.setAttribute('role', 'button');
        avatar.setAttribute('aria-label', 'Logo umdrehen – Vorder- und Rückseite anzeigen');

        console.log("✅ PROFILE ENGINE: Avatar flip initialized.");
    }

    // ============================================================
    // 2. HUD DYNAMIC DATE
    // ============================================================

    /**
     * Updates the system date in the HUD monitor.
     * This is a fallback in case main.js doesn't handle it.
     */
    function updateHudDate() {
        var dateEl = document.getElementById('dynamic-date');
        if (dateEl) {
            var currentYear = new Date().getFullYear();
            dateEl.textContent = currentYear;
            console.log("📅 PROFILE ENGINE: HUD date updated to " + currentYear);
        }
    }

    // ============================================================
    // 3. MAGNETIC BUTTONS (Profile-specific)
    // ============================================================

    /**
     * Adds magnetic hover physics to buttons inside the profile section.
     * This is scoped to the profile section to avoid conflicts with global magnetic buttons.
     */
    function initMagneticButtons() {
        var profileSection = document.getElementById('profile');
        if (!profileSection) return;

        var magneticBtns = profileSection.querySelectorAll('.magnetic-target');

        magneticBtns.forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                var rect = this.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                this.style.transform = 'translate(' + (x * 0.12) + 'px, ' + (y * 0.12) + 'px)';
            });

            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0, 0)';
            });
        });
    }

})();