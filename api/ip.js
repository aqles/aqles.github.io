export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('IP Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch IP' });
  }
}
