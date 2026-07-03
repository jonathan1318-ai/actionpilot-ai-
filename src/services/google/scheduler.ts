import { Timestamp } from 'firebase/firestore'
import { listBusyIntervals, createCalendarEvent, type BusyInterval } from './calendar'
import { scheduleTask } from '@/services/firebase/tasks'
import type { Task } from '@/types'

export interface WorkHours {
  startHour: number
  endHour: number
  workDays: number[]
}

export const DEFAULT_WORK_HOURS: WorkHours = { startHour: 9, endHour: 18, workDays: [1, 2, 3, 4, 5] }

export function hourFromTimeString(time: string): number {
  const hour = Number(time.split(':')[0])
  return Number.isFinite(hour) ? hour : 9
}

const SLOT_MINUTES = 30
const SEARCH_DAYS = 14

function isWorkDay(date: Date, workDays: number[]): boolean {
  return workDays.includes(date.getDay())
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

function nextWorkDayStart(date: Date, hours: WorkHours): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + 1)
  next.setHours(hours.startHour, 0, 0, 0)
  while (!isWorkDay(next, hours.workDays)) next.setDate(next.getDate() + 1)
  return next
}

function findNextFreeSlot(
  busy: BusyInterval[],
  from: Date,
  durationMinutes: number,
  hours: WorkHours,
): { start: Date; end: Date } {
  let candidate = roundUpToSlot(from)
  const limit = new Date(from)
  limit.setDate(limit.getDate() + SEARCH_DAYS)

  while (candidate < limit) {
    if (!isWorkDay(candidate, hours.workDays) || candidate.getHours() >= hours.endHour) {
      candidate = nextWorkDayStart(candidate, hours)
      continue
    }
    if (candidate.getHours() < hours.startHour) {
      candidate = new Date(candidate)
      candidate.setHours(hours.startHour, 0, 0, 0)
      continue
    }

    const slotEnd = new Date(candidate.getTime() + durationMinutes * 60_000)
    const overflowsWorkDay = slotEnd.getHours() > hours.endHour || (slotEnd.getHours() === hours.endHour && slotEnd.getMinutes() > 0)
    if (overflowsWorkDay) {
      candidate = nextWorkDayStart(candidate, hours)
      continue
    }

    const conflict = busy.some(b => overlaps(candidate, slotEnd, b.start, b.end))
    if (!conflict) return { start: new Date(candidate), end: slotEnd }

    candidate = new Date(candidate.getTime() + SLOT_MINUTES * 60_000)
  }

  throw new Error('No free slot found in the next 14 days')
}

export async function scheduleTasksOnCalendar(
  accessToken: string,
  tasks: Task[],
  workHours: WorkHours = DEFAULT_WORK_HOURS,
): Promise<void> {
  const now = new Date()
  const searchEnd = new Date(now)
  searchEnd.setDate(searchEnd.getDate() + SEARCH_DAYS)

  const busy = await listBusyIntervals(accessToken, now.toISOString(), searchEnd.toISOString())
  const bookedThisRun: BusyInterval[] = []

  for (const task of tasks) {
    const slot = findNextFreeSlot([...busy, ...bookedThisRun], now, SLOT_MINUTES, workHours)

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
