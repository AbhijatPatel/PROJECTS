# Antriksh — Vedic Astrology & Numerology App

A full-stack astrology app: the frontend collects name, date/time of birth, and
place of birth; the backend computes Mulank & Bhagyank and calls the Claude
API for a symbolic chart reading (planets in houses, love, career, success,
remedies).

## Project structure

```
antriksh-app/
├── server.js          ← Express backend (calls Claude API)
├── package.json
├── .env.example        ← copy to .env and add your key
├── .gitignore
└── public/
    └── index.html      ← frontend (served as a static file by Express)
```

## 1. Prerequisites

- Node.js 16 or newer (check with `node -v`)
- An Anthropic API key: https://console.anthropic.com/settings/keys

## 2. Setup

```bash
# from inside the antriksh-app folder
npm install
cp .env.example .env
```

Open `.env` and paste in your real key:

```
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=3000
```

## 3. Run it

```bash
npm start
```

You should see:

```
╔════════════════════════════════════════╗
║        ANTRIKSH SERVER RUNNING          ║
╠════════════════════════════════════════╣
║  🌟 http://localhost:3000
║  🔮 API: http://localhost:3000/api
║  📊 Reading: POST /api/reading
╚════════════════════════════════════════╝
```

Open **http://localhost:3000** in your browser. That's the whole app — the
frontend is served by the same Express server, and it calls
`/api/reading` on the same origin (no CORS issues, no separate frontend
server needed).

For auto-restart on file changes during development:

```bash
npm run dev
```

## 4. How it works

1. Browser sends `{name, dob, tob, place, mulank, bhagyank}` to
   `POST /api/reading`. Mulank/Bhagyank are computed client-side (pure
   numerology math, no API call needed).
2. `server.js` builds a system + user prompt and calls
   `https://api.anthropic.com/v1/messages` server-side, using your
   `CLAUDE_API_KEY` — the key never reaches the browser.
3. If Claude responds `429` (rate limited) or `529` (overloaded), the server
   retries automatically up to 3 times with exponential backoff.
4. The parsed JSON reading (planets, houses, love/career/success, remedies)
   is sent back to the browser and rendered into the chart wheel and cards.

## 5. Deploying it for real

This is a standard Node/Express app, so any Node host works:

- **Render / Railway / Fly.io**: connect the repo, set `CLAUDE_API_KEY` as an
  environment variable in the dashboard, deploy. Start command: `npm start`.
- **A VPS**: `git clone`, `npm install --production`, run behind `pm2` or as
  a `systemd` service, put Nginx in front for HTTPS.
- **Docker**: use `node:20-slim`, `COPY . .`, `RUN npm ci --production`,
  `CMD ["node", "server.js"]`, pass `CLAUDE_API_KEY` via `-e` or a secrets
  manager — never bake the key into the image.

Whatever you choose: **never** put `CLAUDE_API_KEY` in the frontend code or
commit `.env` to version control (`.gitignore` already excludes it).

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot find module 'express'` | Run `npm install` in the project folder first |
| `API key not configured` (500 error) | You forgot to create `.env` or set `CLAUDE_API_KEY` |
| `429` errors persist even after retries | Your API key's rate limit is genuinely maxed — check usage at console.anthropic.com |
| Page loads but chart never appears | Open browser DevTools → Network tab → check the `/api/reading` response for the actual error message |
