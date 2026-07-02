import { useState } from 'react'
import { askAboutMeeting } from '@/services/ai/qa'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

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
    <Card className="sticky bottom-4 p-3 shadow-md">
      {answer && <p className="mb-2 text-sm text-gray-700">{answer}</p>}
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="Ask AI anything about this meeting..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
        />
        <Button onClick={handleAsk} loading={loading} disabled={!question.trim()}>
          Ask
        </Button>
      </div>
    </Card>
  )
}
