import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from './config'
import { createOrganization } from './organizations'
import { findPendingInviteForEmail, acceptInvite } from './invites'
import type { User } from '@/types'

async function joinOrgOrCreateOne(uid: string, email: string, displayName: string): Promise<{ orgId: string; role: User['role'] }> {
  const invite = email ? await findPendingInviteForEmail(email) : null
  if (invite) {
    await acceptInvite(invite, uid)
    return { orgId: invite.orgId, role: invite.role }
  }
  const orgId = await createOrganization(uid, `${displayName || 'My'}'s Workspace`, '')
  return { orgId, role: 'owner' }
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider)
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function getOrCreateUserDoc(firebaseUser: FirebaseUser): Promise<User> {
  const ref = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    await setDoc(ref, { lastActiveAt: serverTimestamp() }, { merge: true })
    const existing = snap.data() as User
    if (!existing.orgId) {
      const { orgId, role } = await joinOrgOrCreateOne(firebaseUser.uid, existing.email, existing.displayName)
      return { ...existing, orgId, role }
    }
    return existing
  }

  const newUser: Omit<User, 'createdAt' | 'lastActiveAt'> & Record<string, unknown> = {
    uid:               firebaseUser.uid,
    displayName:       firebaseUser.displayName ?? '',
    email:             firebaseUser.email ?? '',
    photoURL:          firebaseUser.photoURL ?? '',
    orgId:             '',
    role:              'member',
    calendarConnected: false,
    timezone:          'Asia/Kuala_Lumpur',
    notifPrefs:        { email: true, push: true, weeklyDigest: false },
    createdAt:         serverTimestamp(),
    lastActiveAt:      serverTimestamp(),
  }

  await setDoc(ref, newUser)
  const { orgId, role } = await joinOrgOrCreateOne(firebaseUser.uid, newUser.email, newUser.displayName)
  return { ...(await getDoc(ref)).data(), orgId, role } as User
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<User, 'displayName' | 'timezone' | 'notifPrefs'>>,
): Promise<void> {
  await setDoc(doc(db, 'users', uid), updates, { merge: true })
}
