import type { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', children, ...rest }: Props) {
  return (
    <div {...rest} className={`rounded-2xl border border-ap-border bg-ap-surface p-[18px] ${className}`}>
      {children}
    </div>
  )
}
