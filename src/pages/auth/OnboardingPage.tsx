import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrganization, updateOrganizationSettings } from '@/services/firebase/organizations'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function OnboardingPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [step, setStep] = useState(0)
  const [orgName, setOrgName] = useState('')
  const [workDayStart, setWorkDayStart] = useState('09:00')
  const [workDayEnd, setWorkDayEnd] = useState('17:30')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFinish() {
    if (!user || !orgName.trim()) return
    setLoading(true)
    setError('')
    try {
      const orgId = await createOrganization(user.uid, orgName.trim(), '')
      await updateOrganizationSettings(orgId, { settings: { workDayStart, workDayEnd } })
      navigate('/meetings')
    } catch (err) {
      setError((err as Error).message || 'Failed to create workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[440px] max-w-[90vw] animate-ap-fade-up rounded-3xl border border-ap-border bg-ap-surface p-9 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
      <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-ap-accent">Step {step + 1} of 2</p>
      <h1 className="mb-6 text-[22px] font-bold tracking-tight text-ap-text-primary">
        {step === 0 ? 'Set up your workspace' : 'Set your working hours'}
      </h1>

      {step === 0 && (
        <div className="flex flex-col gap-3.5">
          <Input label="Workspace name" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Acme Robotics" />
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-ap-border bg-ap-surface-alt px-3 py-2.5 text-[13px] font-semibold text-ap-text-primary"
            >
              <span className="h-2 w-2 rounded-full bg-[#34A853]" /> Google Workspace
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-ap-border bg-ap-surface-alt px-3 py-2.5 text-[13px] font-semibold text-ap-text-primary"
            >
              <span className="h-2 w-2 rounded-full bg-[#2D8CFF]" /> Zoom
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ap-text-secondary">Work day</label>
            <div className="flex items-center gap-2.5">
              <input
                type="time"
                value={workDayStart}
                onChange={e => setWorkDayStart(e.target.value)}
                className="flex-1 rounded-xl border border-ap-border bg-ap-surface-alt px-3.5 py-3 text-sm text-ap-text-primary"
              />
              <span className="text-ap-text-tertiary">to</span>
              <input
                type="time"
                value={workDayEnd}
                onChange={e => setWorkDayEnd(e.target.value)}
                className="flex-1 rounded-xl border border-ap-border bg-ap-surface-alt px-3.5 py-3 text-sm text-ap-text-primary"
              />
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-ap-text-secondary">
            The Smart Scheduler will only book focus time inside these hours, Monday–Friday.
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-xs text-red-500">{error}</p>}

      <div className="mt-7 flex gap-2.5">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
        )}
        <Button
          className="flex-1 justify-center"
          onClick={() => (step === 0 ? setStep(1) : handleFinish())}
          disabled={!orgName.trim()}
          loading={loading}
        >
          {step === 0 ? 'Continue' : 'Finish setup'}
        </Button>
      </div>
    </div>
  )
}
