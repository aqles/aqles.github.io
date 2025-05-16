// api/hf.js
export default async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.HF_API_KEY;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/google/flan-t5-small',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Hugging Face error body:', err);
      return res.status(response.status).json({ error: 'Model inference error' });
    }

    const result = await response.json();
    // flan-t5-small mengembalikan array dengan generated_text
    const reply = Array.isArray(result)
      ? (result[0]?.generated_text || '').trim()
      : (result.generated_text || '').trim();

    return res.status(200).json({ reply: reply || 'AI belum bisa jawab itu.' });
  } catch (err) {
    console.error('Hugging Face API error:', err);
    return res.status(500).json({ error: 'Gagal menghubungi AI Huhu' });
  }
}
