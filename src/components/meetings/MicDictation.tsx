import { useEffect, useRef, useState } from 'react'
import { speechLangFor, type TranscriptLanguage } from '@/utils/language'

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
  language: TranscriptLanguage
}

export function MicDictation({ onResult, language }: Props) {
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
    recognition.lang = speechLangFor(language)
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
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-[11px] text-[12.5px] font-semibold ${
        listening
          ? 'border-transparent bg-red-600 text-white'
          : 'border-ap-border bg-ap-surface text-ap-text-primary'
      }`}
    >
      <span className={`h-[9px] w-[9px] rounded-full ${listening ? 'bg-white' : 'bg-ap-text-tertiary'}`} />
      {listening ? 'Stop dictation' : 'Live dictation'}
    </button>
  )
}
