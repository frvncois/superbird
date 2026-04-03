import { ref, shallowRef, computed } from 'vue'
import { defineStore } from 'pinia'
import { runAudit, stripMarkdownLinks } from '../utils/audit'
import { AUDIT_ACTIONS } from '../utils/auditActions'
import { getAuditInsight } from '../utils/auditInsights'
import { buildAuditSummary } from '../utils/auditSummary'
import { detectStack } from '../utils/detectStack'
import type { RequestStatus, LighthouseResult, LighthouseAudit } from '@/types'

type VitalStatus = 'pass' | 'warn' | 'fail' | 'n/a'
interface Formatted { value: string; unit: string }

export const useAuditStore = defineStore('audit', () => {
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

  const topIssuesWithActions = computed(() => {
    if (!result.value) return []
    const audits = result.value.lighthouseResult.audits

    return opportunities.value
      .map(opp => {
        const raw = audits[opp.id]
        const savingsMs    = opp.savingsMs
        const savingsBytes = opp.savingsBytes
        const numericValue = raw?.numericValue ?? 0

        // Savings: prefer ms → bytes → numericValue
        const effectiveSavings = savingsMs > 0 ? savingsMs
          : savingsBytes > 0 ? savingsBytes / 200
          : numericValue

        // Priority: savings + score penalty + image boost
        const action = AUDIT_ACTIONS[opp.id]
        const isImageIssue = action?.category === 'images'
        const normalizedSavings = Math.min(effectiveSavings, 5000) / 5000
        const scorePenalty      = 1 - opp.score
        const imageBoost        = isImageIssue && savingsBytes > 100_000 ? 0.15 : 0
        const priority          = normalizedSavings * 0.6 + scorePenalty * 0.3 + imageBoost

        // savingsLabel
        let savingsLabel: string | null = null
        if (savingsMs >= 100) {
          savingsLabel = savingsMs >= 1000
            ? `${(savingsMs / 1000).toFixed(1)} s`
            : `${Math.round(savingsMs)} ms`
        } else if (savingsBytes >= 1024) {
          const kb = savingsBytes / 1024
          savingsLabel = kb >= 1024
            ? `${(kb / 1024).toFixed(1)} MB`
            : `${Math.round(kb)} KiB`
        }

        // impact
        const isHigh = savingsMs > 1000 || savingsBytes > 500_000 || opp.score < 0.3
        const isMed  = savingsMs > 300  || savingsBytes > 100_000 || opp.score < 0.7
        const impact: 'high' | 'medium' | 'low' = isHigh ? 'high' : isMed ? 'medium' : 'low'

        // display fields — suppress fix text if it would repeat the title
        const displayTitle = action?.label ?? opp.title
        const fixText = action?.fix && action.fix !== displayTitle ? action.fix : null

        const route    = action?.route ?? null
        const ctaLabel = action?.cta ?? (route ? 'Fix with Superbird' : null)

        return {
          id: opp.id,
          originalTitle: opp.title,
          displayTitle,
          savingsLabel,
          score: opp.score,
          action,
          impact,
          impactLabel: impact === 'high' ? 'High impact' : impact === 'medium' ? 'Medium impact' : 'Low impact',
          fixText,
          priority,
          route,
          ctaLabel,
          explain: action?.explain ?? null,
          prompt: action?.prompt ?? null,
        }
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
  })

  const quickVerdict = computed((): { title: string; subtitle: string } | null => {
    const perf = scores.value?.performance
    if (perf == null) return null
    const p = perf / 100

    const highCount = topIssuesWithActions.value.filter(i => i.impact === 'high').length
    const title = highCount >= 2
      ? "Start here."
      : highCount === 1
        ? "A few things are holding this back."
        : p >= 0.9
          ? "Your site is in good shape."
          : "Something's slowing your site down."

    const tbt = result.value?.lighthouseResult.audits['total-blocking-time']?.numericValue ?? null
    const lcp = result.value?.lighthouseResult.audits['largest-contentful-paint']?.numericValue ?? null

    const subtitle = getAuditInsight({
      performanceScore: p,
      tbt,
      lcp,
      opportunities: opportunities.value,
    }) ?? 'Start with the issues below.'

    return { title, subtitle }
  })

  async function audit() {
    const v = url.value.trim()
    if (v && !v.startsWith('http://') && !v.startsWith('https://')) {
      url.value = 'https://' + v
    }
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
      const data = await runAudit(url.value, strategy.value, abortController.signal)
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

  function reaudit() {
    result.value = null
    status.value = 'idle'
    audit()
  }

  const detectedStack = computed((): string[] => {
    if (!result.value) return []

    const audits = result.value.lighthouseResult.audits
    const structuralFragments: string[] = []
    const resourceUrls: string[] = [url.value]

    for (const audit of Object.values(audits)) {
      const items = audit.details?.items
      if (!Array.isArray(items)) continue
      for (const item of items) {
        for (const val of Object.values(item)) {
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            const obj = val as Record<string, unknown>
            // Only structural signals: DOM snippets and URLs
            if (typeof obj['snippet'] === 'string') structuralFragments.push(obj['snippet'])
            if (typeof obj['url'] === 'string')     resourceUrls.push(obj['url'])
          }
          // Plain strings that look like URLs go to resourceUrls, not structural HTML
          if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('/'))) {
            resourceUrls.push(val)
          }
        }
      }
    }

    const html = structuralFragments.join(' ')
    const signals = detectStack(html, undefined, resourceUrls)

    // Merge with Lighthouse's own stackPacks (authoritative)
    const packs = (result.value.lighthouseResult.stackPacks ?? []).map(s => s.title)
    const merged = [...packs]
    for (const sig of signals) {
      if (!merged.includes(sig)) merged.push(sig)
    }

    // Meta-framework implies its base — remove redundant entry
    if (merged.includes('Nuxt') || merged.includes('Next.js') || merged.includes('SvelteKit') || merged.includes('Remix')) {
      return merged.filter(s => !['Vue', 'React', 'Svelte'].includes(s))
    }

    return merged
  })

  const auditSummary = computed((): string | null => {
    if (!scores.value || !topIssuesWithActions.value.length) return null
    return buildAuditSummary({
      performance:   scores.value.performance,
      seo:           scores.value.seo,
      accessibility: scores.value.accessibility,
      bestPractices: scores.value.bestPractices,
      issues:        topIssuesWithActions.value,
      stack:         detectedStack.value,
    })
  })

  const fixPlanPrompt = computed((): string | null => {
    if (!scores.value || !topIssuesWithActions.value.length) return null
    const issues = topIssuesWithActions.value
      .map((issue, i) => {
        const savings = issue.savingsLabel ? ` (${issue.savingsLabel})` : ''
        return `${i + 1}. ${issue.displayTitle}${savings}`
      })
      .join('\n')
    return `I ran a Lighthouse audit and got these issues:\n\n${issues}\n\nScores:\n- Performance: ${scores.value.performance}\n- SEO: ${scores.value.seo}\n- Accessibility: ${scores.value.accessibility}\n- Best Practices: ${scores.value.bestPractices}\n\nExplain:\n1. What is causing these issues\n2. Which ones I should fix first\n3. Step-by-step plan to fix them\n\nContext: modern web app. Keep it practical and concise.`
  })

  function setStrategy(s: string) {
    strategy.value = s
    if (status.value === 'done') reaudit()
  }

  return {
    url, strategy, status, loadingStep, result, errorMessage,
    isValidUrl, scores, vitals, opportunities, diagnostics, passedAudits, seoAudits,
    topIssuesWithActions, quickVerdict, auditSummary, fixPlanPrompt,
    audit, reaudit, setStrategy, generateAiPrompt,
  }
})
