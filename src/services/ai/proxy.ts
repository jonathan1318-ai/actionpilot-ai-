export async function callAiProxy(prompt: string): Promise<string> {
  const url = import.meta.env.VITE_AI_PROXY_URL
  if (!url) throw new Error('VITE_AI_PROXY_URL is not set')

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) throw new Error(`AI proxy request failed: ${await res.text()}`)

  const data = (await res.json()) as { text: string }
  return data.text
}

export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1] : text
  return JSON.parse(raw.trim()) as T
}
