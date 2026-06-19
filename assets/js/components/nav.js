/* ==========================================================================
   RAPHAEL LEZIUS | NAVIGATION LOGIC
   ========================================================================== */

const initNav = () => {
    // 1. Live Telemetry Clock
    const clock = document.getElementById('telemetryClock');
    if (clock) {
        setInterval(() => {
            const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            clock.querySelector('.time-display').innerText = time;
        }, 1000);
    }

    // 2. Mobile Menu Logic
    const toggle = document.getElementById('mobileMenuToggle');
    const menu = document.getElementById('fluidMobileMenu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('is-active');
            menu.classList.toggle('is-open');
        });
    }
};

// Initialize
initNav();