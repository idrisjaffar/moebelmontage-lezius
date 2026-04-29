/* ==========================================================================
   RAPHAEL LEZIUS | 2026 QUANTUM JS ENGINE 
   MASTER CONTROLLER (WITH HTML INJECTOR)
   ========================================================================== */

// ==========================================================================
// MODULE 1: GLOBAL HAPTIC ENGINE
// ==========================================================================
window.triggerHaptic = function(ms = 15) {
    if (typeof window.navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(ms); } catch(e) { /* Silent fail */ }
    }
};
window.vibrateDevice = window.triggerHaptic;

document.addEventListener("DOMContentLoaded", async () => {

    // ======================================================================
    // MODULE 2: COMPONENT INJECTOR (THE MISSING PIECE)
    // What it does: Fetches your nav.html and footer.html and puts them on the screen.
    // ======================================================================
    async function loadGlobalComponents() {
        const components = [
            { id: 'global-nav', file: 'components/nav.html' },
            { id: 'global-footer', file: 'components/footer.html' },
            { id: 'global-os', file: 'components/mission_os.html' }
        ];

        const fetchPromises = components.map(async (comp) => {
            const el = document.getElementById(comp.id);
            if (el) {
                try {
                    // Note: You must check if the path is exactly "components/nav.html" or just "nav.html"
                    const response = await fetch(comp.file);
                    if (response.ok) {
                        el.innerHTML = await response.text();
                    } else {
                        console.warn(`[SYSTEM] Missing module: ${comp.file}`);
                    }
                } catch (error) {
                    console.error(`[SYSTEM] Error injecting ${comp.file}:`, error);
                }
            }
        });

        // Wait for ALL files to load before starting the menus
        await Promise.all(fetchPromises);
    }

    // RUN THE INJECTOR FIRST!
    await loadGlobalComponents();

    // ======================================================================
    // MODULE 3: UI PHYSICS & INITIALIZATION
    // ======================================================================
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, offset: 30, once: true, easing: 'ease-out-cubic' });
    }

    const yearEl = document.getElementById('currentYear') || document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const magnets = document.querySelectorAll('.magnetic-target, .btn-magnetic');
    magnets.forEach(magnet => {
        magnet.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                const rect = magnet.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
                magnet.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
        magnet.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                magnet.style.transform = `translate(0px, 0px)`;
            });
        });
    });

    // ======================================================================
    // MODULE 4: MASTER NAVIGATION SCROLL
    // ======================================================================
    const nav = document.getElementById('masterNav') || document.querySelector('.cyber-navbar');
    if (nav) {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    nav.classList.add('is-scrolled');
                } else {
                    nav.classList.remove('is-scrolled');
                }
            });
        }, { passive: true });
    }

    // ======================================================================
    // MODULE 5: MENU CONTROLLERS (MOBILE & PC)
    // ======================================================================
    const mobileBtn = document.getElementById('mobileMenuToggle') || document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('fluidMobileMenu') || document.getElementById('mobileMenu');
    
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            window.triggerHaptic(15);
            const isActive = this.classList.toggle('is-active');
            mobileMenu.classList.toggle('is-open');
            document.body.style.overflow = isActive ? 'hidden' : ''; 
        });
    }

    const dropTrigger = document.getElementById('dropdownTrigger');
    const megaPanel = document.getElementById('megaPanel');
    let dropTimeout;

    if (dropTrigger && megaPanel) {
        dropTrigger.addEventListener('mouseenter', () => {
            clearTimeout(dropTimeout);
            megaPanel.classList.add('is-open');
        });
        dropTrigger.addEventListener('mouseleave', () => {
            dropTimeout = setTimeout(() => {
                megaPanel.classList.remove('is-open');
            }, 300); 
        });
    }

    // ======================================================================
    // MODULE 6: SMART ACCORDIONS (FAQ & SERVICES)
    // ======================================================================
    const accordions = document.querySelectorAll('.js-toggle-faq, .accordion-header');
    
    accordions.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const isService = this.classList.contains('accordion-header');
            const parentModule = isService ? this.parentElement : this;
            const contentBody = isService ? this.nextElementSibling : this.querySelector('.module-body, .faq-content');
            
            const isOpen = parentModule.classList.contains('open') || parentModule.classList.contains('active');
            
            accordions.forEach(otherTrigger => {
                const otherParent = otherTrigger.classList.contains('accordion-header') ? otherTrigger.parentElement : otherTrigger;
                const otherBody = otherTrigger.classList.contains('accordion-header') ? otherTrigger.nextElementSibling : otherTrigger.querySelector('.module-body, .faq-content');
                
                otherParent.classList.remove('open', 'active');
                if(otherTrigger.setAttribute) otherTrigger.setAttribute('aria-expanded', 'false');
                if (otherBody) otherBody.style.maxHeight = null;
            });

            if (!isOpen) {
                parentModule.classList.add('open', 'active');
                if(this.setAttribute) this.setAttribute('aria-expanded', 'true');
                if (contentBody) contentBody.style.maxHeight = contentBody.scrollHeight + 100 + "px";
                window.triggerHaptic(10);
            }
        });
    });

    // ======================================================================
    // MODULE 7: INFINITE PROJECT BELT
    // ======================================================================
    const nextBeltBtn = document.getElementById('nextBelt');
    const prevBeltBtn = document.getElementById('prevBelt');
    const beltTrack = document.getElementById('imageBelt');

    if (nextBeltBtn && beltTrack) {
        nextBeltBtn.addEventListener('click', () => {
            window.triggerHaptic(10);
            beltTrack.style.animationPlayState = 'paused';
        });
    }
    if (prevBeltBtn && beltTrack) {
        prevBeltBtn.addEventListener('click', () => {
            window.triggerHaptic(10);
            beltTrack.style.animationPlayState = 'paused';
        });
    }

    // ======================================================================
    // MODULE 8: MISSION OS (LEAD CAPTURE MODAL)
    // ======================================================================
    const osOverlay = document.getElementById('missionOS') || document.querySelector('.os-overlay');
    
    window.MissionOS = {
        selectedServices: [],
        open: () => {
            window.triggerHaptic([20, 40, 20]);
            if(osOverlay) osOverlay.classList.add('system-active');
            document.body.style.overflow = 'hidden';
        },
        close: () => {
            window.triggerHaptic(20);
            if(osOverlay) osOverlay.classList.remove('system-active');
            document.body.style.overflow = '';
        }
    };

    document.querySelectorAll('.js-open-os').forEach(btn => {
        btn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            window.MissionOS.open(); 
        });
    });
    
    document.querySelectorAll('.js-close-os').forEach(btn => {
        btn.addEventListener('click', window.MissionOS.close);
    });

    console.log("%c[ RAPHAEL LEZIUS // SYSTEM 2026 ONLINE & INJECTED ]", "color: #00e5ff; font-size: 12px; font-weight: bold; background: #000; padding: 5px 10px; border: 1px solid #00e5ff;");
});