interface MemberContext {
  uid: string
  displayName: string
}

export function buildExtractionPrompt(transcript: string, members: MemberContext[], meetingDateIso: string): string {
  const memberList = members.map(m => `- ${m.displayName} (uid: ${m.uid})`).join('\n')

  return `You are ActionPilot AI's task extraction engine. Read the meeting transcript below and extract every actionable task, decision-with-owner, or commitment made by an attendee.

Meeting date: ${meetingDateIso}

Known attendees (match assignee names to these uids when possible; if no clear match, use null):
${memberList || '- (no attendee list provided)'}

Transcript:
"""
${transcript}
"""

Respond with ONLY a JSON object, no prose, no markdown fences, in this exact shape:
{
  "summary": "2-4 sentence summary of the meeting's outcomes",
  "keyHighlights": ["short bullet points covering the main topics discussed, grouped logically"],
  "decisions": ["short bullet points, one per concrete decision that was made"],
  "tasks": [
    {
      "title": "short imperative task title",
      "description": "1-2 sentence context pulled from the transcript",
      "assigneeUid": "uid from the attendee list, or null if unclear",
      "priority": 1,
      "dueDate": "YYYY-MM-DD or null if no deadline was mentioned"
    }
  ]
}

Rules:
- priority is 1 (critical), 2 (high), 3 (medium), or 4 (low) based on urgency and stated impact.
- If a relative deadline is mentioned (e.g. "by Friday", "next week"), resolve it to an absolute date relative to the meeting date.
- Do not invent tasks, highlights, or decisions that were not discussed. Empty arrays are fine if nothing qualifies.`
}
