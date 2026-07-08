export type AccentKey = 'indigo' | 'teal' | 'coral' | 'violet'

interface AccentDef {
  base: string
  dark: string
  soft: string
  softDark: string
}

export const ACCENTS: Record<AccentKey, AccentDef> = {
  indigo: { base: '#4f46e5', dark: '#7c76f0', soft: 'rgba(79,70,229,0.12)', softDark: 'rgba(124,118,240,0.16)' },
  teal:   { base: '#0d9488', dark: '#2dd4bf', soft: 'rgba(13,148,136,0.12)', softDark: 'rgba(45,212,191,0.16)' },
  coral:  { base: '#e2543f', dark: '#ff8266', soft: 'rgba(226,84,63,0.12)', softDark: 'rgba(255,130,102,0.16)' },
  violet: { base: '#8b5cf6', dark: '#a78bfa', soft: 'rgba(139,92,246,0.12)', softDark: 'rgba(167,139,250,0.16)' },
}

export const ACCENT_ORDER: AccentKey[] = ['indigo', 'violet', 'coral', 'teal']

export const ACCENT_LABELS: Record<AccentKey, string> = {
  indigo: 'Indigo',
  teal: 'Teal',
  coral: 'Coral',
  violet: 'Violet',
}

export function applyAccent(accent: AccentKey, dark: boolean) {
  const def = ACCENTS[accent] ?? ACCENTS.indigo
  const root = document.documentElement.style
  root.setProperty('--ap-accent', def.base)
  root.setProperty('--ap-accent-dark', def.dark)
  root.setProperty('--ap-accent-soft', dark ? def.softDark : def.soft)
}
