import { whisperLangFor, type TranscriptLanguage } from '@/utils/language'

export async function transcribeAudio(blob: Blob, language: TranscriptLanguage): Promise<string> {
  const baseUrl = import.meta.env.VITE_AI_PROXY_URL
  if (!baseUrl) throw new Error('VITE_AI_PROXY_URL is not set')

  const url = new URL('/transcribe', baseUrl)
  url.searchParams.set('language', whisperLangFor(language))

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'application/octet-stream' },
    body: blob,
  })

  if (!res.ok) throw new Error(`Transcription failed: ${await res.text()}`)

  const data = (await res.json()) as { text: string }
  return data.text
}
