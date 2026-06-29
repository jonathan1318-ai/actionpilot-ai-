interface Props {
  label: string
  className?: string
}

export function Badge({ label, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
