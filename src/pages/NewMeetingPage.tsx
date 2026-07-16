import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMeeting, updateMeetingStatus } from '@/services/firebase/meetings'
import { extractTasksFromTranscript } from '@/services/ai/extractTasks'
import { useAuthStore } from '@/store/auth.store'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TranscriptUploader } from '@/components/meetings/TranscriptUploader'
import { MicDictation } from '@/components/meetings/MicDictation'
import { AudioCapture } from '@/components/meetings/AudioCapture'
import { TabAudioCapture } from '@/components/meetings/TabAudioCapture'
import { LANGUAGE_OPTIONS, type TranscriptLanguage } from '@/utils/language'

const WAVEFORM_BARS = 24

export function NewMeetingPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [duration, setDuration] = useState(30)
  const [language, setLanguage] = useState<TranscriptLanguage>('en')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function appendTranscript(chunk: string) {
    setTranscript(prev => (prev.trim() ? `${prev.trim()}\n${chunk}` : chunk))
  }

  const recorder = useAudioRecorder({ language, onText: appendTranscript })

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

  const recordingLabel = recorder.recording
    ? 'Recording… tap to stop'
    : recorder.loading
      ? 'Transcribing…'
      : 'Tap to start recording'

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
        <Input label="Meeting title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Weekly product sync" />
        <Input
          label="Duration (minutes)"
          type="number"
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
        />
      </div>

      <div className="text-center">
        <div
          onClick={() => (recorder.recording ? recorder.stop() : recorder.start())}
          className="mx-auto flex h-[104px] w-[104px] cursor-pointer items-center justify-center rounded-full border-2 border-ap-accent bg-ap-accent-soft transition-shadow"
          style={recorder.recording ? { boxShadow: '0 0 0 10px var(--ap-accent-soft)' } : undefined}
        >
          <div
            className="bg-ap-accent transition-all"
            style={{
              width: recorder.recording ? 28 : 40,
              height: recorder.recording ? 28 : 40,
              borderRadius: recorder.recording ? 8 : '50%',
            }}
          />
        </div>
        <p className="mb-1.5 mt-[22px] text-[15px] font-semibold text-ap-text-primary">{recordingLabel}</p>
        <p className="mb-[34px] text-[13px] text-ap-text-tertiary">
          Audio is transcribed automatically once you stop recording.
        </p>
        {recorder.error && <p className="mb-4 text-xs text-red-500">{recorder.error}</p>}

        <div className="mb-[34px] flex h-10 items-center justify-center gap-1">
          {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
            <span
              key={i}
              className="w-[3px] rounded-sm bg-ap-accent transition-all"
              style={{
                height: recorder.recording ? 8 + Math.abs(Math.sin(i * 0.9)) * 32 : 6,
                animation: recorder.recording ? `ap-pulse ${1 + (i % 4) * 0.15}s ease-in-out infinite` : undefined,
              }}
            />
          ))}
        </div>

        <div className="mb-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-ap-border" />
          <span className="text-[11.5px] font-semibold text-ap-text-tertiary">OR CONNECT A SOURCE</span>
          <div className="h-px flex-1 bg-ap-border" />
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4">
          <TranscriptUploader onText={setTranscript} />
          <MicDictation onResult={appendTranscript} language={language} />
          <AudioCapture onText={appendTranscript} language={language} />
          <TabAudioCapture onText={appendTranscript} language={language} />
        </div>
        <p className="mt-2.5 text-[11px] text-ap-text-tertiary">
          "Capture meeting tab" records the other participants' audio directly from the browser tab (Chrome/Edge) — works even if you're wearing earphones and no audio is coming out of a speaker.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-semibold text-ap-text-secondary">Transcript</label>
          <select
            className="rounded-lg border border-ap-border bg-ap-surface-alt px-2 py-1.5 text-[12.5px] text-ap-text-primary outline-none focus:border-ap-accent"
            value={language}
            onChange={e => setLanguage(e.target.value as TranscriptLanguage)}
          >
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt.code} value={opt.code}>{opt.label}</option>
            ))}
          </select>
        </div>
        <textarea
          className="min-h-[180px] rounded-xl border border-ap-border bg-ap-surface-alt p-3.5 text-sm text-ap-text-primary outline-none placeholder:text-ap-text-tertiary focus:border-ap-accent focus:ring-2 focus:ring-ap-accent-soft"
          placeholder="Paste the meeting transcript here, or use a capture method above…"
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <Button
        className="mt-4 w-full justify-center"
        onClick={handleSubmit}
        loading={loading}
        disabled={!title.trim() || !transcript.trim()}
      >
        Extract tasks with Gemini
      </Button>
    </div>
  )
}
