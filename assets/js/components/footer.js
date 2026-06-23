/* ==========================================================================
   RAPHAEL LEZIUS | MISSION CONTROL FOOTER ENGINE (v2077.2)
   ARCHITECTURE: ES6 MODULE | INTERSECTION OBSERVER | MAGNETIC PHYSICS
   ========================================================================== */

class FooterEngine {
    constructor() {
        // DOM Elements
        this.footer = document.getElementById('masterFooter');
        this.clockEl = document.getElementById('footerLocalTime');
        this.yearEl = document.getElementById('currentYear');
        this.latencyEl = document.querySelector('.meta-item.text-green'); // Zielt auf "LATENCY: 12ms"
        this.magneticTargets = document.querySelectorAll('.mega-footer-2077 .magnetic-target');

        // Performance State
        this.telemetryInterval = null;
        this.latencyInterval = null;

        // Init System
        this.init();
    }

    init() {
        if (!this.footer) return; // Failsafe, falls Footer nicht existiert

        this.updateYear();
        this.initMagneticPhysics();
        this.initVisibilityObserver();

        console.log('[SYS_FOOTER] Footer Engine online.');
    }

    /* --- 1. SMART VISIBILITY OBSERVER (BATTERY & CPU SAVER) --- */
    // Diese Funktion stellt sicher, dass ressourcenintensive Skripte nur laufen,
    // wenn der Nutzer den Footer auch wirklich sieht.
    initVisibilityObserver() {
        const options = {
            root: null,
            rootMargin: '50px', // Startet kurz bevor der Footer ins Bild kommt
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startTelemetry();
                    this.footer.classList.add('is-visible'); // Kann für CSS Fade-Ins genutzt werden
                } else {
                    this.stopTelemetry();
                    this.footer.classList.remove('is-visible');
                }
            });
        }, options);

        observer.observe(this.footer);
    }

    /* --- 2. LIVE TELEMETRY & SYSTEM SYNC --- */
    startTelemetry() {
        // 1. Uhrzeit Synchronisation
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            if (this.clockEl) this.clockEl.innerText = `${timeString} CET`;
        };
        
        updateClock(); // Sofortiger Aufruf
        this.telemetryInterval = setInterval(updateClock, 1000);

        // 2. Umgebungs-Latenz Simulation (Tech Ästhetik)
        if (this.latencyEl) {
            this.latencyInterval = setInterval(() => {
                // Generiert einen zufälligen Ping zwischen 8ms und 18ms
                const ping = Math.floor(Math.random() * (18 - 8 + 1) + 8); 
                this.latencyEl.innerText = `LATENCY: ${ping}ms`;
            }, 2500); // Updated alle 2.5 Sekunden
        }
    }

    stopTelemetry() {
        // Stoppt die Intervalle, wenn der Footer nicht sichtbar ist
        if (this.telemetryInterval) clearInterval(this.telemetryInterval);
        if (this.latencyInterval) clearInterval(this.latencyInterval);
    }

    updateYear() {
        // Hält das Copyright immer auf dem aktuellsten Stand
        if (this.yearEl) {
            this.yearEl.innerText = new Date().getFullYear();
        }
    }

    /* --- 3. QUANTUM MAGNETIC UI PHYSICS --- */
    initMagneticPhysics() {
        // Deaktiviert den Effekt auf Touchscreens (Smartphones/Tablets), um Konflikte zu vermeiden
        if (window.matchMedia("(pointer: coarse)").matches) return; 

        this.magneticTargets.forEach(target => {
            target.addEventListener('mousemove', (e) => {
                const rect = target.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Reibungsfaktor 0.15 für ein "schweres", luxuriöses Schwebegefühl
                target.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            // Sanftes Zurückschnappen, wenn die Maus das Element verlässt
            target.addEventListener('mouseleave', () => {
                target.style.transform = 'translate(0px, 0px)';
                setTimeout(() => {
                    target.style.transform = '';
                }, 400); // Entspricht der CSS Transition-Dauer
            });
        });
    }
}

// Exportiert das Modul für den Master-Controller
export default FooterEngine;