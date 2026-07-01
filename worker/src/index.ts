export interface Env {
  GEMINI_API_KEY: string
  ALLOWED_ORIGIN: string
}

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

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      return json({ error: `Gemini request failed: ${errText}` }, 502, env)
    }

    const data = await geminiRes.json<{
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }>()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    return json({ text }, 200, env)
  },
}
