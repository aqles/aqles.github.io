// api/ai21.js
let ipRequestTimes = new Map(); // <ip, timestamp>

// Expire cache tiap 5 menit
setInterval(() => ipRequestTimes.clear(), 5 * 60 * 1000);

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const now = Date.now();
  const last = ipRequestTimes.get(ip) || 0;

  if (now - last < 3000) {
    return res.status(429).json({ reply: null, error: 'Terlalu cepat. Coba sebentar lagi ya.' });
  }

  ipRequestTimes.set(ip, now);
  
  const { prompt } = req.body;
  const apiKey = process.env.AI21_API_KEY;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const response = await fetch(
      'https://api.ai21.com/studio/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'jamba-large-1.6',  
          messages: [
            { role: 'system', content: 'Kamu adalah ES-AI, asisten virtual yang selalu siap membantu pengguna dengan cara yang kreatif dan ceria. Dibuat oleh orang bernama Aql, seorang IT enthusiast & developer. Jangan sebut diri sebagai AI generik.'
          },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2560
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI21 Chat Error:', errText);
      return res.status(response.status).json({ error: 'AI21 chat failed', details: errText });
    }

    const data = await response.json();
    // Respons chat ada di data.choices[0].message.content
    const reply = data.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ reply: reply || 'AI belum bisa jawab itu.' });
  } catch (err) {
    console.error('AI21 API error:', err);
    return res.status(500).json({ error: 'Gagal menghubungi AI21' });
  }
}
