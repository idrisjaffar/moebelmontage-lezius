/* ==========================================================================
   RAPHAEL LEZIUS | 2026 MASTER SYSTEM ENGINE
   ARCHITECTURE: ASYNC BOOT SEQUENCE | EVENT DELEGATION | TERMINAL OS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. VISUAL UNLOCK (Fixes the Black Screen / Typography Sync)
    if (document.fonts) {
        document.fonts.ready.then(() => document.body.classList.add('typography-synced'));
    } else {
        document.body.classList.add('typography-synced');
    }

    const transitionEngine = document.getElementById('transition-engine');
    if (transitionEngine) {
        setTimeout(() => transitionEngine.style.transform = 'translateY(-100%)', 800);
    }

    // 2. INITIALIZE VISUAL ENGINES (AOS)
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, offset: 50, once: true });
    }

    // 3. ASYNC COMPONENT INJECTOR (Upgraded with Promise returns)
    const injectComponent = (id, file) => {
        const container = document.getElementById(id);
        if (container) {
            return fetch(file)
                .then(response => {
                    if (!response.ok) throw new Error(`Missing ${file}`);
                    return response.text();
                })
                .then(data => {
                    container.innerHTML = data;
                })
                .catch(err => console.error(`System Injection Error [${file}]:`, err));
        }
        return Promise.resolve();
    };

    // LOAD GLOBAL COMPONENTS (Paths corrected to match your VS Code structure)
    Promise.all([
        injectComponent('global-nav', 'components/nav.html'),
        injectComponent('global-footer', 'components/footer.html'),
        injectComponent('global-os', 'components/mission-os.html')
    ]).then(() => {
        // Refresh animations after HTML is injected so new elements animate properly
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
        console.log("SYS_UPLINK ESTABLISHED: All components loaded.");
    });

    // 4. BOOT SUBSYSTEMS
    initializePhysicsAndMenus();
    initializeMissionOS();
});


/* ==========================================================================
   PHYSICS & GLOBAL UI LOGIC
   ========================================================================== */
function initializePhysicsAndMenus() {
    
    // A. Magnetic Buttons (Hover Physics)
    document.addEventListener('mousemove', (e) => {
        const btn = e.target.closest('.btn-magnetic, .magnetic-target');
        if (btn) {
            const pos = btn.getBoundingClientRect();
            const x = e.clientX - pos.left - pos.width / 2;
            const y = e.clientY - pos.top - pos.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        }
    });
    document.addEventListener('mouseout', (e) => {
        const btn = e.target.closest('.btn-magnetic, .magnetic-target');
        if (btn) btn.style.transform = 'translate(0px, 0px)';
    });

    // B. Global Accordion Delegation (FAQ)
    document.addEventListener('click', (e) => {
        const accordionHeader = e.target.closest('.accordion-header') || e.target.closest('.faq-trigger-btn');
        if (accordionHeader) {
            const item = accordionHeader.parentElement;
            const isOpen = item.classList.contains('active') || item.classList.contains('open');
            
            const container = item.parentElement;
            container.querySelectorAll('.accordion-item, .faq-module').forEach(mod => {
                mod.classList.remove('active', 'open');
                const content = mod.querySelector('.accordion-content, .module-body');
                if (content) content.style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add('active', 'open');
                const content = item.querySelector('.accordion-content, .module-body');
                if (content) content.style.maxHeight = content.scrollHeight + "px";
            }
        }
    });

    // C. Mobile Menu Toggle
    document.addEventListener('click', (e) => {
        const hamburger = e.target.closest('#mobileMenuToggle');
        const mobileMenu = document.getElementById('fluidMobileMenu');
        
        if (hamburger && mobileMenu) {
            mobileMenu.classList.toggle('is-open');
            hamburger.classList.toggle('is-active');
            document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
        }

        // Close menu if a link is clicked
        if (e.target.closest('.m-link-massive')) {
            if(mobileMenu) mobileMenu.classList.remove('is-open');
            const toggle = document.getElementById('mobileMenuToggle');
            if(toggle) toggle.classList.remove('is-active');
            document.body.style.overflow = '';
        }
    });
}


/* ==========================================================================
   MISSION OS v2026 // MODAL & MULTI-STEP LOGIC
   ========================================================================== */
function initializeMissionOS() {
    
    document.addEventListener('click', (e) => {
        
        // --- OPEN MODAL ---
        if (e.target.closest('.js-open-os')) {
            e.preventDefault();
            const modal = document.getElementById('missionOS');
            if (modal) {
                modal.classList.add('system-active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        }

        // --- CLOSE MODAL ---
        if (e.target.closest('.js-close-os')) {
            e.preventDefault();
            const modal = document.getElementById('missionOS');
            if (modal) {
                modal.classList.remove('system-active');
                document.body.style.overflow = '';
            }
        }

        // --- NEXT STEP LOGIC (With Upgraded Validation) ---
        if (e.target.closest('.btn-next')) {
            const currentStep = e.target.closest('.form-step');
            let isValid = true;
            
            // Validate text inputs, selects, and textareas
            currentStep.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
                
                // Handle Checkbox validation (like the DSGVO box)
                if (input.type === 'checkbox') {
                    if (!input.checked) {
                        isValid = false;
                        input.parentElement.style.color = '#FF007F'; // Highlight text in pink
                    } else {
                        input.parentElement.style.color = ''; 
                    }
                } 
                // Handle standard text inputs
                else if (input.type !== 'radio') {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.style.borderBottomColor = '#FF007F'; // Highlight border in pink
                    } else {
                        input.style.borderBottomColor = ''; 
                    }
                }
            });

            if (isValid) {
                const nextStepNum = parseInt(currentStep.dataset.step) + 1;
                const nextStep = document.querySelector(`.form-step[data-step="${nextStepNum}"]`);
                
                if (nextStep) {
                    currentStep.classList.remove('is-active');
                    nextStep.classList.add('is-active');
                    updateOSProgress(nextStepNum);
                }
            }
        }

        // --- PREVIOUS STEP LOGIC ---
        if (e.target.closest('.btn-prev')) {
            const currentStep = e.target.closest('.form-step');
            const prevStepNum = parseInt(currentStep.dataset.step) - 1;
            const prevStep = document.querySelector(`.form-step[data-step="${prevStepNum}"]`);
            
            if (prevStep) {
                currentStep.classList.remove('is-active');
                prevStep.classList.add('is-active');
                updateOSProgress(prevStepNum);
            }
        }
    });

    // --- PROGRESS BAR & INDICATOR HANDLER ---
    function updateOSProgress(stepNumber) {
        // Update Bar Width (25%, 50%, 75%, 100%)
        const progressBar = document.getElementById('osProgress');
        if (progressBar) {
            progressBar.style.width = `${stepNumber * 25}%`;
        }

        // Update Text Indicators (st1, st2, st3, st4)
        for (let i = 1; i <= 4; i++) {
            const indicator = document.getElementById(`st${i}`);
            if (indicator) {
                if (i <= stepNumber) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            }
        }
    }
}