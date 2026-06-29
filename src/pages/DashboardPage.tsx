import { useEffect } from 'react'
import { useOrganization } from '@/hooks/useOrganization'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { currentPeriod } from '@/utils/date'

export function DashboardPage() {
  const { analytics, fetchAnalytics } = useOrganization()

  useEffect(() => { fetchAnalytics(currentPeriod()) }, [fetchAnalytics])

  if (!analytics) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>

  const rate = Math.round(analytics.completionRate * 100)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Tasks created"   value={analytics.tasksCreated} />
        <StatCard label="Completed"       value={analytics.tasksCompleted} color="text-green-600" />
        <StatCard label="Overdue"         value={analytics.tasksOverdue}   color="text-red-600" />
        <StatCard label="Completion rate" value={`${rate}%`}               color={rate >= 70 ? 'text-green-600' : 'text-orange-500'} />
      </div>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Team performance · {analytics.period}</h3>
        <div className="space-y-3">
          {Object.entries(analytics.memberStats).map(([uid, stat]) => (
            <div key={uid} className="flex items-center gap-3">
              <span className="w-32 truncate text-xs text-gray-500">{uid}</span>
              <div className="flex-1 rounded-full bg-gray-100 h-2">
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
