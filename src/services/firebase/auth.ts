import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from './config'
import { createOrganization } from './organizations'
import type { User } from '@/types'

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
      const orgId = await createOrganization(firebaseUser.uid, `${existing.displayName || 'My'}'s Workspace`, '')
      return { ...existing, orgId }
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
  const orgId = await createOrganization(firebaseUser.uid, `${newUser.displayName || 'My'}'s Workspace`, '')
  return { ...(await getDoc(ref)).data(), orgId } as User
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<User, 'displayName' | 'timezone' | 'notifPrefs'>>,
): Promise<void> {
  await setDoc(doc(db, 'users', uid), updates, { merge: true })
}
