import { useEffect, useState } from 'react'
import { listUnscheduledTasks } from '@/services/firebase/tasks'
import { scheduleTasks } from '@/services/functions'
import { useAuthStore } from '@/store/auth.store'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { PRIORITY_COLORS } from '@/utils/task'
import { formatDate } from '@/utils/date'
import type { Task } from '@/types'

export function SchedulerPage() {
  const user = useAuthStore(s => s.user)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduling, setScheduling] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

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

  async function handleSchedule() {
    if (!user || selected.size === 0) return
    setScheduling(true)
    try {
      await scheduleTasks({ taskIds: [...selected], orgId: user.orgId, userId: user.uid })
      setTasks(prev => prev.filter(t => !selected.has(t.taskId)))
      setSelected(new Set())
    } finally {
      setScheduling(false)
    }
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Unscheduled tasks</h2>
          <p className="text-xs text-gray-400 mt-0.5">Select tasks to book focus time on your calendar.</p>
        </div>
        <Button onClick={handleSchedule} loading={scheduling} disabled={selected.size === 0}>
          Schedule {selected.size > 0 ? `(${selected.size})` : ''}
        </Button>
      </div>

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
    </div>
  )
}
