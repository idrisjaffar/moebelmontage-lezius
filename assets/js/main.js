/* ==========================================================================
   RAPHAEL LEZIUS | 2026 QUANTUM JS ENGINE 
   ARCHITECTURE: MODULAR COMPONENT INJECTION & HAPTIC PHYSICS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    // ======================================================================
    // 1. CORE UTILITIES & PHYSICS ENGINE
    // ======================================================================

    // Haptic Feedback Engine (Mobile Only)
    window.vibrateDevice = (pattern = 15) => {
        if (typeof window.navigator.vibrate === 'function') {
            try { window.navigator.vibrate(pattern); } catch(e) { /* Silent fail if unsupported */ }
        }
    };

    // Magnetic Button Physics (Desktop Only)
    const initMagneticPhysics = () => {
        const magnets = document.querySelectorAll('.btn-magnetic');
        magnets.forEach(magnet => {
            magnet.addEventListener('mousemove', (e) => {
                const rect = magnet.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.3; // 0.3 is the pull strength
                const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
                magnet.style.transform = `translate(${x}px, ${y}px)`;
            });
            magnet.addEventListener('mouseleave', () => {
                magnet.style.transform = `translate(0px, 0px)`;
            });
        });
    };

    // ======================================================================
    // 2. COMPONENT INJECTOR (Async Load)
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
                    console.error(`[SYSTEM] Engine Error injecting ${comp.file}:`, error);
                }
            }
        });

        // Wait for all components to inject before firing up the UI
        await Promise.all(fetchPromises);
    }

    await loadGlobalComponents();

    // ======================================================================
    // 3. UI/UX INITIALIZATION
    // ======================================================================

    const initSystem = () => {
        // Remove Failsafe
        setTimeout(() => document.body.classList.remove('no-js-override'), 50);
        
        // Init AOS Animations
        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 800, offset: 30, once: true, easing: 'ease-out-cubic' });
        }
        
        // Auto-Update Copyright Year
        const yearEl = document.getElementById('copyright-year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        // Start Physics
        initMagneticPhysics();

        // Developer Easter Egg (Console)
        console.log("%c[ RAPHAEL LEZIUS // SYSTEM 2026 ONLINE ]", "color: #d4af37; font-size: 14px; font-weight: bold; background: #000; padding: 5px 10px; border: 1px solid #d4af37;");
    };

    const initNavbar = () => {
        const nav = document.querySelector('.cyber-navbar');
        if (!nav) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        // Hardware-accelerated scroll listener
        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (lastScrollY > 50) {
                        nav.classList.add('is-scrolled');
                        nav.style.background = 'rgba(3, 3, 5, 0.98)'; // Darkens on scroll
                    } else {
                        nav.classList.remove('is-scrolled');
                        nav.style.background = ''; // Reverts to CSS default
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    };

    const initMobileMenu = () => {
        const btn = document.getElementById('hamburgerBtn');
        const closeBtn = document.getElementById('closeMenuBtn');
        const menu = document.getElementById('mobileMenu');
        const links = document.querySelectorAll('.mobile-sub-link, .mobile-cyber-link');

        if (!btn || !menu) return;

        const toggleMenu = () => {
            window.vibrateDevice(15); // Haptic feedback
            const isActive = menu.classList.contains('active');
            
            if (isActive) {
                btn.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                btn.classList.add('active');
                menu.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };

        btn.addEventListener('click', toggleMenu);
        if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
        links.forEach(link => link.addEventListener('click', toggleMenu));
    };

    // ======================================================================
    // 4. MISSION OS CONTROLLER (The Intelligent Form System)
    // ======================================================================

    const initMissionOS = () => {
        const overlay = document.getElementById('missionOS');
        if (!overlay) return;

        // The Global OS Object
        window.MissionOS = {
            selectedServices: [],
            
            open: () => {
                window.vibrateDevice([20, 40, 20]);
                overlay.classList.add('system-active');
                document.body.style.overflow = 'hidden';
                // Reset to phase 1 on open
                window.MissionOS.setPhase(1);
            },
            
            close: () => {
                window.vibrateDevice(20);
                overlay.classList.remove('system-active');
                document.body.style.overflow = '';
            },
            
            setPhase: (phaseNumber) => {
                // Handle UI swapping
                document.querySelectorAll('.case-phase').forEach(p => p.classList.remove('active'));
                const target = document.getElementById(`phase${phaseNumber}`);
                if (target) {
                    target.classList.add('active');
                    // Add a tiny animation bump
                    target.style.animation = 'none';
                    target.offsetHeight; /* trigger reflow */
                    target.style.animation = 'fadeInUp 0.4s ease forwards';
                }

                // Handle Sidebar Active States
                document.querySelectorAll('.step-link').forEach((step, index) => {
                    if (index + 1 === phaseNumber) {
                        step.classList.add('active');
                    } else if (index + 1 < phaseNumber) {
                        step.classList.remove('active');
                        step.style.color = 'var(--neon-green)'; // Mark as completed
                    } else {
                        step.classList.remove('active');
                        step.style.color = '';
                    }
                });
            },

            // Dynamic Search Logic for Phase 2
            filterServices: () => {
                const input = document.getElementById('serviceSearch').value.toLowerCase();
                const resultsBox = document.getElementById('searchResults');
                
                // Hardcoded 2026 Database (Expand as needed)
                const database = [
                    "IKEA PAX Kleiderschrank", "IKEA METOD Küche", "IKEA BESTÅ Wohnwand",
                    "USM Haller Regal", "USM Haller Tisch", "Biohort HighLine", 
                    "Biohort Neo", "Küchenarbeitsplatte Zuschnitt", "Wandspiegel Schwerlast",
                    "Akustikpaneele", "Demontage Altmöbel"
                ];

                if (input.length < 2) {
                    resultsBox.innerHTML = '';
                    resultsBox.style.display = 'none';
                    return;
                }

                const filtered = database.filter(item => item.toLowerCase().includes(input));
                
                if (filtered.length > 0) {
                    resultsBox.style.display = 'block';
                    resultsBox.innerHTML = filtered.map(item => `
                        <div class="search-result-item" onclick="MissionOS.addService('${item}')">
                            <i class="fas fa-plus-circle" style="color: var(--neon-cyan);"></i> ${item}
                        </div>
                    `).join('');
                } else {
                    resultsBox.style.display = 'block';
                    resultsBox.innerHTML = `<div class="search-result-item text-tech" style="color: #666;">// SYSTEM: KEIN EINTRAG GEFUNDEN. BITTE MANUELL UNTEN EINTRAGEN.</div>`;
                }
            },

            addService: (serviceName) => {
                window.vibrateDevice(15);
                if (!window.MissionOS.selectedServices.includes(serviceName)) {
                    window.MissionOS.selectedServices.push(serviceName);
                    window.MissionOS.updateTags();
                }
                document.getElementById('serviceSearch').value = '';
                document.getElementById('searchResults').style.display = 'none';
            },

            removeService: (serviceName) => {
                window.vibrateDevice(10);
                window.MissionOS.selectedServices = window.MissionOS.selectedServices.filter(s => s !== serviceName);
                window.MissionOS.updateTags();
            },

            updateTags: () => {
                const container = document.getElementById('selectedTags');
                const counter = document.getElementById('serviceCount');
                
                // Update Sidebar Count
                if(counter) {
                    let count = window.MissionOS.selectedServices.length;
                    counter.innerText = count < 10 ? `0${count}` : count;
                }

                // Render Tags
                if(container) {
                    container.innerHTML = window.MissionOS.selectedServices.map(service => `
                        <span class="selected-tag">
                            ${service} <i class="fas fa-times" onclick="MissionOS.removeService('${service}')"></i>
                        </span>
                    `).join('');
                }
            }
        };

        // Wire up static HTML buttons
        document.querySelectorAll('.js-open-os').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); window.MissionOS.open(); }));
        document.querySelectorAll('.js-close-os').forEach(btn => btn.addEventListener('click', window.MissionOS.close));
    };

    // ======================================================================
    // 5. EXECUTE ENGINE
    // ======================================================================
    initSystem();
    initNavbar();
    initMobileMenu();
    initMissionOS();

});

document.getElementById('nextBelt').addEventListener('click', () => {
    const track = document.getElementById('imageBelt');
    track.style.animationPlayState = 'paused';
    // Logic to nudge transform if manual control is needed
});

document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.js-faq-item');

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        
        trigger.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-active');
            
            // Close others
            faqItems.forEach(other => {
                other.classList.remove('is-active');
                other.querySelector('.faq-content').style.maxHeight = null;
            });

            // Toggle current
            if (!isOpen) {
                item.classList.add('is-active');
                const content = item.querySelector('.faq-content');
                content.style.maxHeight = content.scrollHeight + "px";
                triggerHaptic(15); // Optional haptic feedback
            }
        });
    });
});

document.querySelectorAll('.js-toggle-faq').forEach(module => {
    module.addEventListener('click', function() {
        const isOpen = this.classList.contains('open');
        
        // Close all others
        document.querySelectorAll('.js-toggle-faq').forEach(other => {
            other.classList.remove('open');
            other.querySelector('.module-body').style.maxHeight = '0';
        });

        // Toggle current
        if (!isOpen) {
            this.classList.add('open');
            const body = this.querySelector('.module-body');
            body.style.maxHeight = body.scrollHeight + 100 + "px"; // +100 for padding safety
            if (window.triggerHaptic) triggerHaptic(10);
        }
    });
});