// public/js/terminal/commands.js
// Semua definisi command, helper, dan data statis
let chatHistory = [];

export const startTime = Date.now();

export async function getCoords(city) {
  const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
  const data = await res.json();
  if (!data.length) throw new Error('Kota tidak ditemukan');
  return { lat: +data[0].lat, lon: +data[0].lon };
}

export function gmailDotTrick(email, maxCount = 100) {
  const [username, domain] = email.split('@');
  if (!username || domain.toLowerCase() !== 'gmail.com') {
    return 'Format salah yaa~ 😢 Coba: dottrick namaku@gmail.com 30';
  }

  const results = new Set();

  const recurse = (current, index) => {
    for (let i = index; i < username.length - 1; i++) {
      const withDot = current.slice(0, i + 1) + '.' + current.slice(i + 1);
      if (!withDot.includes('..')) {
        results.add(withDot);
        if (results.size >= maxCount) return;
        recurse(withDot, i + 2);
      }
      if (results.size >= maxCount) return;
    }
  };

  recurse(username, 0);
  return [...results].join('\n');
};

export const weatherCodeMap = {
  0: 'Cerah', 1:'Sebagian berawan',2:'Berawan',3:'Mendung',
  45:'Berkabut',48:'Kabut beku',51:'Gerimis ringan',
  53:'Gerimis sedang',55:'Gerimis lebat',61:'Hujan ringan',
  63:'Hujan sedang',65:'Hujan lebat',71:'Salju ringan',
  73:'Salju sedang',75:'Salju lebat',80:'Hujan deras',
  81:'Hujan sangat deras',82:'Hujan ekstrem'
};

// Daftar quotes
export const quotes = [
  `“Talk is cheap. Show me the code.” – Linus Torvalds`,
  `“Programs must be written for people to read.” – Harold Abelson`,
	  `“First, solve the problem. Then, write the code.” – John Johnson`,
	  `“Janganlah kalian memandang rendah kebaikan, meskipun hanya sekadar menjawab salam kepada saudaramu.”
	HR. Muslim`,
	  `“Barangsiapa yang memelihara adabnya, maka ia telah memelihara agamanya.”
	HR. Al-Bukhari`,
	  `“Barangsiapa yang memperbaiki akhlaknya, maka ia telah menyempurnakan imannya.”
	HR. Abu Daud`,
	  `“Jangan marahi anak-anak karena menangis, karena mereka seperti burung kecil yang takut kehilangan.”
	HR. Tirmidzi (disebutkan dalam konteks kelembutan)`,
	  `“Jangan kalian dengki, jangan saling membenci, jangan saling memutus hubungan, dan jadilah kalian hamba Allah yang bersaudara.”
	HR. Al-Bukhari`,
	  `“Perumpamaan orang yang mengingat Allah dan yang tidak mengingat-Nya adalah seperti orang hidup dan mati.”
	HR. Al-Bukhari`,
	  `“Barangsiapa yang beriman kepada Allah dan hari akhir, maka hendaklah dia berkata yang baik atau diam.”
	HR. Abu Hurairah (dikutip dari riwayat Bukhari-Muslim secara maknawi)`,
	  `“Tempat yang paling dicintai Allah adalah masjid, dan tempat yang paling dibenci Allah adalah pasar.”
	HR. Abu Hurairah (dalam beberapa riwayat disebutkan oleh Tirmidzi)`,
	  `“Orang mukmin yang paling sempurna imannya adalah yang paling baik akhlaknya.”
	HR. Abu Daud no. 4682 dan Ibnu Hibban`
];

export const commands = {
  help:    () => 'Available: help, about, contact, clear, clearhistory, date, time, dottrick, weather, uptime, projects, skills, joke, quote, ascii, echo, calc, random, ip, techstack, experience and ask',
  about:   () => 'Hai, aku Aql, IT enthusiast & penyuka kopi, salam kenal!',
  contact: () => 'Email: aql@ednasalam.com | GitHub: github.com/aqles | LinkedIn: linkedin.com/in/ednasalam',
  date:    () => new Date().toLocaleDateString(),
  time:    () => new Date().toLocaleTimeString(),
  uptime:  () => `Uptime: ${Math.floor((Date.now()-startTime)/1000)} detik`,
  projects:() => '1. My Portfolio – https://ednasalam.com\n2. AI Chatbot – https://ai.ednasalam.com',
  skills:  () => `Skill Progress ✨

  • JavaScript (ES6+)             [████████░░] 80%
  • TypeScript                    [███████░░░] 70%
  • React & Next.js               [███████▓░░] 75%
  • Node.js & Express.js          [██████░░░░] 65%
  • RESTful API Design            [██████░░░░] 65%
  • Database Management (MongoDB) [██████░░░░] 65%
  • Authentication & AuthZ        [█████▓░░░░] 55%
  • CSS & Tailwind CSS            [██████░░░░] 60%
  • HTML5 & Semantik              [███████░░░] 70%
  • Cloud Deployment (GitHub, CF) [████▓░░░░░] 50%
  • AI Integration                [█████░░░░░] 55%
  • Prompt Engineering            [████▓░░░░░] 50%
  • Testing (Jest, RTL)           [███▓░░░░░░] 40%
  • Version Control (Git)         [██████░░░░] 60%
  • Three.js & 3D Animations      [███▓░░░░░░] 40%
  • CI/CD Basics                  [███░░░░░░░] 35%`, 
  joke:    async()=>{try {
			const res = await fetch('https://official-joke-api.appspot.com/random_joke');
			const { setup, punchline } = await res.json();
			return `${setup} <br>— ${punchline}`;
		  } catch {
			return 'Ups, gagal ambil joke. Coba lagi ya! Hehehe';
		  }},
  quote:   ()=> quotes[Math.floor(Math.random()*quotes.length)],
  ascii:   async()=>{try {
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
		  }},
  echo:    args=> args.join(' '),
  calc:    args=> { try{ return eval(args.join(' ')) }catch{ return 'Expression invalid.' }},
  ip:      async()=>{try {
		  const res = await fetch('/api/ip');
		  const obj = await res.json();
		  return `Your IP: ${obj.ip}`;
		} catch (err) {
		  return 'Gagal ambil IP.';
		}},
  dottrick: args => {
 	if (!args[0]) {
   	return 'Format: dottrick <email@gmail.com> [maxCount]';
 	}
 	return gmailDotTrick(args[0], parseInt(args[1], 10) || 100);
   },
  weather: async args=>{const helpMsg = 'Format: <span class="accent">weather &lt;nama kota&gt;</span><br>Contoh: <code>weather Jakarta</code>. Jangan pakai in atau di';
		
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
		  }},
  random:  ()=>`Random: ${Math.floor(Math.random()*100)+1}`,
  techstack:()=> 'HTML, CSS, JavaScript, Three.js, Node.js, React, GSAP, Lottie',
  clearhistory:()=>{chatHistory.length = 0;
		  return 'Chat history cleared.';},
  experience:()=> '2015 ─ People Management Intern PT. Pertamina (Persero)\n' +
		'2016 ─ Planning & Schedulling Net Mediatama TV\n' +
		'2017 ─ Web Dev Freelance\n'+
		'2019 ─ Consultant Pemprov DKI Jakarta',
  ask:     async args=>{const currentInput = args.join(' ');
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
		  }}
};
