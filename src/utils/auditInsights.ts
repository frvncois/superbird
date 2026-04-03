const IMAGE_IDS = ['uses-optimized-images', 'uses-responsive-images', 'offscreen-images', 'modern-image-formats']
const JS_IDS    = ['unused-javascript', 'bootup-time', 'legacy-javascript', 'unminified-javascript']

export function getAuditInsight(args: {
  performanceScore?: number
  tbt?: number | null
  lcp?: number | null
  opportunities: Array<{ id: string }>
}): string | null {
  const { tbt, lcp, opportunities } = args
  const ids = new Set(opportunities.map(o => o.id))

  if ((tbt ?? 0) > 200 && JS_IDS.some(id => ids.has(id))) {
    return 'JavaScript is blocking the main thread.'
  }
  if ((lcp ?? 0) > 2500 && IMAGE_IDS.some(id => ids.has(id))) {
    return 'Large media is delaying the biggest visible content.'
  }
  if (ids.has('redirects')) {
    return 'Redirect chains are slowing down the initial request.'
  }
  if (ids.has('server-response-time')) {
    return 'Slow server response is delaying the page load.'
  }
  return null
}
