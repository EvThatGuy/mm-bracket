// /api/scores.js — Vercel Serverless Function
// Fetches live and recent scores from The Odds API

export default async function handler(req, res) {
  const ODDS_API_KEY = process.env.ODDS_API_KEY;

  if (!ODDS_API_KEY) {
    return res.status(500).json({ error: 'ODDS_API_KEY not configured' });
  }

  const sport = req.query.sport || 'basketball_ncaab';
  // daysFrom: how many days back to include completed games (1-3)
  const daysFrom = req.query.daysFrom || '2';

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/scores/?apiKey=${ODDS_API_KEY}&daysFrom=${daysFrom}`;
    
    const response = await fetch(url);
    const data = await response.json();

    const remaining = response.headers.get('x-requests-remaining');
    const used = response.headers.get('x-requests-used');

    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.status(response.status).json({
      scores: data,
      usage: {
        remaining: remaining ? parseInt(remaining) : null,
        used: used ? parseInt(used) : null
      }
    });

  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch scores', details: error.message });
  }
}
