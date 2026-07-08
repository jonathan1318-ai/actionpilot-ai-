import type { MeetingStatus } from '@/types'

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  ready: 'Ready',
  transcribing: 'Transcribing',
  extracting: 'Extracting',
  uploading: 'Uploading',
  error: 'Error',
}

export const MEETING_STATUS_COLORS: Record<MeetingStatus, string> = {
  ready:        'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  transcribing: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  extracting:   'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  uploading:    'bg-ap-text-tertiary/15 text-ap-text-secondary',
  error:        'bg-red-500/15 text-red-600 dark:text-red-400',
}
