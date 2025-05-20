// public/js/ui-effects/ui-effects.js
import { sanitizeResponse } from '../utils/sanitize.js';

// Shrink header on scroll & mobile nav toggle
export function initUIEffects() {
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

  const navLinks = document.querySelector('.nav-links');
  const navToggle = document.getElementById('nav-toggle');
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
  });

  // Section reveal
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => observer.observe(el));

  // Typing + glitch
  const el = document.querySelector('.typing');
  const text = 'Hello_World();';
  let idx = 0;
  function type() {
    if (idx < text.length) {
      el.textContent += text.charAt(idx++);
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
}
