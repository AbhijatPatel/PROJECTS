# Abhijat Patel — Portfolio

A full-stack personal portfolio site.

**Quick links (once both servers are running):**
- Site: [http://localhost:5173](http://localhost:5173)
- Backend API health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

- **Frontend**: React + Vite (plain inline styles + CSS variables, icons via `lucide-react`)
- **Backend**: Node + Express — handles the contact form, saves every submission locally, and can email you a copy via SMTP

## ⚠️ Before you start: check your folder structure

If you unzipped this project, you may end up with a **duplicated folder**, like:

```
portfolio-project/
└── portfolio-project/     ← extra nested copy — this is the one you actually want
    ├── backend/
    ├── frontend/
    └── README.md
```

Before running anything, open a terminal and run `dir` (Windows) or `ls` (Mac/Linux). You want to land in the folder where `dir`/`ls` shows **both `backend` and `frontend` side by side**. If you see another `portfolio-project` folder instead, `cd` into it and check again.

## Project structure (once you're in the right folder)

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

You need [Node.js](https://nodejs.org) 18+ installed. Use **two separate terminal windows/tabs** — one per server — and don't close either while working.

### Terminal 1 — backend

```powershell
cd path\to\portfolio-project\backend
copy .env.example .env
npm install
npm start
```

Wait for: `Backend running on` [http://localhost:5000](http://localhost:5000). Leave this terminal open and running.

By default, contact form messages are just saved to `backend/data/messages.json` — no email setup required to test locally. To make the form actually email you, fill in the SMTP fields in `backend/.env` (Gmail needs an "App Password", not your normal password — see comments in `.env.example`).

### Terminal 2 — frontend

```powershell
cd path\to\portfolio-project\frontend
copy .env.example .env
npm install
npm run dev
```

Wait for something like:
```
VITE v5.4.21  ready in 700 ms
➜  Local:   http://localhost:5173/
```

**Open [http://localhost:5173](http://localhost:5173)** in your browser — that's your actual site. (`localhost:5000` is only the backend API — visiting it directly in a browser will show an error or plain JSON, that's expected.)

## 2. Common mistakes

| Symptom | Cause | Fix |
|---|---|---|
| `Missing script: "start"` in `frontend` | Frontend uses `npm run dev`, not `npm start` | Run `npm run dev` |
| `Missing script: "dev"` in `backend` | Backend uses `npm start`, not `npm run dev` | Run `npm start` |
| `Cannot find path ...\.env.example` | You're not actually inside `frontend` or `backend` | Run `dir`/`ls` to confirm you see `package.json` before running any npm command |
| `ERR_CONNECTION_REFUSED` on [http://localhost:5000](http://localhost:5000) | You're visiting the backend directly, or it isn't running | Open [http://localhost:5173](http://localhost:5173) instead, and confirm Terminal 1 shows "Backend running..." |
| `npm install` reports some unrelated package count | You're in the wrong project folder entirely (a different app) | `cd` back out and re-navigate to `portfolio-project\frontend` or `\backend` specifically |

## 3. Replace placeholder assets

- `frontend/public/profile.jpg` — your profile photo (already set)
- `frontend/public/resume.pdf` — your resume (already set)

To update either, just replace the file at that path — no code changes needed.

## 4. Deploying

This is two separate deployments: a static frontend and a small Node backend.

### Frontend (pick one — all have free tiers)
- **Vercel**: `npm i -g vercel`, then `cd frontend && vercel` — it auto-detects Vite.
- **Netlify**: connect the repo, build command `npm run build`, publish directory `dist`.
- **GitHub Pages**: `npm run build`, then deploy the `dist/` folder.

Set an environment variable `VITE_API_URL` to your deployed backend's URL (e.g. `https://your-backend.onrender.com`) before building, so the contact form points at the live API instead of `localhost:5000`.

### Backend (pick one)
- **Render** (easiest free option): new Web Service → point at the `backend` folder → build command `npm install` → start command `npm start`. Add your `.env` values under "Environment".
- **Railway**: similar — deploy the `backend` folder, add env vars in the dashboard.

After the backend is deployed, copy its public URL into the frontend's `VITE_API_URL` and rebuild/redeploy the frontend.

### CORS
The backend has `cors()` enabled for all origins by default — fine to start. To lock it down once deployed, edit `backend/server.js`:

```js
app.use(cors({ origin: "https://your-deployed-frontend.com" }));
```

## 5. Contact form data

Every submission is appended to `backend/data/messages.json` regardless of whether email sending is configured, so you never lose a message even if SMTP fails. Back this file up periodically if you deploy long-term, or swap in a real database later (Postgres, MongoDB, etc.) — the `saveMessageLocally` function in `server.js` is the only place that would need to change.

---

## 📄 License

This project is licensed under the MIT License.

---
