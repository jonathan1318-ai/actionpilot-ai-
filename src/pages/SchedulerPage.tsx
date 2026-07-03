import { useEffect, useState } from 'react'
import { listUnscheduledTasks } from '@/services/firebase/tasks'
import { getOrganization } from '@/services/firebase/organizations'
import { connectGoogleCalendar, getCalendarAccessToken } from '@/services/google/auth'
import {
  proposeSchedule,
  confirmSchedule,
  hourFromTimeString,
  DEFAULT_WORK_HOURS,
  type WorkHours,
  type ScheduleProposal,
} from '@/services/google/scheduler'
import { useAuthStore } from '@/store/auth.store'
import { useCalendarStore } from '@/store/calendar.store'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { ScheduleConfirmDialog } from '@/components/scheduler/ScheduleConfirmDialog'
import { PRIORITY_COLORS } from '@/utils/task'
import { formatDate } from '@/utils/date'
import type { Task } from '@/types'

export function SchedulerPage() {
  const user = useAuthStore(s => s.user)
  const connected = useCalendarStore(s => s.isConnected())
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [proposing, setProposing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [proposals, setProposals] = useState<ScheduleProposal[] | null>(null)
  const [error, setError] = useState('')
  const [dialogError, setDialogError] = useState('')

  useEffect(() => {
    if (!user) return
    listUnscheduledTasks(user.orgId)
      .then(setTasks)
      .finally(() => setLoading(false))
  }, [user])

  function toggle(taskId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(taskId) ? next.delete(taskId) : next.add(taskId)
      return next
    })
  }

  async function handleConnect() {
    setConnecting(true)
    setError('')
    try {
      await connectGoogleCalendar()
    } catch (err) {
      setError((err as Error).message || 'Failed to connect Google Calendar')
    } finally {
      setConnecting(false)
    }
  }

  async function handlePropose() {
    if (!user || selected.size === 0) return
    const accessToken = getCalendarAccessToken()
    if (!accessToken) {
      setError('Google Calendar connection expired. Please reconnect.')
      return
    }
    setProposing(true)
    setError('')
    try {
      const org = await getOrganization(user.orgId)
      const workHours: WorkHours = org
        ? {
            startHour: hourFromTimeString(org.settings.workDayStart),
            endHour: hourFromTimeString(org.settings.workDayEnd),
            workDays: org.settings.workDays,
          }
        : DEFAULT_WORK_HOURS

      const selectedTasks = tasks.filter(t => selected.has(t.taskId))
      const proposed = await proposeSchedule(accessToken, selectedTasks, workHours)
      setProposals(proposed)
    } catch (err) {
      setError((err as Error).message || 'Failed to propose a schedule')
    } finally {
      setProposing(false)
    }
  }

  async function handleConfirm(edited: ScheduleProposal[]) {
    const accessToken = getCalendarAccessToken()
    if (!accessToken) {
      setDialogError('Google Calendar connection expired. Please reconnect.')
      return
    }
    setConfirming(true)
    setDialogError('')
    try {
      await confirmSchedule(accessToken, edited)
      const scheduledIds = new Set(edited.map(p => p.taskId))
      setTasks(prev => prev.filter(t => !scheduledIds.has(t.taskId)))
      setSelected(new Set())
      setProposals(null)
    } catch (err) {
      setDialogError((err as Error).message || 'Failed to book the calendar events')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Unscheduled tasks</h2>
          <p className="mt-0.5 text-xs text-gray-400">Select tasks to book focus time on your calendar.</p>
        </div>
        {connected ? (
          <Button onClick={handlePropose} loading={proposing} disabled={selected.size === 0}>
            Schedule {selected.size > 0 ? `(${selected.size})` : ''}
          </Button>
        ) : (
          <Button onClick={handleConnect} loading={connecting} variant="secondary">
            Connect Google Calendar
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {tasks.length === 0 && (
        <Card className="py-16 text-center text-gray-400">All tasks are scheduled.</Card>
      )}

      {tasks.map(task => (
        <Card
          key={task.taskId}
          className={`cursor-pointer p-4 transition-all ${selected.has(task.taskId) ? 'ring-2 ring-brand-500' : ''}`}
          onClick={() => toggle(task.taskId)}
        >
          <div className="flex items-center gap-3">
            <input type="checkbox" readOnly checked={selected.has(task.taskId)} className="h-4 w-4 accent-brand-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{task.title}</p>
              <p className="text-xs text-gray-400">Due {formatDate(task.dueDate)}</p>
            </div>
            <Badge label={task.priorityLabel} className={PRIORITY_COLORS[task.priorityLabel]} />
          </div>
        </Card>
      ))}

      {proposals && (
        <ScheduleConfirmDialog
          proposals={proposals}
          onCancel={() => { setProposals(null); setDialogError('') }}
          onConfirm={handleConfirm}
          confirming={confirming}
          error={dialogError}
        />
      )}
    </div>
  )
}
