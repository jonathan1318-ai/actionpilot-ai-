import { useCallback } from 'react'
import { listMeetings } from '@/services/firebase/meetings'
import { useMeetingStore } from '@/store/meeting.store'
import { useAuthStore } from '@/store/auth.store'

export function useMeetings() {
  const { meetings, loading, setMeetings, setLoading } = useMeetingStore()
  const orgId = useAuthStore(s => s.user?.orgId ?? '')

  const fetchMeetings = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const data = await listMeetings(orgId)
      setMeetings(data)
    } finally {
      setLoading(false)
    }
  }, [orgId, setMeetings, setLoading])

  return { meetings, loading, fetchMeetings }
}
