// ============================================================================
// StudyMate AI — frontend logic
// Handles view switching and streams responses from the FastAPI backend via
// Server-Sent Events (SSE), rendering tokens as they arrive.
// ============================================================================

const API_BASE = ""; // same-origin; change if the frontend is hosted separately

// ---------------------------------------------------------------------------
// View / tab navigation
// ---------------------------------------------------------------------------
const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
const navToggle = document.getElementById("navToggle");
const tabsEl = document.querySelector(".tabs");

function showView(name) {
  views.forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
  tabs.forEach((t) => {
    const active = t.dataset.view === name;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", String(active));
  });
  tabsEl.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-view]").forEach((el) => {
  el.addEventListener("click", () => showView(el.dataset.view));
});

navToggle.addEventListener("click", () => tabsEl.classList.toggle("open"));

// ---------------------------------------------------------------------------
// SSE streaming helper
// Reads a text/event-stream response from `fetch` (POST bodies aren't
// supported by the native EventSource API, so we parse manually).
// ---------------------------------------------------------------------------
async function streamRequest(path, body, { onToken, onDone, onError }) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Request failed (${res.status})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n\n");
      buffer = parts.pop(); // last part may be incomplete, keep for next loop

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") {
          onDone && onDone();
          return;
        }
        try {
          const json = JSON.parse(payload);
          if (json.error) {
            onError && onError(json.error);
            return;
          }
          if (json.content) onToken && onToken(json.content);
        } catch {
          // ignore malformed chunk
        }
      }
    }
    onDone && onDone();
  } catch (err) {
    onError && onError(err.message || "Something went wrong. Is the backend running?");
  }
}

// ---------------------------------------------------------------------------
// Home — decorative "typing" demo + hero ask box
// ---------------------------------------------------------------------------
const demoTyping = document.getElementById("demoTyping");
const demoLines = [
  "The AI is typing, word by word — not waiting in silence...",
  "Ask about photosynthesis, recursion, or the French Revolution...",
  "Every answer streams in as it's generated, just like this.",
];
let demoLineIndex = 0;
let demoCharIndex = 0;

function typeDemoLoop() {
  const line = demoLines[demoLineIndex];
  if (demoCharIndex <= line.length) {
    demoTyping.textContent = line.slice(0, demoCharIndex);
    demoCharIndex++;
    setTimeout(typeDemoLoop, 28);
  } else {
    setTimeout(() => {
      demoCharIndex = 0;
      demoLineIndex = (demoLineIndex + 1) % demoLines.length;
      typeDemoLoop();
    }, 1400);
  }
}
typeDemoLoop();

document.getElementById("heroAskForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("heroAskInput");
  const question = input.value.trim();
  if (!question) return;
  showView("chat");
  sendChatMessage(question);
  input.value = "";
});

// ---------------------------------------------------------------------------
// AI Chat
// ---------------------------------------------------------------------------
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
let chatHistory = [];

function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return div;
}

function sendChatMessage(text) {
  appendMessage("user", text);
  const aiBubble = appendMessage("ai", "");
  chatSend.disabled = true;

  let fullReply = "";
  streamRequest(
    "/api/chat",
    { message: text, history: chatHistory },
    {
      onToken: (tok) => {
        fullReply += tok;
        aiBubble.textContent = fullReply;
        chatLog.scrollTop = chatLog.scrollHeight;
      },
      onDone: () => {
        chatHistory.push({ role: "user", content: text });
        chatHistory.push({ role: "assistant", content: fullReply });
        chatSend.disabled = false;
      },
      onError: (err) => {
        aiBubble.classList.add("error");
        aiBubble.textContent = `⚠ ${err}`;
        chatSend.disabled = false;
      },
    }
  );
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  sendChatMessage(text);
});

document.querySelectorAll(".hint-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    showView("chat");
    sendChatMessage(chip.dataset.fill);
  });
});

// ---------------------------------------------------------------------------
// Quiz Generator
// ---------------------------------------------------------------------------
const quizForm = document.getElementById("quizForm");
const quizOutput = document.getElementById("quizOutput");
const quizSubmit = document.getElementById("quizSubmit");

quizForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const topic = document.getElementById("quizTopic").value.trim();
  const difficulty = document.getElementById("quizDifficulty").value;
  const num_questions = Number(document.getElementById("quizCount").value);
  if (!topic) return;

  quizSubmit.disabled = true;
  quizOutput.classList.remove("placeholder-wrap");
  quizOutput.textContent = "";

  streamRequest(
    "/api/quiz",
    { topic, difficulty, num_questions },
    {
      onToken: (tok) => {
        quizOutput.textContent += tok;
      },
      onDone: () => {
        quizSubmit.disabled = false;
      },
      onError: (err) => {
        quizOutput.textContent = `⚠ ${err}`;
        quizSubmit.disabled = false;
      },
    }
  );
});

// ---------------------------------------------------------------------------
// Notes Summarizer
// ---------------------------------------------------------------------------
const summarizeSubmit = document.getElementById("summarizeSubmit");
const notesInput = document.getElementById("notesInput");
const summaryOutput = document.getElementById("summaryOutput");

summarizeSubmit.addEventListener("click", () => {
  const notes = notesInput.value.trim();
  if (!notes) return;

  summarizeSubmit.disabled = true;
  summaryOutput.textContent = "";

  streamRequest(
    "/api/summarize",
    { notes },
    {
      onToken: (tok) => {
        summaryOutput.textContent += tok;
      },
      onDone: () => {
        summarizeSubmit.disabled = false;
      },
      onError: (err) => {
        summaryOutput.textContent = `⚠ ${err}`;
        summarizeSubmit.disabled = false;
      },
    }
  );
});
