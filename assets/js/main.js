/**
 * assets/js/main.js
 * Raphael Lezius – Unified Loader & Interactions v3.2
 * Robust theme handling, component loading, and UI binding.
 */
(function () {
  'use strict';

  // ── Configuration ──
  const CONFIG = {
    navPath: 'components/nav.html',
    footerPath: 'components/footer.html',
    cacheKeyPrefix: 'rl-',
    themeStorageKey: 'rl-theme',
    navHeight: 72,
    scrollThreshold: 400,
    revealThreshold: 0.12,
    magneticDistance: 120,
    counterDuration: 1800,
  };

  // ── Fallbacks (minimal – only used if fetch fails) ──
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

  // ── Helpers ──
  function getBase() {
    const baseEl = document.querySelector('base');
    if (baseEl && baseEl.href) {
      // Return the href value (usually './' or '../' etc.)
      return baseEl.getAttribute('href') || './';
    }
    // Fallback: compute from path
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length && parts[parts.length - 1].includes('.')) parts.pop();
    return parts.length === 0 ? './' : '../'.repeat(parts.length);
  }

  function isMobile() { return window.innerWidth <= 900; }
  function isTouchDevice() { return 'ontouchstart' in window || navigator.maxTouchPoints > 0; }

  function debounce(fn, ms = 200) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // ── Theme Management ──
  function getStoredTheme() {
    const stored = localStorage.getItem(CONFIG.themeStorageKey);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.themeStorageKey, theme);
    // Update all theme icons
    document.querySelectorAll('[data-theme-icon]').forEach(icon => {
      icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });
    // Update theme‑color meta
    const meta = document.getElementById('themeColorMeta');
    if (meta) meta.content = theme === 'dark' ? '#0B0A09' : '#F9F7F2';
  }

  // ── Component Loader ──
  async function loadComponent(selector, path, fallback) {
    const el = document.querySelector(selector);
    if (!el) return;

    const url = getBase() + path;
    const cacheKey = CONFIG.cacheKeyPrefix + path;
    let loadedFromCache = false;

    // 1. Try cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      el.innerHTML = cached;
      loadedFromCache = true;
      // Immediately apply theme to the newly inserted content
      applyTheme(getStoredTheme());
      // Refresh in background
      fetch(url)
        .then(r => r.text())
        .then(html => {
          if (html && html.trim() && html !== cached) {
            el.innerHTML = html;
            localStorage.setItem(cacheKey, html);
            applyTheme(getStoredTheme());
          }
        })
        .catch(() => {});
      return;
    }

    // 2. Live fetch
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      if (html.trim()) {
        el.innerHTML = html;
        localStorage.setItem(cacheKey, html);
        applyTheme(getStoredTheme()); // Apply theme immediately
        return;
      }
    } catch (e) {
      console.warn(`Could not load ${path} – using fallback`, e);
    }

    // 3. Fallback
    if (fallback) {
      el.innerHTML = fallback;
      try { localStorage.setItem(cacheKey, fallback); } catch (_) {}
      applyTheme(getStoredTheme());
    } else {
      el.innerHTML = `<p style="color:red;text-align:center;padding:20px;">${path} not available</p>`;
    }
  }

  // ── UI Binding ──
  function bindUI() {
    // ── THEME TOGGLE (delegated) ──
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-theme-toggle]');
      if (btn) {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        console.log('Theme toggled to:', next);
      }
    });

    // ── MOBILE MENU ──
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
      // Remove any existing listeners to avoid duplicates (in case bindUI is called multiple times)
      toggle.removeEventListener('click', toggle._listener);
      toggle._listener = () => menu.classList.contains('open') ? closeMenu() : openMenu();
      toggle.addEventListener('click', toggle._listener);
      backdrop?.addEventListener('click', closeMenu);
      closeBtn?.addEventListener('click', closeMenu);
      menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    }

    // ── SCROLL PROGRESS ──
    const progress = document.getElementById('scrollProgress');
    if (progress) {
      const updateProgress = debounce(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progress.style.width = percent + '%';
      }, 10);
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    }

    // ── STICKY CTA & BACK TO TOP ──
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

    // ── CUSTOM CURSOR ──
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

    // ── MAGNETIC BUTTONS ──
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

    // ── LIVE COUNTERS ──
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

    // ── REVEAL ON SCROLL ──
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.querySelectorAll('.live-counter').forEach((counter) => {
            if (!counter.classList.contains('counted')) {
              counter.classList.add('counted');
              animateCounter(counter);
            }
          });
        }
      });
    }, {
      threshold: CONFIG.revealThreshold,
      rootMargin: '0px 0px -40px 0px'
    });
    revealElements.forEach(el => revealObserver.observe(el));

    // Counters already visible on load
    setTimeout(() => {
      document.querySelectorAll('.reveal.visible .live-counter, .live-counter.visible').forEach((counter) => {
        if (!counter.classList.contains('counted')) {
          counter.classList.add('counted');
          animateCounter(counter);
        }
      });
    }, 300);

    // ── SMOOTH SCROLL FOR ANCHOR LINKS ──
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

    // ── HERO SEARCH ──
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

    // ── FAQ ACCORDION ──
    document.querySelectorAll('.faq-item').forEach((item) => {
      const question = item.querySelector('.faq-question, .question');
      if (question) {
        // Remove old listener to avoid duplicates
        question.removeEventListener('click', question._handler);
        question._handler = () => {
          const isOpen = item.classList.contains('open');
          document.querySelectorAll('.faq-item').forEach((other) => {
            if (other !== item) other.classList.remove('open');
          });
          if (!isOpen) item.classList.add('open');
          else item.classList.remove('open');
        };
        question.addEventListener('click', question._handler);
      }
    });

    // ── NEWSLETTER FORM ──
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      // Remove old listener
      newsletterForm.removeEventListener('submit', newsletterForm._submitHandler);
      newsletterForm._submitHandler = (e) => {
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
      };
      newsletterForm.addEventListener('submit', newsletterForm._submitHandler);
    }

    // ── FILTER BUTTONS ──
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

    // ── LIVE VISITOR COUNTER ──
    const visitorEl = document.getElementById('visitorCount');
    if (visitorEl) {
      let count = Math.floor(Math.random() * 10) + 8;
      function updateVisitor() {
        const delta = Math.floor(Math.random() * 3) - 1;
        count = Math.max(2, count + delta);
        visitorEl.textContent = count;
        visitorEl.style.transition = 'transform 0.15s ease';
        visitorEl.style.transform = 'scale(1.3)';
        setTimeout(() => { visitorEl.style.transform = 'scale(1)'; }, 150);
      }
      setInterval(updateVisitor, Math.floor(Math.random() * 6000) + 4000);
      visitorEl.textContent = count;
    }

    // ── LANGUAGE SWITCHER ──
    function initLanguageSwitcher() {
      const langBtns = document.querySelectorAll('.rl-footer__lang .lang-btn, .lang-switch .lang-btn');
      if (!langBtns.length) return;

      function updateLanguage(lang) {
        langBtns.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });
        document.querySelectorAll('[data-lang]:not(.lang-btn)').forEach(el => {
          const show = (el.getAttribute('data-lang') === lang);
          el.style.display = show ? '' : 'none';
        });
      }

      langBtns.forEach(btn => {
        btn.removeEventListener('click', btn._langHandler);
        btn._langHandler = function () {
          updateLanguage(this.getAttribute('data-lang'));
        };
        btn.addEventListener('click', btn._langHandler);
      });

      // Initialize
      const activeLangBtn = document.querySelector('.rl-footer__lang .lang-btn.active, .lang-switch .lang-btn.active');
      const initialLang = activeLangBtn ? activeLangBtn.getAttribute('data-lang') : 'de';
      updateLanguage(initialLang);
    }

    initLanguageSwitcher();

    // ── HIDE CURSOR ON TOUCH ──
    if (isTouchDevice() || isMobile()) {
      document.querySelectorAll('.cursor-dot, .cursor-ring').forEach(el => el.style.display = 'none');
    }

    // ── ACTIVE SECTION HIGHLIGHTING ──
    function updateActiveSection() {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-link[data-section]');
      let current = '';
      const scrollPos = window.scrollY + 120;
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          current = section.id;
        }
      });
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === current) {
          link.classList.add('active');
        }
      });
    }
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    document.addEventListener('componentsLoaded', function () {
      setTimeout(updateActiveSection, 100);
    });

    console.log('✅ UI binding complete');
  }

  // ── Initialisation ──
  async function init() {
    // Load components
    await Promise.all([
      loadComponent('#nav-placeholder', CONFIG.navPath, NAV_FALLBACK),
      loadComponent('#footer-placeholder', CONFIG.footerPath, FOOTER_FALLBACK)
    ]);

    // Wait a moment for DOM to settle, then bind all UI
    setTimeout(() => {
      bindUI();
      // Dispatch event for external scripts
      document.dispatchEvent(new CustomEvent('componentsLoaded'));
    }, 80);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();