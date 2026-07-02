import { listMeetings } from '@/services/firebase/meetings'
import { callAiProxy, extractJson } from './proxy'

export interface SearchResultItem {
  meetingId: string
  title: string
  excerpt: string
}

export interface SearchResponse {
  answer: string
  results: SearchResultItem[]
}

export async function searchMeetings(orgId: string, questionText: string): Promise<SearchResponse> {
  const meetings = await listMeetings(orgId, 50)
  if (meetings.length === 0) {
    return { answer: 'No meetings found yet.', results: [] }
  }

  const context = meetings
    .map(m => {
      const date = m.date.toDate().toISOString().slice(0, 10)
      const highlights = (m.keyHighlights ?? []).join('; ')
      const decisions = (m.decisions ?? []).join('; ')
      return `Meeting ID: ${m.meetingId}\nTitle: ${m.title}\nDate: ${date}\nSummary: ${m.summary || '(no summary)'}\nKey Highlights: ${highlights}\nDecisions: ${decisions}`
    })
    .join('\n---\n')

  const prompt = `You are ActionPilot AI's meeting search. Given a list of past meetings and a user's question, identify which meetings are relevant and answer the question using only this information.

Meetings:
"""
${context}
"""

Question: ${questionText}

Respond with ONLY a JSON object, no prose, no markdown fences, in this exact shape:
{
  "answer": "a direct 2-4 sentence answer to the question, citing what was found",
  "relevantMeetingIds": ["meetingId1", "meetingId2"]
}

If nothing in the meetings is relevant, say so honestly in "answer" and return an empty relevantMeetingIds array.`

  const text = await callAiProxy(prompt)
  const parsed = extractJson<{ answer: string; relevantMeetingIds: string[] }>(text)

  const results = meetings
    .filter(m => parsed.relevantMeetingIds?.includes(m.meetingId))
    .map(m => ({ meetingId: m.meetingId, title: m.title, excerpt: m.summary || '' }))

  return { answer: parsed.answer ?? '', results }
}
