import {
  collection,
  doc,
  writeBatch,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import { callGeminiProxy, extractJson } from './gemini'
import { buildExtractionPrompt } from './prompt'
import type { TaskPriority, TaskPriorityLabel } from '@/types'

interface ExtractedTask {
  title: string
  description: string
  assigneeUid: string | null
  priority: TaskPriority
  dueDate: string | null
}

interface ExtractionResponse {
  summary: string
  tasks: ExtractedTask[]
}

const PRIORITY_LABEL: Record<TaskPriority, TaskPriorityLabel> = {
  1: 'critical',
  2: 'high',
  3: 'medium',
  4: 'low',
}

export async function extractTasksFromTranscript(
  meetingId: string,
  orgId: string,
  transcript: string,
  meetingDate: Date,
  createdBy: string,
): Promise<{ taskCount: number; summary: string }> {
  const membersSnap = await getDocs(query(collection(db, 'users'), where('orgId', '==', orgId)))
  const members = membersSnap.docs.map(d => ({ uid: d.id, displayName: d.data().displayName as string }))
  const memberUids = new Set(members.map(m => m.uid))

  const dateIso = meetingDate.toISOString().slice(0, 10)
  const prompt = buildExtractionPrompt(transcript, members, dateIso)

  const text = await callGeminiProxy(prompt)
  const parsed = extractJson<ExtractionResponse>(text)

  const batch = writeBatch(db)

  for (const t of parsed.tasks) {
    const taskRef = doc(collection(db, 'tasks'))
    const assigneeId = t.assigneeUid && memberUids.has(t.assigneeUid) ? t.assigneeUid : createdBy
    const dueDate = Timestamp.fromDate(t.dueDate ? new Date(t.dueDate) : new Date(dateIso))

    batch.set(taskRef, {
      orgId,
      meetingId,
      title: t.title,
      description: t.description ?? '',
      assigneeId,
      createdBy,
      status: 'todo',
      priority: t.priority,
      priorityLabel: PRIORITY_LABEL[t.priority],
      dueDate,
      scheduledStart: null,
      scheduledEnd: null,
      calendarEventId: null,
      isScheduled: false,
      tags: [],
      completedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  batch.update(doc(db, 'meetings', meetingId), {
    status: 'ready',
    summary: parsed.summary ?? '',
    taskCount: parsed.tasks.length,
    updatedAt: serverTimestamp(),
  })

  await batch.commit()

  return { taskCount: parsed.tasks.length, summary: parsed.summary ?? '' }
}
