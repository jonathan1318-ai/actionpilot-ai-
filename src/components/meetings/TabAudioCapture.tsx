import { useTabAudioRecorder } from '@/hooks/useTabAudioRecorder'
import type { TranscriptLanguage } from '@/utils/language'

interface Props {
  onText: (text: string) => void
  language: TranscriptLanguage
}

export function TabAudioCapture({ onText, language }: Props) {
  const { recording, loading, error, start, stop } = useTabAudioRecorder({ language, onText })

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => (recording ? stop() : start())}
        disabled={loading}
        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-[11px] text-[12.5px] font-semibold disabled:opacity-60 ${
          recording ? 'border-transparent bg-red-600 text-white' : 'border-ap-border bg-ap-surface text-ap-text-primary'
        }`}
      >
        <span className={`h-[9px] w-[9px] rounded-full ${recording ? 'bg-white' : 'bg-ap-text-tertiary'}`} />
        {loading ? 'Transcribing…' : recording ? 'Stop tab capture' : 'Capture meeting tab'}
      </button>
      {error && <p className="max-w-[180px] text-center text-xs text-red-500">{error}</p>}
    </div>
  )
}
