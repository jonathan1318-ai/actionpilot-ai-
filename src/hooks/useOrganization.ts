import { useState, useCallback } from 'react'
import { getOrganization, getMonthlyAnalytics } from '@/services/firebase/organizations'
import { useAuthStore } from '@/store/auth.store'
import type { Organization, MonthlyAnalytics } from '@/types'

export function useOrganization() {
  const orgId = useAuthStore(s => s.user?.orgId ?? '')
  const [org, setOrg] = useState<Organization | null>(null)
  const [analytics, setAnalytics] = useState<MonthlyAnalytics | null>(null)

  const fetchOrg = useCallback(async () => {
    if (!orgId) return
    const data = await getOrganization(orgId)
    setOrg(data)
  }, [orgId])

  const fetchAnalytics = useCallback(async (period: string) => {
    if (!orgId) return
    const data = await getMonthlyAnalytics(orgId, period)
    setAnalytics(data)
  }, [orgId])

  return { org, analytics, fetchOrg, fetchAnalytics }
}
