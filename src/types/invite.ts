import type { Timestamp } from 'firebase/firestore'
import type { UserRole } from './user'

export type InviteStatus = 'pending' | 'accepted' | 'revoked'

export interface Invite {
  id: string
  orgId: string
  orgName: string
  email: string
  role: UserRole
  invitedBy: string
  status: InviteStatus
  createdAt: Timestamp
}
