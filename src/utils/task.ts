import type { TaskPriority, TaskPriorityLabel, TaskStatus } from '@/types'

export const PRIORITY_COLORS: Record<TaskPriorityLabel, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-gray-100 text-gray-600',
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo:        'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  overdue:     'bg-red-100 text-red-700',
  cancelled:   'bg-gray-100 text-gray-400',
}

export function priorityFromNumber(p: TaskPriority): TaskPriorityLabel {
  const map: Record<TaskPriority, TaskPriorityLabel> = { 1: 'critical', 2: 'high', 3: 'medium', 4: 'low' }
  return map[p]
}
