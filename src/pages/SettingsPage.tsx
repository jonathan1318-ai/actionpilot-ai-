import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import { updateUserProfile } from '@/services/firebase/auth'
import { getOrganization, updateOrganizationSettings, listOrgUsers } from '@/services/firebase/organizations'
import { createInvite, listOrgInvites, revokeInvite } from '@/services/firebase/invites'
import { connectGoogleCalendar } from '@/services/google/auth'
import { useCalendarStore } from '@/store/calendar.store'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ACCENTS, ACCENT_ORDER, ACCENT_LABELS } from '@/utils/theme'
import type { NotificationPrefs, Organization, User, Invite, UserRole } from '@/types'

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

const DEFAULT_NOTIF_PREFS: NotificationPrefs = { email: true, push: true, weeklyDigest: false }

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-6 w-10 shrink-0 rounded-full p-0.5 transition-colors ${on ? 'bg-ap-accent' : 'bg-ap-surface-alt'}`}
    >
      <span
        className="block h-5 w-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: on ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  )
}

export function SettingsPage() {
  const user = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)
  const dark = useThemeStore(s => s.dark)
  const accent = useThemeStore(s => s.accent)
  const toggleDark = useThemeStore(s => s.toggleDark)
  const setAccent = useThemeStore(s => s.setAccent)
  const calendarConnected = useCalendarStore(s => s.isConnected())

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

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(user?.notifPrefs ?? DEFAULT_NOTIF_PREFS)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')

  const [members, setMembers] = useState<User[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('member')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSentTo, setInviteSentTo] = useState('')

  const isAdmin = user?.role === 'owner' || user?.role === 'admin'

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
    listOrgUsers(user.orgId).then(setMembers)
  }, [user?.orgId])

  useEffect(() => {
    if (!user?.orgId || !isAdmin) return
    listOrgInvites(user.orgId).then(setInvites)
  }, [user?.orgId, isAdmin])

  async function handleSendInvite() {
    if (!user?.orgId || !org || !inviteEmail.trim()) return
    setInviting(true)
    setInviteError('')
    setInviteSentTo('')
    try {
      const email = inviteEmail.trim().toLowerCase()
      await createInvite(user.orgId, org.name, email, inviteRole, user.uid)
      setInvites(await listOrgInvites(user.orgId))
      setInviteSentTo(email)
      setInviteEmail('')
    } catch (err) {
      setInviteError((err as Error).message || 'Failed to create invite')
    } finally {
      setInviting(false)
    }
  }

  async function handleRevokeInvite(inviteId: string) {
    if (!user?.orgId) return
    await revokeInvite(inviteId)
    setInvites(await listOrgInvites(user.orgId))
  }

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

  async function handleToggleNotif(key: keyof NotificationPrefs) {
    if (!user) return
    const next = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(next)
    await updateUserProfile(user.uid, { notifPrefs: next })
    setUser({ ...user, notifPrefs: next })
  }

  async function handleConnectCalendar() {
    setConnecting(true)
    setConnectError('')
    try {
      await connectGoogleCalendar()
    } catch (err) {
      setConnectError((err as Error).message || 'Failed to connect Google Calendar')
    } finally {
      setConnecting(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-[18px]">
      <Card>
        <h3 className="mb-3.5 text-[13.5px] font-bold text-ap-text-primary">Your profile</h3>
        <div className="mb-4 flex items-center gap-3">
          <Avatar src={user.photoURL} name={user.displayName || user.email} size="lg" />
          <p className="text-sm text-ap-text-tertiary">{user.email}</p>
        </div>
        <div className="flex flex-col gap-3.5">
          <Input label="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ap-text-secondary">Timezone</label>
            <select
              className="rounded-xl border border-ap-border bg-ap-surface-alt px-3.5 py-3 text-sm text-ap-text-primary outline-none focus:border-ap-accent"
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
            {profileSaved && <span className="text-xs font-semibold text-emerald-600">Saved</span>}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3.5 text-[13.5px] font-bold text-ap-text-primary">Workspace</h3>
        <div className="flex flex-col gap-3.5">
          <Input label="Organization name" value={orgName} onChange={e => setOrgName(e.target.value)} />
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveOrg} loading={savingOrg} disabled={!orgName.trim()}>Save workspace</Button>
            {orgSaved && <span className="text-xs font-semibold text-emerald-600">Saved</span>}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3.5 text-[13.5px] font-bold text-ap-text-primary">Members</h3>
        <div className="flex flex-col gap-2">
          {members.map(m => (
            <div key={m.uid} className="flex items-center gap-3">
              <Avatar src={m.photoURL} name={m.displayName || m.email} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-ap-text-primary">{m.displayName || m.email}</p>
                <p className="truncate text-xs text-ap-text-tertiary">{m.email}</p>
              </div>
              <Badge
                label={m.role}
                className={m.role === 'owner' || m.role === 'admin'
                  ? 'bg-ap-accent-soft text-ap-accent-dark'
                  : 'bg-ap-surface-alt text-ap-text-tertiary'}
              />
            </div>
          ))}
        </div>

        {isAdmin && (
          <>
            {invites.length > 0 && (
              <div className="mt-4 flex flex-col gap-2 border-t border-ap-border pt-3.5">
                <p className="text-[13px] font-semibold text-ap-text-secondary">Pending invites</p>
                {invites.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13.5px] text-ap-text-primary">{inv.email}</p>
                    </div>
                    <Badge label={inv.role} className="bg-ap-surface-alt text-ap-text-tertiary" />
                    <Button size="sm" variant="secondary" onClick={() => handleRevokeInvite(inv.id)}>Revoke</Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2.5 border-t border-ap-border pt-3.5">
              <p className="text-[13px] font-semibold text-ap-text-secondary">Invite a member</p>
              <div className="flex gap-2">
                <Input
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <select
                  className="rounded-xl border border-ap-border bg-ap-surface-alt px-3 py-3 text-sm text-ap-text-primary outline-none focus:border-ap-accent"
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as UserRole)}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <Button onClick={handleSendInvite} loading={inviting} disabled={!inviteEmail.trim()}>Invite</Button>
              </div>
              {inviteError && <p className="text-xs text-red-500">{inviteError}</p>}
              {inviteSentTo && !inviteError && (
                <p className="text-xs text-emerald-600">
                  Invite created for {inviteSentTo} — no email is sent automatically, let them know to sign in with Google using this address.
                </p>
              )}
            </div>
          </>
        )}
      </Card>

      <Card>
        <h3 className="mb-3.5 text-[13.5px] font-bold text-ap-text-primary">Integrations</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className={`h-[9px] w-[9px] shrink-0 rounded-full ${calendarConnected ? 'bg-[#34A853]' : 'bg-ap-text-tertiary'}`} />
            <span className="flex-1 text-[13.5px] font-semibold text-ap-text-primary">Google Calendar</span>
            {calendarConnected ? (
              <Badge label="Connected" className="bg-emerald-500/14 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Button size="sm" variant="secondary" onClick={handleConnectCalendar} loading={connecting}>Connect</Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-ap-text-tertiary" />
            <span className="flex-1 text-[13.5px] font-semibold text-ap-text-primary">Zoom</span>
            <Badge label="Not connected" className="bg-ap-surface-alt text-ap-text-tertiary" />
          </div>
          <div className="flex items-center gap-3">
            <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-ap-text-tertiary" />
            <span className="flex-1 text-[13.5px] font-semibold text-ap-text-primary">Microsoft 365</span>
            <Badge label="Not connected" className="bg-ap-surface-alt text-ap-text-tertiary" />
          </div>
        </div>
        {connectError && <p className="mt-3 text-xs text-red-500">{connectError}</p>}
      </Card>

      {org && (
        <Card>
          <h3 className="mb-3.5 text-[13.5px] font-bold text-ap-text-primary">Working hours</h3>
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Work day start" type="time" value={workDayStart} onChange={e => setWorkDayStart(e.target.value)} />
              <Input label="Work day end" type="time" value={workDayEnd} onChange={e => setWorkDayEnd(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-ap-text-secondary">Work days</label>
              <div className="flex gap-1.5">
                {DAY_LABELS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      workDays.includes(d.value)
                        ? 'bg-ap-accent text-white'
                        : 'bg-ap-surface-alt text-ap-text-secondary'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-ap-text-tertiary">These hours control when the Smart Scheduler books focus time.</p>
            <div className="flex items-center gap-3">
              <Button onClick={handleSaveOrg} loading={savingOrg} disabled={!orgName.trim()}>Save workspace</Button>
              {orgSaved && <span className="text-xs font-semibold text-emerald-600">Saved</span>}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="mb-3.5 text-[13.5px] font-bold text-ap-text-primary">Appearance</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] text-ap-text-primary">Dark mode</span>
            <Toggle on={dark} onToggle={toggleDark} />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-ap-text-secondary">Accent color</label>
            <div className="flex gap-2.5">
              {ACCENT_ORDER.map(key => (
                <button
                  key={key}
                  type="button"
                  aria-label={ACCENT_LABELS[key]}
                  onClick={() => setAccent(key)}
                  className="h-8 w-8 rounded-full transition-transform"
                  style={{
                    background: ACCENTS[key].base,
                    outline: accent === key ? `2px solid ${ACCENTS[key].base}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-1 text-[13.5px] font-bold text-ap-text-primary">Notifications</h3>
        <div className="mt-3 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] text-ap-text-primary">Email digests</span>
            <Toggle on={notifPrefs.email} onToggle={() => handleToggleNotif('email')} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] text-ap-text-primary">Push notifications</span>
            <Toggle on={notifPrefs.push} onToggle={() => handleToggleNotif('push')} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] text-ap-text-primary">Weekly accountability report</span>
            <Toggle on={notifPrefs.weeklyDigest} onToggle={() => handleToggleNotif('weeklyDigest')} />
          </div>
        </div>
      </Card>
    </div>
  )
}
