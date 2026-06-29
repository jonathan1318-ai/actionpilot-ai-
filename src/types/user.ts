import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'owner' | 'admin' | 'manager' | 'member'

export interface User {
  uid: string
  displayName: string
  email: string
  photoURL: string
  orgId: string
  role: UserRole
  calendarConnected: boolean
  timezone: string
  createdAt: Timestamp
  lastActiveAt: Timestamp
}
