import { callAiProxy } from './proxy'

export async function askAboutMeeting(transcript: string, summary: string, question: string): Promise<string> {
  const prompt = `You are ActionPilot AI, answering a question about one specific meeting using only the information below. If the answer isn't covered by this meeting, say so honestly instead of guessing.

Meeting summary:
${summary || '(no summary yet)'}

Transcript:
"""
${transcript}
"""

Question: ${question}

Respond in 2-4 concise sentences, plain text, no markdown.`

  return callAiProxy(prompt)
}
