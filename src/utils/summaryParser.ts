import { AUDIT_ACTIONS } from './auditActions'

// Unified type — optional fields sidestep template narrowing issues
export type SummaryPart = {
  type: 'text' | 'issue' | 'br'
  value?: string
  explain?: string
}

const PHRASE_TO_AUDIT_ID: Record<string, string> = {
  'unused JavaScript':              'unused-javascript',
  'unused CSS':                     'unused-css-rules',
  'render-blocking scripts':        'render-blocking-resources',
  'redirect chains':                'redirects',
  'unoptimized images':             'uses-optimized-images',
  'oversized images':               'uses-responsive-images',
  'legacy image formats':           'modern-image-formats',
  'uncompressed text assets':       'uses-text-compression',
  'poor cache policy':              'uses-long-cache-ttl',
  'slow server response':           'server-response-time',
  'excessive DOM size':             'dom-size',
  'slow JavaScript boot time':      'bootup-time',
  'heavy main-thread work':         'mainthread-work-breakdown',
  'heavy third-party scripts':      'third-party-summary',
  'legacy JavaScript polyfills':    'legacy-javascript',
  'unoptimized animated content':   'efficient-animated-content',
  'offscreen images loaded eagerly':'offscreen-images',
  'missing preconnect hints':       'uses-rel-preconnect',
  'deep critical request chains':   'critical-request-chains',
  'high network latency':           'network-rtt',
  'excessive page weight':          'total-byte-weight',
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
