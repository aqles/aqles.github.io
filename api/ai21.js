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
          model: 'jamba-large-1.6',  
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          maxTokens: 256
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
