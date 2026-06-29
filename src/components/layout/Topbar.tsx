import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/auth.store'

interface Props { title: string }

export function Topbar({ title }: Props) {
  const user = useAuthStore(s => s.user)
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user.displayName}</span>
          <Avatar src={user.photoURL} name={user.displayName} size="sm" />
        </div>
      )}
    </header>
  )
}
