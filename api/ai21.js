// api/ai21.js
export default async function handler(req, res) {
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
          prompt,
		  model: "jamba-large-1.6",
		  messages: [],
		  documents:[],
		  tools:[],
		  n: 1,
          maxTokens: 264,        
          temperature: 0.7
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('AI21 error:', text);
      return res.status(response.status).json({ error: 'AI21 inference failed' });
    }

    const data = await response.json();
    // text keluar di data.completions[0].data.text
    const reply = data.completions?.[0]?.data?.text?.trim();
    return res.status(200).json({ reply: reply || 'AI belum bisa jawab itu.' });
  } catch (err) {
    console.error('AI21 API error:', err);
    return res.status(500).json({ error: 'Gagal menghubungi AI21' });
  }
}
