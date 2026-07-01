import { httpsCallable } from 'firebase/functions'
import { functions } from '@/services/firebase/config'

interface TranscribePayload { meetingId: string; audioUrl: string }
interface TranscribeResult  { transcript: string }

interface ExtractPayload { meetingId: string; transcript: string; orgId: string }
interface ExtractResult  { taskIds: string[]; summary: string; taskCount: number }

interface SchedulePayload { taskIds: string[]; orgId: string; userId: string }
interface ScheduleResult  { scheduled: { taskId: string; eventId: string }[] }

interface SearchPayload { query: string; orgId: string }
interface SearchResult  { results: { meetingId: string; excerpt: string; score: number }[] }

export const transcribeMeeting = httpsCallable<TranscribePayload, TranscribeResult>(
  functions, 'transcribeMeeting',
)
export const extractTasks = httpsCallable<ExtractPayload, ExtractResult>(
  functions, 'extractTasks',
)
export const scheduleTasks = httpsCallable<SchedulePayload, ScheduleResult>(
  functions, 'scheduleTasks',
)
export const searchMeetings = httpsCallable<SearchPayload, SearchResult>(
  functions, 'searchMeetings',
)
