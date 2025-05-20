// public/js/particles/init-particles.js
// Inisialisasi particlesJS jika tersedia
export function initParticles() {
  if (window.particlesJS) {
    particlesJS.load('particle-bg', 'assets/particles.json', () => {
      console.log('Particles loaded');
    });
  }
}
