import { useState } from 'react'
import { Link } from 'react-router-dom'
import { searchMeetings, type SearchResultItem } from '@/services/ai/search'
import { useAuthStore } from '@/store/auth.store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function SearchPage() {
  const user = useAuthStore(s => s.user)
  const [q, setQ] = useState('')
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!user || !q.trim()) return
    setLoading(true)
    setError('')
    setAnswer('')
    setResults([])
    try {
      const res = await searchMeetings(user.orgId, q.trim())
      setAnswer(res.answer)
      setResults(res.results)
      setSearched(true)
    } catch (err) {
      setError((err as Error).message || 'Search failed')
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      {answer && (
        <Card className="p-4">
          <p className="text-sm leading-relaxed text-gray-700">{answer}</p>
        </Card>
      )}

      {searched && !error && results.length === 0 && (
        <p className="text-sm text-gray-400">No matching meetings found.</p>
      )}

      <div className="space-y-3">
        {results.map(r => (
          <Link key={r.meetingId} to={`/meetings/${r.meetingId}`}>
            <Card className="p-4 transition-shadow hover:shadow-md">
              <p className="text-sm font-medium text-gray-900">{r.title}</p>
              {r.excerpt && <p className="mt-1 text-sm leading-relaxed text-gray-600">{r.excerpt}</p>}
              <p className="mt-1 text-xs text-brand-600">View meeting →</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
