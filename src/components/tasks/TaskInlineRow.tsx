import { updateTaskStatus } from '@/services/firebase/tasks'
import { Badge } from '@/components/ui/Badge'
import { PRIORITY_COLORS } from '@/utils/task'
import { formatDate } from '@/utils/date'
import type { Task } from '@/types'

interface Props {
  task: Task
  onChange?: (task: Task) => void
}

export function TaskInlineRow({ task, onChange }: Props) {
  const completed = task.status === 'completed'

  async function toggle() {
    const nextStatus = completed ? 'todo' : 'completed'
    await updateTaskStatus(task.taskId, nextStatus)
    onChange?.({ ...task, status: nextStatus })
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
      <input
        type="checkbox"
        checked={completed}
        onChange={toggle}
        className="h-4 w-4 shrink-0 accent-brand-600"
      />
      <span className={`flex-1 text-sm ${completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
        {task.title}
      </span>
      <span className="shrink-0 text-xs text-gray-400">Due {formatDate(task.dueDate)}</span>
      <Badge label={task.priorityLabel} className={`shrink-0 ${PRIORITY_COLORS[task.priorityLabel]}`} />
    </div>
  )
}
