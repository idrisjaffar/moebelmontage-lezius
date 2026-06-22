/**
 * ==========================================================================
 * DEPLOYMENT SECTOR LOGIC CORE (v2026.5)
 * ==========================================================================
 * ENGINES:
 * 1. Magnetic UI Physics (GPU Accelerated via requestAnimationFrame)
 * 2. Vector Tracking HUD (Scroll-linked telemetry)
 * 3. Autonomous Telemetry Simulation
 * 4. Sector Verification Engine
 * 5. Safe HTML Typewriter Parsing
 * ==========================================================================
 */

(function() {
    "use strict";

    const initSectorLogic = () => {

        // --- 0. MICRO-HAPTICS ENGINE ---
        const triggerHaptic = (pattern) => {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { navigator.vibrate(pattern); } catch(e) {}
            }
        };

        // --- 1. MAGNETIC UI PHYSICS (GPU Accelerated) ---
        const magneticElements = document.querySelectorAll('.js-magnetic');
        magneticElements.forEach(elem => {
            let isHovering = false;
            let targetX = 0;
            let targetY = 0;

            elem.addEventListener('mousemove', (e) => {
                const rect = elem.getBoundingClientRect();
                targetX = e.clientX - rect.left - rect.width / 2;
                targetY = e.clientY - rect.top - rect.height / 2;
                
                if (!isHovering) {
                    isHovering = true;
                    // Use animation frame to prevent layout thrashing
                    requestAnimationFrame(function animate() {
                        if (isHovering) {
                            elem.style.transform = `translate3d(${targetX * 0.3}px, ${targetY * 0.3}px, 0)`;
                            requestAnimationFrame(animate);
                        }
                    });
                }
            });

            elem.addEventListener('mouseleave', () => {
                isHovering = false;
                elem.style.transform = `translate3d(0px, 0px, 0)`;
                triggerHaptic(10);
            });
        });

        // --- 2. VECTOR TRACKING HUD (Scroll Sync) ---
        const trackLat = document.getElementById('track-lat');
        const trackLon = document.getElementById('track-lon');
        const trackProgress = document.getElementById('track-progress');
        
        let ticking = false;
        
        const updateTracker = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const scrollPercent = scrollTop / docHeight;
            
            if (trackProgress) {
                trackProgress.style.width = `${Math.min(100, scrollPercent * 100)}%`;
            }

            // Micro-fluctuations in coordinates
            if (trackLat && trackLon) {
                const baseLat = 48.3717;
                const baseLon = 10.8983;
                trackLat.innerText = (baseLat - (scrollPercent * 0.05)).toFixed(4);
                trackLon.innerText = (baseLon + (scrollPercent * 0.05)).toFixed(4);
            }
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateTracker);
                ticking = true;
            }
        }, { passive: true });

        // Initialize HUD position on load
        updateTracker();

        // --- 3. AUTONOMOUS TELEMETRY SIMULATION ---
        const liveCaps = document.querySelectorAll('.js-live-cap');
        if (liveCaps.length > 0) {
            setInterval(() => {
                liveCaps.forEach(cap => {
                    const base = parseInt(cap.getAttribute('data-base')) || 50;
                    const fluctuation = Math.floor(Math.random() * 5) - 2; // Range: -2 to +2
                    let newValue = Math.min(100, Math.max(0, base + fluctuation));
                    
                    cap.innerText = newValue;
                    
                    const bar = cap.closest('.telemetry-card')?.querySelector('.js-live-bar');
                    if (bar) {
                        bar.style.width = `${newValue}%`;
                    }
                });
            }, 3500); // 3.5s update cycle
        }

        // --- 4. SECTOR VERIFICATION ENGINE ---
        const verifyBtn = document.querySelector('.js-verify-sector');
        const verifyInput = document.getElementById('sectorInput');
        const resultBox = document.getElementById('scanResult');

        // Matrix Dictionaries
        const zone1 = ['86150', '86391', '86356', '86368', '86316', '86343', '86399', '86420', 'augsburg', 'stadtbergen', 'neusäß', 'gersthofen', 'friedberg', 'königsbrunn', 'bobingen', 'diedorf'];
        const zone2 = ['85221', '82256', '86899', '82140', '82178', '82110', '82205', '82216', 'dachau', 'fürstenfeldbruck', 'landsberg', 'olching', 'puchheim', 'germering', 'gilching', 'maisach'];
        const zone3 = ['80331', '80802', '81675', '82319', '82131', '82211', '82327', '82031', 'münchen', 'schwabing', 'bogenhausen', 'starnberg', 'gauting', 'herrsching', 'tutzing', 'grünwald'];

        if (verifyBtn && verifyInput && resultBox) {
            verifyBtn.addEventListener('click', () => {
                const query = verifyInput.value.trim().toLowerCase();
                
                if (query === '') {
                    triggerHaptic([10, 50, 10]);
                    safeTypeWriter(resultBox, "<span class='text-pink'>ERROR: LEERE EINGABE. BITTE PLZ ODER STADT ANGEBEN.</span>");
                    return;
                }

                triggerHaptic(20);
                verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SYNCING...';
                verifyBtn.style.pointerEvents = 'none';

                // Simulate satellite uplink delay
                setTimeout(() => {
                    let response = "";

                    if (zone1.some(z => query.includes(z))) {
                        response = "<span class='text-gold'>MATCH FOUND: ZONE_01 // THE_CORE</span><br>Status: Aktiv<br>Anfahrt: 0,00 € Logistikpauschale.";
                        triggerHaptic([20, 50, 20]);
                    } else if (zone2.some(z => query.includes(z))) {
                        response = "<span class='text-cyan'>MATCH FOUND: ZONE_02 // TRANSIT</span><br>Status: Aktiv<br>Anfahrt: 45,00 € Logistikpauschale.";
                        triggerHaptic([20, 50, 20]);
                    } else if (zone3.some(z => query.includes(z))) {
                        response = "<span class='text-pink'>MATCH FOUND: ZONE_03 // DEEP_SOUTH</span><br>Status: Aktiv<br>Anfahrt: 65,00 € Premium-Logistik.";
                        triggerHaptic([20, 50, 20]);
                    } else {
                        response = "<span class='text-pink'>SECTOR UNKNOWN // OUT_OF_BOUNDS</span><br>Dieses Gebiet fällt unter das 'Extended Range Protocol'.<br>Bitte B2B/Sonderprojekt anfragen.";
                        triggerHaptic([30, 100, 30]);
                    }

                    resultBox.classList.add('active');
                    safeTypeWriter(resultBox, response);
                    
                    verifyBtn.innerHTML = 'SCAN <i class="fas fa-satellite-dish"></i>';
                    verifyBtn.style.pointerEvents = 'auto';

                }, 1200);
            });

            // Enter key mapping
            verifyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    verifyBtn.click();
                }
            });
        }

        // --- 5. SAFE TERMINAL TYPEWRITER EFFECT ---
        // Prevents DOM breakage by treating full HTML tags as single tokens
        function safeTypeWriter(element, htmlString) {
            element.innerHTML = '';
            
            // Match complete HTML tags OR single characters
            const tokens = htmlString.match(/(<[^>]+>|[^<])/g) || [];
            let i = 0;
            
            function type() {
                if (i < tokens.length) {
                    element.innerHTML += tokens[i];
                    i++;
                    
                    // If the token was an HTML tag, type the next character immediately (no delay)
                    if (tokens[i - 1].startsWith('<')) {
                        type();
                    } else {
                        setTimeout(type, 15); // Typing speed
                    }
                }
            }
            type();
        }
    };

    // Failsafe execution: Run immediately if loaded late, otherwise wait for DOM
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSectorLogic);
    } else {
        initSectorLogic();
    }

})();