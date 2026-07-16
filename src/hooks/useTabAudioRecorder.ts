import { useRef, useState } from 'react'
import { transcribeAudio } from '@/services/ai/transcribe'
import type { TranscriptLanguage } from '@/utils/language'

interface Options {
  language: TranscriptLanguage
  onText: (text: string) => void
}

export function useTabAudioRecorder({ language, onText }: Options) {
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
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError('Tab audio capture needs Chrome or Edge')
      return
    }
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      const audioTracks = displayStream.getAudioTracks()
      displayStream.getVideoTracks().forEach(t => t.stop())

      if (audioTracks.length === 0) {
        audioTracks.forEach(t => t.stop())
        setError('No audio was shared — when picking a tab, tick "Share tab audio" (Chrome/Edge only)')
        return
      }

      const stream = new MediaStream(audioTracks)
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

      // Stop recording automatically if the user ends sharing from the browser's own "Stop sharing" bar.
      audioTracks[0].addEventListener('ended', () => stop())
    } catch {
      setError('Tab/screen share was cancelled or denied')
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return { recording, loading, error, start, stop }
}
