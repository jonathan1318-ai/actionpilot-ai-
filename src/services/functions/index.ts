import { httpsCallable } from 'firebase/functions' // import the httpsCallable function from the Firebase Functions module
import { functions } from '@/services/firebase/config' // import the Firebase Functions instance from the project's Firebase configuration

// Define TypeScript interfaces for the payloads and results of the cloud functions
interface TranscribePayload { meetingId: string; audioUrl: string }
interface TranscribeResult  { transcript: string }

// ExtractPayload and ExtractResult interfaces define the structure of the data sent to and received from the extractTasks cloud function
interface ExtractPayload { meetingId: string; transcript: string; orgId: string }
interface ExtractResult  { taskIds: string[]; summary: string; taskCount: number }

// SchedulePayload and ScheduleResult interfaces prepare the data structure for scheduling tasks, including the task IDs, organization ID, and user ID
interface SchedulePayload { taskIds: string[]; orgId: string; userId: string }
interface ScheduleResult  { scheduled: { taskId: string; eventId: string }[] }

// SearchPayload and SearchResult interfaces will read the query and organization ID for searching meetings, and return the results with meeting IDs, excerpts, and scores
interface SearchPayload { query: string; orgId: string }
interface SearchResult  { results: { meetingId: string; excerpt: string; score: number }[] }

// Define the cloud functions using the httpsCallable function, specifying the payload and result types for each function
export const transcribeMeeting = httpsCallable<TranscribePayload, TranscribeResult>(
  functions, 'transcribeMeeting',
)
// export the extractTasks, scheduleTasks, and searchMeetings functions, each with their respective payload and result types
export const extractTasks = httpsCallable<ExtractPayload, ExtractResult>(
  functions, 'extractTasks',
)
export const scheduleTasks = httpsCallable<SchedulePayload, ScheduleResult>(
  functions, 'scheduleTasks',
)
export const searchMeetings = httpsCallable<SearchPayload, SearchResult>(
  functions, 'searchMeetings',
)
