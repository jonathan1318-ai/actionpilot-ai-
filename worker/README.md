# AI proxy (Cloudflare Worker + Workers AI)

Runs task extraction and Q&A on Cloudflare's free Workers AI (Llama 3.3 70B),
directly bound into this Worker. No API key, no billing, no credit card -
just your free Cloudflare account.

## First-time setup

```bash
cd worker
npm install
npx wrangler login          # opens a browser, sign up/in with any account
```

That's it - no secrets to configure. Workers AI is available automatically
once you're logged in.

## Local development

```bash
npm run dev
```

Wrangler prints a local URL (e.g. `http://localhost:8787`). Put that in the
root `.env.local` as:

```
VITE_AI_PROXY_URL=http://localhost:8787
```

## Deploy

```bash
npm run deploy
```

Wrangler prints your live URL (e.g. `https://actionpilot-ai-proxy.<your-subdomain>.workers.dev`).
Put that in `.env.local` instead, and update `ALLOWED_ORIGIN` in `wrangler.toml`
to match your deployed frontend's origin before shipping to real users.

## Changing the model

The model is set in `src/index.ts` (`MODEL` constant). Other free Workers AI
text models are listed at https://developers.cloudflare.com/workers-ai/models/ -
swap in a smaller/faster one (e.g. `@cf/meta/llama-3.1-8b-instruct-fast`) if
you want lower latency at some quality cost.
