import type { Timestamp } from 'firebase/firestore'

export interface MemberStat {
  assigned: number
  completed: number
  overdue: number
  completionRate: number
}

export interface MonthlyAnalytics {
  period: string
  tasksCreated: number
  tasksCompleted: number
  tasksOverdue: number
  completionRate: number
  memberStats: Record<string, MemberStat>
  updatedAt: Timestamp
}
