# PlaceBuddy server

This Node.js/Express server provides the `/chat` API used by the PlaceMate PlaceBuddy widget. The Gemini API key stays on the server and must never be added to the website files.

## Requirements

- Node.js 18 or newer (for built-in `fetch`)
- A Gemini API key
- PlaceMate website served at `http://127.0.0.1:3000` (or `http://localhost:3000`)

## Setup

From the `Assignment10` folder, run:

```powershell
cd .\placebuddy-server
npm install
Copy-Item .env.example .env
```

Open `.env` and replace `your_gemini_api_key_here` with your Gemini API key. Keep `.env` private; it is ignored by Git. Optional settings:

- `GEMINI_MODEL` — model name; defaults to `gemini-2.5-flash`
- `PROMPT_VERSION` — `1` or `2`; defaults to `1`
- `PORT` — server port; defaults to `5000`

Start the API:

```powershell
npm start
```

Serve `Assignment10\website` with VS Code Live Preview on port `3000`, then open the site. The PlaceBuddy button appears at the bottom-right. The API allows requests from `127.0.0.1:3000` and `localhost:3000`.

To demonstrate prompt improvement, set `PROMPT_VERSION=1` or `PROMPT_VERSION=2` in `.env`, then restart the server. Version 2 contains all of version 1 plus the security instruction.

## API

`POST /chat` accepts `{ "message": "...", "history": [], "tracker": {} }` and returns `{ "reply": "..." }`. Messages are limited to 1000 characters. Friendly error responses are returned for invalid messages, missing API configuration, and Gemini failures.
