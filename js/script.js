// script.js

document.addEventListener('DOMContentLoaded', () => {
  // Theme switcher slider
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

  // Particles.js
  if (window.particlesJS) {
    particlesJS.load('particle-bg', 'assets/particles.json', () => {
      console.log('Particles loaded');
    });
  }
  // Particles.js
  if (window.particlesJS) {
    particlesJS.load('particle-bg', 'assets/particles.json', () => {
      console.log('Particles loaded');
    });
  }

  // Form submission via AJAX
  const form = document.getElementById('contact-form');
  const popup = document.getElementById('thank-you-popup');
  const closeBtn = document.getElementById('close-popup');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    fetch('https://formspree.io/f/xzzrrjbj', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(response => {
      if (response.ok) {
        popup.style.display = 'flex';
        form.reset();
      } else {
        alert('Maaf, terjadi kesalahan. Coba lagi nanti.');
      }
    }).catch(() => {
      alert('Maaf, terjadi kesalahan jaringan.');
    });
  });
  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });
  
  // Preloader: sembunyikan setelah window load
	window.addEventListener('load', () => {
	  const pre = document.getElementById('preloader');
	  pre.classList.add('hide');
	  // Optional: benar-benar remove dari DOM setelah fade-out
	  setTimeout(() => pre.remove(), 600);
	});
	
  // Section Reveal on Scroll
	const revealElements = document.querySelectorAll('.reveal');

	const observer = new IntersectionObserver(entries => {
	  entries.forEach(entry => {
		if (entry.isIntersecting) {
		  entry.target.classList.add('visible');
		  observer.unobserve(entry.target); // hanya animasi sekali
		}
	  });
	}, {
	  threshold: 0.1
	});

	revealElements.forEach(el => observer.observe(el));

});