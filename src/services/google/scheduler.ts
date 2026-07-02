import { Timestamp } from 'firebase/firestore'
import { listBusyIntervals, createCalendarEvent, type BusyInterval } from './calendar'
import { scheduleTask } from '@/services/firebase/tasks'
import type { Task } from '@/types'

const WORK_START_HOUR = 9
const WORK_END_HOUR = 18
const SLOT_MINUTES = 30
const SEARCH_DAYS = 14

function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day !== 0 && day !== 6
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd
}

function roundUpToSlot(date: Date): Date {
  const rounded = new Date(date)
  rounded.setSeconds(0, 0)
  const remainder = rounded.getMinutes() % SLOT_MINUTES
  if (remainder !== 0) rounded.setMinutes(rounded.getMinutes() + (SLOT_MINUTES - remainder))
  return rounded
}

function nextWorkDayStart(date: Date): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + 1)
  next.setHours(WORK_START_HOUR, 0, 0, 0)
  while (!isWeekday(next)) next.setDate(next.getDate() + 1)
  return next
}

function findNextFreeSlot(busy: BusyInterval[], from: Date, durationMinutes: number): { start: Date; end: Date } {
  let candidate = roundUpToSlot(from)
  const limit = new Date(from)
  limit.setDate(limit.getDate() + SEARCH_DAYS)

  while (candidate < limit) {
    if (!isWeekday(candidate) || candidate.getHours() >= WORK_END_HOUR) {
      candidate = nextWorkDayStart(candidate)
      continue
    }
    if (candidate.getHours() < WORK_START_HOUR) {
      candidate = new Date(candidate)
      candidate.setHours(WORK_START_HOUR, 0, 0, 0)
      continue
    }

    const slotEnd = new Date(candidate.getTime() + durationMinutes * 60_000)
    const overflowsWorkDay = slotEnd.getHours() > WORK_END_HOUR || (slotEnd.getHours() === WORK_END_HOUR && slotEnd.getMinutes() > 0)
    if (overflowsWorkDay) {
      candidate = nextWorkDayStart(candidate)
      continue
    }

    const conflict = busy.some(b => overlaps(candidate, slotEnd, b.start, b.end))
    if (!conflict) return { start: new Date(candidate), end: slotEnd }

    candidate = new Date(candidate.getTime() + SLOT_MINUTES * 60_000)
  }

  throw new Error('No free slot found in the next 14 days')
}

export async function scheduleTasksOnCalendar(accessToken: string, tasks: Task[]): Promise<void> {
  const now = new Date()
  const searchEnd = new Date(now)
  searchEnd.setDate(searchEnd.getDate() + SEARCH_DAYS)

  const busy = await listBusyIntervals(accessToken, now.toISOString(), searchEnd.toISOString())
  const bookedThisRun: BusyInterval[] = []

  for (const task of tasks) {
    const slot = findNextFreeSlot([...busy, ...bookedThisRun], now, SLOT_MINUTES)

    const eventId = await createCalendarEvent(accessToken, {
      summary: task.title,
      description: task.description || 'Scheduled by ActionPilot AI',
      startISO: slot.start.toISOString(),
      endISO: slot.end.toISOString(),
    })

    bookedThisRun.push(slot)
    await scheduleTask(task.taskId, Timestamp.fromDate(slot.start), Timestamp.fromDate(slot.end), eventId)
  }
}
