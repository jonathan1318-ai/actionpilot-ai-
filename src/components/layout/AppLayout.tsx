import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const PAGE_TITLES: Record<string, string> = {
  '/meetings':  'Meetings',
  '/tasks':     'Tasks',
  '/scheduler': 'Smart Scheduler',
  '/dashboard': 'Dashboard',
  '/search':    'Search',
  '/settings':  'Settings',
}

export function AppLayout() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)
  const base = '/' + (segments[0] ?? '')

  let title = PAGE_TITLES[base] ?? 'ActionPilot AI'
  if (base === '/meetings' && segments[1] === 'new') title = 'New Meeting'
  else if (base === '/meetings' && segments[1]) title = 'Meeting'

  return (
    <div className="flex h-screen overflow-hidden bg-ap-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto px-8 pb-[60px] pt-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
