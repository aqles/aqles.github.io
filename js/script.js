// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    toggle.checked = true;
  }
  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });

  // Typing + Glitch animation
  const el = document.querySelector('.typing');
  const text = 'Hello_World();';
  let idx = 0;
  function type() {
    if (idx < text.length) {
      el.textContent += text.charAt(idx);
      idx++;
      setTimeout(type, 150);
    } else {
      setTimeout(() => {
        el.classList.add('glitch');
        setTimeout(() => {
          el.classList.remove('glitch');
          el.textContent = '';
          idx = 0;
          type();
        }, 200);
      }, 2000);
    }
  }
  type();

  // Particles.js background
  if (window.particlesJS) {
    particlesJS.load('particle-bg', 'assets/particles.json', () => {
      console.log('Particles loaded');
    });
  }
});