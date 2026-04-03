type ExportData = {
  summary: string | null
  scores: { performance: number; seo: number; accessibility: number; bestPractices: number } | null
  topIssues: Array<{ displayTitle: string; savingsLabel: string | null }>
  opportunities: Array<{ title: string; displayValue: string }>
  url: string
}

export function exportMarkdown(data: ExportData): string {
  const scores = data.scores
  return [
    `# Audit Report`,
    `**URL:** ${data.url}`,
    data.summary ? `## Summary\n${data.summary}` : null,
    scores
      ? `## Scores\n- Performance: ${scores.performance}/100\n- SEO: ${scores.seo}/100\n- Accessibility: ${scores.accessibility}/100\n- Best Practices: ${scores.bestPractices}/100`
      : null,
    data.topIssues.length
      ? `## Top Issues\n${data.topIssues.map((i, idx) => `${idx + 1}. ${i.displayTitle}${i.savingsLabel ? ` (${i.savingsLabel})` : ''}`).join('\n')}`
      : null,
    data.opportunities.length
      ? `## Opportunities\n${data.opportunities.map(i => `- ${i.title}${i.displayValue ? ` — ${i.displayValue}` : ''}`).join('\n')}`
      : null,
  ].filter(Boolean).join('\n\n')
}

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

export function exportCSV(data: ExportData): string {
  const rows: string[][] = [
    ['Type', 'Title', 'Value'],
    ...data.topIssues.map(i => ['Top Issue', i.displayTitle, i.savingsLabel ?? '']),
    ...data.opportunities.map(i => ['Opportunity', i.title, i.displayValue]),
  ]
  return rows.map(r => r.map(escapeCSV).join(',')).join('\n')
}

export function exportPDF(markdown: string, url: string) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><title>Audit — ${url}</title><style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #111; }
    h1 { font-size: 1.5rem; } h2 { font-size: 1.1rem; margin-top: 2em; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    pre { white-space: pre-wrap; font-family: inherit; }
  </style></head><body><pre>${markdown.replace(/</g, '&lt;')}</pre></body></html>`)
  win.document.close()
  win.print()
}
