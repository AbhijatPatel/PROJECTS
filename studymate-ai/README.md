# StudyMate AI — AI Learning & Quiz Assistant

An AI-powered study assistant that helps students ask questions, generate quizzes,
summarize notes, and understand difficult concepts with beginner-friendly
explanations. Responses are streamed in real time using **Server-Sent Events (SSE)**
for a smooth and interactive learning experience.

## Features
- **Ask AI** — free-form Q&A with conversation history and live streaming responses
- **Quiz Generator** — create 3/5/10 multiple-choice questions by topic and difficulty
- **Notes Summarizer** — convert long notes into concise bullet-point summaries
- **Explain Simply** — beginner-friendly explanations with simple language and examples
- **Health Check** endpoint for monitoring application status
- **Responsive UI** — optimized for desktop, tablet, and mobile devices
- **Real-time Streaming** powered by Server-Sent Events (SSE)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Python (FastAPI) |
| AI Provider | Groq API |
| AI Model | `llama-3.3-70b-versatile` |
| Streaming | Server-Sent Events (SSE) |
| Container | Docker |
| Deployment | AWS App Runner |

## Project Structure

```text
studymate-ai/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
├── Dockerfile
├── .gitignore
└── README.md
```

## Running Locally

### 1. Configure your API key

Create a `.env` file inside the `backend` directory.

```env
GROQ_API_KEY=your_groq_api_key
MODEL=llama-3.3-70b-versatile
DEMO_MODE=false
```

### 2. Run with Docker (recommended)

```bash
docker build -t studymate-ai .
docker run --env-file backend/.env -p 8000:8000 studymate-ai
```

Open **http://127.0.0.1:8000** in your browser.

---

### 3. Run without Docker

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open:

```
http://localhost:8000
```

To access from another device on the same Wi-Fi network, use your computer's local IP address:

```
http://YOUR_LOCAL_IP:8000
```

Example:

```
http://192.168.1.105:8000
```

## API Endpoints

All AI endpoints return **text/event-stream** responses.

Example:

```text
data: {"content":"Hello"}

data: {"content":" world"}

data: [DONE]
```

| Method | Endpoint | Request Body |
|---------|----------|--------------|
| POST | `/api/chat` | `{ "message": str, "history": [{role, content}] }` |
| POST | `/api/explain` | `{ "topic": str }` |
| POST | `/api/quiz` | `{ "topic": str, "difficulty": str, "num_questions": int }` |
| POST | `/api/summarize` | `{ "notes": str }` |
| GET | `/api/health` | — |

## Prompt Templates

### Explain

```text
You are an expert teacher.

Explain the following topic in simple language suitable for beginners.

Topic: {topic}

Use examples wherever possible.
```

### Quiz

```text
Generate {num_questions} multiple choice questions.

Topic: {topic}

Difficulty: {difficulty}

Provide answers separately.
```

### Summary

```text
Summarize the following notes into concise bullet points.

Text: {notes}
```

## Deploying to AWS App Runner

1. Push the project to a GitHub repository.
2. Open **AWS Console → App Runner**.
3. Create a new service from your GitHub repository.
4. Select **Dockerfile** as the build method.
5. Configure the following environment variables:

```
GROQ_API_KEY=your_groq_api_key
MODEL=llama-3.3-70b-versatile
DEMO_MODE=false
```

6. Set the application port to **8000**.
7. Deploy the application.

After deployment, App Runner will provide a public HTTPS URL similar to:

```
https://studymate-ai.awsapprunner.com
```

The application can then be accessed from any laptop, phone, or tablet with an internet connection.

## Notes

- Chat conversation history is stored only in the browser session and resets when the page is refreshed.
- Responses are streamed in real time using **Server-Sent Events (SSE)**.
- API keys remain server-side and are never exposed to the frontend.
- Never commit your `.env` file or API keys to version control.
- You can switch to any Groq-supported model by updating the `MODEL` environment variable without changing the application code.
