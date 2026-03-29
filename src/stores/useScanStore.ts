import { ref, shallowRef, computed } from 'vue'
import { defineStore } from 'pinia'
import { runScan, stripMarkdownLinks } from '../utils/scan'
import type { RequestStatus, LighthouseResult, LighthouseAudit } from '@/types'

type VitalStatus = 'pass' | 'warn' | 'fail' | 'n/a'
interface Formatted { value: string; unit: string }

export const useScanStore = defineStore('scan', () => {
  const url = ref('https://')
  const strategy = ref('desktop')
  const status = ref<RequestStatus>('idle')
  const loadingStep = ref(0)
  const result = shallowRef<LighthouseResult | null>(null)
  const errorMessage = ref('')

  let abortController: AbortController | null = null

  const isValidUrl = computed(() => {
    const v = url.value.trim()
    return (v.startsWith('http://') || v.startsWith('https://')) && v.includes('.')
  })

  const scores = computed(() => {
    if (!result.value) return null
    const cats = result.value.lighthouseResult.categories
    return {
      performance:   Math.round((cats.performance?.score   ?? 0) * 100),
      seo:           Math.round((cats.seo?.score           ?? 0) * 100),
      accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
    }
  })

  const vitals = computed(() => {
    if (!result.value) return []
    const audits = result.value.lighthouseResult.audits

    function vitalStatus(key: string, ms: number | null | undefined): VitalStatus {
      if (ms == null) return 'n/a'
      const thresholds: Record<string, { pass: number; warn: number }> = {
        LCP:  { pass: 2500, warn: 4000 },
        CLS:  { pass: 0.1,  warn: 0.25 },
        INP:  { pass: 200,  warn: 500  },
        FCP:  { pass: 1800, warn: 3000 },
        TTFB: { pass: 800,  warn: 1800 },
        TBT:  { pass: 200,  warn: 600  },
      }
      const t = thresholds[key]
      if (!t) return 'pass'
      if (ms < t.pass) return 'pass'
      if (ms < t.warn) return 'warn'
      return 'fail'
    }

    function fmtMs(ms: number | null | undefined): Formatted {
      if (ms == null) return { value: '—', unit: '' }
      if (ms >= 1000) return { value: (ms / 1000).toFixed(1), unit: 's' }
      return { value: Math.round(ms).toString(), unit: 'ms' }
    }

    const defs: Array<{
      key: string; label: string; desc: string
      get: () => number | undefined
      format?: (n: number | undefined) => Formatted
    }> = [
      { key: 'LCP',  label: 'Largest Contentful Paint',  desc: 'Time to render largest visible element', get: () => audits['largest-contentful-paint']?.numericValue },
      { key: 'CLS',  label: 'Cumulative Layout Shift',   desc: 'Visual stability of the page',           get: () => audits['cumulative-layout-shift']?.numericValue,  format: (n) => n == null ? { value: '—', unit: '' } : { value: n.toFixed(3), unit: '' } },
      { key: 'INP',  label: 'Interaction to Next Paint', desc: 'Responsiveness to user input',           get: () => audits['interaction-to-next-paint']?.numericValue },
      { key: 'FCP',  label: 'First Contentful Paint',    desc: 'Time to first rendered content',         get: () => audits['first-contentful-paint']?.numericValue },
      { key: 'TTFB', label: 'Time to First Byte',        desc: 'Server response time',                   get: () => audits['server-response-time']?.numericValue },
      { key: 'TBT',  label: 'Total Blocking Time',       desc: 'Time main thread was blocked',           get: () => audits['total-blocking-time']?.numericValue },
    ]

    return defs.map(def => {
      const numericValue = def.get()
      const formatted = def.format ? def.format(numericValue) : fmtMs(numericValue)
      return { key: def.key, label: def.label, value: formatted.value, unit: formatted.unit, desc: def.desc, status: vitalStatus(def.key, numericValue) }
    })
  })

  const opportunities = computed(() => {
    if (!result.value) return []
    const audits = result.value.lighthouseResult.audits
    return (Object.values(audits) as LighthouseAudit[])
      .filter(a => a.details?.type === 'opportunity' && a.score != null && a.score < 0.9)
      .map(a => ({
        id: a.id,
        title: a.title,
        description: stripMarkdownLinks(a.description ?? ''),
        displayValue: a.displayValue ?? '',
        score: a.score ?? 0,
        savingsMs: a.details?.overallSavingsMs ?? 0,
        savingsBytes: a.details?.overallSavingsBytes ?? 0,
        details: a.details ?? null,
      }))
      .sort((a, b) => b.savingsMs - a.savingsMs)
  })

  const diagnostics = computed(() => {
    if (!result.value) return []
    const audits = result.value.lighthouseResult.audits
    const ids = ['mainthread-work-breakdown', 'bootup-time', 'dom-size', 'network-requests', 'total-byte-weight']
    return ids
      .filter(id => audits[id])
      .map(id => {
        const a = audits[id]!
        return { title: a.title, displayValue: a.displayValue ?? '', score: a.score ?? 0, details: a.details ?? null }
      })
  })

  const passedAudits = computed(() => {
    if (!result.value) return []
    const audits = result.value.lighthouseResult.audits
    return (Object.values(audits) as LighthouseAudit[])
      .filter(a => a.score === 1 && a.details?.type === 'opportunity' && a.title)
      .slice(0, 6)
      .map(a => ({
        id: a.id, title: a.title, description: stripMarkdownLinks(a.description ?? ''),
        displayValue: a.displayValue ?? '', score: 1, savingsMs: 0, savingsBytes: 0,
      }))
  })

  const seoAudits = computed(() => {
    if (!result.value) return []
    const cats = result.value.lighthouseResult.categories
    const audits = result.value.lighthouseResult.audits
    const refs = cats.seo?.auditRefs ?? []
    return refs
      .filter(ref => (ref.weight ?? 1) > 0)
      .map(ref => audits[ref.id])
      .filter((a): a is LighthouseAudit => a?.score != null)
      .map(a => ({
        id: a.id, title: a.title,
        description: stripMarkdownLinks(a.description ?? ''),
        displayValue: a.displayValue ?? '',
        score: a.score as number,
        details: a.details ?? null,
      }))
      .sort((a, b) => a.score - b.score)
  })

  async function scan() {
    if (!isValidUrl.value) return

    abortController?.abort()
    abortController = new AbortController()

    status.value = 'loading'
    loadingStep.value = 0
    result.value = null
    errorMessage.value = ''

    const t1 = setTimeout(() => { if (status.value === 'loading') loadingStep.value = 1 }, 800)
    const t2 = setTimeout(() => { if (status.value === 'loading') loadingStep.value = 2 }, 1800)

    try {
      const data = await runScan(url.value, strategy.value, abortController.signal)
      loadingStep.value = 3
      result.value = data
      status.value = 'done'
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      status.value = 'error'
      errorMessage.value = (err as Error).message
    } finally {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }

  function generateAiPrompt(): string {
    const stackPacks = result.value?.lighthouseResult?.stackPacks ?? []
    const stackNames = stackPacks.map(s => s.title).join(', ') || null
    const failedVitals = vitals.value.filter(v => v.status === 'warn' || v.status === 'fail')
    const opps = opportunities.value
    const diags = diagnostics.value
    const lines: string[] = []
    lines.push('I need help improving the performance and quality of my website.')
    lines.push('')
    lines.push(`URL: ${url.value}`)
    lines.push(`Audit strategy: ${strategy.value}`)
    if (stackNames) lines.push(`Detected tech stack: ${stackNames}`)
    lines.push('')
    lines.push('## Lighthouse scores')
    lines.push(`- Performance: ${scores.value?.performance}/100`)
    lines.push(`- SEO: ${scores.value?.seo}/100`)
    lines.push(`- Accessibility: ${scores.value?.accessibility}/100`)
    lines.push(`- Best practices: ${scores.value?.bestPractices}/100`)
    lines.push('')
    if (failedVitals.length) {
      lines.push('## Core web vitals needing attention')
      failedVitals.forEach(v => lines.push(`- ${v.key} (${v.label}): ${v.value}${v.unit ?? ''} — ${v.status === 'warn' ? 'needs improvement' : 'poor'}`))
      lines.push('')
    }
    if (opps.length) {
      lines.push('## Opportunities')
      opps.forEach(o => lines.push(`- ${o.title}${o.displayValue ? ` (${o.displayValue})` : ''}: ${o.description}`))
      lines.push('')
    }
    if (diags.length) {
      lines.push('## Diagnostics')
      diags.forEach(d => lines.push(`- ${d.title}: ${d.displayValue}`))
      lines.push('')
    }
    lines.push('Please analyse these results and give me a prioritised action plan to fix the most impactful issues. For each fix, explain what to change and why it will help. Be specific — include code examples where relevant.')
    return lines.join('\n')
  }

  function rescan() {
    result.value = null
    status.value = 'idle'
    scan()
  }

  function setStrategy(s: string) {
    strategy.value = s
    if (status.value === 'done') rescan()
  }

  return {
    url, strategy, status, loadingStep, result, errorMessage,
    isValidUrl, scores, vitals, opportunities, diagnostics, passedAudits, seoAudits,
    scan, rescan, setStrategy, generateAiPrompt,
  }
})
