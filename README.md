# 2026 March Madness Bracket Intelligence System

AI-powered bracket prediction tool with Monte Carlo simulations, game-by-game picks, auto-bracket generation, betting value finder, live tournament tracking, and Claude-powered matchup analysis.

---

## Deploy to Vercel — Step by Step

### 1. Push to GitHub

Open CMD on your machine:

```
cd C:\Users\evmat\OneDrive\Desktop\Projects
mkdir mm-bracket
```

Copy all project files into that folder, then:

```
cd mm-bracket
git init
git add .
git commit -m "March Madness Bracket Intelligence v4"
gh repo create mm-bracket --public --source=. --push
```

If you don't have GitHub CLI, you can also:
- Create a new repo at github.com/EvThatGuy/mm-bracket
- Follow the push instructions GitHub gives you

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `mm-bracket` repository
4. Vercel auto-detects Vite — just click **"Deploy"**
5. Wait ~60 seconds for the build

### 3. Add Your API Key

This is the critical step — the AI features won't work without it:

1. In your Vercel dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** Your API key (starts with `sk-ant-...`)
   - **Environment:** Production, Preview, Development (check all three)
4. Click **Save**
5. Go to **Deployments** → click the three dots on the latest → **Redeploy**

### 4. You're Live

Your app is now at `https://mm-bracket.vercel.app` (or whatever Vercel assigns).

---

## How It Works

### Architecture

```
Browser (React + Vite)
  ├── All prediction logic runs client-side
  ├── localStorage for bracket persistence
  └── /api/claude → Vercel Serverless Function
                      └── Forwards to Anthropic API with your key
```

Your API key **never** reaches the browser. The serverless function at `/api/claude.js` holds it server-side and proxies requests.

### Features (9 modules)

| Tab | What it does |
|-----|-------------|
| **Picks** | Game-by-game predictions for every matchup with confidence tiers and reasoning |
| **Simulate** | Monte Carlo engine — run 1K to 25K tournament simulations |
| **Bracket** | Interactive 3-bracket manager (Chalk, Balanced, Upset Heavy) |
| **Auto-Gen** | One-tap bracket generation at 3 risk levels |
| **Value** | Betting value finder — model odds vs Vegas lines |
| **Matchups** | AI-powered matchup analysis with style clash breakdown and radar charts |
| **Players** | Star player impact ratings with injury flags |
| **Conf** | Conference Power Index — historical over/under-seeding |
| **Tracker** | Live tournament tracker with web-search score fetching and auto-scoring |

### Data

- 68 teams with 15+ ratings each (offense, defense, SOS, momentum, experience, rebounding, turnover rate, 3PT, FT, bench depth, tempo, style, defensive scheme, clutch, star PIR)
- Vegas odds from BetMGM (Selection Sunday)
- Injury data (Michigan Cason ACL, UNC Wilson hand, Louisville Brown back, Texas Tech Toppin)
- Conference performance history since 1985

---

## Local Development

```
npm install
npm run dev
```

For local AI features, create a `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Then run `vercel dev` instead of `npm run dev` to test serverless functions locally.

---

## Cost Estimate

- **Vercel hosting:** Free (hobby tier)
- **Anthropic API:** Each AI matchup analysis or score fetch costs ~$0.01-0.03
- Running 50 AI analyses during the tournament ≈ $1-2 total
- The Monte Carlo simulations, predictions, and bracket generation are all client-side — zero API cost

---

## Updating During the Tournament

The tracker tab has two ways to stay current:

1. **"Fetch Scores" button** — Uses Claude with web search to pull latest results and auto-import them
2. **Manual entry** — Tap the winning team for each game as results come in

Once a round is complete, the system auto-generates predictions for the next round using actual results.
