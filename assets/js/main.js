/* ==========================================================================
   RAPHAEL LEZIUS | 2077 HUD MASTER ENGINE (mission-control.js)
   ARCHITECTURE: KINETIC 3D, HAPTIC-SENSITIVE, HARDWARE-AWARE
   SYS_DEV: IDRIS | VERSION: 4.0.0_UNIFIED
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. STATE & PERFORMANCE ---
    const state = {
        lowPerformance: false,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        isDesktop: window.matchMedia("(pointer: fine)").matches
    };

    // Battery Awareness
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const updateEcoMode = () => {
                state.lowPerformance = battery.level < 0.2 && !battery.charging;
                document.body.classList.toggle('eco-mode', state.lowPerformance);
            };
            battery.addEventListener('levelchange', updateEcoMode);
            updateEcoMode();
        });
    }

    // --- 1. UTILITIES ---
    window.vibrateDevice = (pattern) => {
        if (!state.lowPerformance && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    };

    // --- 2. PORTFOLIO DATA ---
    const portfolio = [
        // KÜCHEN
        { id: 'k1', cat: 'kueche', title: 'Küchen-Sonderbau', files: ['kueche-1-a.webp'] },
        { id: 'k2', cat: 'kueche', title: 'Küchenzeile L-Form', files: ['kueche-2-a.webp', 'kueche-2-b.webp'] },
        { id: 'k3', cat: 'kueche', title: 'Premium Einbauküche', files: ['kueche-3-a.webp', 'kueche-3-b.webp'] },
        { id: 'k4', cat: 'kueche', title: 'Arbeitsplatten-Finish', files: ['kueche-4-a.webp', 'kueche-4-b.webp'] },
        { id: 'k5', cat: 'kueche', title: 'Design-Küchenmontage', files: ['kueche-5-a.webp', 'kueche-5-b.webp'] },
        { id: 'k6', cat: 'kueche', title: 'IKEA METOD Spezial', files: ['kueche-6-a.webp', 'kueche-6-b.webp'] },
        { id: 'k7', cat: 'kueche', title: 'Küchen-Installation', files: ['kueche-7-a.webp', 'kueche-7-b.webp'] },
        { id: 'k8', cat: 'kueche', title: 'Maßküchen Aufbau', files: ['kueche-8-a.webp', 'kueche-8-c.webp'] },
        { id: 'k9', cat: 'kueche', title: 'Geräte-Integration', files: ['kueche-9-a.webp'] },
        { id: 'k10', cat: 'kueche', title: 'Moderne Küchenzeile', files: ['kueche-10-a.webp'] },
        { id: 'k11', cat: 'kueche', title: 'Winkelküche Montage', files: ['kueche-11-a.webp', 'kueche-11-b.webp'] },
        { id: 'k12', cat: 'kueche', title: 'Küchen-Setup München', files: ['kueche-12-a.webp'] },
        { id: 'k13', cat: 'kueche', title: 'Insel-Küche Design', files: ['kueche-13-a.webp', 'kueche-13-b.webp'] },
        { id: 'k14', cat: 'kueche', title: 'Premium Installation', files: ['kueche-14-a.webp'] },
        { id: 'k15', cat: 'kueche', title: 'Küchen-Meisterwerk', files: ['kueche-15-a.webp'] },
        { id: 'k16', cat: 'kueche', title: 'IKEA METOD Montage', files: ['kueche-16-a.webp', 'kueche-16-b.webp'] },
        { id: 'k17', cat: 'kueche', title: 'High-End Küchenbau', files: ['kueche-17-a.webp', 'kueche-17-b.webp'] },
        { id: 'k18', cat: 'kueche', title: 'Küchen-Montage Profi', files: ['kueche-18-a.webp'] },
        { id: 'k19', cat: 'kueche', title: 'Finales Küchen-Setup', files: ['kueche-19-a.webp'] },
        // WOHNEN
        { id: 'w1', cat: 'wohnen', title: 'TV-Board Schwebend', files: ['wohnen-1-a.webp', 'wohnen-1-b.webp'] },
        { id: 'w2', cat: 'wohnen', title: 'IKEA BESTÅ Kombination', files: ['wohnen-2-a.webp', 'wohnen-2-b.webp'] },
        { id: 'w3', cat: 'wohnen', title: 'Wohnwand Massiv', files: ['wohnen-3-a.webp', 'wohnen-3-b.webp', 'wohnen-3-c.webp'] },
        { id: 'w4', cat: 'wohnen', title: 'Entertainment Center', files: ['wohnen-4-a.webp', 'wohnen-4-b.webp'] },
        { id: 'w5', cat: 'wohnen', title: 'Wohnzimmer Design', files: ['wohnen-5-a.webp'] },
        { id: 'w6', cat: 'wohnen', title: 'Regalsystem Montage', files: ['wohnen-6-b.webp'] },
        { id: 'w7', cat: 'wohnen', title: 'Designer Wohnwand', files: ['wohnen-7-a.webp', 'wohnen-7-b.webp'] },
        { id: 'w8', cat: 'wohnen', title: 'Sideboard Ausrichtung', files: ['wohnen-8-a.webp'] },
        { id: 'w9', cat: 'wohnen', title: 'Wohnkultur Setup', files: ['wohnen-9-a.webp'] },
        { id: 'w10', cat: 'wohnen', title: 'Modernes Media-Board', files: ['wohnen-10-a.webp'] },
        { id: 'w11', cat: 'wohnen', title: 'Bücherwand Montage', files: ['wohnen-11-a.webp'] },
        { id: 'w12', cat: 'wohnen', title: 'Regalsystem Wandbau', files: ['wohnen-12-a.webp'] },
        { id: 'w13', cat: 'wohnen', title: 'Wohn-Ambiente Profi', files: ['wohnen-13-a.webp'] },
        { id: 'w14', cat: 'wohnen', title: 'Sideboard Montage', files: ['wohnen-14-b.webp'] },
        { id: 'w15', cat: 'wohnen', title: 'Exklusive Wohnwand', files: ['wohnen-15-a.webp', 'wohnen-15-b.webp'] },
        { id: 'w16', cat: 'wohnen', title: 'Designer Möbelbau', files: ['wohnen-16-a.webp'] },
        { id: 'w17', cat: 'wohnen', title: 'Wohnzimmer Upgrade', files: ['wohnen-17-a.webp'] },
        { id: 'w18', cat: 'wohnen', title: 'BESTÅ Maßaufbau', files: ['wohnen-18-a.webp', 'wohnen-18-b.webp'] },
        { id: 'w19', cat: 'wohnen', title: 'Media-Setup München', files: ['wohnen-19-a.webp'] },
        { id: 'w20', cat: 'wohnen', title: 'TV-Wandhalterung', files: ['wohnen-20-a.webp'] },
        { id: 'w21', cat: 'wohnen', title: 'Wohnwand Montage', files: ['wohnen-21-a.webp'] },
        { id: 'w22', cat: 'wohnen', title: 'Sideboard Design', files: ['wohnen-22-a.webp'] },
        { id: 'w23', cat: 'wohnen', title: 'Wohnkultur Final', files: ['wohnen-23-a.webp'] },
        // SCHLAFEN
        { id: 's0', cat: 'schlafen', title: 'Premium Bettaufbau', files: ['schlafen-1-a.webp'] },
        { id: 's1', cat: 'schlafen', title: 'IKEA PAX Systemwand', files: ['sz-1-a.webp', 'sz-1-b.webp'] },
        { id: 's2', cat: 'schlafen', title: 'Schrank-Kombination', files: ['sz-2-a.webp', 'sz-2-b.webp'] },
        { id: 's3', cat: 'schlafen', title: 'Master-Bedroom Setup', files: ['sz-3-a.webp', 'sz-3-b.webp'] },
        { id: 's4', cat: 'schlafen', title: 'PAX Eckmontage', files: ['sz-4-a.webp', 'sz-4-b.webp'] },
        { id: 's5', cat: 'schlafen', title: 'Designer Kleiderschrank', files: ['sz-5-a.webp', 'sz-5-b.webp'] },
        { id: 's6', cat: 'schlafen', title: 'Exklusiver Schlafraum', files: ['sz-6-a.webp', 'sz-6-b.webp', 'sz-6-c.webp'] },
        { id: 's7', cat: 'schlafen', title: 'PAX Maßanpassung', files: ['sz-7-a.webp', 'sz-7-b.webp'] }
    ];

    // --- 3. GRID RENDERING ---
    const grid = document.getElementById('main-gallery-grid');
    if (grid) {
        portfolio.forEach((proj, idx) => {
            const item = document.createElement('div');
            item.className = `bento-item ${proj.cat}`;
            item.setAttribute('data-aos', 'fade-up');
            item.setAttribute('data-aos-delay', (idx % 3) * 50);

            let extras = '';
            for(let i=1; i < proj.files.length; i++){
                extras += `<a data-fslightbox="${proj.id}" href="./assets/images/${proj.files[i]}"></a>`;
            }

            item.innerHTML = `
                <a data-fslightbox="${proj.id}" href="./assets/images/${proj.files[0]}" class="bento-link">
                    <img src="./assets/images/${proj.files[0]}" alt="${proj.title}" class="bento-image" loading="lazy">
                    <div class="bento-overlay">
                        <div class="bento-tags">
                            <span class="bento-tag tag-count">${proj.files.length > 1 ? proj.files.length + ' Winkel' : 'Verifiziert'}</span>
                            <span class="bento-tag tag-premium">PRÄZISION</span>
                        </div>
                        <h3 class="bento-title">${proj.title}</h3>
                        <div class="bento-action"><i class="fas fa-crosshairs"></i> INTEL-SCAN ÖFFNEN</div>
                    </div>
                </a>
                ${extras}
            `;
            grid.appendChild(item);

            // 3D Hover
            if (state.isDesktop && !state.reducedMotion) {
                item.addEventListener('mousemove', (e) => {
                    const rect = item.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
                    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
                    item.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.03, 1.03, 1.03)`;
                });
                item.addEventListener('mouseleave', () => {
                    item.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
                });
            }
        });
        
        // Refresh Lightbox
        setTimeout(() => { if (typeof refreshFsLightbox !== 'undefined') refreshFsLightbox(); }, 500);
    }

    // --- 4. NAVIGATION & MENU ---
    const nav = document.querySelector('.cyber-navbar');
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    // Scroll Observer
    window.addEventListener('scroll', () => {
        if (nav) {
            if (window.scrollY > 50) {
                nav.style.background = 'rgba(5, 6, 8, 0.98)';
                nav.style.padding = '10px 0';
            } else {
                nav.style.background = 'rgba(5, 6, 8, 0.9)';
                nav.style.padding = '20px 0';
            }
        }
    });

    // Mobile Hamburger
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const active = mobileMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            document.body.style.overflow = active ? 'hidden' : '';
            window.vibrateDevice(active ? 20 : [10, 10]);
        });
    }

    // --- 5. FILTERING ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.vibrateDevice(15);
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const val = btn.getAttribute('data-filter');
            document.querySelectorAll('.bento-item').forEach(item => {
                if (val === 'all' || item.classList.contains(val)) {
                    item.style.display = 'block';
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => { item.style.display = 'none'; }, 300);
                }
            });
        });
    });

    // --- 6. MISSION_OS ---
    window.MissionOS = {
        open: () => {
            window.vibrateDevice([20, 50]);
            const os = document.getElementById('missionOS');
            if(os) {
                os.classList.add('system-active');
                document.body.style.overflow = 'hidden';
                console.log("MissionOS: System Online.");
            } else {
                alert("SYSTEM_CHECK: Kalkulations-Modul wird geladen.");
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
            window.vibrateDevice(10);
            document.querySelectorAll('.case-phase').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.step-link').forEach(l => l.classList.remove('active'));
            const targetPhase = document.getElementById(`phase${phase}`);
            const targetNav = document.getElementById(`nav${phase}`);
            if(targetPhase) targetPhase.classList.add('active');
            if(targetNav) targetNav.classList.add('active');
        }
    };

    // --- 7. FAQ ACCORDION ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        if (trigger) {
            trigger.addEventListener('click', () => {
                faqItems.forEach(i => { if (i !== item) i.classList.remove('active'); });
                item.classList.toggle('active');
            });
        }
    });

    // --- 8. TERMINAL FEED ---
    const feedContainer = document.getElementById("live-dispatch-feed");
    if (feedContainer) {
        const messages = [
            { t: "SYS:", m: "BOSCH Professional geladen." },
            { t: "LOG:", m: "HEPA-H13 Absaugung bereit." },
            { t: "DIS:", m: "Auftrag Augsburg erfasst." },
            { t: "SEC:", m: "Haftpflicht-Schutz: AKTIV" }
        ];
        let i = 0;
        const inject = () => {
            if (feedContainer.children.length >= 3) feedContainer.removeChild(feedContainer.firstElementChild);
            const line = document.createElement("div");
            line.className = "stream-line";
            line.innerHTML = `<span class="time">${messages[i].t}</span><span class="msg">${messages[i].m}</span>`;
            feedContainer.appendChild(line);
            i = (i + 1) % messages.length;
            setTimeout(inject, 4000);
        };
        inject();
    }

    // --- 9. INIT EXTERNAL LIBS ---
    if (typeof AOS !== 'undefined') {
        AOS.init({ 
            duration: 800, 
            once: true, 
            disable: state.reducedMotion,
            offset: 100,
            easing: 'ease-in-out-cubic'
        });
    }

    const yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.innerText = new Date().getFullYear();
});