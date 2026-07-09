import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { applyAccent, type AccentKey } from '@/utils/theme'

interface ThemeState {
  dark: boolean
  accent: AccentKey
  toggleDark: () => void
  setAccent: (accent: AccentKey) => void
  hydrate: () => void
}

function applyDarkClass(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: false,
      accent: 'indigo',
      toggleDark: () => {
        const dark = !get().dark
        set({ dark })
        applyDarkClass(dark)
        applyAccent(get().accent, dark)
      },
      setAccent: accent => {
        set({ accent })
        applyAccent(accent, get().dark)
      },
      hydrate: () => {
        applyDarkClass(get().dark)
        applyAccent(get().accent, get().dark)
      },
    }),
    { name: 'actionpilot-theme' },
  ),
)
