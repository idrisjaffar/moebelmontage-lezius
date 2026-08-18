// assets/js/app.js
(function() {
  'use strict';

  function initApp() {

    // ---- 1. CLOCK ----
    function updateClocks() {
      var t = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      document.querySelectorAll('.time-display, .mob-clock-display').forEach(function(el) {
        if (el) el.textContent = t;
      });
    }
    updateClocks();
    setInterval(updateClocks, 1000);

    // ---- 2. SCROLL SHADOW ON NAV ----
    var nav = document.getElementById('masterNav');
    if (nav) {
      window.addEventListener('scroll', function() {
        nav.classList.toggle('is-scrolled', window.scrollY > 36);
      }, { passive: true });
    }

    // ---- 3. MOBILE MENU ----
    var mobileToggle = document.getElementById('mobileMenuToggle');
    var mobileMenu = document.getElementById('fluidMobileMenu');

    function openMobile() {
      if (!mobileMenu || !mobileToggle) return;
      mobileMenu.classList.add('is-open');
      mobileToggle.classList.add('is-active');
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
      if (navigator.vibrate) navigator.vibrate(18);
    }
    function closeMobile() {
      if (!mobileMenu || !mobileToggle) return;
      mobileMenu.classList.remove('is-open');
      mobileToggle.classList.remove('is-active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    }
    if (mobileToggle) {
      mobileToggle.addEventListener('click', function() {
        mobileMenu.classList.contains('is-open') ? closeMobile() : openMobile();
      });
    }
    if (mobileMenu) {
      mobileMenu.querySelectorAll('a, .js-open-contact').forEach(function(el) {
        el.addEventListener('click', function() { setTimeout(closeMobile, 80); });
      });
    }

    // ---- 4. LOGO LIGHTBOX ----
    var brandTrigger = document.getElementById('brandLogoTrigger');
    var logoLightbox = document.getElementById('logoLightbox');
    var closeLogoBtn = document.getElementById('closeLogoLightbox');

    if (brandTrigger && logoLightbox) {
      brandTrigger.addEventListener('click', function() {
        logoLightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        if (navigator.vibrate) navigator.vibrate(10);
      });
      brandTrigger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); brandTrigger.click(); }
      });
    }
    function closeLogo() {
      if (!logoLightbox) return;
      logoLightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    if (closeLogoBtn) closeLogoBtn.addEventListener('click', closeLogo);
    if (logoLightbox) {
      logoLightbox.addEventListener('click', function(e) {
        if (e.target === logoLightbox) closeLogo();
      });
    }

    // ---- 5. ESCAPE KEY ----
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeMobile();
        closeLogo();
      }
    });

    // ---- 6. FOOTER: DYNAMIC YEAR ----
    var yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ---- 7. FOOTER: BACK TO TOP ----
    var btt = document.getElementById('footerBackToTop');
    if (btt) {
      window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
          btt.classList.add('visible');
        } else {
          btt.classList.remove('visible');
        }
      }, { passive: true });
      btt.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // ---- 8. FOOTER: NEWSLETTER ----
    var newsletterForm = document.getElementById('newsletterForm');
    var feedback = document.getElementById('newsletterFeedback');
    if (newsletterForm && feedback) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var emailInput = document.getElementById('newsletterEmail');
        var email = emailInput.value.trim();

        if (!email || !email.includes('@') || !email.includes('.')) {
          feedback.innerHTML = '<span style="color:#ff6b6b;"><i class="fas fa-exclamation-circle"></i> Bitte gültige E-Mail eingeben.</span>';
          feedback.style.display = 'block';
          return;
        }

        feedback.innerHTML = '<span style="color:#51cf66;"><i class="fas fa-check-circle"></i> Vielen Dank! Sie sind jetzt angemeldet.</span>';
        feedback.style.display = 'block';
        emailInput.value = '';

        setTimeout(function() {
          feedback.style.display = 'none';
        }, 5000);
      });
    }

    // ---- 9. CONTACT BUTTON SCROLL ----
    document.querySelectorAll('.js-open-contact').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.getElementById('contact');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        closeMobile();
      });
    });

    console.log('✓ App initialized');
  }

  // Wait for components to load, then init
  if (document.readyState === 'complete') {
    initApp();
  } else {
    document.addEventListener('readystatechange', function() {
      if (document.readyState === 'complete') initApp();
    });
  }

  // Also re-init when components are dynamically loaded
  document.addEventListener('componentsLoaded', initApp);
})();