import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'

type SpeechRecognitionCtor = new () => SpeechRecognition

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

interface Props {
  onResult: (text: string) => void
}

export function MicDictation({ onResult }: Props) {
  const [listening, setListening] = useState(false)
  const supported = useRef(getRecognitionCtor() !== null).current
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => () => recognitionRef.current?.stop(), [])

  function toggle() {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const Ctor = getRecognitionCtor()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = event => {
      const chunk = Array.from(event.results)
        .slice(event.resultIndex)
        .map(r => r[0].transcript)
        .join(' ')
      if (chunk.trim()) onResult(chunk.trim())
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognition.start()
    recognitionRef.current = recognition
    setListening(true)
  }

  if (!supported) return null

  return (
    <Button type="button" variant={listening ? 'danger' : 'secondary'} size="sm" onClick={toggle}>
      {listening ? '● Stop dictation' : '🎤 Dictate'}
    </Button>
  )
}
