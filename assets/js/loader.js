/* ============================================================
   RAPHAEL LEZIUS – Component Loader v3.0 (External)
   Loads nav & footer with localStorage cache + inline fallback
   All paths are relative – works on GitHub Pages
   ============================================================ */

(function() {
  'use strict';

  // ── Inline fallback HTML (root‑relative links) ──
  const NAV_FALLBACK = `
<nav class="rl-nav" id="mainNav" role="navigation" aria-label="Hauptnavigation">
  <div class="rl-nav__inner">
    <a href="index.html" class="rl-nav__brand" aria-label="Startseite">Raphael <span>Lezius</span></a>
    <ul class="rl-nav__links" role="menubar">
      <li class="nav-dropdown" role="none">
        <a href="#" class="nav-link" data-section="services" role="menuitem" aria-haspopup="true" aria-expanded="false">
          Services <i class="fas fa-chevron-down"></i>
        </a>
        <div class="nav-dropdown-content" role="menu" aria-label="Services Untermenü">
          <a href="services.html" role="menuitem"><i class="fas fa-th-list"></i> Übersicht</a>
          <a href="services/moebel-kuechen.html" role="menuitem"><i class="fas fa-couch"></i> Möbel & Küchen</a>
          <a href="services/usm-haller.html" role="menuitem"><i class="fas fa-gem"></i> USM Haller</a>
          <a href="services/garten-outdoor.html" role="menuitem"><i class="fas fa-tree"></i> Garten & Outdoor</a>
          <a href="services/demontage-umzug.html" role="menuitem"><i class="fas fa-truck"></i> Demontage & Umzug</a>
          <a href="services/buero-objekt.html" role="menuitem"><i class="fas fa-building"></i> Büro & Objekt</a>
          <a href="services/premium-pro.html" role="menuitem"><i class="fas fa-crown"></i> Premium Pro</a>
        </div>
      </li>
      <li class="nav-dropdown" role="none">
        <a href="#" class="nav-link" data-section="bundles" role="menuitem" aria-haspopup="true" aria-expanded="false">
          Bundles <i class="fas fa-chevron-down"></i>
        </a>
        <div class="nav-dropdown-content" role="menu" aria-label="Bundles Untermenü">
          <a href="bundles/" role="menuitem"><i class="fas fa-gift"></i> Übersicht</a>
          <a href="bundles/kuechen-komplett.html" role="menuitem"><i class="fas fa-utensils"></i> Küchen-Komplett</a>
          <a href="bundles/usm-all-in.html" role="menuitem"><i class="fas fa-gem"></i> USM All-In</a>
          <a href="bundles/umzug-premium.html" role="menuitem"><i class="fas fa-truck"></i> Umzug Premium</a>
        </div>
      </li>
      <li><a href="about.html" class="nav-link" data-section="about" role="menuitem">Über mich</a></li>
      <li><a href="contact.html" class="nav-link" role="menuitem">Kontakt</a></li>
    </ul>
    <div class="rl-nav__actions">
      <a href="anfrage/" class="nav-cta magnetic-btn"><i class="fas fa-comment-dots"></i><span>Kostenlos</span></a>
      <button class="theme-toggle" data-theme-toggle aria-label="Design umschalten"><i class="fas fa-moon" data-theme-icon></i></button>
      <button class="rl-nav__hamburger" id="navToggle" aria-controls="mobileMenu" aria-expanded="false" aria-label="Menü öffnen"><span></span><span></span><span></span></button>
    </div>
  </div>
</nav>
<div class="rl-nav__mobile" id="mobileMenu" role="dialog" aria-modal="true" aria-label="Mobile Navigation" aria-hidden="true">
  <div class="mobile-menu-inner">
    <button class="mobile-close" id="mobileClose" aria-label="Menü schließen"><i class="fas fa-times"></i></button>
    <a href="index.html" class="mobile-link">Start</a>
    <a href="services.html" class="mobile-link" style="font-weight:600; margin-top:8px;"><i class="fas fa-th-list"></i> Services</a>
    <a href="services/moebel-kuechen.html" class="mobile-link">– Möbel & Küchen</a>
    <a href="services/usm-haller.html" class="mobile-link">– USM Haller</a>
    <a href="services/garten-outdoor.html" class="mobile-link">– Garten & Outdoor</a>
    <a href="services/demontage-umzug.html" class="mobile-link">– Demontage & Umzug</a>
    <a href="services/buero-objekt.html" class="mobile-link">– Büro & Objekt</a>
    <a href="services/premium-pro.html" class="mobile-link">– Premium Pro</a>
    <a href="bundles/" class="mobile-link" style="font-weight:600; border-top:1px solid var(--rl-border); padding-top:12px; margin-top:4px;"><i class="fas fa-gift"></i> Bundles</a>
    <a href="bundles/kuechen-komplett.html" class="mobile-link">– Küchen-Komplett</a>
    <a href="bundles/usm-all-in.html" class="mobile-link">– USM All-In</a>
    <a href="bundles/umzug-premium.html" class="mobile-link">– Umzug Premium</a>
    <a href="about.html" class="mobile-link">Über mich</a>
    <a href="contact.html" class="mobile-link">Kontakt</a>
    <a href="faq.html" class="mobile-link" style="color:var(--rl-muted); font-size:0.9rem;">FAQ</a>
    <a href="anfrage/" class="mobile-cta magnetic-btn"><i class="fas fa-comment-dots"></i> Kostenloses Gespräch</a>
    <div class="mobile-extra"><button class="theme-toggle" data-theme-toggle style="width:44px;height:44px;font-size:1.1rem;"><i class="fas fa-moon" data-theme-icon></i></button></div>
  </div>
</div>
<div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>
  `;

  const FOOTER_FALLBACK = `
<footer class="rl-footer" role="contentinfo">
  <div class="container">
    <div class="rl-footer__top">
      <div class="rl-footer__brand">
        <div class="rl-footer__logo">Raphael <span>Lezius</span><span class="rl-footer__badge"><span class="live-dot"></span> Live</span></div>
        <p class="rl-footer__description" data-lang="de">Premium Montage mit echter Leidenschaft – millimetergenau, staubfrei und immer mit Herz.</p>
        <p class="rl-footer__description" data-lang="en" style="display:none;">Premium assembly with real passion – precise, dust‑free, and always with heart.</p>
        <div class="rl-footer__trust">
          <span><i class="fas fa-shield-alt"></i> 5 Mio. € versichert</span>
          <span><i class="fas fa-star"></i> 5.0 ★ (110+)</span>
          <span><i class="fas fa-clock"></i> Antwort &lt; 24 h</span>
          <span><i class="fas fa-heart"></i> 1 Jahr Garantie</span>
        </div>
      </div>
      <div class="rl-footer__newsletter">
        <h4><i class="fas fa-envelope-open-text"></i> <span data-lang="de">Bleiben Sie verbunden</span><span data-lang="en" style="display:none;">Stay connected</span></h4>
        <p data-lang="de">Monatliche Tipps, exklusive Angebote und Einblicke – nur wenn Sie möchten.</p>
        <p data-lang="en" style="display:none;">Monthly tips, exclusive offers, and insights – only if you want.</p>
        <form class="rl-footer__form" id="newsletterForm">
          <div class="form-group">
            <input type="email" id="newsletterEmail" placeholder=" " required aria-label="E-Mail-Adresse">
            <label for="newsletterEmail" data-lang="de">Ihre E-Mail-Adresse</label>
            <label for="newsletterEmail" data-lang="en" style="display:none;">Your email address</label>
          </div>
          <button type="submit" class="magnetic-btn"><i class="fas fa-paper-plane"></i> <span data-lang="de">Anmelden</span><span data-lang="en" style="display:none;">Subscribe</span></button>
        </form>
        <div class="rl-footer__consent">
          <input type="checkbox" id="consent" required />
          <label for="consent"><span data-lang="de">Ich stimme der <a href="legal/datenschutz.html">Datenschutzerklärung</a> zu.</span><span data-lang="en" style="display:none;">I agree to the <a href="legal/datenschutz.html">privacy policy</a>.</span></label>
        </div>
      </div>
    </div>
    <div class="rl-footer__grid">
      <div class="rl-footer__col">
        <h5 data-lang="de">Services</h5><h5 data-lang="en" style="display:none;">Services</h5>
        <ul>
          <li><a href="services.html"><span data-lang="de">Alle Services</span><span data-lang="en" style="display:none;">All Services</span></a></li>
          <li><a href="services/moebel-kuechen.html"><span data-lang="de">Möbel &amp; Küchen</span><span data-lang="en" style="display:none;">Furniture &amp; Kitchens</span></a></li>
          <li><a href="services/usm-haller.html">USM Haller</a></li>
          <li><a href="services/garten-outdoor.html"><span data-lang="de">Garten &amp; Outdoor</span><span data-lang="en" style="display:none;">Garden &amp; Outdoor</span></a></li>
          <li><a href="services/demontage-umzug.html"><span data-lang="de">Demontage &amp; Umzug</span><span data-lang="en" style="display:none;">Disassembly &amp; Moving</span></a></li>
          <li><a href="services/premium-pro.html">Premium Pro</a></li>
        </ul>
      </div>
      <div class="rl-footer__col">
        <h5 data-lang="de">Bundles</h5><h5 data-lang="en" style="display:none;">Bundles</h5>
        <ul>
          <li><a href="bundles/"><span data-lang="de">Alle Bundles</span><span data-lang="en" style="display:none;">All Bundles</span></a></li>
          <li><a href="bundles/kuechen-komplett.html"><span data-lang="de">Küchen-Komplett</span><span data-lang="en" style="display:none;">Kitchen Complete</span></a></li>
          <li><a href="bundles/usm-all-in.html">USM All‑In</a></li>
          <li><a href="bundles/umzug-premium.html"><span data-lang="de">Umzug Premium</span><span data-lang="en" style="display:none;">Moving Premium</span></a></li>
        </ul>
        <h5 style="margin-top:18px;" data-lang="de">Hilfe</h5><h5 style="margin-top:18px;" data-lang="en" style="display:none;">Help</h5>
        <ul>
          <li><a href="faq.html">FAQ</a></li>
          <li><a href="contact.html"><span data-lang="de">Kontakt</span><span data-lang="en" style="display:none;">Contact</span></a></li>
        </ul>
      </div>
      <div class="rl-footer__col">
        <h5 data-lang="de">Über</h5><h5 data-lang="en" style="display:none;">About</h5>
        <ul>
          <li><a href="about.html"><span data-lang="de">Über mich</span><span data-lang="en" style="display:none;">About me</span></a></li>
          <li><a href="reviews.html"><span data-lang="de">Kundenstimmen</span><span data-lang="en" style="display:none;">Reviews</span></a></li>
          <li><a href="anfrage/"><span data-lang="de">Kostenloses Gespräch</span><span data-lang="en" style="display:none;">Free Consultation</span></a></li>
        </ul>
        <div class="rl-footer__social">
          <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
          <a href="#" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
        </div>
      </div>
      <div class="rl-footer__col">
        <h5 data-lang="de">Kontakt</h5><h5 data-lang="en" style="display:none;">Contact</h5>
        <ul class="rl-footer__contact">
          <li><i class="fas fa-phone-alt"></i> <a href="tel:+491608194018">+49 160 8194018</a></li>
          <li><i class="fab fa-whatsapp"></i> <a href="https://wa.me/491608194018" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><i class="fas fa-envelope"></i> <a href="mailto:info@raphael-lezius.de">info@raphael-lezius.de</a></li>
        </ul>
        <h5 style="margin-top:18px;" data-lang="de">Rechtliches</h5><h5 style="margin-top:18px;" data-lang="en" style="display:none;">Legal</h5>
        <ul>
          <li><a href="legal/impressum.html">Impressum</a></li>
          <li><a href="legal/datenschutz.html"><span data-lang="de">Datenschutz</span><span data-lang="en" style="display:none;">Privacy</span></a></li>
          <li><a href="legal/agb.html">AGB</a></li>
          <li><a href="legal/widerruf.html"><span data-lang="de">Widerruf</span><span data-lang="en" style="display:none;">Cancellation</span></a></li>
          <li><a href="legal/cookie.html"><span data-lang="de">Cookie‑Richtlinie</span><span data-lang="en" style="display:none;">Cookie Policy</span></a></li>
        </ul>
      </div>
    </div>
    <div class="rl-footer__trustbar">
      <div class="trust-item"><i class="fas fa-users"></i><div><span class="label"><span data-lang="de">Vertrauen</span><span data-lang="en" style="display:none;">Trust</span></span><span class="value">110+ <span data-lang="de">Kunden</span><span data-lang="en" style="display:none;">clients</span></span></div></div>
      <div class="trust-item"><i class="fas fa-star"></i><div><span class="label"><span data-lang="de">Bewertung</span><span data-lang="en" style="display:none;">Rating</span></span><span class="value">5.0 ★</span></div></div>
      <div class="trust-item"><i class="fas fa-bolt"></i><div><span class="label"><span data-lang="de">Reaktionszeit</span><span data-lang="en" style="display:none;">Response time</span></span><span class="value">&lt; 24 h</span></div></div>
      <div class="trust-item"><i class="fas fa-shield-alt"></i><div><span class="label"><span data-lang="de">Versicherung</span><span data-lang="en" style="display:none;">Insurance</span></span><span class="value">5 Mio. €</span></div></div>
      <div class="trust-item"><i class="fas fa-hand-holding-heart"></i><div><span class="label"><span data-lang="de">Service</span><span data-lang="en" style="display:none;">Service</span></span><span class="value"><span data-lang="de">White‑Glove</span><span data-lang="en" style="display:none;">White‑Glove</span></span></div></div>
      <div class="trust-item"><i class="fas fa-award"></i><div><span class="label"><span data-lang="de">Erfahrung</span><span data-lang="en" style="display:none;">Experience</span></span><span class="value">8+ <span data-lang="de">Jahre</span><span data-lang="en" style="display:none;">years</span></span></div></div>
    </div>
    <div class="rl-footer__bottom">
      <div class="rl-footer__copyright">
        <p>© 2026 Raphael Lezius · <span data-lang="de">Mit Sorgfalt gemacht in Augsburg</span><span data-lang="en" style="display:none;">Crafted with care in Augsburg</span></p>
        <div class="rl-footer__legal">
          <a href="legal/impressum.html">Impressum</a> <span class="sep">·</span>
          <a href="legal/datenschutz.html"><span data-lang="de">Datenschutz</span><span data-lang="en" style="display:none;">Privacy</span></a> <span class="sep">·</span>
          <a href="legal/agb.html">AGB</a>
        </div>
      </div>
      <button class="rl-footer__backtop" id="footerBackTop" aria-label="Nach oben"><i class="fas fa-chevron-up"></i> <span data-lang="de">Nach oben</span><span data-lang="en" style="display:none;">Top</span></button>
    </div>
    <div class="rl-footer__sentiment">
      <i class="fas fa-heart"></i> <span data-lang="de">Danke, dass Sie sich die Zeit genommen haben. Es bedeutet mir viel.</span><span data-lang="en" style="display:none;">Thank you for taking the time. It means a lot to me.</span>
    </div>
  </div>
</footer>
  `;

  // ── Helper: load component ──
  async function loadComponent(selector, path, fallback) {
    const container = document.querySelector(selector);
    if (!container) return;

    const cached = localStorage.getItem(path);
    if (cached) {
      container.innerHTML = cached;
      fetch(path)
        .then(r => r.text())
        .then(html => {
          if (html && html.trim().length > 0) {
            container.innerHTML = html;
            localStorage.setItem(path, html);
          }
        })
        .catch(() => {});
      return;
    }

    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('Network error');
      const html = await res.text();
      if (html && html.trim().length > 0) {
        container.innerHTML = html;
        localStorage.setItem(path, html);
        return;
      }
    } catch (error) {
      // fall through
    }

    // Fallback
    if (fallback) {
      container.innerHTML = fallback;
      try { localStorage.setItem(path, fallback); } catch (e) {}
    } else {
      container.innerHTML = `<p style="color:red; text-align:center; padding:20px;">⚠️ Komponente konnte nicht geladen werden.</p>`;
    }
  }

  // ── Initialize ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Load with RELATIVE paths (no leading slash)
    loadComponent('#nav-placeholder', 'components/nav.html', NAV_FALLBACK);
    loadComponent('#footer-placeholder', 'components/footer.html', FOOTER_FALLBACK);

    setTimeout(() => {
      // ── Mobile Menu ──
      const navToggle = document.getElementById('navToggle');
      const mobileMenu = document.getElementById('mobileMenu');
      const navBackdrop = document.getElementById('navBackdrop');
      const mobileClose = document.getElementById('mobileClose');
      const body = document.body;

      function openMenu() {
        mobileMenu?.classList.add('open');
        navBackdrop?.classList.add('active');
        navToggle?.setAttribute('aria-expanded', 'true');
        mobileMenu?.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
      }

      function closeMenu() {
        mobileMenu?.classList.remove('open');
        navBackdrop?.classList.remove('active');
        navToggle?.setAttribute('aria-expanded', 'false');
        mobileMenu?.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
        navToggle?.focus();
      }

      if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function() {
          mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
        });
      }

      if (navBackdrop) navBackdrop.addEventListener('click', closeMenu);
      if (mobileClose) mobileClose.addEventListener('click', closeMenu);

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) closeMenu();
      });

      if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(function(link) {
          link.addEventListener('click', closeMenu);
        });
      }

      // ── Theme Toggle ──
      document.querySelectorAll('[data-theme-toggle]').forEach(function(btn) {
        btn.removeEventListener('click', toggleTheme);
        btn.addEventListener('click', toggleTheme);
      });

      // ── Newsletter ──
      const form = document.getElementById('newsletterForm');
      if (form) {
        form.removeEventListener('submit', handleNewsletter);
        form.addEventListener('submit', handleNewsletter);
      }

      // ── Language Switcher ──
      document.querySelectorAll('.lang-switcher button').forEach(function(btn) {
        btn.removeEventListener('click', handleLang);
        btn.addEventListener('click', handleLang);
      });

      // ── Footer Back to Top ──
      const footerBack = document.getElementById('footerBackTop');
      if (footerBack) {
        footerBack.removeEventListener('click', footerBackTop);
        footerBack.addEventListener('click', footerBackTop);
      }

      updateActiveSection();

      // ── Dropdowns ──
      initDropdowns();

    }, 50);
  }

  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('rl-theme', next);
    document.querySelectorAll('[data-theme-icon]').forEach(function(i) {
      i.className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });
    const meta = document.getElementById('themeColorMeta');
    if (meta) meta.content = next === 'dark' ? '#0B0A09' : '#F9F7F2';
  }

  function handleNewsletter(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Willkommen!';
    btn.style.background = 'var(--rl-gradient-hover)';
    setTimeout(function() {
      btn.innerHTML = orig;
      btn.style.background = '';
      this.reset();
    }, 2800);
  }

  function handleLang(e) {
    const btn = e.currentTarget;
    const lang = btn.getAttribute('data-lang');
    if (!lang) return;
    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem('rl-lang', lang);
    document.querySelectorAll('.lang-switcher button').forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
  }

  function footerBackTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link[data-section]');
    let current = '';
    const scrollPos = window.scrollY + 120;
    sections.forEach(function(s) {
      const top = s.offsetTop,
        h = s.offsetHeight;
      if (scrollPos >= top && scrollPos < top + h) current = s.id;
    });
    links.forEach(function(l) {
      l.classList.toggle('active', l.getAttribute('data-section') === current);
    });
  }

  // ── Dropdown handling ──
  function initDropdowns() {
    const dropdownTriggers = document.querySelectorAll('.nav-dropdown > a');

    dropdownTriggers.forEach(function(trigger) {
      const parent = trigger.closest('.nav-dropdown');
      const content = parent.querySelector('.nav-dropdown-content');

      // Mobile: click to toggle
      trigger.addEventListener('click', function(e) {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          e.stopPropagation();

          const isOpen = content.classList.contains('open');

          // Close all others
          document.querySelectorAll('.nav-dropdown-content.open').forEach(function(c) {
            if (c !== content) {
              c.classList.remove('open');
              c.closest('.nav-dropdown').querySelector('a').setAttribute('aria-expanded', 'false');
              c.closest('.nav-dropdown').querySelector('a').classList.remove('open');
            }
          });

          if (isOpen) {
            content.classList.remove('open');
            trigger.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
          } else {
            content.classList.add('open');
            trigger.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        }
      });

      // Close on outside click
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-dropdown')) {
          content.classList.remove('open');
          trigger.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });

      // Close on Escape
      trigger.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          content.classList.remove('open');
          trigger.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });
    });
  }

  // ── Restore theme and language ──
  const savedTheme = localStorage.getItem('rl-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('[data-theme-icon]').forEach(function(i) {
      i.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });
  }

  const savedLang = localStorage.getItem('rl-lang') || 'de';
  document.documentElement.setAttribute('data-lang', savedLang);
  document.querySelectorAll('.lang-switcher button').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-lang') === savedLang);
  });

  window.addEventListener('scroll', updateActiveSection, { passive: true });

  // ── Nav auto-hide ──
  const nav = document.querySelector('.rl-nav');
  let lastScroll = 0;
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('scrolled', currentScroll > 20);
    if (currentScroll > 80) {
      if (currentScroll > lastScroll) nav?.classList.add('hidden');
      else nav?.classList.remove('hidden');
    } else {
      nav?.classList.remove('hidden');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  console.log('✨ Raphael Lezius – Component Loader v3.0 (External, relative paths)');

})();