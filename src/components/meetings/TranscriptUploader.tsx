import { useRef } from 'react'

interface Props {
  onText: (text: string) => void
}

export function TranscriptUploader({ onText }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    onText(text)
    e.target.value = ''
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept=".txt,.md" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center justify-center gap-2 rounded-xl border border-ap-border bg-ap-surface px-3 py-[11px] text-[12.5px] font-semibold text-ap-text-primary"
      >
        <span className="h-[9px] w-[9px] rounded-full bg-ap-text-tertiary" />
        Upload .txt file
      </button>
    </div>
  )
}
