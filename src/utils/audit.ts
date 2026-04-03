import type { LighthouseResult } from '@/types'

const PAGESPEED_API_KEY = import.meta.env.VITE_PAGESPEED_API_KEY

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export async function runAudit(url: string, strategy = 'mobile', signal?: AbortSignal): Promise<LighthouseResult> {
  if (!isValidHttpUrl(url)) throw new Error('URL must start with http:// or https://')
  const categories = ['performance', 'seo', 'accessibility', 'best-practices']
    .map(c => `category=${c}`)
    .join('&')
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&${categories}&key=${PAGESPEED_API_KEY}`
  const res = await fetch(endpoint, { signal })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `API error ${res.status}`)
  }
  return res.json() as Promise<LighthouseResult>
}

export function scoreColor(score: number): string {
  if (score >= 90) return 'var(--score-green)'
  if (score >= 50) return 'var(--score-amber)'
  return 'var(--score-red)'
}

export function stripMarkdownLinks(text: string): string {
  return text?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') ?? ''
}

export function scoreOffset(score: number): string {
  return (138.2 * (1 - score / 100)).toFixed(1)
}
