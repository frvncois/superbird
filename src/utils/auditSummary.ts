import { formatStackSentence } from './detectStack'

type Issue = {
  id: string
  displayTitle: string
  savingsLabel: string | null
  impact: 'high' | 'medium' | 'low'
}

const PHRASE_MAP: Record<string, string> = {
  'unused-javascript':       'unused JavaScript',
  'render-blocking-resources': 'blocking scripts',
  'redirects':               'redirect chains',
  'uses-optimized-images':   'heavy images',
  'uses-responsive-images':  'heavy images',
  'modern-image-formats':    'heavy images',
  'server-response-time':    'slow server response',
}

const EFFECT_MAP: Record<string, string> = {
  'unused JavaScript':    'is wasting bandwidth',
  'blocking scripts':     'are delaying rendering',
  'redirect chains':      'are adding unnecessary delay',
  'heavy images':         'are slowing down load time',
  'slow server response': 'is delaying the initial response',
}

function opening(performance: number): string {
  if (performance >= 90) return "Your site is fast overall, but a couple things are holding it back."
  if (performance >= 70) return "Your site is doing okay, but there's still room for improvement."
  return "Your site is being slowed down more than it should."
}

export function buildAuditSummary(args: { performance: number; issues: Issue[]; stack?: string[] }): string {
  const { performance, issues, stack } = args

  const sentences = issues
    .slice(0, 2)
    .map(issue => {
      const phrase = PHRASE_MAP[issue.id]
      if (!phrase) return null
      return `${phrase} ${EFFECT_MAP[phrase]}`
    })
    .filter((s): s is string => s !== null)

  const middle = sentences.length === 2
    ? `${sentences[0]}, and ${sentences[1]}.`
    : sentences.length === 1
      ? `${sentences[0]}.`
      : null

  const stackSentence = stack?.length ? formatStackSentence(stack) : null

  return [stackSentence, opening(performance), middle, 'Fix those first — biggest impact.']
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('\n')
}
