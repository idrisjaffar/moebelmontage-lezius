/* ==========================================================================
   RAPHAEL LEZIUS | 2026 QUANTUM JS ENGINE 
   MASTER CONTROLLER (WITH HTML INJECTOR)
   ========================================================================== */

// ==========================================================================
// MODULE 1: GLOBAL HAPTIC ENGINE (Can safely stay outside)
// ==========================================================================
window.triggerHaptic = function(ms = 15) {
    if (typeof window.navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(ms); } catch(e) { /* Silent fail */ }
    }
};
window.vibrateDevice = window.triggerHaptic;

// ==========================================================================
// THE SAFETY WRAPPER: Ensures HTML is loaded before JS runs
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {

    // ======================================================================
    // MODULE 2: COMPONENT INJECTOR
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

        // IMPORTANT: Wait for all HTML to inject BEFORE attaching button logic
        await Promise.all(fetchPromises);
    }

    // RUN THE INJECTOR
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
    // MODULE 6: UNIVERSAL ACCORDION ENGINE (FAQ & SERVICES)
    // ======================================================================
    const accordionHeaders = document.querySelectorAll('.accordion-header, .module-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const parentModule = this.parentElement;
            const contentBody = this.nextElementSibling; 
            
            const isOpen = parentModule.classList.contains('active') || parentModule.classList.contains('open');
            
            document.querySelectorAll('.accordion-item, .faq-module').forEach(item => {
                item.classList.remove('active', 'open');
                const body = item.querySelector('.accordion-content, .module-body');
                if (body) body.style.maxHeight = null;
            });

            if (!isOpen) {
                parentModule.classList.add('active', 'open');
                if (contentBody) {
                    contentBody.style.maxHeight = contentBody.scrollHeight + 80 + "px";
                }
                if(window.triggerHaptic) window.triggerHaptic(10);
            }
        });
    });

    // ======================================================================
    // MODULE 7: SMART PROJECT SLIDER CONTROLS
    // ======================================================================
    const nextBeltBtn = document.getElementById('nextBelt');
    const prevBeltBtn = document.getElementById('prevBelt');
    const beltContainer = document.querySelector('.belt-container'); 

    if (nextBeltBtn && beltContainer) {
        nextBeltBtn.addEventListener('click', () => {
            if(window.triggerHaptic) window.triggerHaptic(15);
            const itemWidth = beltContainer.querySelector('.belt-item').offsetWidth + 30;
            beltContainer.scrollBy({ left: itemWidth, behavior: 'smooth' });
        });
    }

    if (prevBeltBtn && beltContainer) {
        prevBeltBtn.addEventListener('click', () => {
            if(window.triggerHaptic) window.triggerHaptic(15);
            const itemWidth = beltContainer.querySelector('.belt-item').offsetWidth + 30;
            beltContainer.scrollBy({ left: -itemWidth, behavior: 'smooth' });
        });
    }

    // ======================================================================
    // MODULE 8: CINEMATIC VIDEO LIGHTBOX
    // ======================================================================
    const videoCards = document.querySelectorAll('.js-open-lightbox');
    const lightbox = document.getElementById('videoLightbox');
    const lightboxVideo = document.getElementById('lightboxVideo');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const closeBtns = document.querySelectorAll('.js-close-lightbox');

    if (videoCards.length > 0 && lightbox) {
        videoCards.forEach(card => {
            card.addEventListener('click', () => {
                if(window.triggerHaptic) window.triggerHaptic([15, 30]); 
                
                const src = card.getAttribute('data-video-src');
                const title = card.getAttribute('data-title');
                const desc = card.getAttribute('data-desc');
                
                lightboxVideo.src = src;
                lightboxTitle.textContent = title;
                lightboxDesc.textContent = desc;
                
                lightbox.classList.add('is-active');
                document.body.style.overflow = 'hidden'; 
                
                lightboxVideo.play().catch(e => console.warn("Autoplay prevented by browser:", e));
            });
        });

        const closeLightbox = () => {
            if(window.triggerHaptic) window.triggerHaptic(15);
            lightbox.classList.remove('is-active');
            document.body.style.overflow = ''; 
            lightboxVideo.pause();
            
            setTimeout(() => { lightboxVideo.src = ''; }, 500); 
        };

        closeBtns.forEach(btn => btn.addEventListener('click', closeLightbox));
        
        lightbox.addEventListener('click', (e) => {
            if(e.target === lightbox) closeLightbox();
        });
    }

    // ======================================================================
    // MODULE 9: MISSION OS (MULTI-STEP LEAD CAPTURE)
    // ======================================================================
    const osOverlay = document.getElementById('missionOS') || document.querySelector('.os-overlay');
    
    if (osOverlay) {
        let currentStep = 1;
        const totalSteps = 4;
        const formSteps = document.querySelectorAll('.form-step');
        const nextBtns = document.querySelectorAll('.btn-next');
        const prevBtns = document.querySelectorAll('.btn-prev');
        const progressBar = document.getElementById('osProgress');
        const stepIndicators = document.querySelectorAll('.step-text');

        window.MissionOS = {
            open: () => {
                window.triggerHaptic([20, 40, 20]);
                osOverlay.classList.add('system-active');
                document.body.style.overflow = 'hidden';
            },
            close: () => {
                window.triggerHaptic(20);
                osOverlay.classList.remove('system-active');
                document.body.style.overflow = '';
            }
        };

        const updateFormUI = () => {
            formSteps.forEach(step => {
                step.classList.remove('is-active');
                if (parseInt(step.dataset.step) === currentStep) {
                    step.classList.add('is-active');
                }
            });

            const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
            if (progressBar) progressBar.style.width = `${progressPercentage}%`;

            stepIndicators.forEach((indicator, index) => {
                if (index < currentStep) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        };

        const validateCurrentStep = () => {
            const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
            const requiredInputs = currentStepEl.querySelectorAll('input[required], select[required]');
            let isValid = true;

            requiredInputs.forEach(input => {
                if (!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
                    isValid = false;
                    input.style.borderColor = 'var(--neon-pink)';
                    setTimeout(() => input.style.borderColor = '', 2000);
                }
            });
            return isValid;
        };

        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (validateCurrentStep()) {
                    window.triggerHaptic(10);
                    if (currentStep < totalSteps) {
                        currentStep++;
                        updateFormUI();
                    }
                } else {
                    window.triggerHaptic([30, 30]); 
                }
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                window.triggerHaptic(10);
                if (currentStep > 1) {
                    currentStep--;
                    updateFormUI();
                }
            });
        });

        // Trigger opening
        document.querySelectorAll('.js-open-os').forEach(btn => {
            btn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                window.MissionOS.open(); 
            });
        });
        
        // Trigger closing
        document.querySelectorAll('.js-close-os').forEach(btn => {
            if (btn.classList.contains('os-backdrop')) return; 
            btn.addEventListener('click', window.MissionOS.close);
        });
        
        // Handle Final Submission
        const leadForm = document.getElementById('leadForm');
        if (leadForm) {
            leadForm.addEventListener('submit', (e) => {
                e.preventDefault(); 
                window.triggerHaptic([50, 100, 50]);
                
                const container = document.querySelector('.case-container');
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px 0;">
                        <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--neon-green); margin-bottom: 20px;"></i>
                        <h3 style="color: #fff; font-family: var(--font-head); font-size: 2rem; margin-bottom: 10px;">DATEN EMPFANGEN</h3>
                        <p style="color: #aaa;">Vielen Dank für Ihre Anfrage. Ich werde das Projektprotokoll prüfen und mich umgehend bei Ihnen melden.</p>
                        <button class="os-btn js-close-os" style="margin-top: 30px;" onclick="window.MissionOS.close()">SYSTEM SCHLIESSEN</button>
                    </div>
                `;
            });
        }
    }

    console.log("%c[ RAPHAEL LEZIUS // SYSTEM 2026 ONLINE & INJECTED ]", "color: #00e5ff; font-size: 12px; font-weight: bold; background: #000; padding: 5px 10px; border: 1px solid #00e5ff;");

}); // <-- CRITICAL: THIS CLOSES THE SAFETY WRAPPER AT THE VERY END!