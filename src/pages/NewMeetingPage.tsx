import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMeeting, updateMeetingStatus } from '@/services/firebase/meetings'
import { extractTasksFromTranscript } from '@/services/ai/extractTasks'
import { useAuthStore } from '@/store/auth.store'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TranscriptUploader } from '@/components/meetings/TranscriptUploader'
import { MicDictation } from '@/components/meetings/MicDictation'
import { AudioCapture } from '@/components/meetings/AudioCapture'

export function NewMeetingPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [duration, setDuration] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function appendTranscript(chunk: string) {
    setTranscript(prev => (prev.trim() ? `${prev.trim()}\n${chunk}` : chunk))
  }

  async function handleSubmit() {
    if (!user || !title.trim() || !transcript.trim()) return
    setLoading(true)
    setError('')
    const meetingDate = new Date()
    let meetingId = ''
    try {
      meetingId = await createMeeting(
        user.orgId,
        user.uid,
        title.trim(),
        'manual',
        meetingDate,
        duration,
        [user.uid],
      )
      await updateMeetingStatus(meetingId, { status: 'extracting', transcript: transcript.trim() })
      await extractTasksFromTranscript(meetingId, user.orgId, transcript.trim(), meetingDate, user.uid)
      navigate(`/meetings/${meetingId}`)
    } catch (err) {
      if (meetingId) await updateMeetingStatus(meetingId, { status: 'error' })
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
          <div className="flex items-start justify-between gap-3">
            <label className="pt-1.5 text-sm font-medium text-gray-700">Transcript</label>
            <div className="flex flex-wrap items-start justify-end gap-2">
              <TranscriptUploader onText={setTranscript} />
              <MicDictation onResult={appendTranscript} />
              <AudioCapture onText={appendTranscript} />
            </div>
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
