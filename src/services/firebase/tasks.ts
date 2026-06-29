import {
  collection,
  query,
  where,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { Task, TaskStatus } from '@/types'

const col = () => collection(db, 'tasks')

export async function listOrgTasks(orgId: string): Promise<Task[]> {
  const q = query(col(), where('orgId', '==', orgId), orderBy('createdAt', 'desc'))
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ taskId: d.id, ...d.data() } as Task))
}

export async function listMyTasks(orgId: string, userId: string): Promise<Task[]> {
  const q = query(
    col(),
    where('orgId', '==', orgId),
    where('assigneeId', '==', userId),
    orderBy('dueDate', 'asc'),
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ taskId: d.id, ...d.data() } as Task))
}

export async function listUnscheduledTasks(orgId: string): Promise<Task[]> {
  const q = query(
    col(),
    where('orgId', '==', orgId),
    where('isScheduled', '==', false),
    where('status', '==', 'todo'),
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ taskId: d.id, ...d.data() } as Task))
}

export async function listMeetingTasks(meetingId: string): Promise<Task[]> {
  const q = query(col(), where('meetingId', '==', meetingId))
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ taskId: d.id, ...d.data() } as Task))
}

export async function listOverdueTasks(orgId: string): Promise<Task[]> {
  const q = query(col(), where('orgId', '==', orgId), where('status', '==', 'overdue'))
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ taskId: d.id, ...d.data() } as Task))
}

export async function createTask(task: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(col(), {
    ...task,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const updates: Record<string, unknown> = { status, updatedAt: serverTimestamp() }
  if (status === 'completed') updates.completedAt = serverTimestamp()
  await updateDoc(doc(db, 'tasks', taskId), updates)
}

export async function scheduleTask(
  taskId: string,
  scheduledStart: Timestamp,
  scheduledEnd: Timestamp,
  calendarEventId: string,
): Promise<void> {
  await updateDoc(doc(db, 'tasks', taskId), {
    scheduledStart,
    scheduledEnd,
    calendarEventId,
    isScheduled: true,
    updatedAt: serverTimestamp(),
  })
}
