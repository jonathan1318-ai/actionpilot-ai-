import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import { getGeminiModel, extractJson } from '../lib/gemini'
import { buildExtractionPrompt } from './prompt'

interface ExtractedTask {
  title: string
  description: string
  assigneeUid: string | null
  priority: 1 | 2 | 3 | 4
  dueDate: string | null
}

interface ExtractionResponse {
  summary: string
  tasks: ExtractedTask[]
}

interface ExtractTasksRequest {
  meetingId: string
  transcript: string
  orgId: string
}

const PRIORITY_LABEL = { 1: 'critical', 2: 'high', 3: 'medium', 4: 'low' } as const

export const extractTasks = onCall<ExtractTasksRequest>(
  { region: 'asia-southeast1', secrets: ['GEMINI_API_KEY'] },
  async request => {
    const uid = request.auth?.uid
    if (!uid) throw new HttpsError('unauthenticated', 'Sign-in required')

    const { meetingId, transcript, orgId } = request.data
    if (!meetingId || !transcript?.trim() || !orgId) {
      throw new HttpsError('invalid-argument', 'meetingId, transcript, and orgId are required')
    }

    const db = admin.firestore()

    const meetingRef = db.doc(`meetings/${meetingId}`)
    const meetingSnap = await meetingRef.get()
    if (!meetingSnap.exists || meetingSnap.data()?.orgId !== orgId) {
      throw new HttpsError('permission-denied', 'Meeting does not belong to this organization')
    }

    await meetingRef.update({ status: 'extracting', transcript, updatedAt: admin.firestore.FieldValue.serverTimestamp() })

    const membersSnap = await db.collection('users').where('orgId', '==', orgId).get()
    const members = membersSnap.docs.map(d => ({ uid: d.id, displayName: d.data().displayName as string }))

    const meetingDate = (meetingSnap.data()?.date as admin.firestore.Timestamp).toDate().toISOString().slice(0, 10)
    const prompt = buildExtractionPrompt(transcript, members, meetingDate)

    let parsed: ExtractionResponse
    try {
      const model = getGeminiModel()
      const result = await model.generateContent(prompt)
      parsed = extractJson<ExtractionResponse>(result.response.text())
    } catch (err) {
      await meetingRef.update({ status: 'error', updatedAt: admin.firestore.FieldValue.serverTimestamp() })
      throw new HttpsError('internal', `Gemini extraction failed: ${(err as Error).message}`)
    }

    const memberUids = new Set(members.map(m => m.uid))
    const batch = db.batch()
    const createdTaskIds: string[] = []

    for (const t of parsed.tasks) {
      const taskRef = db.collection('tasks').doc()
      const assigneeId = t.assigneeUid && memberUids.has(t.assigneeUid) ? t.assigneeUid : uid
      const dueDate = t.dueDate ? admin.firestore.Timestamp.fromDate(new Date(t.dueDate)) : admin.firestore.Timestamp.fromDate(new Date(meetingDate))

      batch.set(taskRef, {
        orgId,
        meetingId,
        title: t.title,
        description: t.description ?? '',
        assigneeId,
        createdBy: uid,
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
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      createdTaskIds.push(taskRef.id)
    }

    batch.update(meetingRef, {
      status: 'ready',
      summary: parsed.summary ?? '',
      taskCount: createdTaskIds.length,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    await batch.commit()

    return { taskIds: createdTaskIds, summary: parsed.summary, taskCount: createdTaskIds.length }
  },
)
