/* ==========================================================================
   RAPHAEL LEZIUS | 2026 MASTER SYSTEM ENGINE (main.js)
   ARCHITECTURE: ASYNC BOOT SEQUENCE | EVENT DELEGATION | CANVAS PHYSICS
   ========================================================================== */
/* ==========================================================================
   RAPHAEL LEZIUS // 2026 SYSTEM LOADER
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    
    // Auto-detect if we are in the root or a sub-folder
    // If we are in root, fetch directly. If we are in a sub-folder, add '../'
    const isRoot = window.location.pathname.split('/').filter(Boolean).length <= 1;
    const pathPrefix = isRoot ? '' : '../';

    async function loadComponent(elementId, filePath) {
        try {
            const container = document.getElementById(elementId);
            if (!container) return; 

            // Construct the path dynamically
            const fullPath = pathPrefix + 'components/' + filePath;
            
            const response = await fetch(fullPath);
            if (!response.ok) throw new Error(`Failed to load ${fullPath}`);
            
            container.innerHTML = await response.text();
        } catch (error) {
            console.error("Injection Error:", error);
        }
    }

    // Run the injection
    await Promise.all([
        loadComponent("global-nav", "nav.html"),
        loadComponent("global-footer", "footer.html"),
        loadComponent("global-os", "mission_os.html")
    ]);

    console.log("SYS_UPLINK ESTABLISHED: Components Injected.");

    // Now initialize your engines
    initializeSystemEngines();
});

// ==========================================================================
// 2. MASTER INITIALIZATION (Fires after components load)
// ==========================================================================
function initializeSystemEngines() {
    
    // --- A. AOS ANIMATIONS ---
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, offset: 50, once: true });
    }

    // --- B. GLITCH TYPOGRAPHY ---
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

    // --- C. MAGNETIC BUTTON PHYSICS ---
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

    // --- D. GOLDEN BUBBLES (CANVAS ENGINE) ---
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

    // --- E. 3D OPS CARD TILT ---
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

    // --- F. MOBILE MENU TOGGLE ---
    const hamburger = document.getElementById('mobileMenuToggle'); // Matches your new ID
    const mobileMenu = document.getElementById('fluidMobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-open');
            hamburger.classList.toggle('is-active');
            document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
        });

        // Close menu when clicking links
        document.querySelectorAll('.m-link-massive').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('is-open');
                hamburger.classList.remove('is-active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- G. INTERACTIVE GALLERY BELT ---
    const gurt = document.getElementById('imageBelt');
    const tasteZurueck = document.getElementById('prevBelt');
    const tasteVor = document.getElementById('nextBelt');

    if (gurt && tasteVor && tasteZurueck) {
        // Smooth scroll implementation instead of animation speed
        const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.85 : 470;
        
        tasteVor.addEventListener('click', () => {
            document.querySelector('.belt-container').scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
        tasteZurueck.addEventListener('click', () => {
            document.querySelector('.belt-container').scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }

    // --- H. CINEMATIC LIGHTBOX ---
    const triggers = document.querySelectorAll('.js-lightbox-trigger');
    const lightbox = document.getElementById('cinematicLightbox');
    const closeBtn = document.getElementById('closeCinematicLightbox');
    const videoPlayer = document.getElementById('lightboxVideoPlayer');
    const titleElement = document.getElementById('lightboxTitle');
    const descElement = document.getElementById('lightboxDesc');

    if (lightbox && videoPlayer) {
        triggers.forEach(card => {
            card.addEventListener('click', function() {
                videoPlayer.src = this.getAttribute('data-video-src');
                titleElement.textContent = this.getAttribute('data-title');
                descElement.textContent = this.getAttribute('data-desc');
                
                lightbox.classList.add('is-active');
                document.body.style.overflow = 'hidden';
                videoPlayer.play().catch(e => console.log("Autoplay blocked:", e));
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('is-active');
            document.body.style.overflow = '';
            videoPlayer.pause();
            setTimeout(() => { videoPlayer.src = ""; }, 500);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // --- I. LIVE DISPATCH FEED ---
    const feedContainer = document.getElementById("live-dispatch-feed");
    const dispatchMessages = [
        { time: "> SYS:", msg: "Aviation Tooling geladen.", highlight: false },
        { time: "> LOG:", msg: 'Festool Absaugung: <span style="color:var(--neon-gold)">AKTIV</span>', highlight: false },
        { time: "> CAP:", msg: "Einsatzbereit in Augsburg.", highlight: true },
        { time: "> DIS:", msg: "Laser-Nivellierung kalibriert.", highlight: false },
        { time: "> SEC:", msg: "Betriebshaftpflicht: GÜLTIG", highlight: false }
    ];

    let currentIndex = 0;
    if (feedContainer) {
        setInterval(() => {
            if (feedContainer.children.length >= 3) {
                feedContainer.removeChild(feedContainer.firstElementChild);
            }
            const newMsg = dispatchMessages[currentIndex];
            const line = document.createElement("div");
            line.className = `stream-line ${newMsg.highlight ? 'highlight' : ''}`;
            line.style.opacity = "0"; 
            line.innerHTML = `<span class="time" style="color:var(--neon-cyan)">${newMsg.time}</span> <span class="msg">${newMsg.msg}</span>`;
            
            feedContainer.appendChild(line);
            setTimeout(() => { line.style.opacity = "1"; line.style.transition = "opacity 0.5s"; }, 50);
            currentIndex = (currentIndex + 1) % dispatchMessages.length;
        }, 3500);
    }
}


// ==========================================================================
// 3. GLOBAL FUNCTIONS (Available anywhere, anytime)
// ==========================================================================

// Global Accordion Logic (Using Event Delegation so it works on dynamic HTML)
document.addEventListener('click', function(e) {
    // Handling Accordions (Services & FAQ)
    const accordionHeader = e.target.closest('.accordion-header') || e.target.closest('.faq-trigger');
    if (accordionHeader) {
        const item = accordionHeader.parentElement;
        const isOpen = item.classList.contains('active') || item.classList.contains('open');
        
        // Close others in the same container
        const container = item.parentElement;
        container.querySelectorAll('.accordion-item, .faq-module').forEach(mod => {
            mod.classList.remove('active', 'open');
            mod.querySelector('.accordion-content, .faq-content').style.maxHeight = null;
        });

        // Open clicked
        if (!isOpen) {
            item.classList.add('active', 'open');
            const content = item.querySelector('.accordion-content, .faq-content');
            content.style.maxHeight = content.scrollHeight + "px";
            setTimeout(() => {
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }

    // Handle OS Opening via Buttons
    if (e.target.closest('.js-open-os')) {
        e.preventDefault();
        window.MissionOS.open();
    }
    // Handle OS Closing via Backdrop/Buttons
    if (e.target.closest('.js-close-os')) {
        window.MissionOS.close();
    }
});

// ==========================================================================
// 4. MISSION_OS v2.6 LOGIC ENGINE
// ==========================================================================
window.MissionOS = {
    currentStep: 1,
    totalSteps: 4,

    open: () => {
        const modal = document.getElementById('missionOS');
        if (modal) {
            modal.classList.add('system-active');
            document.body.style.overflow = 'hidden';
            window.MissionOS.goToStep(1); // Reset to start
        }
    },

    close: () => {
        const modal = document.getElementById('missionOS');
        if (modal) {
            modal.classList.remove('system-active');
            document.body.style.overflow = 'auto';
        }
    },

    // Handles the "Next" and "Back" form logic
    goToStep: (stepNumber) => {
        if(stepNumber < 1 || stepNumber > window.MissionOS.totalSteps) return;
        window.MissionOS.currentStep = stepNumber;

        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('is-active');
            step.style.display = 'none';
        });

        // Show active step
        const targetStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if(targetStep) {
            targetStep.style.display = 'block';
            setTimeout(() => targetStep.classList.add('is-active'), 50);
        }

        // Update Progress Bar
        const progressFill = document.getElementById('osProgress');
        if(progressFill) {
            progressFill.style.width = `${(stepNumber / window.MissionOS.totalSteps) * 100}%`;
        }

        // Update Step Indicators
        document.querySelectorAll('.step-text').forEach((indicator, index) => {
            if(index + 1 === stepNumber) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    },

    initFormEvents: () => {
        // We attach these via delegation so it works after injection
        document.addEventListener('click', (e) => {
            if(e.target.closest('.btn-next')) {
                window.MissionOS.goToStep(window.MissionOS.currentStep + 1);
            }
            if(e.target.closest('.btn-prev')) {
                window.MissionOS.goToStep(window.MissionOS.currentStep - 1);
            }
        });
    }
};

// Initialize OS Events
window.MissionOS.initFormEvents();

// Add this after initializeSystemEngines();
    document.body.classList.add('loaded');