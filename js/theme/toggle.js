// public/js/theme/toggle.js
// Theme switcher: simpan di localStorage & toggle data-theme
export function initThemeSwitcher() {
  const switchEl = document.getElementById('theme-switch');
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    switchEl.checked = true;
  }
  switchEl.addEventListener('change', () => {
    if (switchEl.checked) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}
