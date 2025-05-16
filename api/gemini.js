// api/gemini.js
export default async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }
  try {
    const response = await fetch(
      // pakai TextBison model
      `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // bentuk body sesuai spec generateText
          prompt: { text: prompt },
          temperature: 0.7,
          maxOutputTokens: 256
        })
      }
    );
    const data = await response.json();
    // candidates[0].output.text selalu ada jika berhasil
    const reply = data.candidates?.[0]?.output?.text
      || 'Maaf, AI belum bisa jawab itu.';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err);
    return res.status(500).json({ error: 'Gemini API failed' });
  }
}
