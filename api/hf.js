// api/hf.js

export default async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.HF_API_KEY;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    const result = await response.json();
    // Bisa berupa array atau object tergantung model
    const reply = Array.isArray(result)
      ? result[0]?.generated_text?.trim()
      : result?.generated_text?.trim();

    return res.status(200).json({
      reply: reply || 'AI belum bisa jawab itu.'
    });
  } catch (err) {
    console.error('Hugging Face API error:', err);
    return res.status(500).json({
      error: 'Gagal menghubungi AI HuggingFace'
    });
  }
}
