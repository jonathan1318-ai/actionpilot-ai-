interface Props { size?: 'sm' | 'md' | 'lg' }

const sizeClass = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }

export function Spinner({ size = 'md' }: Props) {
  return (
    <span className={`inline-block animate-spin rounded-full border-2 border-brand-600 border-t-transparent ${sizeClass[size]}`} />
  )
}
