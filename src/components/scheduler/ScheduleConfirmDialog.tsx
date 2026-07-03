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

function durationMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60_000)
}

export function ScheduleConfirmDialog({ proposals, onCancel, onConfirm, confirming, error }: Props) {
  const [edited, setEdited] = useState<ScheduleProposal[]>(proposals)

  function updateStart(index: number, dateStr: string, timeStr: string) {
    setEdited(prev => {
      const next = [...prev]
      const item = next[index]
      const duration = durationMinutes(item.start, item.end)
      const [year, month, day] = dateStr.split('-').map(Number)
      const [hour, minute] = timeStr.split(':').map(Number)
      const start = new Date(year, month - 1, day, hour, minute)
      const end = new Date(start.getTime() + duration * 60_000)
      next[index] = { ...item, start, end }
      return next
    })
  }

  function updateDuration(index: number, minutes: number) {
    setEdited(prev => {
      const next = [...prev]
      const item = next[index]
      next[index] = { ...item, end: new Date(item.start.getTime() + minutes * 60_000) }
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
          <Button onClick={() => onConfirm(edited)} loading={confirming}>Confirm &amp; book</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {edited.map((item, i) => (
          <div key={item.taskId} className="rounded-lg border border-gray-200 p-3">
            <p className="mb-2 text-sm font-medium text-gray-900">{item.title}</p>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="date"
                value={toDateInputValue(item.start)}
                onChange={e => updateStart(i, e.target.value, toTimeInputValue(item.start))}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
              />
              <input
                type="time"
                value={toTimeInputValue(item.start)}
                onChange={e => updateStart(i, toDateInputValue(item.start), e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
              />
              <select
                value={durationMinutes(item.start, item.end)}
                onChange={e => updateDuration(i, Number(e.target.value))}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
