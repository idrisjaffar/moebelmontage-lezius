/* ==========================================================================
   RAPHAEL LEZIUS | COMPONENT: MEGA FOOTER ENGINE (footer.js)
   ========================================================================== */

const initFooterEngine = () => {
    // 1. LIVE BAVARIAN CLOCK (System Status)
    const timeDisplay = document.getElementById('footerLocalTime');
    if (timeDisplay) {
        setInterval(() => {
            // Get current time in Augsburg/Munich (CET/CEST)
            const options = { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            const timeString = new Intl.DateTimeFormat('de-DE', options).format(new Date());
            timeDisplay.innerText = timeString;
        }, 1000);
    }

    // 2. AUTO-UPDATE COPYRIGHT YEAR
    const yearDisplay = document.getElementById('currentYear');
    if (yearDisplay) {
        yearDisplay.innerText = new Date().getFullYear();
    }

    // 3. MAGNETIC HOVER PHYSICS (For Comms Station on Desktop)
    if (window.innerWidth > 991) {
        const magneticElements = document.querySelectorAll('.js-magnetic-footer');
        
        magneticElements.forEach(elem => {
            elem.addEventListener('mousemove', (e) => {
                const pos = elem.getBoundingClientRect();
                const x = e.clientX - pos.left - pos.width / 2;
                const y = e.clientY - pos.top - pos.height / 2;
                
                // Subtle pull effect
                elem.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
                
                // Move the icon slightly more for parallax
                const icon = elem.querySelector('i');
                if(icon) icon.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            elem.addEventListener('mouseleave', () => {
                elem.style.transform = 'translate(0px, 0px)';
                const icon = elem.querySelector('i');
                if(icon) icon.style.transform = 'translate(0px, 0px)';
            });
        });
    }
};

// Initialize if the footer is already on the page (for static HTML pages)
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('masterFooter')) {
        initFooterEngine();
    }
});

// Create a global function so your main.js fetch() loader can trigger it after injection
window.FooterEngine = {
    init: initFooterEngine
};