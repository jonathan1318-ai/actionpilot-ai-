interface Props {
  label: string
  className?: string
}

export function Badge({ label, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-bold ${className}`}>
      {label}
    </span>
  )
}
