import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMeeting } from '@/services/firebase/meetings'
import { extractTasks } from '@/services/functions'
import { useAuthStore } from '@/store/auth.store'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TranscriptUploader } from '@/components/meetings/TranscriptUploader'

export function NewMeetingPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [duration, setDuration] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!user || !title.trim() || !transcript.trim()) return
    setLoading(true)
    setError('')
    try {
      const meetingId = await createMeeting(
        user.orgId,
        user.uid,
        title.trim(),
        'manual',
        new Date(),
        duration,
        [user.uid],
      )
      await extractTasks({ meetingId, transcript: transcript.trim(), orgId: user.orgId })
      navigate(`/meetings/${meetingId}`)
    } catch (err) {
      setError((err as Error).message || 'Failed to process meeting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="p-6 space-y-4">
        <Input label="Meeting title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Weekly product sync" />
        <Input
          label="Duration (minutes)"
          type="number"
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Transcript</label>
            <TranscriptUploader onText={setTranscript} />
          </div>
          <textarea
            className="min-h-[220px] rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="Paste the meeting transcript here..."
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          className="w-full justify-center"
          onClick={handleSubmit}
          loading={loading}
          disabled={!title.trim() || !transcript.trim()}
        >
          Extract tasks with Gemini
        </Button>
      </Card>
    </div>
  )
}
