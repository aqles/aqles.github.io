// script.js

document.addEventListener('DOMContentLoaded', () => {
  // ——— Fungsi sanitizeResponse ———
  function sanitizeResponse(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
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

  // Shrink header on scroll
	const header = document.getElementById('main-header');
	window.addEventListener('scroll', () => {
	  if (window.scrollY > 50) {
		header.classList.add('scrolled');
	  } else {
		header.classList.remove('scrolled');
	  }
	});

  // Mobile nav toggle
	const navLinks = document.querySelector('.nav-links');
	const navToggle = document.getElementById('nav-toggle');
	navToggle.addEventListener('click', () => {
	  navLinks.classList.toggle('open');
	  // Animate hamburger into X
	  navToggle.classList.toggle('active');
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
	// fallback 5 detik
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
	
	const chatHistory = [];
	async function getCoords(city) {
	  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
	  const data = await res.json();
	  if (data.length === 0) throw new Error('Kota tidak ditemukan');
	  return {
	    lat: parseFloat(data[0].lat),
	    lon: parseFloat(data[0].lon)
	  };
	};
	const weatherCodeMap = {
	  0: 'Cerah',
	  1: 'Sebagian berawan',
	  2: 'Berawan',
	  3: 'Mendung',
	  45: 'Berkabut',
	  48: 'Kabut beku',
	  51: 'Gerimis ringan',
	  53: 'Gerimis sedang',
	  55: 'Gerimis lebat',
	  61: 'Hujan ringan',
	  63: 'Hujan sedang',
	  65: 'Hujan lebat',
	  71: 'Salju ringan',
	  73: 'Salju sedang',
	  75: 'Salju lebat',
	  80: 'Hujan deras',
	  81: 'Hujan sangat deras',
	  82: 'Hujan ekstrem',
	};
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
//List command
	const commands = {
	  help: () => 'Available: help, about, contact, clear, clearhistory, date, time, weather, uptime, projects, skills, joke, quote, ascii, echo, calc, random, ip, techstack, experience and Ask for Asking',
	  about: () => 'Hai, aku Aql, IT enthusiast & penyuka kopi, salam kenal!',
	  contact: () => 'Email: aql@ednasalam.com | GitHub: github.com/aqles | LinkedIn: linkedin.com/in/ednasalam',
	  date: () => new Date().toLocaleDateString(),
	  time: () => new Date().toLocaleTimeString(),
	  uptime: () => {
		const sec = Math.floor((Date.now() - startTime) / 1000);
		return `Uptime: ${sec} detik`;
	  },
	  projects: () => '1. My Portfolio – https://ednasalam.com\n2. AI Chatbot – https://ai.ednasalam.com',
	  skills: () => `
  Skill Progress ✨

  • JavaScript     [█████▓░░░░░] 50%
  • Three.js       [████░░░░░░░] 40%
  • CSS Animation  [██████▓░░░░] 60%
  • HTML           [███████▓░░░] 70%
  • React          [█████▓░░░░░] 50%
  • Tailwind CSS   [██████░░░░░] 60%
  • Node.js        [████▓░░░░░░] 45%
  • Express.js     [███▓░░░░░░░] 35%
  • MongoDB        [███░░░░░░░░] 30%
  • Git & GitHub   [██████▓░░░░] 65%
  • TypeScript     [███▓░░░░░░░] 35%
  		`;
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
	  ascii: async () => {
		try {
		const prompt = `
		Generate one random, cute or cool ASCII art. Do not include any explanation or extra text—only output the ASCII art itself.

		Example:
		(>'-')> 
		  ( •_•)>⌐■-■

		From now on, always create something unique and different.
		`;

			const res = await fetch('/api/ai21', {
			  method: 'POST',
			  headers: { 'Content-Type': 'application/json' },
			  body: JSON.stringify({ prompt })
			});

			const { reply } = await res.json();
			return reply || 'AI belum bisa buat ASCII... :(';
		  } catch (err) {
			console.error('ASCII error:', err);
			return 'Gagal ambil ASCII dari AI.';
		  }
		},
	  echo: args => args.join(' '),
	  calc: args => {
		try { return eval(args.join(' ')).toString(); }
		catch { return 'Expression invalid.'; }
	  },
	  ip: async () => {
		try {
		  const res = await fetch('/api/ip');
		  const obj = await res.json();
		  return `Your IP: ${obj.ip}`;
		} catch (err) {
		  return 'Gagal ambil IP.';
		}
	  },
	  weather: async (args) => {
		  const helpMsg = 'Format: <span class="accent">weather &lt;nama kota&gt;</span><br>Contoh: <code>weather Jakarta</code>. Jangan pakai in atau di';
		
		  if (!args || args.length === 0) {
		    return `Kamu belum kasih nama kotanya nih~ 🥺<br>${helpMsg}`;
		  }
		
		  const city = args.join(' ').trim();
		  if (city.length < 2) {
		    return `Nama kota terlalu pendek atau gak valid 😢<br>${helpMsg}`;
		  }
		
		  try {
		    const { lat, lon } = await getCoords(city);
		
		    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
		    const data = await res.json();
		    const cuaca = data.current_weather;
		
		    const suhu = cuaca.temperature.toFixed(1);
		    const angin = cuaca.windspeed.toFixed(1);
		    const kode = cuaca.weathercode;
		    const deskripsi = weatherCodeMap[kode] || 'Tidak diketahui';
		
		    const cuacaRingkas = `Cuaca di ${city} saat ini adalah ${deskripsi}, suhu ${suhu}°C, angin ${angin} m/s.`;
		
		    const aiRes = await fetch('/api/ai21', {
		      method: 'POST',
		      headers: { 'Content-Type': 'application/json' },
		      body: JSON.stringify({
		        prompt: `Berikan saran atau komentar positif dan ceria yang simpel dan pendek berdasarkan kondisi beriku:\n${cuacaRingkas}`
		      })
		    });
		
		    const { reply } = await aiRes.json();
		    return `${cuacaRingkas}<br><br>${reply}`;
		  } catch (err) {
		    console.error(err);
		    return `Gagal mengambil data cuaca untuk <strong>${city}</strong> 😢<br>Coba pastikan penulisannya benar yaa 💌`;
		  }
		},
	  random: () => `Random: ${Math.floor(Math.random() * 100) + 1}`,
	  techstack: () => 
		'HTML, CSS, JavaScript, Three.js, Node.js, React, GSAP, Lottie',
	  clearhistory: () => {
		  chatHistory.length = 0;
		  return 'Chat history cleared.';
		},
	  experience: () =>
		'2015 ─ People Management Intern PT. Pertamina (Persero)\n' +
		'2016 ─ Planning & Schedulling Net Mediatama TV\n' +
		'2017 ─ Web Dev Freelance\n'+
		'2019 ─ Consultant Pemprov DKI Jakarta',
	  ask: async (args) => {
		 const currentInput = args.join(' ');
	 	 if (!currentInput) return 'Usage: ask <pertanyaan>';
		  const formattedHistory = chatHistory
		    .slice(-6)
		    .join('\n');
		  const prompt = `${formattedHistory}\nUser: ${currentInput}\nAI:`;
		
		  try {
		    const res = await fetch(`${window.location.origin}/api/ai21`, {
		      method: 'POST',
		      headers: { 'Content-Type': 'application/json' },
		      body: JSON.stringify({ prompt })
		    });
		
		    if (!res.ok) throw new Error(`Status ${res.status}`);
		
		    const { reply, error } = await res.json();
		    const cleanReply = reply?.trim() ?? error ?? 'AI belum bisa jawab itu.';
		
		    // Simpan ke chatHistory untuk konteks selanjutnya
		    chatHistory.push(`User: ${currentInput}`);
		    chatHistory.push(`AI: ${cleanReply}`);
		
		    return cleanReply;
		  } catch (err) {
		    console.error('Fetch AI error:', err);
		    return `Gagal konek ke AI: ${err.message}`;
		  }
		},
	};

	termInput.addEventListener('keydown', async e => {
	  if (e.key !== 'Enter') return;
	  const raw = termInput.value.trim();
	  termOutput.innerHTML += `<p><span class="prompt">$></span> ${raw}</p>`;
	 // ===== Fallback AI dengan indikator thinking... =====
	      const thinkingEl = document.createElement('p');
	      thinkingEl.classList.add('thinking');
	      thinkingEl.textContent = 'thinking...';
	      termOutput.appendChild(thinkingEl);
	      termOutput.scrollTop = termOutput.scrollHeight;
	
	  const [cmd, ...args] = raw.toLowerCase().split(' ');
	  
	  try {
	    let output;
	
	    if (cmd === 'clear') {
	      termOutput.innerHTML = '';
	      output = null;
	    } else if (commands[cmd]) {
	      output = await commands[cmd](args);
	    } else {
	      output = await commands.ask([raw]);
	    }
	    thinkingEl.remove();
	    if (output !== null) {
			const respEl = document.createElement('p');
			let parsedHTML;

			if (/[\s\S]{3,}/.test(output) && !output.includes('<') && output.includes('\n')) {
			  parsedHTML = `<pre>${sanitizeResponse(output)}</pre>`;
			} else {
			  parsedHTML = marked.parse(output);
			}

			respEl.innerHTML = parsedHTML;
			termOutput.appendChild(respEl);
	    }
	  } catch (err) {
	    thinkingEl.remove();
	    const errEl = document.createElement('p');
	    errEl.textContent = `Error: ${err.message}`;
	    termOutput.appendChild(errEl);
	    console.error('Command execution error:', err);
	  }

	  termOutput.scrollTop = termOutput.scrollHeight;
	  termInput.value = '';
	});

});
