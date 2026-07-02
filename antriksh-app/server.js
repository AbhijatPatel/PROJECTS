const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

console.log('CLAUDE_API_KEY loaded:', process.env.CLAUDE_API_KEY ? `yes (starts with ${process.env.CLAUDE_API_KEY.slice(0,10)}...)` : 'NO - .env not found or key missing');

const app = express();
const PORT = process.env.PORT || 3000;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main reading endpoint
app.post('/api/reading', async (req, res) => {
  try {
    const { name, dob, tob, place, mulank, bhagyank } = req.body;

    // Validation
    if (!name || !dob || !place) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const systemPrompt = `You are the reading engine for Antriksh, a Vedic-flavored astrology and numerology app. Given a person's birth details and their Mulank and Bhagyank numbers, produce a warm, specific, symbolic astrology reading for entertainment and self-reflection.

Respond with ONLY a raw JSON object — no markdown fences, no preamble. Match this exact shape and keep every field populated and CONCISE (respect the word limits given):
{
  "ascendant": "short zodiac/lagna name",
  "moon_sign": "sign name",
  "sun_sign": "sign name",
  "planets": [
    {"planet":"Sun","house":1,"sign":"...","note":"4-6 word effect"},
    {"planet":"Moon","house":2,"sign":"...","note":"4-6 word effect"},
    {"planet":"Mars","house":3,"sign":"...","note":"4-6 word effect"},
    {"planet":"Mercury","house":4,"sign":"...","note":"4-6 word effect"},
    {"planet":"Jupiter","house":5,"sign":"...","note":"4-6 word effect"},
    {"planet":"Venus","house":6,"sign":"...","note":"4-6 word effect"},
    {"planet":"Saturn","house":7,"sign":"...","note":"4-6 word effect"},
    {"planet":"Rahu","house":8,"sign":"...","note":"4-6 word effect"},
    {"planet":"Ketu","house":9,"sign":"...","note":"4-6 word effect"}
  ],
  "strengths": ["short phrase","short phrase","short phrase"],
  "challenges": ["short phrase","short phrase","short phrase"],
  "love": "2-3 sentences",
  "career": "2-3 sentences",
  "success": "2-3 sentences",
  "yearly_theme": "1-2 sentences on the general theme of this life chapter",
  "compatibility": "1-2 sentences on relationship dynamics that tend to suit this chart",
  "remedies": ["short practical/symbolic suggestion","second","third","fourth"]
}

Rules: assign each of the 9 planets to a distinct house from 1-12, internally consistent with the birth details given (use the numerology numbers as a symbolic seed for variety between different people). Never mention death or serious illness, and never make absolute guaranteed predictions — use "tend to", "are likely to", "often shows up as" instead of "will". Keep total output compact.`;

    const userPrompt = `Name: ${name}
Date of birth: ${dob}
Time of birth: ${tob || 'not provided'}
Place of birth: ${place}
Mulank (root number): ${mulank}
Bhagyank (destiny number): ${bhagyank}

Generate the reading now.`;

    const callClaude = async () => fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    // Retry with exponential backoff on 429 (rate limit) or 529 (overloaded)
    const MAX_RETRIES = 3;
    let response;
    let lastErrorBody = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      response = await callClaude();
      if (response.ok) break;

      if ((response.status === 429 || response.status === 529) && attempt < MAX_RETRIES) {
        const retryAfterHeader = response.headers.get('retry-after');
        const waitMs = retryAfterHeader
          ? parseInt(retryAfterHeader, 10) * 1000
          : 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
        console.warn(`Claude API ${response.status} -- retrying in ${waitMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      lastErrorBody = await response.json().catch(() => ({}));
      break;
    }

    if (!response.ok) {
      console.error('Claude API error:', response.status, lastErrorBody);
      const friendly = response.status === 429
        ? 'The stars are busy right now (rate limited). Please wait a few seconds and try again.'
        : response.status === 529
        ? 'The cosmic servers are overloaded. Please try again shortly.'
        : 'Failed to generate reading.';
      return res.status(response.status).json({
        error: friendly,
        details: lastErrorBody
      });
    }

    const data = await response.json();
    const textContent = data.content
      .map(block => (block.type === 'text' ? block.text : ''))
      .join('\n')
      .trim();

    // Clean and parse JSON
    const cleaned = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const reading = JSON.parse(cleaned);

    res.json({ success: true, reading });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Serve index for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║        ANTRIKSH SERVER RUNNING          ║
╠════════════════════════════════════════╣
║  🌟 http://localhost:${PORT}
║  🔮 API: http://localhost:${PORT}/api
║  📊 Reading: POST /api/reading
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
