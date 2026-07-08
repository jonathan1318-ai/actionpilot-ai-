import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMeetings } from '@/hooks/useMeetings'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { MeetingBadge } from '@/components/meetings/MeetingBadge'
import { formatTime, dateGroupLabel, type DateGroup } from '@/utils/date'
import { MEETING_STATUS_COLORS, MEETING_STATUS_LABELS } from '@/utils/status'
import type { Meeting } from '@/types'

const GROUP_ORDER: DateGroup[] = ['Today', 'Yesterday', 'Earlier']

function groupMeetings(meetings: Meeting[]): Record<DateGroup, Meeting[]> {
  const groups: Record<DateGroup, Meeting[]> = { Today: [], Yesterday: [], Earlier: [] }
  for (const m of meetings) groups[dateGroupLabel(m.date)].push(m)
  return groups
}

export function MeetingsPage() {
  const { meetings, loading, fetchMeetings } = useMeetings()

  useEffect(() => { fetchMeetings() }, [fetchMeetings])

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>

  const groups = groupMeetings(meetings)

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-[26px]">
      {meetings.length === 0 && (
        <Card className="py-16 text-center text-ap-text-tertiary">
          No meetings yet. Tap "New meeting" to get started.
        </Card>
      )}

      {GROUP_ORDER.filter(g => groups[g].length > 0).map(group => (
        <div key={group}>
          <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ap-text-tertiary">{group}</h3>
          <div className="flex flex-col gap-2">
            {groups[group].map(m => (
              <Link key={m.meetingId} to={`/meetings/${m.meetingId}`}>
                <Card className="flex items-center gap-3.5 !p-4 transition-shadow hover:shadow-md dark:hover:shadow-black/30">
                  <MeetingBadge title={m.title} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold text-ap-text-primary">{m.title || 'Untitled meeting'}</p>
                    <p className="mt-0.5 text-[12.5px] text-ap-text-tertiary">
                      {formatTime(m.date)} · {m.duration} min · {m.taskCount} tasks
                    </p>
                  </div>
                  <Badge label={MEETING_STATUS_LABELS[m.status]} className={MEETING_STATUS_COLORS[m.status]} />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
