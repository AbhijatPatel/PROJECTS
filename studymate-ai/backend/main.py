"""
StudyMate AI - Backend
FastAPI server that proxies prompts to OpenAI's GPT API and streams the
response back to the browser using Server-Sent Events (SSE).
"""

import json
import os
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from groq import Groq
from pydantic import BaseModel

load_dotenv()

GROQ_API_KEY = os.environ.get("OPENAI_API_KEY")  # Using same env var name for compatibility
MODEL = os.environ.get("MODEL", "mixtral-8x7b-32768")
DEMO_MODE = os.environ.get("DEMO_MODE", "false").lower() == "true"

app = FastAPI(title="StudyMate AI")

# Allow the frontend (which may be served from a different origin during
# local development) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------
class HistoryTurn(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[HistoryTurn]] = None


class ExplainRequest(BaseModel):
    topic: str


class QuizRequest(BaseModel):
    topic: str
    difficulty: str = "Easy"
    num_questions: int = 5


class SummaryRequest(BaseModel):
    notes: str


# ---------------------------------------------------------------------------
# Streaming helper
# ---------------------------------------------------------------------------
def sse_event(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


def stream_demo_response(response_text: str):
    """Yield a demo response word by word."""
    import time
    words = response_text.split()
    for word in words:
        yield sse_event({"content": word + " "})
        time.sleep(0.05)  # Small delay for realistic streaming effect
    yield "data: [DONE]\n\n"


def stream_completion(messages: list):
    """Call OpenAI in streaming mode and yield SSE-formatted chunks."""
    if DEMO_MODE:
        # Demo mode: return sample responses
        user_message = messages[-1]["content"].lower()
        
        if "photosynthesis" in user_message:
            response = "Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in two main stages: the light-dependent reactions in the thylakoid membranes, where light is converted to ATP and NADPH, and the light-independent reactions (Calvin cycle) in the stroma, where CO₂ is fixed into glucose using the energy from the light reactions."
        elif "quiz" in user_message or "test" in user_message:
            response = "I'd love to help you create a quiz! Here's a sample multiple choice question:\n\nQ1. What is the powerhouse of the cell?\na) Nucleus\nb) Mitochondria\nc) Ribosome\nd) Chloroplast\n\nAnswer: b) Mitochondria"
        elif "summarize" in user_message or "summary" in user_message:
            response = "Here's a summary of key points:\n• Main concept 1\n• Key finding 2\n• Important detail 3\n• Significant takeaway 4"
        elif "explain" in user_message:
            response = "Sure! Let me break this down into simple terms. Imagine you're learning something new - the key is to understand the basic building blocks first. Once you grasp those, everything else builds naturally on top. Think of it like learning to read: first you learn letters, then words, then sentences, and finally you can read whole stories!"
        else:
            response = "That's an interesting question! In this demo mode, I'm returning a sample response. To use the full AI capabilities, please add a valid OpenAI API key to your .env file and set DEMO_MODE=false. This demo response shows how the streaming interface works - notice how text appears word by word, just like a real AI thinking through its answer."
        
        yield from stream_demo_response(response)
        return

    if client is None:
        yield sse_event({"error": "GROQ_API_KEY is not configured on the server."})
        yield "data: [DONE]\n\n"
        return

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            stream=True,
            temperature=0.7,
            max_tokens=1024,
        )
        for chunk in response:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield sse_event({"content": delta})
    except Exception as exc:  # noqa: BLE001
        yield sse_event({"error": str(exc)})

    yield "data: [DONE]\n\n"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "model": MODEL}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """Ask-anything AI chat, with optional conversation history."""
    system = (
        "You are StudyMate, an expert and friendly AI tutor. "
        "Answer clearly, be encouraging, and use simple examples where helpful."
    )
    messages = [{"role": "system", "content": system}]
    if req.history:
        for turn in req.history:
            role = "assistant" if turn.role == "assistant" else "user"
            messages.append({"role": role, "content": turn.content})
    messages.append({"role": "user", "content": req.message})

    return StreamingResponse(stream_completion(messages), media_type="text/event-stream")


@app.post("/api/explain")
async def explain(req: ExplainRequest):
    """Explain a difficult concept in simple language."""
    system = "You are an expert teacher."
    prompt = (
        "Explain the following topic in simple language suitable for beginners.\n\n"
        f"Topic: {req.topic}\n\n"
        "Use examples wherever possible."
    )
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": prompt},
    ]
    return StreamingResponse(stream_completion(messages), media_type="text/event-stream")


@app.post("/api/quiz")
async def quiz(req: QuizRequest):
    """Generate a multiple-choice quiz on a topic."""
    system = "You are an expert quiz creator for students."
    prompt = (
        f"Generate {req.num_questions} multiple choice questions.\n\n"
        f"Topic: {req.topic}\n"
        f"Difficulty: {req.difficulty}\n\n"
        "Format:\n"
        "Q1. <question>\n"
        "a) option\n"
        "b) option\n"
        "c) option\n"
        "d) option\n"
        "(blank line between questions)\n\n"
        "After all questions, add a line '---' followed by an 'Answers:' section "
        "listing the correct option letter for each question number, e.g. '1. b'."
    )
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": prompt},
    ]
    return StreamingResponse(stream_completion(messages), media_type="text/event-stream")


@app.post("/api/summarize")
async def summarize(req: SummaryRequest):
    """Summarize pasted notes into bullet points."""
    system = "You are an expert at summarizing academic notes concisely."
    prompt = (
        "Summarize the following notes into concise bullet points. "
        "Keep the most important ideas and use short, clear phrasing.\n\n"
        f"Text:\n{req.notes}"
    )
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": prompt},
    ]
    return StreamingResponse(stream_completion(messages), media_type="text/event-stream")


# ---------------------------------------------------------------------------
# Serve the static frontend (single-container deployment)
# ---------------------------------------------------------------------------
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
if os.path.isdir(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
