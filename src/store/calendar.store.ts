import { create } from 'zustand'

interface CalendarState {
  accessToken: string | null
  expiresAt: number | null
  setToken: (token: string, expiresInSeconds: number) => void
  clearToken: () => void
  isConnected: () => boolean
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  accessToken: null,
  expiresAt: null,
  setToken: (token, expiresInSeconds) => set({ accessToken: token, expiresAt: Date.now() + expiresInSeconds * 1000 }),
  clearToken: () => set({ accessToken: null, expiresAt: null }),
  isConnected: () => {
    const { accessToken, expiresAt } = get()
    return !!accessToken && !!expiresAt && Date.now() < expiresAt
  },
}))
