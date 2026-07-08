import { useRef, useState } from 'react'
import { transcribeAudio } from '@/services/ai/transcribe'
import type { TranscriptLanguage } from '@/utils/language'

interface Props {
  onText: (text: string) => void
  language: TranscriptLanguage
}

export function AudioCapture({ onText, language }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const text = await transcribeAudio(file, language)
      if (text.trim()) onText(text.trim())
    } catch (err) {
      setError((err as Error).message || 'Transcription failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-xl border border-ap-border bg-ap-surface px-3 py-[11px] text-[12.5px] font-semibold text-ap-text-primary disabled:opacity-60"
      >
        <span className="h-[9px] w-[9px] rounded-full bg-ap-text-tertiary" />
        {loading ? 'Transcribing…' : 'Upload audio'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
