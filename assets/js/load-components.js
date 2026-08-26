/* ============================================================
   RAPHAEL LEZIUS – Component Loader v2.0
   Loads nav & footer with localStorage cache + inline fallback
   ============================================================ */

(function() {
  'use strict';

  // ── Inline fallback HTML (copy of your nav and footer) ──
  // This ensures the menu always works, even offline.
  const NAV_FALLBACK = `
<nav class="rl-nav" id="mainNav">
  <div class="rl-nav__inner">
    <a href="/" class="rl-nav__brand" aria-label="Zur Startseite">
      Raphael <span>Lezius</span>
      <span class="rl-nav__tagline">Präzision mit Herz</span>
    </a>
    <ul class="rl-nav__links">
      <li><a href="/" class="nav-link" data-section="home">Willkommen</a></li>
      <li><a href="/#services" class="nav-link" data-section="services">Was ich für Sie tue</a></li>
      <li><a href="/#about" class="nav-link" data-section="about">Über mich</a></li>
      <li><a href="/reviews.html" class="nav-link">Ihre Stimmen</a></li>
      <li><a href="/anfrage/" class="cta magnetic-btn"><i class="fas fa-comments"></i> Kostenloses Gespräch</a></li>
    </ul>
    <div class="rl-nav__actions">
      <button class="theme-toggle" data-theme-toggle aria-label="Design umschalten">
        <i class="fas fa-moon" data-theme-icon></i>
      </button>
      <button class="rl-nav__hamburger" id="navToggle" aria-label="Menü öffnen" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>
<div class="rl-nav__mobile" id="mobileMenu" aria-hidden="true">
  <div class="mobile-menu-inner">
    <a href="/" class="mobile-link">Willkommen</a>
    <a href="/#services" class="mobile-link">Was ich für Sie tue</a>
    <a href="/#about" class="mobile-link">Über mich</a>
    <a href="/reviews.html" class="mobile-link">Ihre Stimmen</a>
    <a href="/anfrage/" class="mobile-cta magnetic-btn"><i class="fas fa-comments"></i> Kostenloses Gespräch starten</a>
    <div class="mobile-extra">
      <p>Schön, dass Sie hier sind.</p>
      <button class="theme-toggle" data-theme-toggle style="width:52px; height:52px; font-size:1.2rem; margin-top:16px;">
        <i class="fas fa-moon" data-theme-icon></i>
      </button>
    </div>
  </div>
</div>
  `;

  const FOOTER_FALLBACK = `
<footer class="rl-footer">
  <div class="container">
    <div class="rl-footer-top">
      <div class="rl-footer-brand">
        <div class="logo">Raphael <span>Lezius</span></div>
        <p>Ich freue mich, dass Sie hier sind.<br>Premium Montage mit echter Leidenschaft – millimetergenau, staubfrei und immer mit Herz.</p>
        <div class="rl-footer-trust">
          <span><i class="fas fa-shield-alt"></i> 5 Mio. € versichert</span>
          <span><i class="fas fa-star"></i> 5.0 ★ von 110+ Menschen</span>
          <span><i class="fas fa-clock"></i> Antwort innerhalb 24 h</span>
          <span><i class="fas fa-heart"></i> 1 Jahr persönliche Garantie</span>
        </div>
      </div>
      <div class="rl-footer-newsletter">
        <h4><i class="fas fa-envelope-open-text" style="color:var(--rl-primary)"></i> Bleiben Sie in Verbindung</h4>
        <p>Einmal im Monat sende ich Ihnen nützliche Tipps und exklusive Angebote – nur wenn Sie möchten.</p>
        <form class="newsletter-form" id="newsletterForm">
          <input type="email" placeholder="Ihre E-Mail-Adresse" required aria-label="E-Mail für Newsletter" />
          <button type="submit" class="magnetic-btn">Gerne dabei sein</button>
        </form>
        <div class="newsletter-consent">
          <input type="checkbox" id="consent" required />
          <label for="consent">Ich stimme der <a href="/legal/datenschutz.html" style="color:var(--rl-primary); text-decoration:underline;">Datenschutzerklärung</a> zu und freue mich auf Ihre Nachrichten.</label>
        </div>
      </div>
    </div>
    <div class="rl-footer-grid">
      <div class="rl-footer-col">
        <h5>Was ich für Sie tue</h5>
        <a href="/services/moebel-kuechen.html">Möbel & Küchen</a>
        <a href="/services/usm-haller.html">USM Haller Spezialist</a>
        <a href="/services/garten-outdoor.html">Garten & Outdoor</a>
        <a href="/services/demontage-umzug.html">Demontage & Umzug</a>
        <a href="/services/premium-pro.html">Premium Pro Service</a>
      </div>
      <div class="rl-footer-col">
        <h5>Für Sie</h5>
        <a href="/anfrage/">Kostenloses Gespräch</a>
        <a href="/reviews.html">Ihre Stimmen</a>
        <a href="/faq.html">Häufige Fragen</a>
        <a href="/contact.html">Direkter Kontakt</a>
      </div>
      <div class="rl-footer-col">
        <h5>Über mich</h5>
        <a href="/#about">Wer ich bin</a>
        <a href="/about.html#philosophie">Meine Philosophie</a>
        <a href="/legal/impressum.html">Impressum</a>
      </div>
      <div class="rl-footer-col">
        <h5>Unterstützung</h5>
        <a href="tel:+491608194018"><i class="fas fa-phone-alt" style="margin-right:6px; opacity:0.7;"></i> +49 160 8194018</a>
        <a href="https://wa.me/491608194018" target="_blank" rel="noopener"><i class="fab fa-whatsapp" style="margin-right:6px; opacity:0.7;"></i> WhatsApp schreiben</a>
        <a href="/legal/datenschutz.html">Datenschutz</a>
        <a href="/legal/agb.html">AGB</a>
      </div>
    </div>
    <div class="rl-footer-trustbar">
      <div class="trustbar-item"><i class="fas fa-users"></i><div><div class="label">Vertrauen</div><div class="value">110+ glückliche Kunden</div></div></div>
      <div class="trustbar-item"><i class="fas fa-star"></i><div><div class="label">Bewertung</div><div class="value">5.0 ★ Durchschnitt</div></div></div>
      <div class="trustbar-item"><i class="fas fa-bolt"></i><div><div class="label">Reaktion</div><div class="value">meist innerhalb 24 h</div></div></div>
      <div class="trustbar-item"><i class="fas fa-shield-alt"></i><div><div class="label">Sicherheit</div><div class="value">5 Mio. € versichert</div></div></div>
      <div class="trustbar-item"><i class="fas fa-hand-holding-heart"></i><div><div class="label">Service</div><div class="value">White-Glove mit Herz</div></div></div>
    </div>
    <div class="rl-footer-bottom">
      <div>© 2026 Raphael Lezius · Mit Sorgfalt gemacht in Augsburg</div>
      <div><a href="/legal/impressum.html">Impressum</a> <a href="/legal/datenschutz.html">Datenschutz</a> <a href="/legal/agb.html">AGB</a></div>
      <div class="rl-footer-social">
        <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
        <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
      </div>
    </div>
    <div style="text-align:center; margin-top:28px; font-size:0.88rem; color:var(--rl-dim);">
      <i class="fas fa-heart" style="color:var(--rl-primary); margin-right:6px;"></i>
      Danke, dass Sie sich die Zeit genommen haben. Es bedeutet mir viel.
    </div>
  </div>
</footer>
  `;

  // ── Helper: load component with cache + fallback ──
  async function loadComponent(selector, url, fallbackHtml) {
    const container = document.querySelector(selector);
    if (!container) return;

    // Try cache first
    const cached = localStorage.getItem(url);
    if (cached) {
      container.innerHTML = cached;
      // Still try to update in background
      fetch(url)
        .then(res => res.text())
        .then(html => {
          if (html && html.trim().length > 0) {
            container.innerHTML = html;
            localStorage.setItem(url, html);
          }
        })
        .catch(() => {});
      return;
    }

    // No cache – try fetch
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network error');
      const html = await response.text();
      if (html && html.trim().length > 0) {
        container.innerHTML = html;
        localStorage.setItem(url, html);
        return;
      }
    } catch (error) {
      // fall through
    }

    // Fallback: use inline HTML
    if (fallbackHtml) {
      container.innerHTML = fallbackHtml;
      // Save fallback to cache so next load is instant
      try { localStorage.setItem(url, fallbackHtml); } catch (e) {}
    } else {
      container.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Komponente konnte nicht geladen werden.</p>`;
    }
  }

  // ── Initialize when DOM is ready ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Load nav and footer
    loadComponent('#nav-placeholder', '/components/nav.html', NAV_FALLBACK);
    loadComponent('#footer-placeholder', '/components/footer.html', FOOTER_FALLBACK);

    // ── Re-bind mobile menu after components load ──
    // (We need to wait a moment for the HTML to be inserted)
    setTimeout(() => {
      const navToggle = document.getElementById('navToggle');
      const mobileMenu = document.getElementById('mobileMenu');
      if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function() {
          const isOpen = mobileMenu.classList.toggle('open');
          navToggle.setAttribute('aria-expanded', isOpen);
          mobileMenu.setAttribute('aria-hidden', !isOpen);
          document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        // Close menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', function() {
            mobileMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
          });
        });
      }

      // ── Theme toggle re-bind ──
      document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
        btn.removeEventListener('click', toggleTheme);
        btn.addEventListener('click', toggleTheme);
      });

      // ── Newsletter form (footer) ──
      const form = document.getElementById('newsletterForm');
      if (form) {
        form.removeEventListener('submit', handleNewsletter);
        form.addEventListener('submit', handleNewsletter);
      }
    }, 50);
  }

  // ── Theme toggle function ──
  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('rl-theme', next);
    document.querySelectorAll('[data-theme-icon]').forEach(icon => {
      icon.className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });
    const meta = document.getElementById('themeColorMeta');
    if (meta) meta.content = next === 'dark' ? '#0B0A09' : '#F8F5F0';
  }

  // ── Newsletter handler ──
  function handleNewsletter(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Willkommen an Bord!';
    btn.style.background = 'var(--rl-gradient-hover)';
    setTimeout(() => {
      btn.innerHTML = original;
      this.reset();
    }, 2800);
  }

  // ── Also fix theme on load (if saved) ──
  const savedTheme = localStorage.getItem('rl-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('[data-theme-icon]').forEach(icon => {
      icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });
  }

})();