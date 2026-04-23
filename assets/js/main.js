/* ==========================================================================
   RAPHAEL LEZIUS | 2026 JS MASTER ENGINE (COMPONENT ARCHITECTURE)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. INJECT GLOBAL COMPONENTS FIRST
    async function loadGlobalComponents() {
        const components = [
            { id: 'global-nav', file: 'components/nav.html' },
            { id: 'global-footer', file: 'components/footer.html' },
            { id: 'global-os', file: 'components/mission_os.html' }
        ];

        for (let comp of components) {
            let el = document.getElementById(comp.id);
            if (el) {
                try {
                    let response = await fetch(comp.file);
                    if (response.ok) {
                        el.innerHTML = await response.text();
                    }
                } catch (error) {
                    console.error(`System Error: Could not load ${comp.file}`);
                }
            }
        }
    }

    // Wait for the HTML to be injected...
    await loadGlobalComponents();

    // ======================================================================
    // 2. NOW RUN THE REST OF YOUR SCRIPTS
    // ======================================================================
    
    const initSystem = () => {
        setTimeout(() => document.body.classList.remove('no-js-override'), 50);
        if (typeof AOS !== 'undefined') AOS.init({ duration: 800, offset: 30, once: true });
        
        const yearEl = document.getElementById('copyright-year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    };

    const initNavbar = () => {
        const nav = document.querySelector('.cyber-navbar');
        if (nav) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) nav.classList.add('is-scrolled');
                else nav.classList.remove('is-scrolled');
            }, { passive: true });
        }
    };

    const initMobileMenu = () => {
        const btn = document.getElementById('hamburgerBtn');
        const menu = document.getElementById('mobileMenu');
        const links = document.querySelectorAll('.mobile-sub-link, .mobile-cyber-link');

        if (!btn || !menu) return;

        const toggle = () => {
            btn.classList.toggle('active');
            menu.classList.toggle('active');
            document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
        };

        btn.addEventListener('click', toggle);
        links.forEach(link => link.addEventListener('click', toggle));
    };

    const initMissionOS = () => {
        const overlay = document.getElementById('missionOS');
        if (!overlay) return;

        window.MissionOS = {
            open: () => {
                overlay.classList.add('system-active');
                document.body.style.overflow = 'hidden';
            },
            close: () => {
                overlay.classList.remove('system-active');
                document.body.style.overflow = '';
            },
            goToPhase: (targetPhaseId) => {
                document.querySelectorAll('.case-phase').forEach(p => p.classList.remove('active'));
                const target = document.getElementById(targetPhaseId);
                if (target) target.classList.add('active');

                document.querySelectorAll('.step-link').forEach(step => {
                    if (step.dataset.phase === targetPhaseId) step.classList.add('active');
                    else step.classList.remove('active');
                });
            }
        };

        // Wire up buttons
        document.querySelectorAll('.js-open-os').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); window.MissionOS.open(); }));
        document.querySelectorAll('.js-close-os').forEach(btn => btn.addEventListener('click', window.MissionOS.close));
        document.querySelectorAll('.js-phase-nav').forEach(btn => {
            btn.addEventListener('click', () => window.MissionOS.goToPhase(btn.getAttribute('data-target')));
        });
        document.querySelectorAll('.step-link').forEach(step => {
            step.addEventListener('click', () => window.MissionOS.goToPhase(step.getAttribute('data-phase')));
        });
    };

    // Execute Systems
    initSystem();
    initNavbar();
    initMobileMenu();
    initMissionOS();
    
    // (You can safely add your Accordion and Carousel JS back here as well)
});