import { useEffect, useMemo, useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/utils/task'
import { formatDate } from '@/utils/date'
import type { TaskStatus } from '@/types'

const FILTERS: { key: 'all' | TaskStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
]

export function TasksPage() {
  const { tasks, loading, fetchMyTasks, changeStatus } = useTasks()
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')

  useEffect(() => { fetchMyTasks() }, [fetchMyTasks])

  const visibleTasks = useMemo(
    () => tasks.filter(t => filter === 'all' || t.status === filter),
    [tasks, filter],
  )

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>

  return (
    <div className="mx-auto max-w-[780px]">
      <div className="mb-[18px] flex gap-1.5">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 whitespace-nowrap rounded-[10px] border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
              filter === f.key
                ? 'border-transparent bg-ap-accent text-white'
                : 'border-ap-border bg-ap-surface text-ap-text-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {visibleTasks.length === 0 && (
          <Card className="py-16 text-center text-ap-text-tertiary">No tasks in this view.</Card>
        )}

        {visibleTasks.map(task => (
          <Card key={task.taskId}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-ap-text-primary">{task.title}</p>
                {task.description && <p className="mt-0.5 text-xs text-ap-text-secondary">{task.description}</p>}
                <p className="mt-1 text-[12.5px] text-ap-text-tertiary">Due {formatDate(task.dueDate)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Badge label={PRIORITY_LABELS[task.priorityLabel]} className={PRIORITY_COLORS[task.priorityLabel]} />
                <select
                  className="rounded-lg border border-ap-border bg-ap-surface-alt px-2 py-1 text-xs text-ap-text-primary outline-none"
                  value={task.status}
                  onChange={e => changeStatus(task.taskId, e.target.value as TaskStatus)}
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
