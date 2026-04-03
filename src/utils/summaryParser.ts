import { AUDIT_ACTIONS } from './auditActions'

// Unified type — optional fields sidestep template narrowing issues
export type SummaryPart = {
  type: 'text' | 'issue' | 'br'
  value?: string
  explain?: string
}

const PHRASE_TO_AUDIT_ID: Record<string, string> = {
  'unused JavaScript':       'unused-javascript',
  'blocking scripts':        'render-blocking-resources',
  'redirect chains':         'redirects',
  'heavy images':            'uses-optimized-images',
  'slow server response':    'server-response-time',
}

function parseLine(line: string): SummaryPart[] {
  const phrases = Object.keys(PHRASE_TO_AUDIT_ID)

  type Match = { start: number; end: number; phrase: string; explain?: string }
  const matches: Match[] = []

  for (const phrase of phrases) {
    const idx = line.indexOf(phrase)
    if (idx !== -1) {
      const auditId = PHRASE_TO_AUDIT_ID[phrase]
      matches.push({
        start: idx,
        end: idx + phrase.length,
        phrase,
        explain: auditId ? AUDIT_ACTIONS[auditId]?.explain : undefined,
      })
    }
  }

  matches.sort((a, b) => a.start - b.start)

  const parts: SummaryPart[] = []
  let pos = 0
  for (const m of matches) {
    if (m.start > pos) parts.push({ type: 'text', value: line.slice(pos, m.start) })
    parts.push({ type: 'issue', value: m.phrase, explain: m.explain })
    pos = m.end
  }
  if (pos < line.length) parts.push({ type: 'text', value: line.slice(pos) })

  return parts
}

export function parseSummary(text: string): SummaryPart[] {
  const lines = text.split('\n')
  const result: SummaryPart[] = []
  lines.forEach((line, i) => {
    result.push(...parseLine(line))
    if (i < lines.length - 1) result.push({ type: 'br' })
  })
  return result
}
