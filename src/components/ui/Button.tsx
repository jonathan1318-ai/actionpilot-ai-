import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClass: Record<Variant, string> = {
  primary:   'bg-ap-accent text-white hover:opacity-90 focus-visible:ring-ap-accent',
  secondary: 'bg-ap-surface-alt text-ap-text-primary border border-ap-border hover:bg-ap-border/40 focus-visible:ring-ap-border',
  ghost:     'text-ap-text-secondary hover:bg-ap-surface-alt focus-visible:ring-ap-border',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
}

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[12.5px] rounded-lg',
  md: 'px-4 py-2.5 text-[13.5px] rounded-xl',
  lg: 'px-5 py-3 text-[15px] rounded-xl',
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${className}`}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
}
