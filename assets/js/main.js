/* assets/js/main.js */
/* ====================================================================
   RAPHAEL LEZIUS | ENGINEERING LEVEL JS CORE (v2025.1 - CONSOLIDATED & DEBUGGED)
   ==================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 800, offset: 100, once: true });

    initMobileMenu();
    initModals();
    initStickyHeader();
    initNumberCounters();
    init3DTiltEffect();
    initFormHandlers();
    initSawdust();
});

/* FUNCTIONS */

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            hamburger.innerHTML = mobileMenu.classList.contains('active') ?
                '<i class="fas fa-times" style="font-size:1.5rem; color:white;"></i>' :
                '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
}

function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) hamburger.click();
}

function initModals() {
    document.querySelectorAll('.modal-overlay, .drawer-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}

function toggleAuth() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.toggle('active');
        document.body.style.overflow = modal.classList.contains('active') ? 'hidden' : '';
    }
}

function toggleQuote() {
    const drawer = document.getElementById('quoteDrawer');
    if (drawer) {
        drawer.classList.toggle('active');
        document.body.style.overflow = drawer.classList.contains('active') ? 'hidden' : '';
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('loginForm').classList.toggle('active', tabName === 'login');
    document.getElementById('registerForm').classList.toggle('active', tabName === 'register');
}

function initStickyHeader() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
                navbar.style.height = '70px';
            } else {
                navbar.classList.remove('scrolled');
                navbar.style.height = '90px';
            }
        });
    }
}

function initNumberCounters() {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.getAttribute('data-counted')) {
                const target = parseFloat(entry.target.getAttribute('data-target'));
                let count = 0;
                const increment = target / 50;
                const update = () => {
                    count += increment;
                    if (count < target) {
                        entry.target.innerText = Math.ceil(count);
                        requestAnimationFrame(update);
                    } else {
                        entry.target.innerText = target % 1 !== 0 ? target.toFixed(1) : target;
                        entry.target.setAttribute('data-counted', 'true');
                    }
                };
                update();
            }
        });
    });
    counters.forEach(counter => observer.observe(counter));
}

function init3DTiltEffect() {
    const card = document.querySelector('.id-card');
    const wrapper = document.querySelector('.profile-card-wrapper');
    if (wrapper && card) {
        wrapper.addEventListener('mousemove', e => {
            const rect = wrapper.getBoundingClientRect();
            const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -10;
            const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        wrapper.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    }
}

function initFormHandlers() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            const originalText = submitBtn.innerText;
            submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Senden...';
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Gesendet';
                setTimeout(() => {
                    form.reset();
                    submitBtn.innerText = originalText;
                    if (form.closest('.drawer-overlay')) toggleQuote();
                    if (form.closest('.modal-overlay')) toggleAuth();
                }, 2000);
            }, 1500);
        });
    });
}

function updateEstimate() {
    const projectType = document.getElementById('projectType');
    const hourSlider = document.getElementById('hourSlider');
    const hourValue = document.getElementById('hourValue');
    const totalEstimate = document.getElementById('totalEstimate');
    if (projectType && hourSlider && hourValue && totalEstimate) {
        const base = parseInt(projectType.value) || 0;
        const hours = parseInt(hourSlider.value);
        hourValue.innerText = hours;
        totalEstimate.innerText = base + (hours * 65);
    }
}

function initSawdust() {
    const canvas = document.getElementById('dust-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speed = Math.random() * 0.5 + 0.2;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.drift = (Math.random() - 0.5) * 0.2;
        }
        update() {
            this.y -= this.speed;
            this.x += this.drift;
            if (this.y < -10) {
                this.y = canvas.height + 10;
                this.x = Math.random() * canvas.width;
            }
        }
        draw() {
            ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    for (let i = 0; i < 60; i++) particles.push(new Particle());
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < 60; i++) particles.push(new Particle());
    });
}