import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/meetings',  label: 'Meetings',   icon: '🎙' },
  { to: '/tasks',     label: 'Tasks',      icon: '✅' },
  { to: '/scheduler', label: 'Scheduler',  icon: '📅' },
  { to: '/dashboard', label: 'Dashboard',  icon: '📊' },
  { to: '/search',    label: 'Search',     icon: '🔍' },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-bold text-brand-700">ActionPilot AI</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
