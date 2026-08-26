/* ============================================================
   RAPHAEL LEZIUS – main.js v2.0
   All interactive features – modular & self-contained
   ============================================================ */

(function() {
  'use strict';

  // ── DOM READY ──────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {

    // =========================================================
    // 1. THEME TOGGLE (Dark / Light)
    // =========================================================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;
    const STORAGE_KEY = 'rl-theme';

    // Load saved theme or system preference
    function getPreferredTheme() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function setTheme(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
      if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
      }
      const meta = document.getElementById('themeColorMeta');
      if (meta) {
        meta.content = theme === 'dark' ? '#0B0A09' : '#F8F5F0';
      }
    }

    // Apply initial theme
    setTheme(getPreferredTheme());

    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        const current = html.getAttribute('data-theme') || 'dark';
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    }

    // Re‑bind theme toggle after dynamic content loads (component loader)
    document.addEventListener('componentsLoaded', function() {
      const newToggle = document.querySelector('[data-theme-toggle]');
      if (newToggle) {
        newToggle.removeEventListener('click', themeToggleHandler);
        newToggle.addEventListener('click', themeToggleHandler);
      }
    });

    function themeToggleHandler() {
      const current = html.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    }

    // =========================================================
    // 2. MOBILE MENU
    // =========================================================
    const hamburger = document.getElementById('navToggle') || document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function() {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
        mobileMenu.setAttribute('aria-hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close menu on link click
      mobileMenu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          mobileMenu.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          mobileMenu.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        });
      });
    }

    // =========================================================
    // 3. SCROLL PROGRESS BAR
    // =========================================================
    const progress = document.getElementById('scrollProgress');

    if (progress) {
      window.addEventListener('scroll', function() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progress.style.width = percent + '%';
      }, { passive: true });
    }

    // =========================================================
    // 4. STICKY CTA & BACK TO TOP
    // =========================================================
    const stickyCta = document.getElementById('stickyCta');
    const backTop = document.getElementById('backToTop');

    function updateStickyElements() {
      const scrollY = window.scrollY;
      const show = scrollY > 400;
      if (stickyCta) stickyCta.classList.toggle('visible', show);
      if (backTop) backTop.classList.toggle('visible', show);
    }

    window.addEventListener('scroll', updateStickyElements, { passive: true });

    if (backTop) {
      backTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // =========================================================
    // 5. CUSTOM CURSOR (desktop only)
    // =========================================================
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    if (dot && ring && window.matchMedia('(pointer: fine)').matches) {
      let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

      document.addEventListener('mousemove', function(e) {
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
      document.addEventListener('mouseover', function(e) {
        if (e.target.closest('a, button, .btn, .magnetic-btn, .kk-item, .service-card, .bundle-card, .review-card, .feature-item, .pricing-card, .faq-item')) {
          dot.classList.add('hovering');
          ring.classList.add('hovering');
        }
      });
      document.addEventListener('mouseout', function(e) {
        if (e.target.closest('a, button, .btn, .magnetic-btn, .kk-item, .service-card, .bundle-card, .review-card, .feature-item, .pricing-card, .faq-item')) {
          dot.classList.remove('hovering');
          ring.classList.remove('hovering');
        }
      });
    }

    // =========================================================
    // 6. MAGNETIC BUTTONS (desktop only)
    // =========================================================
    if (window.matchMedia('(pointer: fine)').matches) {
      document.addEventListener('mousemove', function(e) {
        document.querySelectorAll('.magnetic-btn').forEach(function(btn) {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const strength = (120 - dist) / 120 * 4;
            btn.style.transform = 'translate(' + (dx * strength / 6) + 'px, ' + (dy * strength / 6) + 'px)';
          } else {
            btn.style.transform = 'translate(0, 0)';
          }
        });
      });
    }

    // =========================================================
    // 7. LIVE COUNTERS (animate on scroll)
    // =========================================================
    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      const duration = 1800;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current.toLocaleString('de-DE') + (target >= 100 ? '+' : '');
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target.toLocaleString('de-DE') + (target >= 100 ? '+' : '');
        }
      }
      requestAnimationFrame(updateCounter);
    }

    // =========================================================
    // 8. REVEAL ON SCROLL (Intersection Observer)
    // =========================================================
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Trigger live counters inside revealed elements
          entry.target.querySelectorAll('.live-counter').forEach(function(counter) {
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
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function(el) {
      revealObserver.observe(el);
    });

    // Also trigger any counters that are already visible on load
    setTimeout(function() {
      document.querySelectorAll('.reveal.visible .live-counter, .live-counter.visible').forEach(function(counter) {
        if (!counter.classList.contains('counted')) {
          counter.classList.add('counted');
          animateCounter(counter);
        }
      });
    }, 300);

    // =========================================================
    // 9. SMOOTH SCROLL FOR ANCHOR LINKS
    // =========================================================
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const navHeight = 72; // --rl-nav-height
          const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    // =========================================================
    // 10. HERO SEARCH
    // =========================================================
    const searchInput = document.getElementById('heroSearch');
    const searchBtn = document.getElementById('heroSearchBtn');

    function performSearch() {
      const query = searchInput ? searchInput.value.trim() : '';
      if (query) {
        window.location.href = '/services.html?q=' + encodeURIComponent(query);
      } else if (searchInput) {
        searchInput.focus();
      }
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', performSearch);
    }
    if (searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
      });
    }

    // =========================================================
    // 11. FAQ ACCORDION (if present)
    // =========================================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function(item) {
      const question = item.querySelector('.question');
      if (!question) return;
      question.addEventListener('click', function() {
        const isOpen = item.classList.contains('open');
        // Close all others (optional: single open)
        faqItems.forEach(function(other) {
          other.classList.remove('open');
        });
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });

    // =========================================================
    // 12. NEWSLETTER FORM (footer)
    // =========================================================
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Willkommen an Bord!';
        btn.style.background = 'var(--rl-gradient-hover)';
        setTimeout(function() {
          btn.innerHTML = originalText;
          newsletterForm.reset();
          btn.style.background = '';
        }, 2800);
      });
    }

    // =========================================================
    // 13. FILTER BUTTONS (services page)
    // =========================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-detailed-card, .service-card');
    const noResults = document.getElementById('noResults');

    if (filterBtns.length) {
      filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          filterBtns.forEach(function(b) { b.classList.remove('active'); });
          this.classList.add('active');

          const filter = this.getAttribute('data-filter');
          let visible = 0;

          serviceCards.forEach(function(card) {
            const category = card.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
              card.style.display = 'flex';
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

    // =========================================================
    // 14. COMPONENTS LOADED EVENT (for re-binding)
    // =========================================================
    // Dispatch a custom event when the page is fully interactive
    // This helps the component loader to re‑bind event listeners.
    // The component loader script can listen for 'componentsLoaded'
    // and re‑initialize things like theme toggle, mobile menu, etc.

    // If you use a component loader (fetching nav/footer), trigger this event
    // after the components are inserted.
    // Example: after fetch().then(...) { ... dispatchEvent }

    // For now, we dispatch it once at the end of DOMContentLoaded.
    setTimeout(function() {
      document.dispatchEvent(new CustomEvent('componentsLoaded'));
    }, 500);

    // =========================================================
    // 15. CONSOLE WELCOME
    // =========================================================
    console.log('✨ Raphael Lezius – Premium Montage');
    console.log('❤️ Danke, dass Sie hier sind.');

  }); // end DOMContentLoaded

})();