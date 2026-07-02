import { colorForSeed } from '@/utils/avatarColor'

interface Props {
  title: string
}

function initials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function MeetingBadge({ title }: Props) {
  return (
    <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colorForSeed(title)}`}>
      {initials(title)}
    </span>
  )
}
