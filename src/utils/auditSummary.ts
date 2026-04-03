import { formatStackSentence } from './detectStack'

type Issue = {
  id: string
  displayTitle: string
  savingsLabel: string | null
  impact: 'high' | 'medium' | 'low'
}

// Maps audit IDs to a short human phrase used inline in the summary
const PHRASE_MAP: Record<string, string> = {
  'unused-javascript':              'unused JavaScript',
  'unused-css-rules':               'unused CSS',
  'render-blocking-resources':      'render-blocking scripts',
  'redirects':                      'redirect chains',
  'uses-optimized-images':          'unoptimized images',
  'uses-responsive-images':         'oversized images',
  'modern-image-formats':           'legacy image formats',
  'uses-text-compression':          'uncompressed text assets',
  'uses-long-cache-ttl':            'poor cache policy',
  'server-response-time':           'slow server response',
  'dom-size':                       'excessive DOM size',
  'bootup-time':                    'slow JavaScript boot time',
  'mainthread-work-breakdown':      'heavy main-thread work',
  'third-party-summary':            'heavy third-party scripts',
  'legacy-javascript':              'legacy JavaScript polyfills',
  'efficient-animated-content':     'unoptimized animated content',
  'offscreen-images':               'offscreen images loaded eagerly',
  'uses-rel-preconnect':            'missing preconnect hints',
  'critical-request-chains':        'deep critical request chains',
  'network-rtt':                    'high network latency',
  'total-byte-weight':              'excessive page weight',
}

// What each phrase does to the page — used to build natural sentences
const EFFECT_MAP: Record<string, string> = {
  'unused JavaScript':              'is loading code the page never uses',
  'unused CSS':                     'is shipping styles that apply to nothing',
  'render-blocking scripts':        'are preventing the page from painting',
  'redirect chains':                'are adding avoidable round trips',
  'unoptimized images':             'are larger than they need to be',
  'oversized images':               'are served at full resolution regardless of screen size',
  'legacy image formats':           'are missing out on WebP/AVIF compression',
  'uncompressed text assets':       'could be dramatically smaller with Gzip or Brotli',
  'poor cache policy':              'forces repeat visitors to redownload unchanged files',
  'slow server response':           'is adding latency before the browser has anything to work with',
  'excessive DOM size':             'is slowing down layout and style calculations',
  'slow JavaScript boot time':      'is consuming main-thread budget during startup',
  'heavy main-thread work':         'is keeping the browser busy and delaying interaction',
  'heavy third-party scripts':      'are outside your direct control but hurting your scores',
  'legacy JavaScript polyfills':    'are being sent to browsers that do not need them',
  'unoptimized animated content':   'would be better served as video instead of GIF',
  'offscreen images loaded eagerly':'are wasting bandwidth on content the user has not reached',
  'missing preconnect hints':       'means the browser discovers connections later than it could',
  'deep critical request chains':   'are serialising resources that should load in parallel',
  'high network latency':           'is a hosting or geographic distance problem',
  'excessive page weight':          'means the total page is too heavy overall',
}

// Score-based verdict lines
function performanceLine(score: number): string {
  if (score >= 90) return `Performance score is ${score}/100 — strong, but there are still gains on the table.`
  if (score >= 70) return `Performance score is ${score}/100 — decent, but meaningful improvements are within reach.`
  if (score >= 50) return `Performance score is ${score}/100 — noticeably slow. Users on mobile or slower connections are likely bouncing.`
  return `Performance score is ${score}/100 — critically slow. This needs immediate attention.`
}

function seoLine(score: number): string {
  if (score >= 90) return `SEO is in good shape at ${score}/100.`
  if (score >= 70) return `SEO score is ${score}/100 — some metadata or crawlability issues to fix.`
  return `SEO score is ${score}/100 — search engines may struggle to index or rank this site correctly.`
}

function accessibilityLine(score: number): string {
  if (score >= 90) return `Accessibility is solid at ${score}/100.`
  if (score >= 70) return `Accessibility is ${score}/100 — some elements may be unusable for screen reader or keyboard users.`
  return `Accessibility is ${score}/100 — significant barriers exist for users relying on assistive technology.`
}

function bestPracticesLine(score: number): string | null {
  if (score >= 90) return null
  if (score >= 70) return `Best practices score is ${score}/100 — minor security or compatibility issues present.`
  return `Best practices score is ${score}/100 — security headers, HTTPS issues, or deprecated APIs detected.`
}

const IMAGE_IDS = new Set(['uses-optimized-images', 'uses-responsive-images', 'modern-image-formats', 'offscreen-images', 'efficient-animated-content'])

// Build the issue sentences (up to 5 issues, grouped by theme)
function buildIssueParagraph(issues: Issue[]): string | null {
  const lines: string[] = []

  const imageIssues = issues.filter(i => IMAGE_IDS.has(i.id))
  const otherIssues = issues.filter(i => !IMAGE_IDS.has(i.id))

  if (imageIssues.length > 0) {
    const savings = imageIssues.map(i => i.savingsLabel).filter((s): s is string => Boolean(s)).join(', ')
    const firstId = imageIssues[0]!.id
    const detail = imageIssues.length > 1
      ? 'they are unoptimized, oversized, or using legacy formats'
      : `${PHRASE_MAP[firstId] ?? 'suboptimal'} ${EFFECT_MAP[PHRASE_MAP[firstId] ?? ''] ?? ''}`
    lines.push(`Images are the biggest asset problem — ${detail}${savings ? ` (potential saving: ${savings})` : ''}.`)
  }

  for (const issue of otherIssues.slice(0, 4)) {
    const phrase = PHRASE_MAP[issue.id]
    const effect = phrase ? EFFECT_MAP[phrase] : null
    if (!phrase || !effect) continue
    const saving = issue.savingsLabel ? ` Estimated saving: ${issue.savingsLabel}.` : ''
    lines.push(`${phrase.charAt(0).toUpperCase() + phrase.slice(1)} ${effect}.${saving}`)
  }

  return lines.length > 0 ? lines.join('\n') : null
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type AuditSummaryArgs = {
  performance: number
  seo?: number
  accessibility?: number
  bestPractices?: number
  issues: Issue[]
  stack?: string[]
}

export function buildAuditSummary(args: AuditSummaryArgs): string {
  const { performance, seo, accessibility, bestPractices, issues, stack } = args

  const sections: string[] = []

  // 1. Stack context — platform-aware hint
  const stackSentence = stack?.length ? formatStackSentence(stack) : null
  if (stackSentence) sections.push(stackSentence)

  // 2. Score overview
  sections.push(performanceLine(performance))
  if (seo != null)           sections.push(seoLine(seo))
  if (accessibility != null) sections.push(accessibilityLine(accessibility))
  if (bestPractices != null) {
    const bp = bestPracticesLine(bestPractices)
    if (bp) sections.push(bp)
  }

  // 3. Issue breakdown
  const issueParagraph = buildIssueParagraph(issues)
  if (issueParagraph) sections.push(issueParagraph)

  // 4. Closing CTA
  sections.push('Start with the highest-impact items above — fixing those first will move the scores the most.')

  return sections.join('\n')
}
