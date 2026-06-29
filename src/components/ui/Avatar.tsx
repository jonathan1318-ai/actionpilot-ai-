interface Props {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' }

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function Avatar({ src, name, size = 'md' }: Props) {
  if (src) return <img src={src} alt={name} className={`rounded-full object-cover ${sizeClass[size]}`} />
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ${sizeClass[size]}`}>
      {initials(name)}
    </span>
  )
}
