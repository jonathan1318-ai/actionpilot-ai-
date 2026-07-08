import { useState } from 'react'
import { askAboutMeeting } from '@/services/ai/qa'

interface Props {
  transcript: string
  summary: string
}

export function AskAiBar({ transcript, summary }: Props) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAsk() {
    if (!question.trim()) return
    setLoading(true)
    setError('')
    setAnswer('')
    try {
      const text = await askAboutMeeting(transcript, summary, question.trim())
      setAnswer(text)
    } catch (err) {
      setError((err as Error).message || 'Failed to get an answer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-ap-border bg-ap-surface-alt p-1.5">
      {answer && <p className="px-4 pb-2 pt-2 text-sm leading-relaxed text-ap-text-primary">{answer}</p>}
      {error && <p className="px-4 pb-2 text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-2.5 pl-4">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z" stroke="var(--ap-accent)" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <input
          className="flex-1 border-none bg-transparent py-2.5 text-[13.5px] text-ap-text-primary outline-none placeholder:text-ap-text-tertiary"
          placeholder="Ask AI about this meeting…"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
        />
        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="shrink-0 rounded-xl bg-ap-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '…' : 'Ask'}
        </button>
      </div>
    </div>
  )
}
