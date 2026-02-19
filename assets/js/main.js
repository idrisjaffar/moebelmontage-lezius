document.addEventListener('DOMContentLoaded', () => {
    
    // 1. INITIALIZE AOS ANIMATIONS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, offset: 50, once: true });
    }

    // 2. SCRAMBLE TEXT (GLITCH EFFECT)
    const glitchHeader = document.querySelector('.glitch-header');
    if (glitchHeader) {
        const originalText = glitchHeader.getAttribute('data-text') || "PERFEKTION";
        const chars = '!<>-_\\/[]{}—=+*^?#________';
        const scramble = () => {
            let iteration = 0;
            const interval = setInterval(() => {
                const target = glitchHeader.querySelector('.gold-text');
                if(target) {
                    target.innerText = originalText.split('').map((l, i) => {
                        if(i < iteration) return originalText[i];
                        return chars[Math.floor(Math.random() * chars.length)];
                    }).join('');
                }
                if(iteration >= originalText.length) clearInterval(interval);
                iteration += 1/3;
            }, 30);
        };
        setTimeout(scramble, 500);
    }

    // 3. MAGNETIC BUTTONS (SMOOTH)
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const pos = btn.getBoundingClientRect();
            const x = e.pageX - pos.left - pos.width / 2;
            const y = e.pageY - pos.top - pos.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener('mouseout', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    // 4. GOLDEN BUBBLES (CHAMPAGNE EFFECT)
    const canvas = document.getElementById('gold-bubbles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let bubbles = [];
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize);
        resize();

        class Bubble {
            constructor() { this.init(); }
            init() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.size = Math.random() * 4 + 1; 
                this.speed = Math.random() * 1 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.y -= this.speed;
                if (this.y < -10) this.init();
            }
            draw() {
                ctx.beginPath();
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                grad.addColorStop(0, `rgba(255, 215, 0, ${this.opacity})`);
                grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
                ctx.fillStyle = grad;
                ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        for (let i = 0; i < 100; i++) bubbles.push(new Bubble());
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            bubbles.forEach(b => { b.update(); b.draw(); });
            requestAnimationFrame(animate);
        };
        animate();
    }

    // 5. LIVE TIME (OPS PANEL)
    const timeEl = document.querySelector('.stream-line .time');
    if(timeEl) {
        const now = new Date();
        timeEl.innerText = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        timeEl.style.color = '#39ff14';
    }

    // 6. OPS CARD TILT
    const tiltWrapper = document.querySelector('.ops-panel-wrapper');
    const tiltCard = document.querySelector('.ops-card');
    if (tiltWrapper && tiltCard) {
        tiltWrapper.addEventListener('mousemove', (e) => {
            const rect = tiltWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        tiltWrapper.addEventListener('mouseleave', () => tiltCard.style.transform = 'rotateX(0) rotateY(0)');
    }

    // 7. COUNTERS (SMART SCROLL)
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                let current = 0;
                const updateCounter = () => {
                    current += target / 60; // Smooth speed
                    if (current < target) {
                        counter.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));

    // 8. MATRIX TAB SYSTEM (NEW UPDATE)
    window.openMatrix = (evt, sectorName) => {
        // Hide all content
        const contents = document.querySelectorAll('.matrix-content');
        contents.forEach(content => content.classList.remove('active'));

        // Deactivate all buttons
        const tabs = document.querySelectorAll('.matrix-tab');
        tabs.forEach(tab => tab.classList.remove('active'));

        // Show selected content & activate button
        const selected = document.getElementById(sectorName);
        if(selected) selected.classList.add('active');
        if(evt) evt.currentTarget.classList.add('active');
    };

    // 9. MOBILE MENU TOGGLE
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // Hamburger Animation
            const bars = hamburger.querySelectorAll('.bar');
            if (mobileMenu.classList.contains('active')) {
                bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
                document.body.style.overflow = 'hidden'; // Lock scroll
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
                document.body.style.overflow = ''; // Unlock scroll
            }
        });

        // Close menu when clicking links
        const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                hamburger.classList.remove('active');
                const bars = hamburger.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
                document.body.style.overflow = '';
            });
        });
    }
});

/* =========================================
   11. PREMIUM SECTOR TOGGLE (Exclusive Mode)
   ========================================= */
window.expandSector = (element) => {
    const isActive = element.classList.contains('active');
    document.querySelectorAll('.sector-module').forEach(mod => mod.classList.remove('active'));

    if (!isActive) {
        element.classList.add('active');
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }
};

/* =========================================
   12. INTERACTIVE GALLERY BELT (ImageBelt)
   ========================================= */
const gurt = document.getElementById('imageBelt');
const tasteZurueck = document.getElementById('prevBelt');
const tasteVor = document.getElementById('nextBelt');

if (gurt && tasteVor && tasteZurueck) {
    tasteVor.addEventListener('mouseenter', () => gurt.style.animationDuration = '10s');
    tasteVor.addEventListener('mouseleave', () => gurt.style.animationDuration = '40s');

    tasteZurueck.addEventListener('mouseenter', () => {
        gurt.style.animationDirection = 'reverse';
        gurt.style.animationDuration = '10s';
    });
    tasteZurueck.addEventListener('mouseleave', () => {
        gurt.style.animationDirection = 'normal';
        gurt.style.animationDuration = '40s';
    });
}

/* =========================================
   14. REVIEW TERMINAL SLIDER
   ========================================= */
let currentRev = 0;
const reviews = document.querySelectorAll('.review-card');
const revNum = document.getElementById('revNum');

window.showReview = (index) => {
    if(!reviews.length) return;
    reviews.forEach(r => r.classList.remove('active'));
    reviews[index].classList.add('active');
    if(revNum) revNum.innerText = index + 1;
};

window.nextReview = () => {
    currentRev = (currentRev + 1) % reviews.length;
    showReview(currentRev);
};

window.prevReview = () => {
    currentRev = (currentRev - 1 + reviews.length) % reviews.length;
    showReview(currentRev);
};

/* =========================================
   15. SMART-TILE FAQ PROTOCOL
   ========================================= */
function toggleModule(element) {
    const isOpen = element.classList.contains('open');
    document.querySelectorAll('.faq-module').forEach(mod => mod.classList.remove('open'));

    if (!isOpen) {
        element.classList.add('open');
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }
}

/* ============================================================
   MISSION_OS_v2.6 UNIFIED SYSTEM ENGINE (INTEGRATED)
   ============================================================ */

const serviceDB = [
    "IKEA PAX Schrank Montage", "IKEA METOD Küche", "IKEA PLATSA System", "IKEA EKET Regal",
    "IKEA HEMNES Serie", "IKEA MALM Bett", "IKEA BILLY Regal", "IKEA BESTÅ Wandmontage",
    "IKEA BROR Regal", "IKEA KALLAX System", "IKEA IVAR Lagerregal",
    "USM Haller Regal Aufbau", "USM Haller Umbau", "Hülsta Schrankwand", "Nobilia Einbauküche",
    "Schreibtisch (Höhenverstellbar)", "Konferenztisch", "Büro-Rollcontainer", "Akustikpaneele",
    "Boxspringbett Aufbau", "Kleiderschrank Schwebetüren", "Esstisch & Stühle", "Sofa / Couch Montage",
    "Wohnwand Montage", "Sideboard / Kommode", "Garderobe & Flurmöbel",
    "TV-Wandhalterung (alle Größen)", "Bohrarbeiten (Beton/Ziegel)", "Lampen Montage & Anschluss",
    "Vorhangschienen / Gardinenstangen", "Spiegel & Bilder aufhängen", "Smart Home Installation",
    "LED-Leisten / Ambiente-Licht", "Kabelmanagement",
    "Küchen-Arbeitsplatte Zuschnitt", "Herd/Spüle Ausschnitt", "Möbel-Demontage", "Umzugshilfe (Möbel)",
    "Entsorgung Verpackungsmaterial"
];

window.MissionOS = {
    // 1. TERMINAL CONTROLS
    open: () => {
        const modal = document.getElementById('missionOS');
        if (modal) {
            modal.classList.add('system-active');
            document.body.style.overflow = 'hidden';
            MissionOS.setPhase(1); // Default start
        }
    },

    close: () => {
        const modal = document.getElementById('missionOS');
        if (modal) {
            modal.classList.remove('system-active');
            document.body.style.overflow = 'auto';
        }
    },

    // 2. PHASE NAVIGATION
    setPhase: (n) => {
        // Handle Content Phases
        document.querySelectorAll('.case-phase').forEach(p => p.classList.remove('active'));
        const targetPhase = document.getElementById(`phase${n}`);
        if(targetPhase) targetPhase.classList.add('active');

        // Handle Sidebar Navigation Links
        document.querySelectorAll('.step-link').forEach(l => l.classList.remove('active'));
        const targetNav = document.getElementById(`nav${n}`);
        if(targetNav) targetNav.classList.add('active');

        // Reset Scroll Position for the user
        const mainContent = document.querySelector('.case-main');
        if(mainContent) mainContent.scrollTop = 0;
    },

    // 3. INTELLIGENT SEARCH ENGINE
    filterServices: () => {
        const query = document.getElementById('serviceSearch').value.toLowerCase();
        const results = document.getElementById('searchResults');
        results.innerHTML = "";
        
        if (query.length < 1) { 
            results.style.display = "none"; 
            return; 
        }
        
        const matches = serviceDB.filter(s => s.toLowerCase().includes(query));
        
        if (matches.length > 0) {
            matches.forEach(m => {
                const div = document.createElement('div');
                div.className = "search-item";
                div.innerHTML = `<i class="fas fa-plus-circle" style="color:var(--gold, #FFD700); margin-right: 10px;"></i> ${m}`;
                div.onclick = () => MissionOS.addTag(m);
                results.appendChild(div);
            });
        } else {
            // Manual entry option if nothing found
            const div = document.createElement('div');
            div.className = "search-item";
            div.innerHTML = `<i class="fas fa-keyboard" style="color:var(--gold, #FFD700); margin-right: 10px;"></i> "${query}" manuell hinzufügen`;
            div.onclick = () => MissionOS.addTag(query);
            results.appendChild(div);
        }
        results.style.display = "block";
    },

    // 4. COMPONENT MANAGEMENT
    addTag: (val) => {
        const container = document.getElementById('selectedTags');
        
        // Duplicate check
        if ([...container.children].some(chip => chip.innerText.trim().includes(val))) {
            document.getElementById('serviceSearch').value = "";
            document.getElementById('searchResults').style.display = "none";
            return;
        }

        const chip = document.createElement('div');
        chip.className = "tech-tag";
        chip.innerHTML = `${val} <i class="fas fa-times" style="margin-left:10px; cursor:pointer;" onclick="this.parentElement.remove(); MissionOS.updateCount();"></i>`;
        container.appendChild(chip);
        
        MissionOS.updateCount();
        document.getElementById('serviceSearch').value = "";
        document.getElementById('searchResults').style.display = "none";
    },

    updateCount: () => {
        const count = document.getElementById('selectedTags').children.length;
        const countDisplay = document.getElementById('serviceCount');
        if(countDisplay) {
            countDisplay.innerText = count < 10 ? '0' + count : count;
        }
    }
};

// GLOBAL EVENT LISTENERS
document.addEventListener('click', (e) => {
    // Close search dropdown when clicking outside
    if (!e.target.closest('.search-terminal')) {
        const res = document.getElementById('searchResults');
        if(res) res.style.display = "none";
    }
});

document.addEventListener('keydown', (e) => {
    // Close on Escape key
    if (e.key === "Escape") MissionOS.close();
});

/* =========================================
   LIVE DISPATCH TERMINAL FEED (HERO SECTION)
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
    const feedContainer = document.getElementById("live-dispatch-feed");
    
    // The messages that will cycle in the terminal to create FOMO and establish authority
    const dispatchMessages = [
        { time: "> SYS:", msg: "Aviation Tooling geladen.", highlight: false },
        { time: "> LOG:", msg: 'Festool Absaugung: <span class="green">AKTIV</span>', highlight: false },
        { time: "> CAP:", msg: "Team 1 (2 Pax) einsatzbereit.", highlight: true },
        { time: "> DIS:", msg: "Prüfe aktuelle Kapazitäten...", highlight: false },
        { time: "> WARN:", msg: "Hohes Montage-Aufkommen in München.", highlight: true },
        { time: "> INFO:", msg: "Laser-Nivellierung kalibriert.", highlight: false },
        { time: "> SEC:", msg: "Betriebshaftpflicht: GÜLTIG", highlight: false }
    ];

    let currentIndex = 0;

    if (feedContainer) {
        setInterval(() => {
            // Remove the oldest message
            if (feedContainer.children.length >= 3) {
                feedContainer.removeChild(feedContainer.firstElementChild);
            }

            // Get the new message
            const newMsg = dispatchMessages[currentIndex];
            
            // Create the new element
            const line = document.createElement("div");
            line.className = `stream-line ${newMsg.highlight ? 'highlight' : ''}`;
            line.style.opacity = "0"; // Start hidden for animation
            line.innerHTML = `<span class="time">${newMsg.time}</span><span class="msg">${newMsg.msg}</span>`;
            
            feedContainer.appendChild(line);

            // Fade in effect
            setTimeout(() => { line.style.opacity = "1"; line.style.transition = "opacity 0.5s"; }, 50);

            // Loop back to start if at the end of the array
            currentIndex = (currentIndex + 1) % dispatchMessages.length;
            
        }, 3500); // Changes every 3.5 seconds
    }
});