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
	  help: () => 'Available: help, about, contact, clear, clearhistory, date, time, uptime, projects, skills, joke, quote, ascii, echo, calc, random, ip, techstack, experience and Ask for Asking',
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
	  ascii: () => `                                              
   _____   ________  .____     
  /  _  \  \_____  \ |    |    
 /  /_\  \  /  / \  \|    |    
/    |    \/   \_/.  \    |___ 
\____|__  /\_____\ \_/_______ \
        \/        \__>       \/
                                                         
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
	      const html = marked.parse(answer);
	      respEl.innerHTML = html;
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
