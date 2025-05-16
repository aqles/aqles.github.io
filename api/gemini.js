// api/gemini.js
export default async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' 
      + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: {
            text: prompt
          },
          // parameter Gemini
          temperature: 0.7,
          maxOutputTokens: 256
        })
      }
    );
    const data = await response.json();
    const reply = data.candidates?.[0]?.output?.text || 'Maaf, AI belum bisa jawab itu.';
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Gemini API failed' });
  }
}
