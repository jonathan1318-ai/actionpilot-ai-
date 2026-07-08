import type { TaskPriority, TaskPriorityLabel, TaskStatus } from '@/types'

export const PRIORITY_LABELS: Record<TaskPriorityLabel, string> = {
  critical: 'Urgent',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
}

export const PRIORITY_COLORS: Record<TaskPriorityLabel, string> = {
  critical: 'bg-red-500/12 text-red-600 dark:text-red-400',
  high:     'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  medium:   'bg-ap-accent-soft text-ap-accent',
  low:      'bg-ap-text-tertiary/12 text-ap-text-secondary',
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo:        'bg-ap-text-tertiary/12 text-ap-text-secondary',
  in_progress: 'bg-blue-500/12 text-blue-600 dark:text-blue-400',
  completed:   'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  overdue:     'bg-red-500/12 text-red-600 dark:text-red-400',
  cancelled:   'bg-ap-text-tertiary/12 text-ap-text-tertiary',
}

export function priorityFromNumber(p: TaskPriority): TaskPriorityLabel {
  const map: Record<TaskPriority, TaskPriorityLabel> = { 1: 'critical', 2: 'high', 3: 'medium', 4: 'low' }
  return map[p]
}
