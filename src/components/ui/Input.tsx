import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        {...rest}
        className={`rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
