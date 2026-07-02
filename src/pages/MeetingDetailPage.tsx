import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMeeting } from '@/services/firebase/meetings'
import { listMeetingTasks } from '@/services/firebase/tasks'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/utils/date'
import { MeetingBadge } from '@/components/meetings/MeetingBadge'
import { MeetingSummaryView } from '@/components/meetings/MeetingSummaryView'
import { AskAiBar } from '@/components/meetings/AskAiBar'
import { TaskInlineRow } from '@/components/tasks/TaskInlineRow'
import type { Meeting, Task } from '@/types'

type Tab = 'summary' | 'transcript' | 'tasks'

const STATUS_COLOR: Record<string, string> = {
  ready: 'bg-green-100 text-green-700',
  transcribing: 'bg-blue-100 text-blue-700',
  extracting: 'bg-purple-100 text-purple-700',
  uploading: 'bg-gray-100 text-gray-600',
  error: 'bg-red-100 text-red-700',
}

export function MeetingDetailPage() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('summary')

  useEffect(() => {
    if (!meetingId) return
    Promise.all([getMeeting(meetingId), listMeetingTasks(meetingId)])
      .then(([m, t]) => { setMeeting(m); setTasks(t) })
      .finally(() => setLoading(false))
  }, [meetingId])

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>
  if (!meeting) return <p className="text-gray-500">Meeting not found.</p>

  function updateTaskInList(updated: Task) {
    setTasks(prev => prev.map(t => (t.taskId === updated.taskId ? updated : t)))
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-start gap-3">
        <MeetingBadge title={meeting.title} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">{meeting.title}</h2>
            <Badge label={meeting.status} className={STATUS_COLOR[meeting.status] ?? ''} />
          </div>
          <p className="text-sm text-gray-400">{formatDateTime(meeting.date)} · {meeting.duration} min · {meeting.platform}</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {([
          ['summary', 'Summary'],
          ['transcript', 'Transcript'],
          ['tasks', `Tasks (${tasks.length})`],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? 'border-b-2 border-brand-600 text-brand-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <Card className="p-5">
          <MeetingSummaryView
            summary={meeting.summary}
            keyHighlights={meeting.keyHighlights ?? []}
            decisions={meeting.decisions ?? []}
          />
        </Card>
      )}

      {tab === 'transcript' && (
        <Card className="p-5">
          {meeting.transcript ? (
            <pre className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-gray-600">
              {meeting.transcript}
            </pre>
          ) : (
            <p className="text-sm text-gray-400">No transcript available.</p>
          )}
        </Card>
      )}

      {tab === 'tasks' && (
        <div className="space-y-2">
          {tasks.length === 0 && <p className="text-sm text-gray-400">No tasks extracted yet.</p>}
          {tasks.map(task => (
            <TaskInlineRow key={task.taskId} task={task} onChange={updateTaskInList} />
          ))}
        </div>
      )}

      {meeting.transcript && <AskAiBar transcript={meeting.transcript} summary={meeting.summary} />}
    </div>
  )
}
