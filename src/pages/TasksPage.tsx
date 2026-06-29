import { useEffect } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { PRIORITY_COLORS } from '@/utils/task'
import { formatDate } from '@/utils/date'

export function TasksPage() {
  const { tasks, loading, fetchMyTasks, changeStatus } = useTasks()

  useEffect(() => { fetchMyTasks() }, [fetchMyTasks])

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{tasks.length} tasks assigned to you</p>

      {tasks.length === 0 && (
        <Card className="py-16 text-center text-gray-400">No tasks yet.</Card>
      )}

      {tasks.map(task => (
        <Card key={task.taskId} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{task.title}</p>
              {task.description && <p className="mt-0.5 text-xs text-gray-500">{task.description}</p>}
              <p className="mt-1 text-xs text-gray-400">Due {formatDate(task.dueDate)}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge label={task.priorityLabel} className={PRIORITY_COLORS[task.priorityLabel]} />
              <select
                className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600 focus:outline-none"
                value={task.status}
                onChange={e => changeStatus(task.taskId, e.target.value as never)}
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
  )
}
