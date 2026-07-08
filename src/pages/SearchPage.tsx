import { useState } from 'react'
import { Link } from 'react-router-dom'
import { searchMeetings, type SearchResultItem } from '@/services/ai/search'
import { useAuthStore } from '@/store/auth.store'
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
    <div className="mx-auto max-w-[720px]">
      <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-ap-border bg-ap-surface px-[18px] py-3.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <circle cx="10.5" cy="10.5" r="6.5" stroke="var(--ap-text-tertiary)" strokeWidth="1.7" />
          <path d="M20 20l-4.8-4.8" stroke="var(--ap-text-tertiary)" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <input
          className="flex-1 border-none bg-transparent text-[14.5px] text-ap-text-primary outline-none placeholder:text-ap-text-tertiary"
          placeholder="Search meetings, tasks, decisions…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !q.trim()}
          className="shrink-0 rounded-xl bg-ap-accent px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '…' : 'Search'}
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {answer && (
        <div className="mb-4 flex gap-2.5 rounded-2xl bg-ap-accent-soft p-[18px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
            <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z" fill="var(--ap-accent)" />
          </svg>
          <p className="text-sm leading-relaxed text-ap-text-primary">{answer}</p>
        </div>
      )}

      {searched && !error && results.length === 0 && (
        <p className="text-sm text-ap-text-tertiary">No matching meetings found.</p>
      )}

      <div className="flex flex-col gap-2">
        {results.map(r => (
          <Link key={r.meetingId} to={`/meetings/${r.meetingId}`}>
            <Card className="transition-shadow hover:shadow-md dark:hover:shadow-black/30">
              <p className="mb-1 text-[13.5px] font-semibold text-ap-text-primary">{r.title}</p>
              {r.excerpt && <p className="text-[13px] leading-relaxed text-ap-text-secondary">{r.excerpt}</p>}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
