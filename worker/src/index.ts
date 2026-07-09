export interface Env {
  AI: Ai
  ALLOWED_ORIGINS: string
}

const TEXT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
const WHISPER_MODEL = '@cf/openai/whisper-large-v3-turbo'

function resolveOrigin(request: Request, env: Env): string {
  const allowed = env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  const requestOrigin = request.headers.get('Origin') ?? ''
  return allowed.includes(requestOrigin) ? requestOrigin : allowed[0]
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  return {
    'Access-Control-Allow-Origin': resolveOrigin(request, env),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

function json(body: unknown, status: number, request: Request, env: Env): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request, env) },
  })
}

async function handleGenerate(request: Request, env: Env): Promise<Response> {
  let prompt: string
  try {
    const body = await request.json<{ prompt?: string }>()
    if (!body.prompt) throw new Error('missing prompt')
    prompt = body.prompt
  } catch {
    return json({ error: 'Request body must be JSON with a "prompt" string' }, 400, request, env)
  }

  try {
    const result = await env.AI.run(TEXT_MODEL, {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    })

    let text = ''
    if (typeof result === 'string') {
      text = result
    } else if (result && typeof result === 'object' && 'response' in result) {
      const response = (result as { response?: unknown }).response
      text = typeof response === 'string' ? response : JSON.stringify(response ?? '')
    }

    if (!text) {
      return json({ error: `Unexpected Workers AI response shape: ${JSON.stringify(result)}` }, 502, request, env)
    }

    return json({ text }, 200, request, env)
  } catch (err) {
    return json({ error: `Workers AI request failed: ${(err as Error).message}` }, 502, request, env)
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

async function handleTranscribe(request: Request, env: Env): Promise<Response> {
  const buffer = await request.arrayBuffer()
  if (buffer.byteLength === 0) {
    return json({ error: 'Request body must contain audio bytes' }, 400, request, env)
  }

  const language = new URL(request.url).searchParams.get('language') || 'en'

  try {
    const audio = arrayBufferToBase64(buffer)
    const result = await env.AI.run(WHISPER_MODEL, { audio, language })
    const text = result && typeof result === 'object' && 'text' in result
      ? String((result as { text?: string }).text ?? '')
      : ''
    return json({ text }, 200, request, env)
  } catch (err) {
    return json({ error: `Whisper transcription failed: ${(err as Error).message}` }, 502, request, env)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request, env) })
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, request, env)
    }

    const { pathname } = new URL(request.url)
    if (pathname === '/transcribe') {
      return handleTranscribe(request, env)
    }
    return handleGenerate(request, env)
  },
}
