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
    <span className={`inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl text-[13px] font-bold ${colorForSeed(title)}`}>
      {initials(title)}
    </span>
  )
}
