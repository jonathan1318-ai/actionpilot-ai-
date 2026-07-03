import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { updateUserProfile } from '@/services/firebase/auth'
import { getOrganization, updateOrganizationSettings } from '@/services/firebase/organizations'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import type { Organization } from '@/types'

const TIMEZONES = [
  'Asia/Kuala_Lumpur',
  'Asia/Singapore',
  'Asia/Jakarta',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Europe/London',
  'America/New_York',
  'UTC',
]

const DAY_LABELS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

export function SettingsPage() {
  const user = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [timezone, setTimezone] = useState(user?.timezone ?? 'Asia/Kuala_Lumpur')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [org, setOrg] = useState<Organization | null>(null)
  const [orgName, setOrgName] = useState('')
  const [workDayStart, setWorkDayStart] = useState('09:00')
  const [workDayEnd, setWorkDayEnd] = useState('18:00')
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [savingOrg, setSavingOrg] = useState(false)
  const [orgSaved, setOrgSaved] = useState(false)

  useEffect(() => {
    if (!user?.orgId) return
    getOrganization(user.orgId).then(data => {
      if (!data) return
      setOrg(data)
      setOrgName(data.name)
      setWorkDayStart(data.settings.workDayStart)
      setWorkDayEnd(data.settings.workDayEnd)
      setWorkDays(data.settings.workDays)
    })
  }, [user?.orgId])

  function toggleDay(day: number) {
    setWorkDays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()))
  }

  async function handleSaveProfile() {
    if (!user) return
    setSavingProfile(true)
    setProfileSaved(false)
    try {
      await updateUserProfile(user.uid, { displayName: displayName.trim(), timezone })
      setUser({ ...user, displayName: displayName.trim(), timezone })
      setProfileSaved(true)
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSaveOrg() {
    if (!user?.orgId) return
    setSavingOrg(true)
    setOrgSaved(false)
    try {
      await updateOrganizationSettings(user.orgId, {
        name: orgName.trim(),
        settings: { workDayStart, workDayEnd, workDays },
      })
      setOrgSaved(true)
    } finally {
      setSavingOrg(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Your Profile</h2>
        <div className="flex items-center gap-3">
          <Avatar src={user.photoURL} name={user.displayName} size="lg" />
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
        <Input label="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Timezone</label>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSaveProfile} loading={savingProfile} disabled={!displayName.trim()}>
            Save profile
          </Button>
          {profileSaved && <span className="text-xs text-green-600">Saved</span>}
        </div>
      </Card>

      {org && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Organization</h2>
          <Input label="Organization name" value={orgName} onChange={e => setOrgName(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Work day start" type="time" value={workDayStart} onChange={e => setWorkDayStart(e.target.value)} />
            <Input label="Work day end" type="time" value={workDayEnd} onChange={e => setWorkDayEnd(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Work days</label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    workDays.includes(d.value)
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400">These hours control when the Smart Scheduler books focus time.</p>

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveOrg} loading={savingOrg} disabled={!orgName.trim()}>
              Save organization
            </Button>
            {orgSaved && <span className="text-xs text-green-600">Saved</span>}
          </div>
        </Card>
      )}
    </div>
  )
}
