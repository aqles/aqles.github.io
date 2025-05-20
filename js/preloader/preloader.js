// public/js/preloader/preloader.js
// Hide/remove preloader after load
export function initPreloader() {
  window.addEventListener('load', () => {
    const pre = document.getElementById('preloader');
    pre.classList.add('hide');
    setTimeout(() => pre.remove(), 600);
    setTimeout(() => {
      const p = document.getElementById('preloader');
      if (p) p.style.display = 'none';
    }, 5000);
  });
}
