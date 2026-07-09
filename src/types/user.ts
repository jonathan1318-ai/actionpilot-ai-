import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'owner' | 'admin' | 'manager' | 'member'

export interface NotificationPrefs {
  email: boolean
  push: boolean
  weeklyDigest: boolean
}

export interface User {
  uid: string
  displayName: string
  email: string
  photoURL: string
  orgId: string
  role: UserRole
  calendarConnected: boolean
  timezone: string
  notifPrefs: NotificationPrefs
  createdAt: Timestamp
  lastActiveAt: Timestamp
}
