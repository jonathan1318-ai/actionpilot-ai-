import { useEffect } from 'react'
import { onAuthChange, getOrCreateUserDoc } from '@/services/firebase/auth'
import { useAuthStore } from '@/store/auth.store'

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsub = onAuthChange(async firebaseUser => {
      if (firebaseUser) {
        const appUser = await getOrCreateUserDoc(firebaseUser)
        setUser(appUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [setUser, setLoading])

  return { user, loading }
}
