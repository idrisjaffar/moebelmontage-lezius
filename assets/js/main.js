/* ==========================================================================
   RAPHAEL LEZIUS | 2026 MASTER SYSTEM ENGINE (main.js)
   ARCHITECTURE: ASYNC BOOT SEQUENCE | EVENT DELEGATION | CANVAS PHYSICS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    
    /* ==========================================================================
       1. IMMEDIATE VISUAL UNLOCK (Fixes the Black Screen)
       ========================================================================== */
    // Sync Typography to remove opacity: 0
    if (document.fonts) {
        document.fonts.ready.then(() => document.body.classList.add('typography-synced'));
    } else {
        document.body.classList.add('typography-synced');
    }

    // Lift the black "Establishing Connection" transition curtain
    const transitionEngine = document.getElementById('transition-engine');
    if (transitionEngine) {
        setTimeout(() => {
            transitionEngine.style.transform = 'translateY(-100%)';
        }, 800);
    }

    /* ==========================================================================
       2. ASYNC SYSTEM LOADER (Injects Nav, Footer, and Mission OS)
       ========================================================================== */
    const isRoot = window.location.pathname.split('/').filter(Boolean).length <= 1;
    const pathPrefix = isRoot ? '' : '../';

    async function loadComponent(elementId, filePath) {
        try {
            const container = document.getElementById(elementId);
            if (!container) return; 

            // Fix the path logic depending on your folder structure
             // Adjusted path
            const fullPath = pathPrefix + 'components/' + filePath; const response = await fetch(fullPath);
            if (!response.ok) throw new Error(`Failed to load ${fullPath}`);
            
            container.innerHTML = await response.text();
        } catch (error) {
            console.error(`Injection Error for ${elementId}:`, error);
        }
    }

    // Attempt to inject HTML components
    await Promise.all([
        loadComponent("global-nav", "nav.html"),
        loadComponent("global-footer", "footer.html"),
        loadComponent("global-os", "mission_os.html")
    ]);

    console.log("SYS_UPLINK ESTABLISHED: Components Handled.");

    /* ==========================================================================
       3. INITIALIZE SYSTEM ENGINES
       ========================================================================== */
    initializeSystemEngines();
    if (window.MissionOS) window.MissionOS.init(); 
});

/* ==========================================================================
   4. MISSION OS v2.6 LOGIC ENGINE (Multi-Step Form & Modal)
   ========================================================================== */
window.MissionOS = {
    currentStep: 1,
    totalSteps: 4,

    open: () => {
        const modal = document.getElementById('missionOS');
        if (modal) {
            modal.classList.add('system-active');
            document.body.style.overflow = 'hidden'; 
            window.MissionOS.goToStep(1); 
        }
    },

    close: () => {
        const modal = document.getElementById('missionOS');
        if (modal) {
            modal.classList.remove('system-active');
            document.body.style.overflow = ''; 
        }
    },

    goToStep: (stepNumber) => {
        if(stepNumber < 1 || stepNumber > window.MissionOS.totalSteps) return;
        window.MissionOS.currentStep = stepNumber;

        document.querySelectorAll('.form-step').forEach(step => {
            if (parseInt(step.dataset.step) === window.MissionOS.currentStep) {
                step.style.display = 'block';
                setTimeout(() => step.classList.add('is-active'), 50);
            } else {
                step.classList.remove('is-active');
                setTimeout(() => step.style.display = 'none', 300);
            }
        });

        const progressFill = document.getElementById('osProgress');
        if(progressFill) {
            const progress = ((window.MissionOS.currentStep - 1) / (window.MissionOS.totalSteps - 1)) * 100;
            progressFill.style.width = `${progress}%`;
        }

        document.querySelectorAll('.step-text').forEach((indicator, index) => {
            if(index + 1 <= window.MissionOS.currentStep) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    },

    init: () => {
        document.addEventListener('click', (e) => {
            if(e.target.closest('.btn-next')) {
                e.preventDefault();
                window.MissionOS.goToStep(window.MissionOS.currentStep + 1);
            }
            if(e.target.closest('.btn-prev')) {
                e.preventDefault();
                window.MissionOS.goToStep(window.MissionOS.currentStep - 1);
            }
            if(e.target.closest('.js-close-os') || e.target.classList.contains('os-backdrop')) {
                e.preventDefault();
                window.MissionOS.close();
            }
            if(e.target.closest('.js-open-os')) {
                e.preventDefault();
                window.MissionOS.open();
            }
        });

        // AI Feedback inputs inside MissionOS
        const form = document.getElementById('leadForm');
        if(form) {
            const aiStatus = document.getElementById('ai-status');
            const updateAiStatus = (text, color) => {
                if(aiStatus) {
                    aiStatus.innerText = text;
                    aiStatus.style.color = color;
                }
            };
            form.querySelectorAll('.intelligent-input').forEach(input => {
                input.addEventListener('focus', () => updateAiStatus('ANALYZING // ACTIVE_INPUT_STREAM', 'var(--neon-gold)'));
                input.addEventListener('blur', () => updateAiStatus('SYSTEM_IDLE // AWAITING_INPUT', 'var(--neon-green)'));
            });
        }
    }
};

/* ==========================================================================
   5. MASTER VISUAL ENGINES (Physics, Sliders, Layouts)
   ========================================================================== */
function initializeSystemEngines() {
    
    // --- A. AOS ANIMATIONS ---
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, offset: 50, once: true });
    }

    // --- B. MAGNETIC BUTTON PHYSICS ---
    document.querySelectorAll('.btn-magnetic, .magnetic-target').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const pos = btn.getBoundingClientRect();
            const x = e.clientX - pos.left - pos.width / 2;
            const y = e.clientY - pos.top - pos.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener('mouseout', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    // --- C. MOBILE MENU TOGGLE ---
    const hamburger = document.getElementById('mobileMenuToggle'); 
    const mobileMenu = document.getElementById('fluidMobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-open');
            hamburger.classList.toggle('is-active');
            document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
        });

        document.querySelectorAll('.m-link-massive').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('is-open');
                hamburger.classList.remove('is-active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- D. GLOBAL ACCORDION DELEGATION ---
    document.addEventListener('click', function(e) {
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
                if (content) {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            }
        }
    });
}

// This listens for clicks anywhere on the document
document.addEventListener('click', function(event) {
    
    // Check if the user clicked the "ANFRAGE" button (or any element with js-open-os)
    if (event.target.closest('.js-open-os')) {
        event.preventDefault(); // Stop page reload
        
        const modal = document.getElementById('missionOS');
        if (modal) {
            modal.classList.add('system-active');
            console.log("Mission OS: UPLINK ESTABLISHED");
        } else {
            console.error("Mission OS: Overlay not found in DOM.");
        }
    }

    // Check if the user clicked the close button or backdrop
    if (event.target.closest('.js-close-os')) {
        const modal = document.getElementById('missionOS');
        if (modal) {
            modal.classList.remove('system-active');
        }
    }
});