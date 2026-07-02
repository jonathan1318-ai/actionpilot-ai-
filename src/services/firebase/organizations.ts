import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { db } from './config'
import type { Organization, MonthlyAnalytics, User } from '@/types'

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const snap = await getDoc(doc(db, 'organizations', orgId))
  return snap.exists() ? ({ orgId: snap.id, ...snap.data() } as Organization) : null
}

export async function createOrganization(
  ownerId: string,
  name: string,
  domain: string,
): Promise<string> {
  const ref = await addDoc(collection(db, 'organizations'), {
    name,
    domain,
    plan: 'free',
    ownerId,
    memberIds: [ownerId],
    settings: {
      timezone: 'Asia/Kuala_Lumpur',
      workDayStart: '09:00',
      workDayEnd: '18:00',
      workDays: [1, 2, 3, 4, 5],
    },
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'users', ownerId), { orgId: ref.id, role: 'owner' })
  return ref.id
}

export async function getMonthlyAnalytics(orgId: string, period: string): Promise<MonthlyAnalytics | null> {
  const snap = await getDoc(doc(db, 'organizations', orgId, 'analytics', period))
  return snap.exists() ? (snap.data() as MonthlyAnalytics) : null
}

export async function listOrgUsers(orgId: string): Promise<User[]> {
  const q = query(collection(db, 'users'), where('orgId', '==', orgId))
  const snaps = await getDocs(q)
  return snaps.docs.map(d => d.data() as User)
}
