/**
 * loader.js – Centralised component loader for Raphael Lezius
 * Loads nav and footer from components/ with a built‑in fallback.
 * Uses the page's <base> tag to resolve paths correctly.
 */

(function() {
  'use strict';

  // ─── FALLBACK HTML (identical to components/nav.html & footer.html) ───
  const NAV_FALLBACK = `
<nav class="rl-nav" id="mainNav" role="navigation" aria-label="Hauptnavigation">
  <div class="rl-nav__inner">

    <!-- Brand -->
    <a href="index.html" class="rl-nav__brand" aria-label="Zur Startseite">
      Raphael <span>Lezius</span>
    </a>

    <!-- Desktop Links -->
    <ul class="rl-nav__links" role="menubar">
      <!-- Services Dropdown -->
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

      <!-- Bundles Dropdown -->
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

    <!-- Right Actions -->
    <div class="rl-nav__actions">
      <!-- CTA -->
      <a href="anfrage/" class="nav-cta magnetic-btn">
        <i class="fas fa-comment-dots"></i>
        <span>Kostenlos</span>
      </a>

      <!-- Theme Toggle -->
      <button class="theme-toggle" data-theme-toggle aria-label="Design umschalten">
        <i class="fas fa-moon" data-theme-icon></i>
      </button>

      <!-- Hamburger (mobile) -->
      <button class="rl-nav__hamburger" id="navToggle" aria-controls="mobileMenu" aria-expanded="false" aria-label="Menü öffnen">
        <span></span><span></span><span></span>
      </button>
    </div>

  </div>
</nav>

<!-- ===== MOBILE MENU (Off-Canvas) ===== -->
<div class="rl-nav__mobile" id="mobileMenu" role="dialog" aria-modal="true" aria-label="Mobile Navigation" aria-hidden="true">
  <div class="mobile-menu-inner">

    <!-- Close Button -->
    <button class="mobile-close" id="mobileClose" aria-label="Menü schließen">
      <i class="fas fa-times"></i>
    </button>

    <!-- Mobile Links -->
    <a href="index.html" class="mobile-link" style="font-weight:700;">Start</a>

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

    <a href="anfrage/" class="mobile-cta magnetic-btn">
      <i class="fas fa-comment-dots"></i> Kostenloses Gespräch
    </a>

    <div class="mobile-extra">
      <button class="theme-toggle" data-theme-toggle style="width:44px; height:44px; font-size:1.1rem;">
        <i class="fas fa-moon" data-theme-icon></i>
      </button>
    </div>
  </div>
</div>

<!-- ===== BACKDROP OVERLAY ===== -->
<div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>
  `;

  const FOOTER_FALLBACK = `
<footer class="rl-footer" role="contentinfo">
  <div class="container">

    <!-- ===== TOP: Brand + Newsletter ===== -->
    <div class="rl-footer__top">

      <!-- Brand Column -->
      <div class="rl-footer__brand">
        <div class="rl-footer__logo">
          Raphael <span>Lezius</span>
          <span class="rl-footer__badge">
            <span class="live-dot"></span>
            <span data-lang="de">Live</span>
            <span data-lang="en" style="display:none;">Live</span>
          </span>
          <!-- Live Visitors Counter -->
          <span class="rl-footer__visitors">
            <i class="fas fa-user"></i>
            <span id="visitorCount">12</span>
            <span data-lang="de">aktiv</span>
            <span data-lang="en" style="display:none;">active</span>
          </span>
        </div>
        <p class="rl-footer__description">
          <span data-lang="de">Premium Montage mit echter Leidenschaft – millimetergenau, staubfrei und immer mit Herz.</span>
          <span data-lang="en" style="display:none;">Premium assembly with real passion – precise, dust‑free, and always with heart.</span>
        </p>
        <div class="rl-footer__trust">
          <span><i class="fas fa-shield-alt"></i> 5 Mio. € versichert</span>
          <span><i class="fas fa-star"></i> 5.0 ★ (110+)</span>
          <span><i class="fas fa-clock"></i> <span data-lang="de">Antwort &lt; 24 h</span><span data-lang="en" style="display:none;">Response &lt; 24 h</span></span>
          <span><i class="fas fa-heart"></i> <span data-lang="de">1 Jahr Garantie</span><span data-lang="en" style="display:none;">1‑year guarantee</span></span>
        </div>
      </div>

      <!-- Newsletter Column -->
      <div class="rl-footer__newsletter">
        <h4>
          <i class="fas fa-envelope-open-text"></i>
          <span data-lang="de">Bleiben Sie verbunden</span>
          <span data-lang="en" style="display:none;">Stay connected</span>
        </h4>
        <p data-lang="de">Monatliche Tipps, exklusive Angebote und Einblicke – nur wenn Sie möchten.</p>
        <p data-lang="en" style="display:none;">Monthly tips, exclusive offers, and insights – only if you want.</p>
        <form class="rl-footer__form" id="newsletterForm">
          <div class="form-group">
            <input type="email" id="newsletterEmail" placeholder=" " required aria-label="E-Mail-Adresse">
            <label for="newsletterEmail" data-lang="de">Ihre E-Mail-Adresse</label>
            <label for="newsletterEmail" data-lang="en" style="display:none;">Your email address</label>
          </div>
          <button type="submit" class="magnetic-btn">
            <i class="fas fa-paper-plane"></i>
            <span data-lang="de">Anmelden</span>
            <span data-lang="en" style="display:none;">Subscribe</span>
          </button>
        </form>
        <div class="rl-footer__consent">
          <input type="checkbox" id="consent" required />
          <label for="consent">
            <span data-lang="de">Ich stimme der <a href="legal/datenschutz.html">Datenschutzerklärung</a> zu.</span>
            <span data-lang="en" style="display:none;">I agree to the <a href="legal/datenschutz.html">privacy policy</a>.</span>
          </label>
        </div>
      </div>
    </div>

    <!-- ===== MIDDLE: Link Grid ===== -->
    <div class="rl-footer__grid">

      <!-- Column 1: Services -->
      <div class="rl-footer__col">
        <h5><span data-lang="de">Services</span><span data-lang="en" style="display:none;">Services</span></h5>
        <ul>
          <li><a href="services.html"><span data-lang="de">Alle Services</span><span data-lang="en" style="display:none;">All Services</span></a></li>
          <li><a href="services/moebel-kuechen.html"><span data-lang="de">Möbel &amp; Küchen</span><span data-lang="en" style="display:none;">Furniture &amp; Kitchens</span></a></li>
          <li><a href="services/usm-haller.html">USM Haller</a></li>
          <li><a href="services/garten-outdoor.html"><span data-lang="de">Garten &amp; Outdoor</span><span data-lang="en" style="display:none;">Garden &amp; Outdoor</span></a></li>
          <li><a href="services/demontage-umzug.html"><span data-lang="de">Demontage &amp; Umzug</span><span data-lang="en" style="display:none;">Disassembly &amp; Moving</span></a></li>
          <li><a href="services/premium-pro.html">Premium Pro</a></li>
        </ul>
      </div>

      <!-- Column 2: Bundles -->
      <div class="rl-footer__col">
        <h5><span data-lang="de">Bundles</span><span data-lang="en" style="display:none;">Bundles</span></h5>
        <ul>
          <li><a href="bundles/"><span data-lang="de">Alle Bundles</span><span data-lang="en" style="display:none;">All Bundles</span></a></li>
          <li><a href="bundles/kuechen-komplett.html"><span data-lang="de">Küchen-Komplett</span><span data-lang="en" style="display:none;">Kitchen Complete</span></a></li>
          <li><a href="bundles/usm-all-in.html">USM All‑In</a></li>
          <li><a href="bundles/umzug-premium.html"><span data-lang="de">Umzug Premium</span><span data-lang="en" style="display:none;">Moving Premium</span></a></li>
        </ul>
        <h5 style="margin-top:18px;"><span data-lang="de">Hilfe</span><span data-lang="en" style="display:none;">Help</span></h5>
        <ul>
          <li><a href="faq.html">FAQ</a></li>
          <li><a href="contact.html"><span data-lang="de">Kontakt</span><span data-lang="en" style="display:none;">Contact</span></a></li>
        </ul>
      </div>

      <!-- Column 3: Über + Social -->
      <div class="rl-footer__col">
        <h5><span data-lang="de">Über</span><span data-lang="en" style="display:none;">About</span></h5>
        <ul>
          <li><a href="about.html"><span data-lang="de">Über mich</span><span data-lang="en" style="display:none;">About me</span></a></li>
          <li><a href="reviews.html"><span data-lang="de">Kundenstimmen</span><span data-lang="en" style="display:none;">Reviews</span></a></li>
          <li><a href="anfrage/"><span data-lang="de">Kostenloses Gespräch</span><span data-lang="en" style="display:none;">Free Consultation</span></a></li>
        </ul>
        <!-- Language Switcher (small) -->
        <div class="rl-footer__lang">
          <span data-lang="de">Sprache:</span>
          <span data-lang="en" style="display:none;">Language:</span>
          <button class="lang-btn active" data-lang="de">DE</button>
          <button class="lang-btn" data-lang="en">EN</button>
        </div>
        <div class="rl-footer__social">
          <a href="#" aria-label="Instagram" title="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" aria-label="LinkedIn" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          <a href="#" aria-label="YouTube" title="YouTube"><i class="fab fa-youtube"></i></a>
          <a href="#" aria-label="TikTok" title="TikTok"><i class="fab fa-tiktok"></i></a>
        </div>
      </div>

      <!-- Column 4: Kontakt + Rechtliches -->
      <div class="rl-footer__col">
        <h5><span data-lang="de">Kontakt</span><span data-lang="en" style="display:none;">Contact</span></h5>
        <ul class="rl-footer__contact">
          <li>
            <i class="fas fa-phone-alt"></i>
            <a href="tel:+491608194018">+49 160 8194018</a>
          </li>
          <li>
            <i class="fab fa-whatsapp"></i>
            <a href="https://wa.me/491608194018" target="_blank" rel="noopener">WhatsApp</a>
          </li>
          <li>
            <i class="fas fa-envelope"></i>
            <a href="mailto:info@raphael-lezius.de">info@raphael-lezius.de</a>
          </li>
        </ul>
        <h5 style="margin-top:18px;"><span data-lang="de">Rechtliches</span><span data-lang="en" style="display:none;">Legal</span></h5>
        <ul>
          <li><a href="legal/impressum.html">Impressum</a></li>
          <li><a href="legal/datenschutz.html"><span data-lang="de">Datenschutz</span><span data-lang="en" style="display:none;">Privacy</span></a></li>
          <li><a href="legal/agb.html">AGB</a></li>
          <li><a href="legal/widerruf.html"><span data-lang="de">Widerruf</span><span data-lang="en" style="display:none;">Cancellation</span></a></li>
          <li><a href="legal/cookie.html"><span data-lang="de">Cookie‑Richtlinie</span><span data-lang="en" style="display:none;">Cookie Policy</span></a></li>
        </ul>
      </div>

    </div>

    <!-- ===== TRUST BAR ===== -->
    <div class="rl-footer__trustbar">
      <div class="trust-item">
        <i class="fas fa-users"></i>
        <div>
          <span class="label"><span data-lang="de">Vertrauen</span><span data-lang="en" style="display:none;">Trust</span></span>
          <span class="value">110+ <span data-lang="de">Kunden</span><span data-lang="en" style="display:none;">clients</span></span>
        </div>
      </div>
      <div class="trust-item">
        <i class="fas fa-star"></i>
        <div>
          <span class="label"><span data-lang="de">Bewertung</span><span data-lang="en" style="display:none;">Rating</span></span>
          <span class="value">5.0 ★</span>
        </div>
      </div>
      <div class="trust-item">
        <i class="fas fa-bolt"></i>
        <div>
          <span class="label"><span data-lang="de">Reaktionszeit</span><span data-lang="en" style="display:none;">Response time</span></span>
          <span class="value">&lt; 24 h</span>
        </div>
      </div>
      <div class="trust-item">
        <i class="fas fa-shield-alt"></i>
        <div>
          <span class="label"><span data-lang="de">Versicherung</span><span data-lang="en" style="display:none;">Insurance</span></span>
          <span class="value">5 Mio. €</span>
        </div>
      </div>
      <div class="trust-item">
        <i class="fas fa-hand-holding-heart"></i>
        <div>
          <span class="label"><span data-lang="de">Service</span><span data-lang="en" style="display:none;">Service</span></span>
          <span class="value"><span data-lang="de">White‑Glove</span><span data-lang="en" style="display:none;">White‑Glove</span></span>
        </div>
      </div>
      <div class="trust-item">
        <i class="fas fa-award"></i>
        <div>
          <span class="label"><span data-lang="de">Erfahrung</span><span data-lang="en" style="display:none;">Experience</span></span>
          <span class="value">8+ <span data-lang="de">Jahre</span><span data-lang="en" style="display:none;">years</span></span>
        </div>
      </div>
    </div>

    <!-- ===== BOTTOM ===== -->
    <div class="rl-footer__bottom">
      <div class="rl-footer__copyright">
        <p>© 2026 Raphael Lezius · <span data-lang="de">Mit Sorgfalt gemacht in Augsburg</span><span data-lang="en" style="display:none;">Crafted with care in Augsburg</span></p>
        <div class="rl-footer__legal">
          <a href="legal/impressum.html">Impressum</a>
          <span class="sep">·</span>
          <a href="legal/datenschutz.html"><span data-lang="de">Datenschutz</span><span data-lang="en" style="display:none;">Privacy</span></a>
          <span class="sep">·</span>
          <a href="legal/agb.html">AGB</a>
        </div>
      </div>

      <!-- Back to Top -->
      <button class="rl-footer__backtop" id="footerBackTop" aria-label="Nach oben">
        <i class="fas fa-chevron-up"></i>
        <span data-lang="de">Nach oben</span>
        <span data-lang="en" style="display:none;">Top</span>
      </button>
    </div>

    <!-- ===== FINAL SENTIMENT ===== -->
    <div class="rl-footer__sentiment">
      <i class="fas fa-heart"></i>
      <span data-lang="de">Danke, dass Sie sich die Zeit genommen haben. Es bedeutet mir viel.</span>
      <span data-lang="en" style="display:none;">Thank you for taking the time. It means a lot to me.</span>
    </div>

  </div>
</footer>
  `;

  // ─── HELPER: Get the correct base path (same as dynamic <base>) ───
  function getBasePath() {
    // If <base> already exists and has a href, use that
    const baseEl = document.querySelector('base');
    if (baseEl) {
      const href = baseEl.getAttribute('href');
      if (href) return href;
    }
    // Fallback: compute from window.location
    const parts = window.location.pathname.split('/').filter(p => p.length > 0);
    if (parts.length > 0 && parts[parts.length - 1].includes('.')) parts.pop();
    const depth = parts.length;
    return depth === 0 ? './' : '../'.repeat(depth);
  }

  // ─── LOAD COMPONENT ───
  function loadComponent(selector, componentPath, fallbackHTML) {
    const container = document.querySelector(selector);
    if (!container) {
      console.warn('❌ Placeholder not found:', selector);
      return;
    }

    const base = getBasePath();
    const url = base + componentPath;  // e.g., './components/nav.html' or '../components/nav.html'

    // Try to fetch the component
    fetch(url, { cache: 'no-cache' })
      .then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .then(html => {
        if (html.trim().length === 0) throw new Error('Empty response');
        container.innerHTML = html;
        // Cache in localStorage for offline / fallback
        try { localStorage.setItem('rl-' + componentPath, html); } catch (e) {}
        console.log('✅ Loaded:', componentPath);
      })
      .catch(err => {
        console.warn('⚠️ Failed to load', componentPath, '– using fallback', err);
        // Use fallback (either from localStorage or hardcoded)
        const cached = localStorage.getItem('rl-' + componentPath);
        if (cached) {
          container.innerHTML = cached;
          console.log('✅ Used cached fallback for:', componentPath);
        } else {
          container.innerHTML = fallbackHTML;
          console.log('✅ Used built‑in fallback for:', componentPath);
        }
      });
  }

  // ─── INIT ───
  function init() {
    // Load nav and footer
    loadComponent('#nav-placeholder', 'components/nav.html', NAV_FALLBACK);
    loadComponent('#footer-placeholder', 'components/footer.html', FOOTER_FALLBACK);

    // After a short delay, bind interactive elements
    setTimeout(function() {
      // ----- Mobile Menu Toggle -----
      const navToggle = document.getElementById('navToggle');
      const mobileMenu = document.getElementById('mobileMenu');
      const navBackdrop = document.getElementById('navBackdrop');
      const mobileClose = document.getElementById('mobileClose');
      const body = document.body;

      function openMenu() {
        if (mobileMenu) mobileMenu.classList.add('open');
        if (navBackdrop) navBackdrop.classList.add('active');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
        if (mobileMenu) mobileMenu.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
      }

      function closeMenu() {
        if (mobileMenu) mobileMenu.classList.remove('open');
        if (navBackdrop) navBackdrop.classList.remove('active');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        if (mobileMenu) mobileMenu.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
        if (navToggle) navToggle.focus();
      }

      if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function(e) {
          e.preventDefault();
          if (mobileMenu.classList.contains('open')) closeMenu();
          else openMenu();
        });
      }
      if (navBackdrop) navBackdrop.addEventListener('click', closeMenu);
      if (mobileClose) mobileClose.addEventListener('click', closeMenu);
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) closeMenu();
      });
      if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(function(link) {
          link.addEventListener('click', closeMenu);
        });
      }

      // ----- Theme Toggle -----
      const themeToggles = document.querySelectorAll('[data-theme-toggle]');
      themeToggles.forEach(function(btn) {
        btn.addEventListener('click', function() {
          const html = document.documentElement;
          const current = html.getAttribute('data-theme') || 'dark';
          const next = current === 'dark' ? 'light' : 'dark';
          html.setAttribute('data-theme', next);
          localStorage.setItem('rl-theme', next);
          const icons = document.querySelectorAll('[data-theme-icon]');
          icons.forEach(function(i) {
            i.className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
          });
          const meta = document.getElementById('themeColorMeta');
          if (meta) meta.content = next === 'dark' ? '#0B0A09' : '#F9F7F2';
        });
      });

      // ----- Newsletter Form -----
      const form = document.getElementById('newsletterForm');
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const btn = this.querySelector('button');
          const orig = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check"></i> Willkommen!';
          btn.style.background = 'var(--rl-gradient-hover)';
          setTimeout(function() {
            btn.innerHTML = orig;
            btn.style.background = '';
            form.reset();
          }, 2800);
        });
      }

      // ----- Language Switcher (in footer) -----
      const langBtns = document.querySelectorAll('.lang-btn');
      langBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          const lang = this.getAttribute('data-lang');
          if (!lang) return;
          document.documentElement.setAttribute('data-lang', lang);
          localStorage.setItem('rl-lang', lang);
          langBtns.forEach(function(b) {
            b.classList.toggle('active', b.getAttribute('data-lang') === lang);
          });
        });
      });

      // ----- Dropdowns on mobile (desktop: hover, but we keep click for touch) -----
      const dropdownTriggers = document.querySelectorAll('.nav-dropdown > a');
      dropdownTriggers.forEach(function(trigger) {
        trigger.addEventListener('click', function(e) {
          if (window.innerWidth <= 900) {
            e.preventDefault();
            e.stopPropagation();
            const parent = this.closest('.nav-dropdown');
            const content = parent.querySelector('.nav-dropdown-content');
            const isOpen = content.classList.contains('open');
            // Close others
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
      });

      // ----- Nav auto‑hide on scroll -----
      const nav = document.querySelector('.rl-nav');
      let lastScroll = 0;
      window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (nav) nav.classList.toggle('scrolled', currentScroll > 20);
        if (currentScroll > 80) {
          if (currentScroll > lastScroll) {
            if (nav) nav.classList.add('hidden');
          } else {
            if (nav) nav.classList.remove('hidden');
          }
        } else {
          if (nav) nav.classList.remove('hidden');
        }
        lastScroll = currentScroll;
      }, { passive: true });

      // ----- Back to Top (footer) -----
      const footerBackTop = document.getElementById('footerBackTop');
      if (footerBackTop) {
        footerBackTop.addEventListener('click', function() {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      // ----- Sticky CTA and Back to Top (global) -----
      const sticky = document.getElementById('stickyCta');
      const backTop = document.getElementById('backToTop');
      window.addEventListener('scroll', function() {
        const st = window.scrollY;
        if (st > 400) {
          if (sticky) sticky.classList.add('visible');
          if (backTop) backTop.classList.add('visible');
        } else {
          if (sticky) sticky.classList.remove('visible');
          if (backTop) backTop.classList.remove('visible');
        }
      }, { passive: true });
      if (backTop) {
        backTop.addEventListener('click', function() {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      // ----- Cursor (desktop only) -----
      const dot = document.getElementById('cursorDot');
      const ring = document.getElementById('cursorRing');
      let mx = 0, my = 0, rx = 0, ry = 0;
      if (dot && ring && window.matchMedia('(min-width:769px)').matches) {
        document.addEventListener('mousemove', function(e) {
          mx = e.clientX;
          my = e.clientY;
          dot.style.left = mx + 'px';
          dot.style.top = my + 'px';
          document.querySelectorAll('.magnetic-btn').forEach(function(b) {
            const r = b.getBoundingClientRect();
            const cx = r.left + r.width/2, cy = r.top + r.height/2;
            const dx = e.clientX - cx, dy = e.clientY - cy;
            const dist = Math.sqrt(dx*dx + dy*dy);
            b.style.transform = dist < 120 ? 'translate(' + (dx/6) + 'px,' + (dy/6) + 'px)' : 'translate(0,0)';
          });
        });
        function animRing() {
          rx += (mx - rx) * 0.18;
          ry += (my - ry) * 0.18;
          ring.style.left = rx + 'px';
          ring.style.top = ry + 'px';
          requestAnimationFrame(animRing);
        }
        animRing();
        document.addEventListener('mouseover', function(e) {
          if (e.target.closest('a, button, .btn, .kk-item, .service-card, .bundle-card, .process-step, .benefit-item, .video-card, .testimonial-card, .value-card, .audience-card')) {
            dot.classList.add('hovering');
            ring.classList.add('hovering');
          }
        });
        document.addEventListener('mouseout', function(e) {
          if (e.target.closest('a, button, .btn, .kk-item, .service-card, .bundle-card, .process-step, .benefit-item, .video-card, .testimonial-card, .value-card, .audience-card')) {
            dot.classList.remove('hovering');
            ring.classList.remove('hovering');
          }
        });
      }

      // ----- Scroll Progress -----
      const progress = document.getElementById('scrollProgress');
      window.addEventListener('scroll', function() {
        const st = window.scrollY;
        const dh = document.documentElement.scrollHeight - window.innerHeight;
        if (progress) progress.style.width = (dh > 0 ? (st / dh) * 100 : 0) + '%';
      }, { passive: true });

      console.log('✅ Loader: All interactive elements bound.');
    }, 100); // small delay to ensure DOM is ready
  }

  // ─── RUN ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();