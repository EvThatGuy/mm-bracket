// /api/auth.js — Vercel Serverless Function
// Simple password authentication against environment variable

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const APP_PASSWORD = process.env.APP_PASSWORD;

  if (!APP_PASSWORD) {
    return res.status(500).json({ error: 'APP_PASSWORD not configured in Vercel environment variables' });
  }

  const { password } = req.body || {};

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  if (password === APP_PASSWORD) {
    // Generate a simple session token (timestamp + hash)
    const token = Buffer.from(`${APP_PASSWORD}-${Date.now()}`).toString('base64');
    return res.status(200).json({ success: true, token });
  }

  return res.status(401).json({ success: false, error: 'Invalid password' });
}
