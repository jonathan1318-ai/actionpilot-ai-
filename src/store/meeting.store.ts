import { create } from 'zustand'
import type { Meeting } from '@/types'

interface MeetingState {
  meetings: Meeting[]
  activeMeeting: Meeting | null
  loading: boolean
  setMeetings: (meetings: Meeting[]) => void
  setActiveMeeting: (meeting: Meeting | null) => void
  setLoading: (loading: boolean) => void
  upsertMeeting: (meeting: Meeting) => void
}

export const useMeetingStore = create<MeetingState>(set => ({
  meetings:      [],
  activeMeeting: null,
  loading:       false,
  setMeetings:       meetings      => set({ meetings }),
  setActiveMeeting:  activeMeeting => set({ activeMeeting }),
  setLoading:        loading       => set({ loading }),
  upsertMeeting: meeting => set(state => {
    const idx = state.meetings.findIndex(m => m.meetingId === meeting.meetingId)
    if (idx === -1) return { meetings: [meeting, ...state.meetings] }
    const next = [...state.meetings]
    next[idx] = meeting
    return { meetings: next }
  }),
}))
