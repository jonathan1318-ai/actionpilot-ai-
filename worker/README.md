# Gemini proxy (Cloudflare Worker)

Keeps the Gemini API key off the browser without needing Firebase Blaze / a
credit card. Cloudflare's free Workers plan needs no payment method.

## First-time setup

```bash
cd worker
npm install
npx wrangler login          # opens a browser, sign up/in with any account
npx wrangler secret put GEMINI_API_KEY   # paste your AI Studio API key
```

## Local development

```bash
npm run dev
```

Wrangler prints a local URL (e.g. `http://localhost:8787`). Put that in the
root `.env.local` as:

```
VITE_GEMINI_PROXY_URL=http://localhost:8787
```

## Deploy

```bash
npm run deploy
```

Wrangler prints your live URL (e.g. `https://actionpilot-gemini-proxy.<your-subdomain>.workers.dev`).
Put that in `.env.local` instead, and update `ALLOWED_ORIGIN` in `wrangler.toml`
to match your deployed frontend's origin before shipping to real users.
