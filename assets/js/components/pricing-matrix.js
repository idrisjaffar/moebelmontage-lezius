/**
 * ==========================================================================
 * DEPLOYMENT SECTOR LOGIC CORE (v2026.5)
 * ==========================================================================
 * FEATURES:
 * 1. Magnetic UI Physics (Hardware Accelerated Lerp)
 * 2. Vector Tracking HUD (Scroll-linked telemetry)
 * 3. Live Sector Verification Engine (Terminal Typewriter)
 * 4. Autonomous Telemetry Fluctuations (Data Simulation)
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // --- 0. MICRO-HAPTICS ENGINE ---
    const triggerHaptic = (pattern) => {
        if (typeof navigator.vibrate === "function") {
            navigator.vibrate(pattern);
        }
    };

    // --- 1. MAGNETIC UI PHYSICS ---
    // Pulls buttons smoothly toward the cursor for a tactile "app" feel
    const magneticElements = document.querySelectorAll('.js-magnetic');
    
    magneticElements.forEach(elem => {
        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            const h = rect.height;
            const w = rect.width;
            const x = e.clientX - rect.left - w / 2;
            const y = e.clientY - rect.top - h / 2;
            
            // Magnetic pull strength (0.3 = 30% pull)
            elem.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
        });

        elem.addEventListener('mouseleave', () => {
            // Spring back to center
            elem.style.transform = `translate3d(0px, 0px, 0)`;
            triggerHaptic(10);
        });
    });

    // --- 2. VECTOR TRACKING HUD (Scroll Sync) ---
    // Ties the left-side HUD to the user's scroll depth using requestAnimationFrame for zero lag
    const trackLat = document.getElementById('track-lat');
    const trackLon = document.getElementById('track-lon');
    const trackProgress = document.getElementById('track-progress');
    
    let ticking = false;
    
    const updateTracker = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;
        
        if (trackProgress) {
            trackProgress.style.width = `${scrollPercent * 100}%`;
        }

        // Simulate micro-changes in coordinates to make it feel alive
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

    // --- 3. AUTONOMOUS TELEMETRY SIMULATION ---
    // Creates subtle fluctuations in the Fleet Status bars
    const liveCaps = document.querySelectorAll('.js-live-cap');
    
    setInterval(() => {
        liveCaps.forEach(cap => {
            const base = parseInt(cap.getAttribute('data-base'));
            // Fluctuate by -2% to +2%
            const fluctuation = Math.floor(Math.random() * 5) - 2;
            let newValue = base + fluctuation;
            
            // Cap it between 0 and 100
            if(newValue > 100) newValue = 100;
            if(newValue < 0) newValue = 0;
            
            cap.innerText = newValue;
            
            // Find corresponding bar and update width
            const bar = cap.closest('.telemetry-card').querySelector('.js-live-bar');
            if (bar) {
                bar.style.width = `${newValue}%`;
            }
        });
    }, 3500); // Update every 3.5 seconds

    // --- 4. SECTOR VERIFICATION ENGINE ---
    // Real logic to check user input against defined zones
    const verifyBtn = document.querySelector('.js-verify-sector');
    const verifyInput = document.getElementById('sectorInput');
    const resultBox = document.getElementById('scanResult');

    // Dictionaries based on your SEO Matrix
    const zone1 = ['86150', '86391', '86356', '86368', '86316', '86343', '86399', '86420', 'augsburg', 'stadtbergen', 'neusäß', 'gersthofen', 'friedberg', 'königsbrunn', 'bobingen', 'diedorf'];
    const zone2 = ['85221', '82256', '86899', '82140', '82178', '82110', '82205', '82216', 'dachau', 'fürstenfeldbruck', 'landsberg', 'olching', 'puchheim', 'germering', 'gilching', 'maisach'];
    const zone3 = ['80331', '80802', '81675', '82319', '82131', '82211', '82327', '82031', 'münchen', 'schwabing', 'bogenhausen', 'starnberg', 'gauting', 'herrsching', 'tutzing', 'grünwald'];

    if (verifyBtn && verifyInput && resultBox) {
        verifyBtn.addEventListener('click', () => {
            const query = verifyInput.value.trim().toLowerCase();
            
            if (query === '') {
                triggerHaptic([10, 50, 10]);
                typeWriterEffect(resultBox, "<span class='text-pink'>ERROR: LEERE EINGABE. BITTE PLZ ODER STADT ANGEBEN.</span>");
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
                } 
                else if (zone2.some(z => query.includes(z))) {
                    response = "<span class='text-cyan'>MATCH FOUND: ZONE_02 // TRANSIT</span><br>Status: Aktiv<br>Anfahrt: 45,00 € Logistikpauschale.";
                    triggerHaptic([20, 50, 20]);
                } 
                else if (zone3.some(z => query.includes(z))) {
                    response = "<span class='text-pink'>MATCH FOUND: ZONE_03 // DEEP_SOUTH</span><br>Status: Aktiv<br>Anfahrt: 65,00 € Premium-Logistik.";
                    triggerHaptic([20, 50, 20]);
                } 
                else {
                    response = "<span class='text-pink'>SECTOR UNKNOWN // OUT_OF_BOUNDS</span><br>Dieses Gebiet fällt unter das 'Extended Range Protocol'.<br>Bitte B2B/Sonderprojekt anfragen.";
                    triggerHaptic([30, 100, 30]);
                }

                resultBox.classList.add('active');
                typeWriterEffect(resultBox, response);
                
                verifyBtn.innerHTML = 'SCAN <i class="fas fa-satellite-dish"></i>';
                verifyBtn.style.pointerEvents = 'auto';

            }, 1200);
        });

        // Allow Enter key to trigger scan
        verifyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                verifyBtn.click();
            }
        });
    }

    // --- 5. TERMINAL TYPEWRITER EFFECT UTILITY ---
    function typeWriterEffect(element, htmlString) {
        element.innerHTML = '';
        let i = 0;
        let isTag = false;
        let text = htmlString;
        
        function type() {
            if (i < text.length) {
                if (text.charAt(i) === '<') isTag = true;
                if (text.charAt(i) === '>') isTag = false;
                
                element.innerHTML += text.charAt(i);
                i++;
                
                if (isTag) {
                    type(); // Skip delays for HTML tags
                } else {
                    setTimeout(type, 15); // Typing speed
                }
            }
        }
        type();
    }
});