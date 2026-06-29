import { useState } from 'react'
import { searchMeetings } from '@/services/functions'
import { useAuthStore } from '@/store/auth.store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Link } from 'react-router-dom'

interface Result { meetingId: string; excerpt: string; score: number }

export function SearchPage() {
  const user = useAuthStore(s => s.user)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!user || !q.trim()) return
    setLoading(true)
    try {
      const res = await searchMeetings({ query: q.trim(), orgId: user.orgId })
      setResults(res.data.results)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex gap-2">
        <Input
          className="flex-1"
          placeholder='e.g. "budget approval from last quarter"'
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} loading={loading} disabled={!q.trim()}>Search</Button>
      </div>

      {searched && results.length === 0 && (
        <p className="text-sm text-gray-400">No results found for "{q}".</p>
      )}

      <div className="space-y-3">
        {results.map(r => (
          <Link key={r.meetingId} to={`/meetings/${r.meetingId}`}>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-700 leading-relaxed">{r.excerpt}</p>
              <p className="mt-1 text-xs text-brand-600">View meeting →</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
