import { useEffect, useState } from 'react'
import { listOrgTasks } from '@/services/firebase/tasks'
import { listOrgUsers } from '@/services/firebase/organizations'
import { computeAnalytics } from '@/services/analytics/compute'
import { useAuthStore } from '@/store/auth.store'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { MonthlyAnalytics, User } from '@/types'

export function DashboardPage() {
  const orgId = useAuthStore(s => s.user?.orgId ?? '')
  const [analytics, setAnalytics] = useState<MonthlyAnalytics | null>(null)
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orgId) return
    Promise.all([listOrgTasks(orgId), listOrgUsers(orgId)])
      .then(([tasks, users]) => {
        setMembers(users)
        setAnalytics(computeAnalytics(tasks, users))
      })
      .catch(err => setError((err as Error).message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [orgId])

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>
  if (error) return <p className="text-sm text-red-500">{error}</p>
  if (!analytics) return <p className="text-ap-text-secondary">No data yet.</p>

  const rate = Math.round(analytics.completionRate * 100)
  const memberName = (uid: string) => members.find(m => m.uid === uid)?.displayName ?? uid
  const activeMembers = Object.entries(analytics.memberStats).filter(([, stat]) => stat.assigned > 0)

  return (
    <div className="mx-auto flex max-w-[920px] flex-col gap-5">
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StatCard label="Tasks created" value={analytics.tasksCreated} />
        <StatCard label="Completed" value={analytics.tasksCompleted} color="#1a9c4a" />
        <StatCard label="Overdue" value={analytics.tasksOverdue} color="#d6301f" />
        <StatCard label="Completion rate" value={`${rate}%`} color="var(--ap-accent)" />
      </div>

      <Card>
        <h3 className="mb-4 text-[13.5px] font-bold text-ap-text-primary">Team performance</h3>
        {activeMembers.length === 0 && (
          <p className="text-sm text-ap-text-tertiary">No tasks assigned to team members yet.</p>
        )}
        <div className="flex flex-col gap-3.5">
          {activeMembers.map(([uid, stat]) => (
            <div key={uid} className="flex items-center gap-3">
              <span className="w-[110px] shrink-0 truncate text-[13px] text-ap-text-secondary">{memberName(uid)}</span>
              <div className="h-2 flex-1 rounded-full bg-ap-surface-alt">
                <div
                  className="h-2 rounded-full bg-ap-accent transition-all"
                  style={{ width: `${Math.round(stat.completionRate * 100)}%` }}
                />
              </div>
              <span className="w-[38px] shrink-0 text-right text-[12.5px] font-semibold text-ap-text-secondary">
                {Math.round(stat.completionRate * 100)}%
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value, color = 'var(--ap-text-primary)' }: { label: string; value: string | number; color?: string }) {
  return (
    <Card>
      <p className="text-xs font-semibold text-ap-text-tertiary">{label}</p>
      <p className="mt-2 text-[28px] font-bold tracking-tight" style={{ color }}>{value}</p>
    </Card>
  )
}
