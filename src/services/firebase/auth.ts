import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from './config'
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
    return snap.data() as User
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
    createdAt:         serverTimestamp(),
    lastActiveAt:      serverTimestamp(),
  }

  await setDoc(ref, newUser)
  return (await getDoc(ref)).data() as User
}
