// public/js/main.js
import { initThemeSwitcher } from './theme/toggle.js';
import { initUIEffects }     from './ui-effects/ui-effects.js';
import { initParticles }     from './particles/init-particles.js';
import { initFormSubmit }    from './form/submit.js';
import { initPreloader }     from './preloader/preloader.js';
import { initTerminal }      from './terminal/core.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initUIEffects();
  initFormSubmit();
  initTerminal();
  initParticles();
  initPreloader();
});
