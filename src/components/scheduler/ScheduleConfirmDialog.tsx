import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { ScheduleProposal } from '@/services/google/scheduler'

interface Props {
  proposals: ScheduleProposal[]
  onCancel: () => void
  onConfirm: (edited: ScheduleProposal[]) => void
  confirming: boolean
  error: string
}

type DurationUnit = 'minutes' | 'hours' | 'days'

const UNIT_MINUTES: Record<DurationUnit, number> = { minutes: 1, hours: 60, days: 1440 }

const inputClass = 'rounded-lg border border-ap-border bg-ap-surface-alt px-2 py-1.5 text-sm text-ap-text-primary outline-none focus:border-ap-accent'

interface Row {
  taskId: string
  title: string
  description: string
  start: Date
  durationAmount: number
  durationUnit: DurationUnit
}

function toDateInputValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toTimeInputValue(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function bestUnitFor(totalMinutes: number): { amount: number; unit: DurationUnit } {
  if (totalMinutes % UNIT_MINUTES.days === 0) return { amount: totalMinutes / UNIT_MINUTES.days, unit: 'days' }
  if (totalMinutes % UNIT_MINUTES.hours === 0) return { amount: totalMinutes / UNIT_MINUTES.hours, unit: 'hours' }
  return { amount: totalMinutes, unit: 'minutes' }
}

function rowToProposal(row: Row): ScheduleProposal {
  const minutes = row.durationAmount * UNIT_MINUTES[row.durationUnit]
  return {
    taskId: row.taskId,
    title: row.title,
    description: row.description,
    start: row.start,
    end: new Date(row.start.getTime() + minutes * 60_000),
  }
}

export function ScheduleConfirmDialog({ proposals, onCancel, onConfirm, confirming, error }: Props) {
  const [rows, setRows] = useState<Row[]>(() =>
    proposals.map(p => {
      const totalMinutes = Math.round((p.end.getTime() - p.start.getTime()) / 60_000)
      const { amount, unit } = bestUnitFor(totalMinutes)
      return { taskId: p.taskId, title: p.title, description: p.description, start: p.start, durationAmount: amount, durationUnit: unit }
    }),
  )

  function updateStart(index: number, dateStr: string, timeStr: string) {
    setRows(prev => {
      const next = [...prev]
      const [year, month, day] = dateStr.split('-').map(Number)
      const [hour, minute] = timeStr.split(':').map(Number)
      next[index] = { ...next[index], start: new Date(year, month - 1, day, hour, minute) }
      return next
    })
  }

  function updateDurationAmount(index: number, amount: number) {
    setRows(prev => {
      const next = [...prev]
      next[index] = { ...next[index], durationAmount: Math.max(1, amount) }
      return next
    })
  }

  function updateDurationUnit(index: number, unit: DurationUnit) {
    setRows(prev => {
      const next = [...prev]
      next[index] = { ...next[index], durationUnit: unit }
      return next
    })
  }

  return (
    <Modal
      title="Review scheduled times"
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={confirming}>Cancel</Button>
          <Button onClick={() => onConfirm(rows.map(rowToProposal))} loading={confirming}>Confirm &amp; book</Button>
        </>
      }
    >
      <div className="space-y-3">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {rows.map((row, i) => (
          <div key={row.taskId} className="rounded-xl border border-ap-border bg-ap-surface-alt p-3">
            <p className="mb-2 text-sm font-semibold text-ap-text-primary">{row.title}</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={toDateInputValue(row.start)}
                onChange={e => updateStart(i, e.target.value, toTimeInputValue(row.start))}
                className={inputClass}
              />
              <input
                type="time"
                value={toTimeInputValue(row.start)}
                onChange={e => updateStart(i, toDateInputValue(row.start), e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-ap-text-tertiary">Duration:</span>
              <input
                type="number"
                min={1}
                value={row.durationAmount}
                onChange={e => updateDurationAmount(i, Number(e.target.value))}
                className={`w-20 ${inputClass}`}
              />
              <select
                value={row.durationUnit}
                onChange={e => updateDurationUnit(i, e.target.value as DurationUnit)}
                className={inputClass}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
