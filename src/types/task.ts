import type { Timestamp } from 'firebase/firestore'

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
export type TaskPriority = 1 | 2 | 3 | 4
export type TaskPriorityLabel = 'critical' | 'high' | 'medium' | 'low'

export interface Task {
  taskId: string
  orgId: string
  meetingId: string | null
  title: string
  description: string
  assigneeId: string
  createdBy: string
  status: TaskStatus
  priority: TaskPriority
  priorityLabel: TaskPriorityLabel
  dueDate: Timestamp
  scheduledStart: Timestamp | null
  scheduledEnd: Timestamp | null
  calendarEventId: string | null
  isScheduled: boolean
  tags: string[]
  completedAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
