import type { Timestamp } from 'firebase/firestore'

export type OrgPlan = 'free' | 'pro' | 'enterprise'

export interface OrgSettings {
  timezone: string
  workDayStart: string
  workDayEnd: string
  workDays: number[]
}

export interface Organization {
  orgId: string
  name: string
  domain: string
  plan: OrgPlan
  ownerId: string
  memberIds: string[]
  settings: OrgSettings
  createdAt: Timestamp
}
