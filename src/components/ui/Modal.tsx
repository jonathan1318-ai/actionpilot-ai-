import type { ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ title, onClose, children, footer }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-ap-border bg-ap-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-ap-border px-5 py-4">
          <h3 className="text-[13.5px] font-bold text-ap-text-primary">{title}</h3>
          <button onClick={onClose} className="text-ap-text-tertiary hover:text-ap-text-primary" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ap-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}
