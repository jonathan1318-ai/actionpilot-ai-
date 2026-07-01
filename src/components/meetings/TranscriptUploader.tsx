import { useRef } from 'react'
import { Button } from '@/components/ui/Button'

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
      <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
        Upload .txt transcript
      </Button>
    </div>
  )
}
