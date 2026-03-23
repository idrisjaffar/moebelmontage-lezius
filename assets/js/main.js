/* ==========================================================================
   RAPHAEL LEZIUS | 2077 HUD MASTER ENGINE (main.js)
   ARCHITECTURE: HIGH-PERFORMANCE, HAPTIC-ENABLED, INTELLIGENT-REACTION
   LEGAL: 100% GDPR (DSGVO) COMPLIANT 2026
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. SMART HARDWARE & PRIVACY ENGINE ---
    // Detects battery status and reduces animation intensity to be "Sensitive" to user hardware
    const state = {
        lowPerformance: false,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const checkBattery = () => {
                state.lowPerformance = battery.level < 0.2 && !battery.charging;
                if (state.lowPerformance) document.body.classList.add('eco-mode');
            };
            battery.addEventListener('levelchange', checkBattery);
            checkBattery();
        });
    }

    // --- 1. GLOBAL HAPTIC ENGINE (DSGVO COMPLIANT) ---
    // Vibration only triggers on explicit user interaction (Click/Tap)
    window.vibrateDevice = (pattern) => {
        if (!state.lowPerformance && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    };

    // --- 2. SYSTEM INITIALIZATION ---
    console.log("%c[SYSTEM ONLINE] R.LEZIUS_ENGINE_v2.8_FINAL", "color: #FFD700; font-weight: bold; background: #000; padding: 5px 10px;");

    // Initialize AOS with "Sensitivity" - only if user hasn't requested reduced motion
    if (typeof AOS !== 'undefined') {
        AOS.init({ 
            duration: 800, 
            once: true, 
            disable: state.reducedMotion 
        });
    }

    // Dynamic Date Injection (German Format)
    const dateElement = document.getElementById('dynamic-date');
    if (dateElement) {
        dateElement.innerText = new Date().toLocaleDateString('de-DE');
    }
    
    const yearElement = document.getElementById('copyright-year');
    if (yearElement) {
        yearElement.innerText = new Date().getFullYear();
    }

    // --- 3. INTELLIGENT SCRAMBLE (GLITCH EFFECT) ---
    const glitchHeader = document.querySelector('.glitch-header');
    if (glitchHeader && !state.reducedMotion) {
        const targetText = glitchHeader.getAttribute('data-text') || "PRÄZISION";
        const targetSpan = glitchHeader.querySelector('.gold-text');
        
        if (targetSpan) {
            const chars = '01X%$@&*'; 
            let frame = 0;
            const scramble = () => {
                targetSpan.innerText = targetText.split('').map((char, index) => {
                    if (index < frame) return targetText[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');

                if (frame < targetText.length) {
                    frame += 0.3;
                    requestAnimationFrame(scramble);
                }
            };
            setTimeout(scramble, 500);
        }
    }

    // --- 4. MAGNETIC BUTTON PHYSICS (SENSITIVE REACTION) ---
    const magneticButtons = document.querySelectorAll('.btn-magnetic');
    if (window.innerWidth > 1024 && !state.reducedMotion) {
        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // --- 5. NEON GOLD BUBBLES (HARDWARE-AWARE CANVAS) ---
    const canvas = document.getElementById('gold-bubbles');
    if (canvas && !state.lowPerformance) {
        const ctx = canvas.getContext('2d');
        let bubbles = [];
        let active = true;

        // Auto-pause when user leaves tab (Intelligent Battery Saving)
        const observer = new IntersectionObserver(entries => active = entries[0].isIntersecting);
        observer.observe(canvas);

        const setSize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', setSize);
        setSize();

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 50;
                this.size = Math.random() * 3 + 1;
                this.speed = Math.random() * 1.5 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.y -= this.speed;
                if (this.y < -50) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 100; i++) bubbles.push(new Particle());

        function loop() {
            if (active) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                bubbles.forEach(b => { b.update(); b.draw(); });
            }
            requestAnimationFrame(loop);
        }
        loop();
    }

    // --- 6. SMART ACCORDION (SECTOR MODULES) ---
    window.expandSector = (element) => {
        const allModules = document.querySelectorAll('.sector-module');
        const isOpening = !element.classList.contains('active');

        allModules.forEach(m => m.classList.remove('active'));
        if (isOpening) {
            element.classList.add('active');
            window.vibrateDevice(15);
        }
    };

    // --- 7. MOBILE NAVIGATION (HAPTIC READY) ---
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const active = mobileMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            document.body.style.overflow = active ? 'hidden' : '';
            window.vibrateDevice(active ? 20 : [10, 10]);
        });
    }
});

// --- 8. MISSION_OS LEAD ENGINE (GLOBAL HOOKS) ---
window.MissionOS = {
    open: () => {
        const os = document.getElementById('missionOS');
        if(os) {
            os.classList.add('system-active');
            document.body.style.overflow = 'hidden';
            window.vibrateDevice([20, 50]);
        }
    },
    close: () => {
        const os = document.getElementById('missionOS');
        if(os) {
            os.classList.remove('system-active');
            document.body.style.overflow = '';
        }
    },
    setPhase: (phase) => {
        document.querySelectorAll('.case-phase').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.step-link').forEach(l => l.classList.remove('active'));
        document.getElementById(`phase${phase}`).classList.add('active');
        document.getElementById(`nav${phase}`).classList.add('active');
        window.vibrateDevice(10);
    }
};

// --- 9. LIVE DISPATCH TERMINAL INJECTOR (INTELLIGENT FEED) ---
const initDispatchFeed = () => {
    const feedContainer = document.getElementById("live-dispatch-feed");
    if (!feedContainer) return;

    const dispatchMessages = [
        { time: "SYS:", msg: "Premium Bosch-Tooling geladen.", highlight: false },
        { time: "LOG:", msg: 'HEPA-Absaugung: <span style="color:var(--neon-green)">AKTIV</span>', highlight: false },
        { time: "DIS:", msg: "Prüfe Montage-Kapazitäten...", highlight: false },
        { time: "WARN:", msg: "Hohes Auftragsvolumen erfasst.", highlight: true },
        { time: "INFO:", msg: "Kreuzlinienlaser kalibriert.", highlight: false },
        { time: "SEC:", msg: "Betriebshaftpflicht: GÜLTIG", highlight: false }
    ];

    let currentIndex = 0;
    // Uses a staggered interval to feel more "Human/AI" and less like a robot
    const injectMessage = () => {
        if (feedContainer.children.length >= 3) {
            feedContainer.removeChild(feedContainer.firstElementChild);
        }
        const newMsg = dispatchMessages[currentIndex];
        const line = document.createElement("div");
        line.className = `stream-line ${newMsg.highlight ? 'highlight' : ''}`;
        line.style.transform = "translateX(-20px)";
        line.style.opacity = "0";
        line.innerHTML = `<span class="time">${newMsg.time}</span><span class="msg">${newMsg.msg}</span>`;
        
        feedContainer.appendChild(line);
        
        // Fluid transition
        requestAnimationFrame(() => {
            line.style.transition = "all 0.5s ease";
            line.style.transform = "translateX(0)";
            line.style.opacity = "1";
        });

        currentIndex = (currentIndex + 1) % dispatchMessages.length;
        setTimeout(injectMessage, 3000 + Math.random() * 2000); // Intelligent variation
    };
    injectMessage();
};

// --- 10. INTERACTIVE GALLERY BELT (PHYSICS-BASED) ---
const initGalleryBelt = () => {
    const gurt = document.getElementById('imageBelt');
    const tasteZurueck = document.getElementById('prevBelt');
    const tasteVor = document.getElementById('nextBelt');

    if (gurt && tasteVor && tasteZurueck) {
        const setSpeed = (speed, direction = 'normal') => {
            gurt.style.animationDuration = speed;
            gurt.style.animationDirection = direction;
        };

        // Turbo Speed on hover/hold
        const turbo = () => { setSpeed('15s'); window.vibrateDevice(10); };
        const reset = () => { setSpeed('90s'); };

        tasteVor.addEventListener('mousedown', turbo);
        tasteVor.addEventListener('mouseup', reset);
        tasteVor.addEventListener('touchstart', turbo, {passive: true});
        tasteVor.addEventListener('touchend', reset);

        tasteZurueck.addEventListener('mousedown', () => { turbo(); gurt.style.animationDirection = 'reverse'; });
        tasteZurueck.addEventListener('mouseup', () => { reset(); gurt.style.animationDirection = 'normal'; });
        tasteZurueck.addEventListener('touchstart', () => { turbo(); gurt.style.animationDirection = 'reverse'; }, {passive: true});
        tasteZurueck.addEventListener('touchend', () => { reset(); gurt.style.animationDirection = 'normal'; });
    }
};

// --- 11. MISSION_OS v2.6: THE INTELLIGENT LEAD ENGINE ---
const serviceDB = [
    "IKEA PAX Kleiderschrank", "IKEA METOD Küche", "IKEA PLATSA System", "IKEA EKET Regal",
    "IKEA BESTÅ Wohnwand", "IKEA MALM Bett", "Gartenhaus (Holz)", "Gerätehaus (Metall/Biohort)",
    "USM Haller Regal Aufbau", "Büro-Schreibtisch (Höhenverstellbar)", "Konferenztisch",
    "Boxspringbett Aufbau", "TV-Wandhalterung (Schwerlast)", "Bilder & Spiegel Wandmontage", 
    "Vorhangschienen Montage", "Küchen-Arbeitsplatte Zuschnitt", "Spüle / Kochfeld Ausschnitt",
    "Outdoor Lounge / Pavillon", "Möbel-Demontage", "Akustikpaneele Montage"
];

window.MissionOS = {
    open: () => {
        window.vibrateDevice([20, 40]);
        const modal = document.getElementById('missionOS');
        if (modal) {
            modal.classList.add('system-active');
            document.body.style.overflow = 'hidden';
            window.MissionOS.setPhase(1); 
        }
    },

    close: () => {
        const modal = document.getElementById('missionOS');
        if (modal) {
            modal.classList.remove('system-active');
            document.body.style.overflow = '';
        }
    },

    setPhase: (n) => {
        // Visual Progress feedback
        window.vibrateDevice(10);
        document.querySelectorAll('.case-phase').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.step-link').forEach(l => l.classList.remove('active'));
        
        const targetPhase = document.getElementById(`phase${n}`);
        const targetNav = document.getElementById(`nav${n}`);
        
        if(targetPhase && targetNav) {
            targetPhase.classList.add('active');
            targetNav.classList.add('active');
        }
        document.querySelector('.case-main').scrollTop = 0;
    },

    filterServices: () => {
        const searchEl = document.getElementById('serviceSearch');
        const results = document.getElementById('searchResults');
        if(!searchEl || !results) return;

        const query = searchEl.value.toLowerCase();
        results.innerHTML = "";
        
        if (query.length < 1) { 
            results.style.display = "none"; 
            return; 
        }
        
        const matches = serviceDB.filter(s => s.toLowerCase().includes(query));
        
        matches.forEach(m => {
            const div = document.createElement('div');
            div.className = "search-item";
            div.innerHTML = `<i class="fas fa-plus-circle" style="color:var(--neon-cyan)"></i> ${m}`;
            div.onclick = () => window.MissionOS.addTag(m);
            results.appendChild(div);
        });

        // Smart Feature: Allow manual entry if no match
        if (matches.length === 0) {
            const manual = document.createElement('div');
            manual.className = "search-item";
            manual.innerHTML = `<i class="fas fa-keyboard" style="color:var(--neon-gold)"></i> "${searchEl.value}" hinzufügen`;
            manual.onclick = () => window.MissionOS.addTag(searchEl.value);
            results.appendChild(manual);
        }
        results.style.display = "block";
    },

    addTag: (val) => {
        const container = document.getElementById('selectedTags');
        if (!container || !val) return;

        // Duplicate Check
        if ([...container.querySelectorAll('.tag-val')].some(el => el.value === val)) return;

        window.vibrateDevice(15);
        const chip = document.createElement('div');
        chip.className = "tech-tag";
        chip.innerHTML = `
            ${val} 
            <input type="hidden" name="service[]" class="tag-val" value="${val}">
            <i class="fas fa-times" onclick="this.parentElement.remove(); window.MissionOS.updateCount();"></i>
        `;
        container.appendChild(chip);
        window.MissionOS.updateCount();
        
        // Clear search
        document.getElementById('serviceSearch').value = "";
        document.getElementById('searchResults').style.display = "none";
    },

    updateCount: () => {
        const count = document.getElementById('selectedTags').children.length;
        const display = document.getElementById('serviceCount');
        if (display) display.innerText = count.toString().padStart(2, '0');
    }
};

// Initialize everything on load
document.addEventListener('DOMContentLoaded', () => {
    initDispatchFeed();
    initGalleryBelt();
    
    // Global Close Handlers
    document.addEventListener('keydown', e => { if(e.key === "Escape") window.MissionOS.close(); });
    document.addEventListener('click', e => {
        if (!e.target.closest('.search-terminal')) {
            const res = document.getElementById('searchResults');
            if(res) res.style.display = "none";
        }
    });
});