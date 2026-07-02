export async function transcribeAudio(blob: Blob): Promise<string> {
  const baseUrl = import.meta.env.VITE_AI_PROXY_URL
  if (!baseUrl) throw new Error('VITE_AI_PROXY_URL is not set')

  const res = await fetch(`${baseUrl}/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'application/octet-stream' },
    body: blob,
  })

  if (!res.ok) throw new Error(`Transcription failed: ${await res.text()}`)

  const data = (await res.json()) as { text: string }
  return data.text
}
