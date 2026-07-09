import { useRef, useState } from 'react'
import { transcribeAudio } from '@/services/ai/transcribe'
import type { TranscriptLanguage } from '@/utils/language'

interface Options {
  language: TranscriptLanguage
  onText: (text: string) => void
}

export function useAudioRecorder({ language, onText }: Options) {
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function transcribeAndAppend(blob: Blob) {
    setLoading(true)
    setError('')
    try {
      const text = await transcribeAudio(blob, language)
      if (text.trim()) onText(text.trim())
    } catch (err) {
      setError((err as Error).message || 'Transcription failed')
    } finally {
      setLoading(false)
    }
  }

  async function start() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        void transcribeAndAppend(blob)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
    } catch {
      setError('Microphone access denied or unavailable')
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return { recording, loading, error, start, stop }
}
