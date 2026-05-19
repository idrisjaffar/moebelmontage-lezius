/* ==========================================================================
   RAPHAEL LEZIUS | 2026 MASTER JAVASCRIPT ENGINE
   ARCHITECTURE: MODULAR | GPU-ACCELERATED | EVENT-DELEGATED
   ========================================================================== */

// --------------------------------------------------------------------------
// 01. GLOBAL HARDWARE UTILITIES
// --------------------------------------------------------------------------
window.triggerHaptic = function(ms = 15) {
    if (typeof window.navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(ms); } catch(e) { /* Silent fail */ }
    }
};

// --------------------------------------------------------------------------
// 02. CORE SYSTEM INITIALIZATION
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {

    // A. Component Injector (DRY HTML Routing)
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
                    if (response.ok) el.innerHTML = await response.text();
                } catch (error) {
                    console.error(`[SYSTEM] Error injecting ${comp.file}:`, error);
                }
            }
        });

        // Ensure DOM is fully injected before attaching event listeners
        await Promise.all(fetchPromises);
    }
    
    await loadGlobalComponents();

    // B. Typography & CLS Prevention
    if ('fonts' in document) {
        document.fonts.ready.then(() => document.body.classList.add('typography-synced'));
    } else {
        document.body.classList.add('typography-synced');
    }

    // C. Animation Library Init
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, offset: 30, once: true, easing: 'ease-out-cubic' });
    }

    // D. Dynamic Year
    const yearEl = document.getElementById('currentYear') || document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --------------------------------------------------------------------------
    // 03. GLOBAL UI PHYSICS & NAVIGATION
    // --------------------------------------------------------------------------
    
    // Seamless Page Transitions (PJAX Simulation)
    const transitionEngine = document.getElementById('transition-engine');
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.target === '_blank') return;
            e.preventDefault();
            const targetUrl = link.getAttribute('href');
            
            if (transitionEngine) transitionEngine.classList.add('is-routing');
            if (typeof isAudioLive !== 'undefined' && isAudioLive) playTerminalSound('sawtooth', 200, 0.4, 0.05);
            
            setTimeout(() => window.location.href = targetUrl, 600);
        });
    });

    // Tactical Navigation Scroll State
    const mainNav = document.querySelector('.tactical-nav');
    if (mainNav) {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                mainNav.classList.toggle('is-scrolled', window.scrollY > 50);
            });
        }, { passive: true });
    }

    // Mobile Off-Canvas Menu
    document.querySelectorAll('.js-toggle-menu, .js-close-menu').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.triggerHaptic(15);
            document.body.classList.toggle('menu-open');
        });
    });

    // Kinetic UI (Magnetic Buttons)
    if (window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll('.js-magnetic').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                requestAnimationFrame(() => {
                    const rect = btn.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
                    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
                    btn.style.transform = `translate(${x}px, ${y}px)`;
                });
            });
            btn.addEventListener('mouseleave', () => {
                requestAnimationFrame(() => btn.style.transform = 'translate(0px, 0px)');
            });
        });
    }

    // Tactical HUD Cursor
    const cursorDot = document.querySelector('.hud-cursor');
    const cursorTrail = document.querySelector('.hud-cursor-trail');
    
    if (cursorDot && cursorTrail && window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            setTimeout(() => {
                if (!cursorTrail.classList.contains('is-locked')) {
                    cursorTrail.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
                } else {
                    cursorTrail.style.left = `${e.clientX}px`;
                    cursorTrail.style.top = `${e.clientY}px`;
                    cursorTrail.style.transform = `translate(-50%, -50%)`;
                }
            }, 40);
        });

        document.querySelectorAll('a, button, input, textarea, .js-magnetic, .accordion-header').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('is-locked');
                cursorTrail.classList.add('is-locked');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('is-locked');
                cursorTrail.classList.remove('is-locked');
            });
        });

        window.addEventListener('mousedown', (e) => cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) scale(0.7)`);
        window.addEventListener('mouseup', (e) => cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) scale(1)`);
    }

    // Synaptic Audio Engine (Zero-Asset)
    const audioToggle = document.querySelector('.js-toggle-audio');
    let audioCtx, isAudioLive = false;

    window.playTerminalSound = function(type, frequency, duration, volume) {
        if (!isAudioLive) return;
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    };

    if (audioToggle) {
        audioToggle.addEventListener('click', () => {
            isAudioLive = !isAudioLive;
            audioToggle.classList.toggle('is-live', isAudioLive);
            audioToggle.innerHTML = isAudioLive ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
            if (isAudioLive) playTerminalSound('triangle', 600, 0.2, 0.05);
        });

        if (window.matchMedia("(pointer: fine)").matches) {
            document.querySelectorAll('a, button, .filter-btn, .accordion-header, .js-magnetic').forEach(el => {
                el.addEventListener('mouseenter', () => playTerminalSound('sine', 800, 0.05, 0.02));
                el.addEventListener('mousedown', () => playTerminalSound('square', 300, 0.1, 0.05));
            });
        }
    }

    // --------------------------------------------------------------------------
    // 04. COMPONENT LOGIC (ACCORDIONS, SLIDERS, TABS, LIGHTBOX)
    // --------------------------------------------------------------------------
    
    // Universal Accordion Engine
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const parent = this.parentElement;
            const content = this.nextElementSibling; 
            const isOpen = parent.classList.contains('active');
            
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                const body = item.querySelector('.accordion-content');
                if (body) body.style.maxHeight = null;
            });

            if (!isOpen) {
                parent.classList.add('active');
                if (content) content.style.maxHeight = content.scrollHeight + "px";
                window.triggerHaptic(10);
            }
        });
    });

    // Dynamic Hover Glow (Pricing Cards)
    document.querySelectorAll('.price-module, .metric-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    // Image Belt Slider Controls
    const nextBeltBtn = document.getElementById('nextBelt');
    const prevBeltBtn = document.getElementById('prevBelt');
    const beltContainer = document.querySelector('.belt-container'); 

    if (nextBeltBtn && beltContainer) {
        nextBeltBtn.addEventListener('click', () => {
            window.triggerHaptic(15);
            const itemWidth = beltContainer.querySelector('.belt-item').offsetWidth + 30;
            beltContainer.scrollBy({ left: itemWidth, behavior: 'smooth' });
        });
    }

    if (prevBeltBtn && beltContainer) {
        prevBeltBtn.addEventListener('click', () => {
            window.triggerHaptic(15);
            const itemWidth = beltContainer.querySelector('.belt-item').offsetWidth + 30;
            beltContainer.scrollBy({ left: -itemWidth, behavior: 'smooth' });
        });
    }

    // Cinematic Video Lightbox Engine
    const videoCards = document.querySelectorAll('.js-open-lightbox');
    const lightbox = document.getElementById('videoLightbox');
    const lightboxVideo = document.getElementById('lightboxVideo');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const closeBtns = document.querySelectorAll('.js-close-lightbox');

    if (videoCards.length > 0 && lightbox) {
        videoCards.forEach(card => {
            card.addEventListener('click', () => {
                window.triggerHaptic([15, 30]); 
                lightboxVideo.src = card.getAttribute('data-video-src');
                lightboxTitle.textContent = card.getAttribute('data-title');
                lightboxDesc.textContent = card.getAttribute('data-desc');
                
                lightbox.classList.add('is-active');
                document.body.style.overflow = 'hidden'; 
                lightboxVideo.play().catch(e => console.warn("Autoplay prevented:", e));
            });
        });

        const closeLightbox = () => {
            window.triggerHaptic(15);
            lightbox.classList.remove('is-active');
            document.body.style.overflow = ''; 
            lightboxVideo.pause();
            setTimeout(() => { lightboxVideo.src = ''; }, 500); 
        };

        closeBtns.forEach(btn => btn.addEventListener('click', closeLightbox));
        lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
    }

    // --------------------------------------------------------------------------
    // 05. AREA PAGE SPECIFICS (TOPOGRAPHY & TELEMETRY)
    // --------------------------------------------------------------------------
    
    // Tactical Terrain Canvas (WebGL/2D Context Simulation)
    const terrainCanvas = document.getElementById('tacticalTerrain');
    if (terrainCanvas && window.innerWidth >= 992) {
        const ctx = terrainCanvas.getContext('2d');
        let w, h, scrollOffset = 0;
        
        const resize = () => {
            w = terrainCanvas.width = window.innerWidth;
            h = terrainCanvas.height = terrainCanvas.parentElement.offsetHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const drawTerrain = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
            ctx.lineWidth = 1;
            
            const vpX = w / 2, vpY = h * 0.15;
            ctx.beginPath();
            for (let x = -w; x < w * 2; x += 70) {
                ctx.moveTo(vpX, vpY);
                ctx.lineTo(x, h);
            }
            
            scrollOffset = (scrollOffset + 1.2) % 25; 
            for (let y = 1; y < 60; y++) {
                const drawY = vpY + Math.pow(y - (scrollOffset / 25), 2); 
                if (drawY > h) break; 
                ctx.moveTo(0, drawY);
                ctx.lineTo(w, drawY);
            }
            ctx.stroke();
            requestAnimationFrame(drawTerrain);
        };
        drawTerrain();
    }

    // Scroll-Driven Coordinate Telemetry
    const trackProg = document.getElementById('track-progress');
    if (trackProg) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            let percent = Math.max(0, Math.min(1, docHeight > 0 ? (scrollTop / docHeight) : 0));

            document.getElementById('track-lat').textContent = (48.3717 + ((48.1351 - 48.3717) * percent)).toFixed(4);
            document.getElementById('track-lon').textContent = (10.8983 + ((11.5820 - 10.8983) * percent)).toFixed(4);
            trackProg.style.height = `${percent * 100}%`;
            
            scrollTop < 100 ? document.body.setAttribute('data-scroll', 'top') : document.body.removeAttribute('data-scroll');
        }, { passive: true });
    }

    // Live Fleet Telemetry Fluctuation
    const capNumbers = document.querySelectorAll('.js-live-cap');
    if (capNumbers.length > 0) {
        setInterval(() => {
            capNumbers.forEach((el, index) => {
                let newCap = Math.max(10, Math.min(99, parseInt(el.getAttribute('data-base')) + (Math.floor(Math.random() * 5) - 2)));
                el.innerText = newCap;
                const bar = document.querySelectorAll('.js-live-bar')[index];
                if(bar) bar.style.width = newCap + '%';
            });
        }, 3500);
    }

    // Sector Scanner Simulator
    const scanBtn = document.querySelector('.js-verify-sector');
    if (scanBtn) {
        scanBtn.addEventListener('click', () => {
            const input = document.getElementById('sectorInput');
            const res = document.getElementById('scanResult');
            const query = input.value.trim();
            
            if (!query) return input.style.borderColor = "var(--neon-pink)";
            
            input.style.borderColor = "rgba(255,255,255,0.1)";
            res.classList.remove('active');
            scanBtn.innerHTML = 'CALCULATING... <i class="fas fa-spinner fa-spin"></i>';
            scanBtn.style.opacity = "0.7";
            scanBtn.style.pointerEvents = "none";

            setTimeout(() => {
                scanBtn.innerHTML = 'SCAN <i class="fas fa-satellite-dish"></i>';
                scanBtn.style.opacity = "1";
                scanBtn.style.pointerEvents = "auto";
                res.classList.add('active');
                res.innerHTML = `
                    <div style="color: var(--neon-green); margin-bottom: 5px;">> COORDINATES RECEIVED</div>
                    <div style="color: #fff; margin-bottom: 5px;">> TARGET: ${query.toUpperCase()}</div>
                    <div style="color: var(--neon-cyan);">> STATUS: PLEASE PROCEED TO MISSION_OS TO VERIFY EXACT LOGISTICS.</div>
                `;
            }, 1200);
        });
    }

    // Dynamic Sector Filtering (Mission Logs)
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.getAttribute('data-filter');

                document.querySelectorAll('.proof-card').forEach(card => {
                    card.classList.remove('is-filtered-in'); 
                    if (target === 'all' || card.getAttribute('data-zone') === target) {
                        card.classList.remove('is-filtered-out');
                        void card.offsetWidth; // Force Reflow
                        card.classList.add('is-filtered-in');
                    } else {
                        card.classList.add('is-filtered-out');
                    }
                });
                if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);
            });
        });
    }

    // --------------------------------------------------------------------------
    // 06. MISSION OS (LEAD CAPTURE MODAL)
    // --------------------------------------------------------------------------
    const osOverlay = document.querySelector('.os-overlay');
    if (osOverlay) {
        let currentStep = 1;
        const totalSteps = 4;
        const formSteps = document.querySelectorAll('.form-step');

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
            formSteps.forEach(step => step.classList.toggle('is-active', parseInt(step.dataset.step) === currentStep));
            const bar = document.getElementById('osProgress');
            if (bar) bar.style.width = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;

            document.querySelectorAll('.step-text').forEach((ind, i) => ind.classList.toggle('active', i < currentStep));
        };

        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', () => {
                const currentEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
                let isValid = true;
                
                currentEl.querySelectorAll('input[required], select[required]').forEach(input => {
                    if (!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
                        isValid = false;
                        input.style.borderColor = 'var(--neon-pink)';
                        setTimeout(() => input.style.borderColor = '', 2000);
                    }
                });

                if (isValid) {
                    window.triggerHaptic(10);
                    if (currentStep < totalSteps) { currentStep++; updateFormUI(); }
                } else {
                    window.triggerHaptic([30, 30]); 
                }
            });
        });

        document.querySelectorAll('.btn-prev').forEach(btn => {
            btn.addEventListener('click', () => {
                window.triggerHaptic(10);
                if (currentStep > 1) { currentStep--; updateFormUI(); }
            });
        });

        // Event delegation for opening/closing
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('.js-open-os')) { e.preventDefault(); window.MissionOS.open(); }
            if (e.target.closest('.js-close-os') && !e.target.classList.contains('os-backdrop')) window.MissionOS.close();
        });

        // Cartography Data Injection
        document.querySelectorAll('.js-open-os[data-sector]').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.querySelector('input[name="city"]');
                if (input) {
                    input.value = btn.getAttribute('data-sector');
                    input.style.borderColor = "var(--neon-cyan)";
                    input.style.background = "rgba(0, 229, 255, 0.1)";
                    setTimeout(() => {
                        input.style.borderColor = "rgba(255,255,255,0.1)";
                        input.style.background = "rgba(0,0,0,0.4)";
                    }, 2000);
                }
            });
        });

        // Submit Simulator
        const leadForm = document.getElementById('leadForm');
        if (leadForm) {
            leadForm.addEventListener('submit', (e) => {
                e.preventDefault(); 
                window.triggerHaptic([50, 100, 50]);
                document.querySelector('.case-container').innerHTML = `
                    <div style="text-align: center; padding: 40px 0;">
                        <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--neon-green); margin-bottom: 20px;"></i>
                        <h3 style="color: #fff; font-family: var(--font-head); font-size: 2rem; margin-bottom: 10px;">DATEN EMPFANGEN</h3>
                        <p style="color: #aaa;">Vielen Dank für Ihre Anfrage. Ich werde das Projektprotokoll prüfen und mich umgehend bei Ihnen melden.</p>
                        <button class="btn-terminal js-close-os" style="margin-top: 30px;">SYSTEM SCHLIESSEN</button>
                    </div>
                `;
            });
        }
    }

    console.log("%c[ RAPHAEL LEZIUS // SYSTEM 2026 ONLINE & CALIBRATED ]", "color: #00e5ff; font-size: 12px; font-weight: bold; background: #000; padding: 5px 10px; border: 1px solid #00e5ff;");

});

// --------------------------------------------------------------------------
// 07. POST-LOAD BOOT SEQUENCE
// --------------------------------------------------------------------------
window.addEventListener('load', () => {
    const bootScreen = document.getElementById('boot-sequence');
    if (bootScreen) {
        setTimeout(() => {
            bootScreen.classList.add('boot-complete');
            document.body.classList.remove('is-booting');
            if (typeof AOS !== 'undefined') AOS.refresh();
        }, 1200); 
    }
});

// Interactive Reveal Slider (Phase 04)
const revealContainerP4 = document.getElementById('harmonySliderPhase4');
if(revealContainerP4) {
    const moveSliderP4 = (clientX) => {
        const rect = revealContainerP4.getBoundingClientRect();
        let x = ((clientX - rect.left) / rect.width) * 100;
        if(x < 0) x = 0; if(x > 100) x = 100;
        const overlay = revealContainerP4.querySelector('.reveal-overlay-box');
        const imgTop = revealContainerP4.querySelector('.reveal-img-top');
        overlay.style.left = `${x}%`;
        imgTop.style.left = `-${x}%`;
    };

    revealContainerP4.addEventListener('mousemove', (e) => moveSliderP4(e.clientX));
    revealContainerP4.addEventListener('touchmove', (e) => {
        moveSliderP4(e.touches[0].clientX);
    }, {passive: true});
}

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Fallback-Funktionen definieren, damit keine Fehler das Skript blockieren
    window.triggerHaptic = window.triggerHaptic || function(intensity) {
        if (navigator.vibrate) navigator.vibrate(intensity);
    };

    window.MissionOS = window.MissionOS || {
        open: function() {
            alert("[SYSTEM] MissionOS Overlay wird geladen...");
        }
    };

    // 2. Mobile Menu Logik
    const mobileToggle = document.getElementById("mobileMenuToggle");
    const mobileMenu = document.getElementById("fluidMobileMenu");
    const body = document.body;

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Klasse "is-open" beim Menü hinzuzufügen/entfernen
            const isOpen = mobileMenu.classList.toggle("is-open");
            
            // Scrollen der Webseite im Hintergrund verhindern, wenn Menü offen ist
            if (isOpen) {
                body.style.overflow = "hidden";
            } else {
                body.style.overflow = "";
            }
        });

        // 3. Menü schließen, wenn man auf einen Link klickt
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener("click", function() {
                mobileMenu.classList.remove("is-open");
                body.style.overflow = "";
            });
        });
    }

    // 4. Logo Lightbox Logik
    const brandLogo = document.getElementById("brandLogoTrigger");
    const lightbox = document.getElementById("logoLightbox");
    const closeLightbox = document.getElementById("closeLightbox");

    if (brandLogo && lightbox) {
        brandLogo.addEventListener("click", function(e) {
            lightbox.classList.add("is-open");
        });
        
        if (closeLightbox) {
            closeLightbox.addEventListener("click", function() {
                lightbox.classList.remove("is-open");
            });
        }
    }
});

// Automatically update the copyright year in the footer
document.addEventListener("DOMContentLoaded", function() {
    const yearSpan = document.getElementById("currentYear");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});