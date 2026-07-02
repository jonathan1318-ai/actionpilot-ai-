import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/services/firebase/config'
import { useCalendarStore } from '@/store/calendar.store'

// calendar.events alone doesn't cover freeBusy queries - need the full calendar scope.
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar'
const ASSUMED_TOKEN_LIFETIME_SECONDS = 3500

export async function connectGoogleCalendar(): Promise<void> {
  const provider = new GoogleAuthProvider()
  provider.addScope(CALENDAR_SCOPE)
  provider.setCustomParameters({ prompt: 'consent' })

  const result = await signInWithPopup(auth, provider)
  const credential = GoogleAuthProvider.credentialFromResult(result)

  if (!credential?.accessToken) {
    throw new Error('Google did not return a Calendar access token')
  }

  useCalendarStore.getState().setToken(credential.accessToken, ASSUMED_TOKEN_LIFETIME_SECONDS)
}

export function getCalendarAccessToken(): string | null {
  const state = useCalendarStore.getState()
  return state.isConnected() ? state.accessToken : null
}
