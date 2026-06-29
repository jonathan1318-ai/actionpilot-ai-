import {
  collection,
  query,
  where,
  orderBy,
  limit,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { Meeting, MeetingPlatform } from '@/types'

const col = () => collection(db, 'meetings')

export async function getMeeting(meetingId: string): Promise<Meeting | null> {
  const snap = await getDoc(doc(db, 'meetings', meetingId))
  return snap.exists() ? ({ meetingId: snap.id, ...snap.data() } as Meeting) : null
}

export async function listMeetings(orgId: string, pageSize = 20): Promise<Meeting[]> {
  const q = query(col(), where('orgId', '==', orgId), orderBy('date', 'desc'), limit(pageSize))
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ meetingId: d.id, ...d.data() } as Meeting))
}

export async function createMeeting(
  orgId: string,
  createdBy: string,
  title: string,
  platform: MeetingPlatform,
  date: Date,
  duration: number,
  attendeeIds: string[],
): Promise<string> {
  const ref = await addDoc(col(), {
    orgId,
    title,
    platform,
    status: 'uploading',
    attendeeIds,
    transcript: '',
    summary: '',
    date,
    duration,
    taskCount: 0,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateMeetingStatus(
  meetingId: string,
  updates: Partial<Pick<Meeting, 'status' | 'transcript' | 'summary' | 'taskCount'>>,
): Promise<void> {
  await updateDoc(doc(db, 'meetings', meetingId), { ...updates, updatedAt: serverTimestamp() })
}
