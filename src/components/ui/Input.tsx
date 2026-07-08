import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[13px] font-semibold text-ap-text-secondary">{label}</label>}
      <input
        {...rest}
        className={`rounded-xl border bg-ap-surface-alt px-3.5 py-3 text-sm text-ap-text-primary outline-none transition-colors placeholder:text-ap-text-tertiary focus:border-ap-accent focus:ring-2 focus:ring-ap-accent-soft ${error ? 'border-red-400' : 'border-ap-border'} ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
