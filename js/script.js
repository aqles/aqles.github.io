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
	// fallback 10 detik
		setTimeout(() => {
		  const pre = document.getElementById('preloader');
		  if (pre) pre.style.display = 'none';
		}, 5000);
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
	
  // Interactive Terminal Logic
	const termInput = document.getElementById('terminal-input');
	const termOutput = document.getElementById('terminal-output');

	let userCoords = null;

	// Minta izin geolocation dan simpan coords
	if (navigator.geolocation) {
	  navigator.geolocation.getCurrentPosition(pos => {
		userCoords = {
		  lat: pos.coords.latitude,
		  lon: pos.coords.longitude
		};
	  });
	}

	const startTime = Date.now();
	const quotes = [
	  `“Talk is cheap. Show me the code.” – Linus Torvalds`,
	  `“Programs must be written for people to read.” – Harold Abelson`,
	  `“First, solve the problem. Then, write the code.” – John Johnson`,
	  `Janganlah kalian memandang rendah kebaikan, meskipun hanya sekadar menjawab salam kepada saudaramu.
	HR. Muslim`,
	  `Barangsiapa yang memelihara adabnya, maka ia telah memelihara agamanya.
	HR. Al-Bukhari`,
	  `Barangsiapa yang memperbaiki akhlaknya, maka ia telah menyempurnakan imannya.
	HR. Abu Daud`,
	  `Jangan marahi anak-anak karena menangis, karena mereka seperti burung kecil yang takut kehilangan.
	HR. Tirmidzi (disebutkan dalam konteks kelembutan)`,
	  `Jangan kalian dengki, jangan saling membenci, jangan saling memutus hubungan, dan jadilah kalian hamba Allah yang bersaudara.
	HR. Al-Bukhari`,
	  `Perumpamaan orang yang mengingat Allah dan yang tidak mengingat-Nya adalah seperti orang hidup dan mati.
	HR. Al-Bukhari`,
	  `Barangsiapa yang beriman kepada Allah dan hari akhir, maka hendaklah dia berkata yang baik atau diam.
	HR. Abu Hurairah (dikutip dari riwayat Bukhari-Muslim secara maknawi)`,
	  `Tempat yang paling dicintai Allah adalah masjid, dan tempat yang paling dibenci Allah adalah pasar.
	HR. Abu Hurairah (dalam beberapa riwayat disebutkan oleh Tirmidzi)`,
	  `Orang mukmin yang paling sempurna imannya adalah yang paling baik akhlaknya.
	HR. Abu Daud no. 4682 dan Ibnu Hibban`
	];

	const commands = {
	  help: () => 'Available: help, about, contact, clear, date, time, uptime, projects, skills, joke, quote, weather, ascii, echo, calc, random, ip.',
	  about: () => 'Hai, aku Aql, IT enthusiast & penyuka kopi, salam kenal!',
	  contact: () => 'Email: aql@ednasalam.com | GitHub: github.com/aqles | LinkedIn: linkedin.com/in/ednasalam',
	  date: () => new Date().toLocaleDateString(),
	  time: () => new Date().toLocaleTimeString(),
	  uptime: () => {
		const sec = Math.floor((Date.now() - startTime) / 1000);
		return `Uptime: ${sec} detik`;
	  },
	  projects: () => '1. My Portfolio – https://ednasalam.com\n2. AI Chatbot – https://ai.ednasalam.com',
	  skills: () => '• JavaScript [█████▓░░░░░] 50%\n• Three.js    [████░░░░░░░] 40%\n• CSS Anim    [██████▓░░░░] 60%',
	  joke: async () => {
		  try {
			const res = await fetch('https://official-joke-api.appspot.com/random_joke');
			const { setup, punchline } = await res.json();
			return `${setup} <br>— ${punchline}`;
		  } catch {
			return 'Ups, gagal ambil joke. Coba lagi ya! Hehehe';
		  }
		},
	  quote: () => quotes[Math.floor(Math.random() * quotes.length)],
	  weather: async () => {
		  if (!userCoords) return 'Geolocation belum diizinkan.';
		  try {
			const { lat, lon } = userCoords;
			const res = await fetch(
			  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
			);
			const data = await res.json();
			const temp = data.current_weather.temperature.toFixed(1);
			const wind = data.current_weather.windspeed.toFixed(1);
			return `Suhu: ${temp}°C, Angin: ${wind} m/s`;
		  } catch {
			return 'Gagal ambil data cuaca.';
		  }
		},
	  ascii: () => `                                              
 _______ _______ _______ _______ _______ _______ _______ 
|\     /|\     /|\     /|\     /|\     /|\     /|\     /|
| +---+ | +---+ | +---+ | +---+ | +---+ | +---+ | +---+ |
| |   | | |   | | |   | | |   | | |   | | |   | | |   | |
| |h  | | |a  | | |n  | | |o  | | |m  | | |a  | | |n  | |
| +---+ | +---+ | +---+ | +---+ | +---+ | +---+ | +---+ |
|/_____\|/_____\|/_____\|/_____\|/_____\|/_____\|/_____\|
                                                         
       `.trim(),
	  echo: args => args.join(' '),
	  calc: args => {
		try { return eval(args.join(' ')).toString(); }
		catch { return 'Expression invalid.'; }
	  },
	  ip: async () => {
		try {
		  const res = await fetch('https://api.ipify.org?format=json');
		  const obj = await res.json();
		  return `Your IP: ${obj.ip}`;
		} catch (err) {
		  return 'Gagal ambil IP.';
		}
	  },
	  random: () => `Random: ${Math.floor(Math.random() * 100) + 1}`
	};

	termInput.addEventListener('keydown', async e => {
	  if (e.key !== 'Enter') return;
	  const raw = termInput.value.trim();
	  const [cmd, ...args] = raw.toLowerCase().split(' ');
	  termOutput.innerHTML += `<p><span class="prompt">$></span> ${raw}</p>`;

	  if (cmd === 'clear') {
		termOutput.innerHTML = '';
	  } else if (commands[cmd]) {
		let res = commands[cmd];
		res = typeof res === 'function' ? await res(args) : res;
		termOutput.innerHTML += `<p>${res.replace(/\n/g,'<br>')}</p>`;
	  } else {
		termOutput.innerHTML += `<p>Command not found: <span class="accent">${cmd}</span>. Type <span class="accent">help</span>.</p>`;
	  }

	  termOutput.scrollTop = termOutput.scrollHeight;
	  termInput.value = '';
	});

});