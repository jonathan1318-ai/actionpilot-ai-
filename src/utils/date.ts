import type { Timestamp } from 'firebase/firestore'

export function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts) return '—'
  return ts.toDate().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(ts: Timestamp | null | undefined): string {
  if (!ts) return '—'
  return ts.toDate().toLocaleString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatTime(ts: Timestamp | null | undefined): string {
  if (!ts) return '—'
  return ts.toDate().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
}

export function currentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function isOverdue(ts: Timestamp): boolean {
  return ts.toDate() < new Date()
}

export type DateGroup = 'Today' | 'Yesterday' | 'Earlier'

export function dateGroupLabel(ts: Timestamp): DateGroup {
  const d = ts.toDate()
  const now = new Date()
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return 'Earlier'
}

