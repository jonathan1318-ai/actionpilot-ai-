import { Timestamp } from 'firebase/firestore'
import type { Task, User, MemberStat, MonthlyAnalytics } from '@/types'

function isOverdueTask(task: Task): boolean {
  if (task.status === 'overdue') return true
  if (task.status === 'completed' || task.status === 'cancelled') return false
  return task.dueDate.toDate() < new Date()
}

export function computeAnalytics(tasks: Task[], members: User[]): MonthlyAnalytics {
  const tasksCreated = tasks.length
  const tasksCompleted = tasks.filter(t => t.status === 'completed').length
  const tasksOverdue = tasks.filter(isOverdueTask).length
  const completionRate = tasksCreated > 0 ? tasksCompleted / tasksCreated : 0

  const memberStats: Record<string, MemberStat> = {}
  for (const member of members) {
    const assigned = tasks.filter(t => t.assigneeId === member.uid)
    const completed = assigned.filter(t => t.status === 'completed').length
    const overdue = assigned.filter(isOverdueTask).length
    memberStats[member.uid] = {
      assigned: assigned.length,
      completed,
      overdue,
      completionRate: assigned.length > 0 ? completed / assigned.length : 0,
    }
  }

  return {
    period: 'all-time',
    tasksCreated,
    tasksCompleted,
    tasksOverdue,
    completionRate,
    memberStats,
    updatedAt: Timestamp.now(),
  }
}
