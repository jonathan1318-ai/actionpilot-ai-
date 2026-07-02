import type { Timestamp } from 'firebase/firestore'

export type MeetingPlatform = 'google_meet' | 'zoom' | 'upload' | 'manual'
export type MeetingStatus = 'uploading' | 'transcribing' | 'extracting' | 'ready' | 'error'

export interface Meeting {
  meetingId: string
  orgId: string
  title: string
  platform: MeetingPlatform
  status: MeetingStatus
  attendeeIds: string[]
  transcript: string
  summary: string
  keyHighlights: string[]
  decisions: string[]
  date: Timestamp
  duration: number
  taskCount: number
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
