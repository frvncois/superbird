export function detectStack(html: string, headers?: Record<string, string>): string[] {
  const signals: string[] = []

  // Framework detection
  if (html.includes('__NUXT__')) signals.push('Nuxt')
  else if (html.includes('__NEXT_DATA__')) signals.push('Next.js')
  else if (html.includes('data-v-')) signals.push('Vue')
  else if (html.includes('react')) signals.push('React')

  // CMS detection
  if (html.includes('wp-content')) signals.push('WordPress')
  if (html.includes('shopify')) signals.push('Shopify')

  // CDN / hosting
  const server = headers?.['server']?.toLowerCase() ?? ''
  if (server.includes('cloudflare')) signals.push('Cloudflare')
  if (server.includes('vercel')) signals.push('Vercel')

  return signals
}

const FRAMEWORKS = new Set(['Nuxt', 'Next.js', 'Vue', 'React'])
const CMS = new Set(['WordPress', 'Shopify'])
const HOSTING = new Set(['Cloudflare', 'Vercel'])

export function formatStackSentence(signals: string[]): string | null {
  const framework = signals.find(s => FRAMEWORKS.has(s))
  const cms = signals.find(s => CMS.has(s))
  const host = signals.find(s => HOSTING.has(s))

  const primary = cms ?? framework
  if (!primary && !host) return null

  const type = cms ? 'site' : 'app'
  if (primary && host) return `Looks like a ${primary} ${type} behind ${host}.`
  if (primary) return `Looks like a ${primary} ${type}.`
  if (host) return `Hosted on ${host}.`
  return null
}
