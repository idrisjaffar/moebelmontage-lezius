/**
 * assets/js/loader.js
 * Raphael Lezius – Premium Loader v3.0
 * Combines component loading, UI binding, and all interactive features.
 */

(function () {
  'use strict';

  // ============================================================
  // 1. CONFIGURATION
  // ============================================================
  const CONFIG = {
    navPath: 'components/nav.html',
    footerPath: 'components/footer.html',
    cacheKeyPrefix: 'rl-',
    themeStorageKey: 'rl-theme',
    navHeight: 72,        // matches --rl-nav-height
    scrollThreshold: 400,
    revealThreshold: 0.12,
    magneticDistance: 120,
    counterDuration: 1800,
  };

  // ============================================================
  // 2. FALLBACKS (minimal – only used if fetch fails)
  // ============================================================
  const NAV_FALLBACK = `
    <nav class="rl-nav" id="mainNav" role="navigation" aria-label="Hauptnavigation">
      <div class="rl-nav__inner">
        <a href="index.html" class="rl-nav__brand">Raphael <span>Lezius</span></a>
        <ul class="rl-nav__links">
          <li><a href="services.html" class="nav-link">Services</a></li>
          <li><a href="bundles/" class="nav-link">Bundles</a></li>
          <li><a href="about.html" class="nav-link">Über mich</a></li>
          <li><a href="contact.html" class="nav-link">Kontakt</a></li>
        </ul>
        <div class="rl-nav__actions">
          <a href="anfrage/" class="nav-cta magnetic-btn"><i class="fas fa-comment-dots"></i> <span>Kostenlos</span></a>
          <button class="theme-toggle" data-theme-toggle aria-label="Design umschalten"><i class="fas fa-moon" data-theme-icon></i></button>
          <button class="rl-nav__hamburger" id="navToggle" aria-label="Menü öffnen"><span></span><span></span><span></span></button>
        </div>
      </div>
    </nav>
    <div class="rl-nav__mobile" id="mobileMenu" aria-hidden="true">
      <div class="mobile-menu-inner">
        <button class="mobile-close" id="mobileClose" aria-label="Menü schließen"><i class="fas fa-times"></i></button>
        <a href="index.html" class="mobile-link">Start</a>
        <a href="services.html" class="mobile-link">Services</a>
        <a href="bundles/" class="mobile-link">Bundles</a>
        <a href="about.html" class="mobile-link">Über mich</a>
        <a href="contact.html" class="mobile-link">Kontakt</a>
        <a href="faq.html" class="mobile-link">FAQ</a>
        <a href="anfrage/" class="mobile-cta magnetic-btn"><i class="fas fa-comment-dots"></i> Kostenloses Gespräch</a>
        <div class="mobile-extra">
          <button class="theme-toggle" data-theme-toggle><i class="fas fa-moon" data-theme-icon></i></button>
        </div>
      </div>
    </div>
    <div class="nav-backdrop" id="navBackdrop"></div>
  `;

  const FOOTER_FALLBACK = `
    <footer class="rl-footer" role="contentinfo">
      <div class="container">
        <p style="text-align:center;padding:40px 0;color:var(--rl-muted);">© 2026 Raphael Lezius</p>
      </div>
    </footer>
  `;

  // ============================================================
  // 3. HELPERS
  // ============================================================
  function getBase() {
    const baseEl = document.querySelector('base');
    if (baseEl && baseEl.href) return baseEl.getAttribute('href');
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length && parts[parts.length - 1].includes('.')) parts.pop();
    return parts.length === 0 ? './' : '../'.repeat(parts.length);
  }

  function isMobile() {
    return window.innerWidth <= 900;
  }

  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // Debounce utility
  function debounce(fn, ms = 200) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // ============================================================
  // 4. COMPONENT LOADER
  // ============================================================
  async function loadComponent(selector, path, fallback) {
    const el = document.querySelector(selector);
    if (!el) return;

    const url = getBase() + path;
    const cacheKey = CONFIG.cacheKeyPrefix + path;

    // 1. Try cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      el.innerHTML = cached;
      // Already rendered; still fetch in background for freshness
    }

    // 2. Fetch live
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      if (html.trim()) {
        el.innerHTML = html;
        localStorage.setItem(cacheKey, html);
        return; // success
      }
    } catch (e) {
      console.warn(`Could not load ${path} – using fallback`, e);
    }

    // 3. Fallback (only if element is still empty)
    if (!el.innerHTML.trim()) {
      el.innerHTML = fallback || `<p style="color:red;text-align:center;padding:20px;">${path} not available</p>`;
    }
  }

  // ============================================================
  // 5. UI BINDING (all interactions)
  // ============================================================
  function bindUI() {
    // ── 5.1 THEME TOGGLE ──
    const html = document.documentElement;
    const themeMeta = document.getElementById('themeColorMeta');

    function setTheme(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem(CONFIG.themeStorageKey, theme);
      document.querySelectorAll('[data-theme-icon]').forEach(icon => {
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
      });
      if (themeMeta) {
        themeMeta.content = theme === 'dark' ? '#0B0A09' : '#F9F7F2';
      }
    }

    // Load saved or system preference
    function getPreferredTheme() {
      const stored = localStorage.getItem(CONFIG.themeStorageKey);
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setTheme(getPreferredTheme());

    // Delegate theme toggle clicks (works for dynamic buttons)
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-theme-toggle]');
      if (btn) {
        const current = html.getAttribute('data-theme') || 'dark';
        setTheme(current === 'dark' ? 'light' : 'dark');
      }
    });

    // ── 5.2 MOBILE MENU ──
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('navBackdrop');
    const closeBtn = document.getElementById('mobileClose');

    function openMenu() {
      menu?.classList.add('open');
      backdrop?.classList.add('active');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      menu?.classList.remove('open');
      backdrop?.classList.remove('active');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    if (toggle && menu) {
      toggle.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
      backdrop?.addEventListener('click', closeMenu);
      closeBtn?.addEventListener('click', closeMenu);
      menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    }

    // ── 5.3 SCROLL PROGRESS ──
    const progress = document.getElementById('scrollProgress');
    if (progress) {
      const updateProgress = debounce(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progress.style.width = percent + '%';
      }, 10);
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress(); // initial
    }

    // ── 5.4 STICKY CTA & BACK TO TOP ──
    const stickyCta = document.getElementById('stickyCta');
    const backTop = document.getElementById('backToTop');

    function toggleStickyElements() {
      const show = window.scrollY > CONFIG.scrollThreshold;
      if (stickyCta) stickyCta.classList.toggle('visible', show);
      if (backTop) backTop.classList.toggle('visible', show);
    }
    window.addEventListener('scroll', toggleStickyElements, { passive: true });
    toggleStickyElements();

    backTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ── 5.5 CUSTOM CURSOR (desktop only, not touch) ──
    if (!isTouchDevice() && window.matchMedia('(pointer: fine)').matches) {
      const dot = document.getElementById('cursorDot');
      const ring = document.getElementById('cursorRing');
      if (dot && ring) {
        let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
        document.addEventListener('mousemove', (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          dot.style.left = mouseX + 'px';
          dot.style.top = mouseY + 'px';
        });
        function animateRing() {
          ringX += (mouseX - ringX) * 0.18;
          ringY += (mouseY - ringY) * 0.18;
          ring.style.left = ringX + 'px';
          ring.style.top = ringY + 'px';
          requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover state for interactive elements
        document.addEventListener('mouseover', (e) => {
          const target = e.target.closest('a, button, .btn, .magnetic-btn, .kk-item, .service-card, .bundle-card, .review-card, .faq-item');
          if (target) {
            dot.classList.add('hovering');
            ring.classList.add('hovering');
          }
        });
        document.addEventListener('mouseout', (e) => {
          const target = e.target.closest('a, button, .btn, .magnetic-btn, .kk-item, .service-card, .bundle-card, .review-card, .faq-item');
          if (target) {
            dot.classList.remove('hovering');
            ring.classList.remove('hovering');
          }
        });
      }
    }

    // ── 5.6 MAGNETIC BUTTONS (desktop only) ──
    if (!isTouchDevice() && window.matchMedia('(pointer: fine)').matches) {
      document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.magnetic-btn').forEach((btn) => {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.magneticDistance) {
            const strength = (CONFIG.magneticDistance - dist) / CONFIG.magneticDistance * 4;
            btn.style.transform = `translate(${dx * strength / 6}px, ${dy * strength / 6}px)`;
          } else {
            btn.style.transform = 'translate(0, 0)';
          }
        });
      });
    }

    // ── 5.7 LIVE COUNTERS (animate on scroll) ──
    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target) || target <= 0) return;
      const duration = CONFIG.counterDuration;
      const startTime = performance.now();
      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current.toLocaleString('de-DE') + (target >= 100 ? '+' : '');
        if (progress < 1) requestAnimationFrame(updateCounter);
        else el.textContent = target.toLocaleString('de-DE') + (target >= 100 ? '+' : '');
      }
      requestAnimationFrame(updateCounter);
    }

    // ── 5.8 REVEAL ON SCROLL (Intersection Observer) ──
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Trigger counters inside
          entry.target.querySelectorAll('.live-counter').forEach((counter) => {
            if (!counter.classList.contains('counted')) {
              counter.classList.add('counted');
              animateCounter(counter);
            }
          });
          // Optionally unobserve after reveal (performance)
          // revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.revealThreshold,
      rootMargin: '0px 0px -40px 0px'
    });
    revealElements.forEach(el => revealObserver.observe(el));

    // Also trigger counters that are already visible on load
    setTimeout(() => {
      document.querySelectorAll('.reveal.visible .live-counter, .live-counter.visible').forEach((counter) => {
        if (!counter.classList.contains('counted')) {
          counter.classList.add('counted');
          animateCounter(counter);
        }
      });
    }, 300);

    // ── 5.9 SMOOTH SCROLL FOR ANCHOR LINKS ──
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - CONFIG.navHeight - 16;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    // ── 5.10 HERO SEARCH ──
    const searchInput = document.getElementById('heroSearch');
    const searchBtn = document.getElementById('heroSearchBtn');

    function performSearch() {
      const query = searchInput ? searchInput.value.trim() : '';
      if (query) {
        window.location.href = (getBase() || './') + 'services.html?q=' + encodeURIComponent(query);
      } else if (searchInput) {
        searchInput.focus();
      }
    }
    searchBtn?.addEventListener('click', performSearch);
    searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });

    // ── 5.11 FAQ ACCORDION ──
    document.querySelectorAll('.faq-item').forEach((item) => {
      const question = item.querySelector('.faq-question, .question');
      if (question) {
        question.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          // Close others (optional: single open)
          document.querySelectorAll('.faq-item').forEach((other) => {
            if (other !== item) other.classList.remove('open');
          });
          if (!isOpen) item.classList.add('open');
          else item.classList.remove('open');
        });
      }
    });

    // ── 5.12 NEWSLETTER FORM ──
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = newsletterForm.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Willkommen!';
        btn.style.background = 'var(--rl-gradient-cta-hover, #E4B98A)';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          newsletterForm.reset();
        }, 2500);
      });
    }

    // ── 5.13 FILTER BUTTONS (services page) ──
    const filterBtns = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-detailed-card, .service-card, .kk-item');
    const noResults = document.getElementById('noResults');

    if (filterBtns.length) {
      filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.getAttribute('data-filter') || 'all';
          let visible = 0;
          serviceCards.forEach((card) => {
            const category = card.getAttribute('data-category') || '';
            if (filter === 'all' || category === filter) {
              card.style.display = '';
              visible++;
            } else {
              card.style.display = 'none';
            }
          });
          if (noResults) {
            noResults.style.display = visible === 0 ? 'block' : 'none';
          }
        });
      });
    }

    // ── 5.14 LIVE VISITOR COUNTER (simulated) ──
    const visitorEl = document.getElementById('visitorCount');
    if (visitorEl) {
      let count = Math.floor(Math.random() * 10) + 8;
      function updateVisitor() {
        const delta = Math.floor(Math.random() * 3) - 1; // -1,0,1
        count = Math.max(2, count + delta);
        visitorEl.textContent = count;
        visitorEl.style.transition = 'transform 0.15s ease';
        visitorEl.style.transform = 'scale(1.3)';
        setTimeout(() => { visitorEl.style.transform = 'scale(1)'; }, 150);
      }
      setInterval(updateVisitor, Math.floor(Math.random() * 6000) + 4000);
      visitorEl.textContent = count; // initial
    }

    // ── 5.15 LANGUAGE SWITCHER (footer) ──
    document.querySelectorAll('.rl-footer__lang .lang-btn, .lang-switch .lang-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const lang = this.getAttribute('data-lang');
        if (!lang) return;
        // Update active state
        const parent = this.closest('.rl-footer__lang, .lang-switch');
        if (parent) {
          parent.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
        }
        // Toggle visibility of elements with data-lang
        document.querySelectorAll('[data-lang]').forEach((el) => {
          const show = (el.getAttribute('data-lang') === lang);
          el.style.display = show ? '' : 'none';
        });
        // Also handle nested by re‑checking all (simple)
      });
    });
    // Initialize language to DE (default)
    const defaultLang = document.querySelector('.rl-footer__lang .lang-btn.active, .lang-switch .lang-btn.active');
    if (defaultLang) {
      const lang = defaultLang.getAttribute('data-lang') || 'de';
      document.querySelectorAll('[data-lang]').forEach((el) => {
        el.style.display = (el.getAttribute('data-lang') === lang) ? '' : 'none';
      });
    }

    // ── 5.16 RESPONSIVE BREAKPOINT: hide custom cursor on mobile ──
    if (isTouchDevice() || isMobile()) {
      document.querySelectorAll('.cursor-dot, .cursor-ring').forEach(el => el.style.display = 'none');
    }

    console.log('✅ UI binding complete');
  }

  // ============================================================
  // 6. INITIALISATION
  // ============================================================
  async function init() {
    // Load components
    await Promise.all([
      loadComponent('#nav-placeholder', CONFIG.navPath, NAV_FALLBACK),
      loadComponent('#footer-placeholder', CONFIG.footerPath, FOOTER_FALLBACK)
    ]);

    // Small delay to ensure DOM is stable
    setTimeout(() => {
      bindUI();
      // Dispatch event for any external scripts that need to know components are ready
      document.dispatchEvent(new CustomEvent('componentsLoaded'));
    }, 60);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();