const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

export interface BusyInterval {
  start: Date
  end: Date
}

export async function listBusyIntervals(
  accessToken: string,
  timeMinISO: string,
  timeMaxISO: string,
): Promise<BusyInterval[]> {
  const res = await fetch(`${CALENDAR_API}/freeBusy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ timeMin: timeMinISO, timeMax: timeMaxISO, items: [{ id: 'primary' }] }),
  })

  if (!res.ok) throw new Error(`Failed to read calendar availability: ${await res.text()}`)

  const data = (await res.json()) as { calendars: Record<string, { busy: { start: string; end: string }[] }> }
  const busy = data.calendars?.primary?.busy ?? []
  return busy.map(b => ({ start: new Date(b.start), end: new Date(b.end) }))
}

interface CreateEventInput {
  summary: string
  description: string
  startISO: string
  endISO: string
}

export async function createCalendarEvent(accessToken: string, input: CreateEventInput): Promise<string> {
  const res = await fetch(`${CALENDAR_API}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.startISO },
      end: { dateTime: input.endISO },
    }),
  })

  if (!res.ok) throw new Error(`Failed to create calendar event: ${await res.text()}`)

  const data = (await res.json()) as { id: string }
  return data.id
}
