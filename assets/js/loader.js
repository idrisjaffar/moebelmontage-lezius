/**
 * assets/js/loader.js
 * Raphael Lezius – Shared Nav + Footer loader
 */
(function () {
  'use strict';

  // ── Minimal fallbacks (keep them short – real content lives in components/) ──
  const NAV_FALLBACK = `
    <nav class="rl-nav" id="mainNav">
      <div class="rl-nav__inner">
        <a href="index.html" class="rl-nav__brand">Raphael <span>Lezius</span></a>
        <ul class="rl-nav__links">
          <li class="nav-dropdown">
            <a href="#" class="nav-link">Services <i class="fas fa-chevron-down"></i></a>
            <div class="nav-dropdown-content">
              <a href="services.html"><i class="fas fa-th-list"></i> Übersicht</a>
              <a href="services/moebel-kuechen.html"><i class="fas fa-couch"></i> Möbel & Küchen</a>
              <a href="services/usm-haller.html"><i class="fas fa-gem"></i> USM Haller</a>
              <a href="services/garten-outdoor.html"><i class="fas fa-tree"></i> Garten & Outdoor</a>
              <a href="services/demontage-umzug.html"><i class="fas fa-truck"></i> Demontage & Umzug</a>
              <a href="services/buero-objekt.html"><i class="fas fa-building"></i> Büro & Objekt</a>
              <a href="services/premium-pro.html"><i class="fas fa-crown"></i> Premium Pro</a>
            </div>
          </li>
          <li class="nav-dropdown">
            <a href="#" class="nav-link">Bundles <i class="fas fa-chevron-down"></i></a>
            <div class="nav-dropdown-content">
              <a href="bundles/"><i class="fas fa-gift"></i> Übersicht</a>
              <a href="bundles/kuechen-komplett.html"><i class="fas fa-utensils"></i> Küchen-Komplett</a>
              <a href="bundles/usm-all-in.html"><i class="fas fa-gem"></i> USM All-In</a>
              <a href="bundles/umzug-premium.html"><i class="fas fa-truck"></i> Umzug Premium</a>
            </div>
          </li>
          <li><a href="about.html" class="nav-link">Über mich</a></li>
          <li><a href="reviews.html" class="nav-link">Ihre Stimmen</a></li>
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
        <a href="index.html" class="mobile-link">Start</a>
        <a href="services.html" class="mobile-link"><i class="fas fa-th-list"></i> Services</a>
        <a href="services/moebel-kuechen.html" class="mobile-link">– Möbel & Küchen</a>
        <a href="services/usm-haller.html" class="mobile-link">– USM Haller</a>
        <a href="services/garten-outdoor.html" class="mobile-link">– Garten & Outdoor</a>
        <a href="services/demontage-umzug.html" class="mobile-link">– Demontage & Umzug</a>
        <a href="services/buero-objekt.html" class="mobile-link">– Büro & Objekt</a>
        <a href="services/premium-pro.html" class="mobile-link">– Premium Pro</a>
        <a href="bundles/" class="mobile-link"><i class="fas fa-gift"></i> Bundles</a>
        <a href="bundles/kuechen-komplett.html" class="mobile-link">– Küchen-Komplett</a>
        <a href="bundles/usm-all-in.html" class="mobile-link">– USM All-In</a>
        <a href="bundles/umzug-premium.html" class="mobile-link">– Umzug Premium</a>
        <a href="about.html" class="mobile-link">Über mich</a>
        <a href="reviews.html" class="mobile-link">Ihre Stimmen</a>
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

  const FOOTER_FALLBACK = `<!-- paste a shortened version of your footer.html here if needed -->`;

  function getBase() {
    const baseEl = document.querySelector('base');
    if (baseEl && baseEl.href) return baseEl.getAttribute('href');
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length && parts[parts.length - 1].includes('.')) parts.pop();
    return parts.length === 0 ? './' : '../'.repeat(parts.length);
  }

  async function loadComponent(selector, path, fallback) {
    const el = document.querySelector(selector);
    if (!el) return;

    const url = getBase() + path;
    const cacheKey = 'rl-' + path;

    // 1. Try cache first (fast)
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      el.innerHTML = cached;
    }

    // 2. Fetch live version
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      const html = await res.text();
      if (html.trim()) {
        el.innerHTML = html;
        localStorage.setItem(cacheKey, html);
        return;
      }
    } catch (e) {
      console.warn('Could not load', path, '→ using fallback');
    }

    // 3. Fallback
    if (!el.innerHTML.trim()) {
      el.innerHTML = fallback || '<p style="color:red;text-align:center;padding:20px">Component missing</p>';
    }
  }

  function bindUI() {
    // Mobile menu
    const toggle = document.getElementById('navToggle');
    const menu   = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('navBackdrop');

    function open() {
      menu?.classList.add('open');
      backdrop?.classList.add('active');
      toggle?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      menu?.classList.remove('open');
      backdrop?.classList.remove('active');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle?.addEventListener('click', () => menu?.classList.contains('open') ? close() : open());
    backdrop?.addEventListener('click', close);
    document.getElementById('mobileClose')?.addEventListener('click', close);
    menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

    // Theme
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const html = document.documentElement;
        const next = (html.getAttribute('data-theme') || 'dark') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('rl-theme', next);
        document.querySelectorAll('[data-theme-icon]').forEach(i => {
          i.className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        });
        const meta = document.getElementById('themeColorMeta');
        if (meta) meta.content = next === 'dark' ? '#0B0A09' : '#F9F7F2';
      });
    });

    // Newsletter
    const form = document.getElementById('newsletterForm');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Willkommen!';
        setTimeout(() => { btn.innerHTML = orig; form.reset(); }, 2500);
      });
    }

    // Active page highlighting
    const path = location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.rl-nav a, .rl-nav__mobile a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const full = new URL(href, location.href).pathname.replace(/\/$/, '') || '/';
      if (full === path || (path.endsWith(href) && href !== 'index.html')) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  async function init() {
    await Promise.all([
      loadComponent('#nav-placeholder', 'components/nav.html', NAV_FALLBACK),
      loadComponent('#footer-placeholder', 'components/footer.html', FOOTER_FALLBACK)
    ]);
    // small delay so DOM is fully parsed
    setTimeout(bindUI, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();