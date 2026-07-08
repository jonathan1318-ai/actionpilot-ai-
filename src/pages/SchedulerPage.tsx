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
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/utils/task'
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
    <div className="mx-auto max-w-[720px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[15.5px] font-bold text-ap-text-primary">Unscheduled tasks</h2>
          <p className="mt-1 text-[12.5px] text-ap-text-tertiary">Select tasks to book focus time on your calendar.</p>
        </div>
        {connected ? (
          <Button onClick={handlePropose} loading={proposing} disabled={selected.size === 0}>
            Schedule{selected.size > 0 ? ` (${selected.size})` : ''}
          </Button>
        ) : (
          <Button onClick={handleConnect} loading={connecting} variant="secondary" className="whitespace-nowrap">
            Connect Google Calendar
          </Button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-[18px] flex flex-col gap-2.5">
        {tasks.length === 0 && (
          <Card className="py-16 text-center text-ap-text-tertiary">All tasks are scheduled.</Card>
        )}

        {tasks.map(task => {
          const isSelected = selected.has(task.taskId)
          return (
            <div
              key={task.taskId}
              onClick={() => toggle(task.taskId)}
              className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border bg-ap-surface px-4 py-3.5 transition-shadow ${
                isSelected ? 'border-ap-accent shadow-[0_0_0_1px_var(--ap-accent)]' : 'border-ap-border'
              }`}
            >
              <span
                className={`h-[18px] w-[18px] shrink-0 rounded-[6px] border-2 ${
                  isSelected ? 'border-ap-accent bg-ap-accent' : 'border-ap-border bg-transparent'
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ap-text-primary">{task.title}</p>
                <p className="text-xs text-ap-text-tertiary">Due {formatDate(task.dueDate)}</p>
              </div>
              <Badge label={PRIORITY_LABELS[task.priorityLabel]} className={PRIORITY_COLORS[task.priorityLabel]} />
            </div>
          )
        })}
      </div>

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
