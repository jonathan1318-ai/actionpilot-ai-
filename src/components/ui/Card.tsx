import type { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', children, ...rest }: Props) {
  return (
    <div {...rest} className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}
