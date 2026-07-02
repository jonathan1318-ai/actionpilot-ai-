export interface Env {
  AI: Ai
  ALLOWED_ORIGIN: string
}

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'

function corsHeaders(env: Env): HeadersInit {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function json(body: unknown, status: number, env: Env): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) })
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, env)
    }

    let prompt: string
    try {
      const body = await request.json<{ prompt?: string }>()
      if (!body.prompt) throw new Error('missing prompt')
      prompt = body.prompt
    } catch {
      return json({ error: 'Request body must be JSON with a "prompt" string' }, 400, env)
    }

    try {
      const result = await env.AI.run(MODEL, {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
      })
      const text = typeof result === 'object' && result !== null && 'response' in result
        ? String((result as { response?: string }).response ?? '')
        : ''
      return json({ text }, 200, env)
    } catch (err) {
      return json({ error: `Workers AI request failed: ${(err as Error).message}` }, 502, env)
    }
  },
}
