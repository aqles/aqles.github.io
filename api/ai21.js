// api/ai21.js
export default async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.AI21_API_KEY;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const response = await fetch(
      'https://api.ai21.com/studio/v1/j1-large/complete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt,           // teks user
          maxTokens: 264,    // panjang jawaban
          temperature: 0.7, // randomness
          topP: 0.9,        // nucleus sampling
          topKReturn: 1,    // jumlah alternatif
          stopSequences: ["\n"]
        })
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('AI21 Error Body:', errBody);
      return res
        .status(response.status)
        .json({ error: 'AI21 inference failed', details: errBody });
    }

    const data = await response.json();
    // path data.completions[0].data.text sesuai spec completion API
    const reply = data.completions?.[0]?.data?.text?.trim();
    return res
      .status(200)
      .json({ reply: reply || 'AI belum bisa jawab itu.' });
  } catch (err) {
    console.error('AI21 API error:', err);
    return res.status(500).json({ error: 'Gagal menghubungi AI' });
  }
}
