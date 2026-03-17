// /api/odds.js — Vercel Serverless Function
// Proxies requests to The Odds API with your key stored as an environment variable

export default async function handler(req, res) {
  const ODDS_API_KEY = process.env.ODDS_API_KEY;

  if (!ODDS_API_KEY) {
    return res.status(500).json({ error: 'ODDS_API_KEY not configured. Add it in Vercel Environment Variables.' });
  }

  // Get sport and markets from query params (defaults to NCAAB)
  const sport = req.query.sport || 'basketball_ncaab';
  const markets = req.query.markets || 'h2h,spreads,totals';
  const regions = req.query.regions || 'us';
  const oddsFormat = req.query.oddsFormat || 'american';

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${ODDS_API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=${oddsFormat}`;
    
    const response = await fetch(url);
    const data = await response.json();

    // Forward rate limit headers so frontend knows usage
    const remaining = response.headers.get('x-requests-remaining');
    const used = response.headers.get('x-requests-used');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    return res.status(response.status).json({
      odds: data,
      usage: {
        remaining: remaining ? parseInt(remaining) : null,
        used: used ? parseInt(used) : null
      }
    });

  } catch (error) {
    console.error('Odds API error:', error);
    return res.status(500).json({ error: 'Failed to fetch odds', details: error.message });
  }
}
