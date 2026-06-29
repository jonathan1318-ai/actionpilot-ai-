import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMeetings } from '@/hooks/useMeetings'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/date'

const STATUS_COLOR: Record<string, string> = {
  ready:       'bg-green-100 text-green-700',
  transcribing:'bg-blue-100 text-blue-700',
  extracting:  'bg-purple-100 text-purple-700',
  uploading:   'bg-gray-100 text-gray-600',
  error:       'bg-red-100 text-red-700',
}

export function MeetingsPage() {
  const { meetings, loading, fetchMeetings } = useMeetings()

  useEffect(() => { fetchMeetings() }, [fetchMeetings])

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-gray-500">{meetings.length} meetings</h2>
        <Link to="/meetings/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          + New meeting
        </Link>
      </div>

      {meetings.length === 0 && (
        <Card className="py-16 text-center text-gray-400">No meetings yet. Upload or connect a meeting to get started.</Card>
      )}

      <div className="grid gap-3">
        {meetings.map(m => (
          <Link key={m.meetingId} to={`/meetings/${m.meetingId}`}>
            <Card className="p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{m.title || 'Untitled meeting'}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{formatDate(m.date)} · {m.duration} min · {m.taskCount} tasks</p>
                </div>
                <Badge label={m.status} className={STATUS_COLOR[m.status] ?? ''} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
