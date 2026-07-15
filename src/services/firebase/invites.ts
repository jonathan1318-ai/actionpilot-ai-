import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { db } from './config'
import type { Invite, UserRole } from '@/types'

function inviteId(orgId: string, email: string): string {
  return `${orgId}__${email.trim().toLowerCase()}`
}

export async function createInvite(
  orgId: string,
  orgName: string,
  email: string,
  role: UserRole,
  invitedBy: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()
  await setDoc(doc(db, 'invites', inviteId(orgId, normalizedEmail)), {
    orgId,
    orgName,
    email: normalizedEmail,
    role,
    invitedBy,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export async function listOrgInvites(orgId: string): Promise<Invite[]> {
  const q = query(
    collection(db, 'invites'),
    where('orgId', '==', orgId),
    where('status', '==', 'pending'),
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }) as Invite)
}

export async function revokeInvite(inviteId: string): Promise<void> {
  await updateDoc(doc(db, 'invites', inviteId), { status: 'revoked' })
}

export async function findPendingInviteForEmail(email: string): Promise<Invite | null> {
  const q = query(
    collection(db, 'invites'),
    where('email', '==', email.trim().toLowerCase()),
    where('status', '==', 'pending'),
  )
  const snaps = await getDocs(q)
  if (snaps.empty) return null
  const d = snaps.docs[0]
  return { id: d.id, ...d.data() } as Invite
}

export async function acceptInvite(invite: Invite, uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { orgId: invite.orgId, role: invite.role })
  await updateDoc(doc(db, 'invites', invite.id), { status: 'accepted' })
}
