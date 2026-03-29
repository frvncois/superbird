export type RequestStatus = 'idle' | 'loading' | 'done' | 'error'

// ── Lighthouse API response ───────────────────────────────────────────────────

export interface LighthouseAudit {
  id: string
  title: string
  description?: string
  score: number | null
  displayValue?: string
  numericValue?: number
  details?: {
    type: string
    headings?: Array<{ key: string; label: string; valueType?: string }>
    items?: Record<string, unknown>[]
    overallSavingsMs?: number
    overallSavingsBytes?: number
  } | null
}

export interface LighthouseCategory {
  score: number | null
  auditRefs: Array<{ id: string; weight?: number }>
}

export interface LighthouseResult {
  lighthouseResult: {
    categories: {
      performance?: LighthouseCategory
      seo?: LighthouseCategory
      accessibility?: LighthouseCategory
      'best-practices'?: LighthouseCategory
    }
    audits: Record<string, LighthouseAudit>
    stackPacks?: Array<{ title: string }>
  }
}
