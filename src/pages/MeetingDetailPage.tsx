import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMeeting } from '@/services/firebase/meetings'
import { listMeetingTasks } from '@/services/firebase/tasks'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { formatDateTime } from '@/utils/date'
import { Badge } from '@/components/ui/Badge'
import { PRIORITY_COLORS, STATUS_COLORS } from '@/utils/task'
import type { Meeting, Task } from '@/types'

export function MeetingDetailPage() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!meetingId) return
    Promise.all([getMeeting(meetingId), listMeetingTasks(meetingId)])
      .then(([m, t]) => { setMeeting(m); setTasks(t) })
      .finally(() => setLoading(false))
  }, [meetingId])

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>
  if (!meeting) return <p className="text-gray-500">Meeting not found.</p>

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{meeting.title}</h2>
        <p className="text-sm text-gray-400">{formatDateTime(meeting.date)} · {meeting.duration} min · {meeting.platform}</p>
      </div>

      {meeting.summary && (
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Summary</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{meeting.summary}</p>
        </Card>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Tasks ({tasks.length})</h3>
        <div className="space-y-2">
          {tasks.map(task => (
            <Card key={task.taskId} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                <div className="flex gap-1.5 shrink-0">
                  <Badge label={task.priorityLabel} className={PRIORITY_COLORS[task.priorityLabel]} />
                  <Badge label={task.status} className={STATUS_COLORS[task.status]} />
                </div>
              </div>
              {task.description && <p className="mt-1 text-xs text-gray-500">{task.description}</p>}
            </Card>
          ))}
          {tasks.length === 0 && <p className="text-sm text-gray-400">No tasks extracted yet.</p>}
        </div>
      </div>

      {meeting.transcript && (
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Transcript</h3>
          <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap text-xs text-gray-500 leading-relaxed">{meeting.transcript}</pre>
        </Card>
      )}
    </div>
  )
}
