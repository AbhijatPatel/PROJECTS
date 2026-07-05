# Abhijat Patel — Portfolio

A full-stack personal portfolio site.

- **Frontend**: React + Vite, single-page, no external CSS framework (plain inline styles + CSS variables), icons via `lucide-react`.
- **Backend**: Node + Express, handles the contact form — saves every message to a local JSON file and (optionally) emails you a copy via SMTP.

## Project structure

```
portfolio-project/
├── frontend/          React app (Vite)
│   ├── public/
│   │   ├── profile.jpg
│   │   └── resume.pdf
│   └── src/
│       ├── App.jsx    the whole site
│       ├── main.jsx
│       └── index.css
└── backend/           Express API
    ├── server.js
    └── data/
        └── messages.json   (contact form submissions land here)
```

## 1. Run it locally

You need [Node.js](https://nodejs.org) 18+ installed. Open two terminals.

### Terminal 1 — backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

You should see `Backend running on http://localhost:5000`.

By default, contact form messages are just saved to `backend/data/messages.json` — no email setup required to test locally. If you want the form to actually email you, fill in the SMTP fields in `.env` (see the comments in `.env.example` — for Gmail you need an "App Password", not your regular password).

### Terminal 2 — frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). The site is live, and the contact form will hit your local backend.

## 2. Replace placeholder assets

- `frontend/public/profile.jpg` — your profile photo (already set to your real photo)
- `frontend/public/resume.pdf` — your resume (already set to your real resume)

To update either, just replace the file at that path — the site references them directly, no code changes needed.

## 3. Deploying

This is two separate deployments: a static frontend and a small Node backend.

### Frontend (pick one — all have free tiers)
- **Vercel**: `npm i -g vercel`, then `cd frontend && vercel` — it auto-detects Vite.
- **Netlify**: connect the repo, set build command `npm run build`, publish directory `dist`.
- **GitHub Pages**: `npm run build`, then deploy the `dist/` folder.

Whichever you use, set an environment variable `VITE_API_URL` to your deployed backend's URL (e.g. `https://your-backend.onrender.com`) before building, so the contact form points at the live API instead of `localhost:5000`.

### Backend (pick one)
- **Render** (easiest free option): new Web Service → point at the `backend` folder → build command `npm install` → start command `npm start`. Add your `.env` values under "Environment".
- **Railway**: similar — deploy the `backend` folder, add env vars in the dashboard.

After the backend is deployed, copy its public URL into the frontend's `VITE_API_URL` and rebuild/redeploy the frontend.

### CORS
The backend already has `cors()` enabled for all origins, which is fine to get started. If you want to lock it down once deployed, edit `backend/server.js`:

```js
app.use(cors({ origin: "https://your-deployed-frontend.com" }));
```

## 4. Contact form data

Every submission is appended to `backend/data/messages.json` regardless of whether email sending is configured, so you never lose a message even if SMTP fails. Back this file up periodically if you deploy long-term, or swap in a real database later (Postgres, MongoDB, etc.) — the `saveMessageLocally` function in `server.js` is the only place that would need to change.
