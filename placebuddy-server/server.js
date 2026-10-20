require('dotenv').config();

const cors = require('cors');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const app = express();
const port = Number(process.env.PORT) || 5000;
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const promptVersion = process.env.PROMPT_VERSION || '1';
const allowedOrigins = new Set([
  'http://127.0.0.1:3000',
  'http://localhost:3000'
]);

if (!['1', '2'].includes(promptVersion)) {
  throw new Error('PROMPT_VERSION must be either 1 or 2.');
}

const systemPrompt = fs.readFileSync(
  path.join(__dirname, 'prompts', `v${promptVersion}.txt`),
  'utf8'
).trim();

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('This site origin is not allowed by PlaceBuddy.'));
  }
}));
app.use(express.json({ limit: '20kb' }));

function formatTracker(tracker) {
  const values = tracker && typeof tracker === 'object' && !Array.isArray(tracker) ? tracker : {};
  const youtube = boundedInteger(values.youtubeChapters, 0, 19);
  const udemy = boundedInteger(values.udemyPercent, 5, 100);
  const analytics = boundedInteger(values.analyticsLessons, 76, 219);
  return `YouTube Core CS video: ${youtube}/19 chapters; Udemy course: ${udemy}% complete; CodeWithHarry Data Analytics: ${analytics}/219 lessons.`;
}

function boundedInteger(value, fallback, max) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(0, Math.round(number))) : fallback;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-20).flatMap(entry => {
    if (!entry || typeof entry.content !== 'string') return [];
    const text = entry.content.trim().slice(0, 1000);
    if (!text || !['user', 'assistant', 'model'].includes(entry.role)) return [];
    return [{ role: entry.role === 'assistant' ? 'model' : entry.role, parts: [{ text }] }];
  });
}

app.post('/chat', async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'Please enter a message for PlaceBuddy.' });
  if (message.length > 1000) return res.status(400).json({ error: 'Please keep your message under 1000 characters.' });
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'PlaceBuddy is not configured yet. Add your Gemini API key to the server .env file.' });
  }

  const trackerText = formatTracker(req.body.tracker);
  const contents = normalizeHistory(req.body.history);
  contents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let apiResponse;
    try {
      apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: `${systemPrompt}\n\nCURRENT TRACKER: ${trackerText}` }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
          })
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!apiResponse.ok) {
      console.error(`Gemini API returned HTTP ${apiResponse.status}.`);
      return res.status(502).json({ error: 'PlaceBuddy could not get a reply right now. Please try again in a moment.' });
    }

    const result = await apiResponse.json();
    const reply = result.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim();
    if (!reply) {
      console.error('Gemini API returned no text candidate.');
      return res.status(502).json({ error: 'PlaceBuddy could not create a reply. Please try again.' });
    }
    return res.json({ reply });
  } catch (error) {
    console.error('PlaceBuddy request failed:', error.name === 'AbortError' ? 'Gemini request timed out.' : error.message);
    return res.status(502).json({ error: 'PlaceBuddy is temporarily unavailable. Please try again shortly.' });
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'The request body must contain valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'That request is too large. Please try a shorter message.' });
  }
  if (error.message === 'This site origin is not allowed by PlaceBuddy.') {
    return res.status(403).json({ error: 'This website address is not allowed to use PlaceBuddy.' });
  }
  console.error('PlaceBuddy server error:', error.message);
  return res.status(500).json({ error: 'PlaceBuddy encountered a server error. Please try again.' });
});

app.listen(port, () => {
  console.log(`PlaceBuddy server listening at http://127.0.0.1:${port}`);
  console.log(`Prompt version: ${promptVersion}; model: ${model}`);
});
