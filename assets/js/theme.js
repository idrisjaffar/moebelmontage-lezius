/* ============================================================
   RAPHAEL LEZIUS – THEME.JS
   Smooth Dark / Light Mode Manager
   ============================================================ */

(function () {
  const html = document.documentElement;
  const STORAGE_KEY = 'rl-theme';

  // Get preferred theme
  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Apply theme
  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update icons
    const icons = document.querySelectorAll('[data-theme-icon]');
    icons.forEach(icon => {
      icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });

    // Update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = theme === 'dark' ? '#0C0B09' : '#F8F5F0';
    }
  }

  // Toggle
  function toggleTheme() {
    const current = html.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Init
  setTheme(getPreferredTheme());

  // Expose
  window.RLTheme = {
    toggle: toggleTheme,
    set: setTheme,
    get: () => html.getAttribute('data-theme')
  };

  // Bind all theme toggles
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  });
})();