import { Link, useLocation } from 'react-router-dom'

interface Props { title: string }

export function Topbar({ title }: Props) {
  const { pathname } = useLocation()
  const showNewMeeting = pathname === '/meetings'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-ap-border bg-ap-surface px-7">
      <h1 className="text-[19px] font-bold tracking-tight text-ap-text-primary">{title}</h1>
      {showNewMeeting && (
        <Link
          to="/meetings/new"
          className="flex items-center gap-1.5 rounded-[11px] bg-ap-accent px-4 py-2.5 text-[13.5px] font-semibold text-white hover:opacity-90"
        >
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" /></svg>
          New meeting
        </Link>
      )}
    </header>
  )
}
