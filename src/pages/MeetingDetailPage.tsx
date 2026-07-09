import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMeeting } from '@/services/firebase/meetings'
import { listMeetingTasks } from '@/services/firebase/tasks'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime, formatDate } from '@/utils/date'
import { MEETING_STATUS_COLORS, MEETING_STATUS_LABELS } from '@/utils/status'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/utils/task'
import { AskAiBar } from '@/components/meetings/AskAiBar'
import type { Meeting, Task } from '@/types'

export function MeetingDetailPage() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!meetingId) return
    setLoading(true)
    Promise.all([getMeeting(meetingId), listMeetingTasks(meetingId)])
      .then(([m, t]) => { setMeeting(m); setTasks(t) })
      .finally(() => setLoading(false))
  }, [meetingId])

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>
  if (!meeting) return <p className="text-ap-text-secondary">Meeting not found.</p>

  const transcriptLines = meeting.transcript.split('\n').map(l => l.trim()).filter(Boolean)

  return (
    <div className="mx-auto max-w-[980px]">
      <Link to="/meetings" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ap-text-secondary hover:text-ap-text-primary">
        <svg width="15" height="15" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
        All meetings
      </Link>

      <div className="mb-[22px] flex items-start justify-between gap-5">
        <div>
          <h2 className="mb-1.5 text-[23px] font-bold tracking-tight text-ap-text-primary">{meeting.title}</h2>
          <p className="text-[13.5px] text-ap-text-tertiary">
            {formatDateTime(meeting.date)} · {meeting.duration} min · {tasks.length} tasks extracted
          </p>
        </div>
        <Badge label={MEETING_STATUS_LABELS[meeting.status]} className={MEETING_STATUS_COLORS[meeting.status]} />
      </div>

      <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <h3 className="mb-2.5 text-[13px] font-bold text-ap-text-secondary">AI Summary</h3>
            <p className="text-sm leading-relaxed text-ap-text-primary">
              {meeting.summary || 'Summary will appear once processing completes.'}
            </p>
            {meeting.keyHighlights.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-[13px] font-bold text-ap-text-secondary">Key highlights</h4>
                <ul className="space-y-1.5">
                  {meeting.keyHighlights.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ap-text-primary">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ap-text-tertiary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {meeting.decisions.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-[13px] font-bold text-ap-text-secondary">Decisions</h4>
                <ol className="space-y-1.5">
                  {meeting.decisions.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ap-text-primary">
                      <span className="font-semibold text-ap-accent">{i + 1}.</span>
                      {point}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-2.5 text-[13px] font-bold text-ap-text-secondary">Transcript</h3>
            {transcriptLines.length === 0 ? (
              <p className="text-sm text-ap-text-tertiary">No transcript available.</p>
            ) : (
              <div className="max-h-[28rem] overflow-y-auto">
                {transcriptLines.map((line, i) => (
                  <div key={i} className="border-b border-ap-border py-2 text-[13.5px] leading-relaxed text-ap-text-primary last:border-0">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card>
          <h3 className="mb-3 text-[13px] font-bold text-ap-text-secondary">Extracted tasks · {tasks.length}</h3>
          {tasks.length === 0 && <p className="text-sm text-ap-text-tertiary">No tasks extracted yet.</p>}
          <div className="flex flex-col gap-2.5">
            {tasks.map(t => (
              <div key={t.taskId} className="rounded-[14px] border border-ap-border bg-ap-surface-alt p-3">
                <p className="mb-2 text-[13.5px] font-semibold leading-snug text-ap-text-primary">{t.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ap-text-tertiary">Due {formatDate(t.dueDate)}</span>
                  <Badge label={PRIORITY_LABELS[t.priorityLabel]} className={PRIORITY_COLORS[t.priorityLabel]} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {meeting.transcript && (
        <div className="mt-[22px]">
          <AskAiBar transcript={meeting.transcript} summary={meeting.summary} />
        </div>
      )}
    </div>
  )
}
