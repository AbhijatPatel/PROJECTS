# StudyMate AI — AI Learning & Quiz Assistant

An AI-powered study helper: ask questions, generate quizzes, summarize notes,
and get difficult concepts explained simply — with answers streamed in
word-by-word using Server-Sent Events (SSE).

## Features
- **Ask AI** — free-form Q&A with conversation history, streamed live
- **Quiz Generator** — pick a topic + difficulty, get 3/5/10 MCQs with an answer key
- **Notes Summarizer** — paste notes, get concise bullet points back
- **Explain simply** endpoint for beginner-friendly explanations
- Fully responsive UI (mobile → desktop), no build step required

## Tech Stack
| Component  | Technology                          |
|------------|--------------------------------------|
| Frontend   | HTML, CSS, vanilla JavaScript         |
| Backend    | Python (FastAPI)                      |
| AI Model   | OpenAI GPT (`gpt-4.1-mini` by default)|
| Streaming  | Server-Sent Events (SSE)              |
| Container  | Docker                                |
| Deployment | AWS App Runner                        |

## Project Structure
```
studymate-ai/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── main.py
│   └── requirements.txt
├── Dockerfile
├── .env.example
├── .gitignore
└── README.md
```

## Running locally

### 1. Configure your API key
```bash
cp .env.example .env
# then edit .env and paste your real OPENAI_API_KEY
```

### 2. Run with Docker (recommended)
```bash
docker build -t studymate-ai .
docker run --env-file .env -p 8080:8080 studymate-ai
```
Open **http://localhost:8080** — the backend serves the frontend directly,
so there's nothing else to start.

### 3. Or run without Docker
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export OPENAI_API_KEY=sk-xxxx      # Windows (PowerShell): $env:OPENAI_API_KEY="sk-xxxx"
export MODEL=gpt-4.1-mini
uvicorn main:app --reload --port 8080
```
Then open `../frontend/index.html` directly in a browser, or serve it with
any static file server. If the frontend is on a different origin than the
backend, update `API_BASE` at the top of `frontend/script.js` to the
backend's full URL (e.g. `http://localhost:8080`).

## API Endpoints
All endpoints return `text/event-stream` responses, formatted as:
```
data: {"content": "next chunk of text"}

data: [DONE]
```

| Method | Path             | Body                                              |
|--------|------------------|----------------------------------------------------|
| POST   | `/api/chat`      | `{ "message": str, "history": [{role, content}] }` |
| POST   | `/api/explain`   | `{ "topic": str }`                                 |
| POST   | `/api/quiz`      | `{ "topic": str, "difficulty": str, "num_questions": int }` |
| POST   | `/api/summarize` | `{ "notes": str }`                                 |
| GET    | `/api/health`    | —                                                   |

## Prompt Templates (used internally)

**Explain**
```
You are an expert teacher.
Explain the following topic in simple language suitable for beginners.
Topic: {topic}
Use examples wherever possible.
```

**Quiz**
```
Generate {num_questions} multiple choice questions.
Topic: {topic}
Difficulty: {difficulty}
Provide answers separately.
```

**Summary**
```
Summarize the following notes into concise bullet points.
Text: {notes}
```

## Deploying to AWS App Runner
1. Push this project to a GitHub repository.
2. In the AWS Console, go to **App Runner → Create service**.
3. Choose **Source: Repository** → connect your GitHub repo.
4. Deployment settings: select **Dockerfile** as the build method (App Runner
   will use the included `Dockerfile` automatically).
5. Under **Environment variables**, add:
   - `OPENAI_API_KEY` = your key
   - `MODEL` = `gpt-4.1-mini` (or another supported model)
6. Set the port to `8080` (matches the Dockerfile's `EXPOSE`/`CMD`).
7. Deploy. App Runner will give you an HTTPS URL, e.g.
   `https://studymate-ai.awsapprunner.com`.

**Never commit your `.env` file or hardcode API keys in JavaScript** — the
key only ever lives server-side, injected as an environment variable.

## Notes
- Conversation history for the chat tab is kept in-memory in the browser
  tab (resets on refresh) — there's no database in this version by design,
  matching the "optional" conversation history requirement.
- Swap `MODEL` to any Chat Completions-compatible OpenAI model without
  touching code.
