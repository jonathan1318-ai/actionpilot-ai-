import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { transcribeAudio } from '@/services/ai/transcribe'

interface Props {
  onText: (text: string) => void
}

export function AudioCapture({ onText }: Props) {
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  async function transcribeAndAppend(blob: Blob) {
    setLoading(true)
    setError('')
    try {
      const text = await transcribeAudio(blob)
      if (text.trim()) onText(text.trim())
    } catch (err) {
      setError((err as Error).message || 'Transcription failed')
    } finally {
      setLoading(false)
    }
  }

  async function startRecording() {
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

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    await transcribeAndAppend(file)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {!recording ? (
          <Button type="button" variant="secondary" size="sm" onClick={startRecording} loading={loading}>
            🔴 Record audio
          </Button>
        ) : (
          <Button type="button" variant="danger" size="sm" onClick={stopRecording}>
            ■ Stop &amp; transcribe
          </Button>
        )}
        <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFile} />
        <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()} loading={loading}>
          Upload audio
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
