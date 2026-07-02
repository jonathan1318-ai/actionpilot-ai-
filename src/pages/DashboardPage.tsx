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

  useEffect(() => {
    if (!orgId) return
    Promise.all([listOrgTasks(orgId), listOrgUsers(orgId)])
      .then(([tasks, users]) => {
        setMembers(users)
        setAnalytics(computeAnalytics(tasks, users))
      })
      .finally(() => setLoading(false))
  }, [orgId])

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>
  if (!analytics) return <p className="text-gray-500">No data yet.</p>

  const rate = Math.round(analytics.completionRate * 100)
  const memberName = (uid: string) => members.find(m => m.uid === uid)?.displayName ?? uid
  const activeMembers = Object.entries(analytics.memberStats).filter(([, stat]) => stat.assigned > 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Tasks created" value={analytics.tasksCreated} />
        <StatCard label="Completed" value={analytics.tasksCompleted} color="text-green-600" />
        <StatCard label="Overdue" value={analytics.tasksOverdue} color="text-red-600" />
        <StatCard label="Completion rate" value={`${rate}%`} color={rate >= 70 ? 'text-green-600' : 'text-orange-500'} />
      </div>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Team performance</h3>
        {activeMembers.length === 0 && (
          <p className="text-sm text-gray-400">No tasks assigned to team members yet.</p>
        )}
        <div className="space-y-3">
          {activeMembers.map(([uid, stat]) => (
            <div key={uid} className="flex items-center gap-3">
              <span className="w-32 truncate text-xs text-gray-500">{memberName(uid)}</span>
              <div className="h-2 flex-1 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-brand-500 transition-all"
                  style={{ width: `${Math.round(stat.completionRate * 100)}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs text-gray-600">{Math.round(stat.completionRate * 100)}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value, color = 'text-gray-900' }: { label: string; value: string | number; color?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </Card>
  )
}
