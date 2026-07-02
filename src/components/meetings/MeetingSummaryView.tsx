interface Props {
  summary: string
  keyHighlights: string[]
  decisions: string[]
}

export function MeetingSummaryView({ summary, keyHighlights, decisions }: Props) {
  return (
    <div className="space-y-6">
      {summary && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">AI Summary</h3>
          <p className="text-sm leading-relaxed text-gray-600">{summary}</p>
        </section>
      )}

      {keyHighlights.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Key Highlights</h3>
          <ul className="space-y-1.5">
            {keyHighlights.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                {point}
              </li>
            ))}
          </ul>
        </section>
      )}

      {decisions.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Decisions</h3>
          <ol className="space-y-1.5">
            {decisions.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="font-medium text-brand-600">{i + 1}.</span>
                {point}
              </li>
            ))}
          </ol>
        </section>
      )}

      {!summary && keyHighlights.length === 0 && decisions.length === 0 && (
        <p className="text-sm text-gray-400">No summary generated yet.</p>
      )}
    </div>
  )
}
