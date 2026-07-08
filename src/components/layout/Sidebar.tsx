import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import { getOrganization } from '@/services/firebase/organizations'
import { Avatar } from '@/components/ui/Avatar'

const navItems = [
  {
    to: '/meetings', label: 'Meetings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" /><path d="M6 11a6 6 0 0 0 12 0M12 20v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
    ),
  },
  {
    to: '/tasks', label: 'Tasks',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" /><path d="M8 12.5l2.5 2.5L16.5 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
  {
    to: '/scheduler', label: 'Scheduler',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="15.5" rx="3.5" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
    ),
  },
  {
    to: '/dashboard', label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="12" width="4" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.7" /><rect x="10" y="7" width="4" height="13" rx="1.2" stroke="currentColor" strokeWidth="1.7" /><rect x="16" y="3" width="4" height="17" rx="1.2" stroke="currentColor" strokeWidth="1.7" /></svg>
    ),
  },
  {
    to: '/search', label: 'Search',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="M20 20l-4.8-4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
    ),
  },
]

const settingsItem = {
  to: '/settings', label: 'Settings',
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" /></svg>
  ),
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] transition-colors ${
    isActive
      ? 'bg-ap-accent-soft font-bold text-ap-accent'
      : 'font-semibold text-ap-text-secondary hover:bg-ap-surface-alt'
  }`
}

export function Sidebar() {
  const user = useAuthStore(s => s.user)
  const dark = useThemeStore(s => s.dark)
  const toggleDark = useThemeStore(s => s.toggleDark)
  const [orgName, setOrgName] = useState('')

  useEffect(() => {
    if (!user?.orgId) return
    getOrganization(user.orgId).then(org => org && setOrgName(org.name))
  }, [user?.orgId])

  return (
    <aside className="flex h-full w-[236px] shrink-0 flex-col border-r border-ap-border bg-[color:var(--ap-sidebar-bg)] backdrop-blur-2xl">
      <div className="flex items-center gap-2.5 px-5 pb-[18px] pt-[22px]">
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-ap-accent to-ap-accent-dark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="white" strokeWidth="2" /><circle cx="12" cy="12" r="2" fill="white" /></svg>
        </div>
        <span className="text-[15px] font-bold tracking-tight text-ap-text-primary">ActionPilot</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} className={navLinkClass}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
        <div className="mx-2 my-2.5 h-px bg-ap-border" />
        <NavLink to={settingsItem.to} className={navLinkClass}>
          {settingsItem.icon}
          {settingsItem.label}
        </NavLink>
      </nav>

      {user && (
        <div className="flex items-center gap-2.5 border-t border-ap-border px-4 py-3.5">
          <Avatar src={user.photoURL} name={user.displayName || user.email} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ap-text-primary">{user.displayName || user.email}</p>
            <p className="truncate text-[11.5px] text-ap-text-tertiary">{orgName || ' '}</p>
          </div>
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className={`relative h-6 w-10 shrink-0 rounded-full p-0.5 transition-colors ${dark ? 'bg-ap-accent' : 'bg-ap-surface-alt'}`}
          >
            <span
              className="block h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: dark ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </button>
        </div>
      )}
    </aside>
  )
}
