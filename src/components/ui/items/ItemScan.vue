<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { formatBytes } from '@/utils/formatters'

type ItemStatus = 'pass' | 'warn' | 'fail' | 'n/a'

interface Heading {
  key: string
  label: string
  valueType?: string
}

const props = defineProps<{
  title: string
  value?: string
  description?: string
  score?: number
  status?: ItemStatus
  details?: {
    type: string
    headings?: Heading[]
    items?: Record<string, unknown>[]
  } | null
}>()

const expanded = ref(false)

const resolvedStatus = computed<ItemStatus>(() => {
  if (props.status) return props.status
  if (props.score === undefined) return 'n/a'
  if (props.score >= 0.9) return 'pass'
  if (props.score >= 0.5) return 'warn'
  return 'fail'
})

const dotColor = computed(() => {
  switch (resolvedStatus.value) {
    case 'pass': return 'var(--score-green)'
    case 'warn': return 'var(--score-amber)'
    case 'fail': return 'var(--score-red)'
    default:     return 'var(--color-secondary)'
  }
})

const hasDetails = computed(() => {
  const d = props.details
  if (!d) return false
  return (d.type === 'table' || d.type === 'opportunity') &&
    (d.headings?.length ?? 0) > 0 &&
    (d.items?.length ?? 0) > 0
})

const visibleHeadings = computed<Heading[]>(() =>
  props.details?.headings?.filter(h => h.label) ?? []
)

function isNumericType(valueType?: string) {
  return valueType === 'bytes' || valueType === 'timespanMs' || valueType === 'ms' || valueType === 'numeric'
}

function formatValue(value: unknown, valueType?: string): string {
  if (value === undefined || value === null || value === '') return '—'

  if (typeof value === 'object') {
    const v = value as Record<string, unknown>
    if (v['type'] === 'url' || v['type'] === 'code') return String(v['value'] ?? '—')
    if (v['type'] === 'link') return String(v['text'] ?? v['url'] ?? '—')
    if (v['type'] === 'node') return String(v['nodeLabel'] ?? v['snippet'] ?? '—')
    if (v['type'] === 'source-location') {
      const file = String(v['url'] ?? '').split('/').pop() ?? String(v['url'] ?? '')
      return `${file}:${v['line'] ?? 0}:${v['column'] ?? 0}`
    }
    return '—'
  }

  switch (valueType) {
    case 'bytes':
      return formatBytes(Number(value))
    case 'timespanMs':
    case 'ms': {
      const n = Number(value)
      return n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${Math.round(n)} ms`
    }
    case 'numeric':
      return Number(value).toLocaleString()
    case 'url': {
      try {
        const u = new URL(String(value))
        return u.pathname + (u.search ?? '')
      } catch {
        return String(value)
      }
    }
    default:
      return String(value)
  }
}
</script>

<template>
  <div class="border-b border-border/50 last:border-b-0">

    <!-- Main row -->
    <div
      class="flex items-start gap-3 p-3"
      :class="hasDetails ? 'cursor-pointer select-none' : ''"
      @click="hasDetails ? expanded = !expanded : undefined"
    >
      <div class="size-2 rounded-full mt-1.5 shrink-0" :style="{ backgroundColor: dotColor }" />
      <div class="flex-1 min-w-0">
        <div class="text-xs font-medium truncate">{{ title }}</div>
        <div v-if="description" class="text-[10px] text-secondary mt-0.5 leading-relaxed line-clamp-2">
          {{ description }}
        </div>
      </div>
      <span v-if="value" class="text-[10px] font-mono text-secondary shrink-0 mt-0.5">{{ value }}</span>
      <ChevronDownIcon
        v-if="hasDetails"
        class="size-3.5 text-secondary shrink-0 mt-0.5 transition-transform duration-200"
        :class="expanded ? 'rotate-180' : ''"
      />
    </div>

    <!-- Detail table -->
    <div v-if="hasDetails && expanded" class="border-t border-border/50">
      <!-- Column headers -->
      <div class="flex gap-4 px-8 py-2 bg-secondary/5 border-b border-border/50">
        <span
          v-for="h in visibleHeadings"
          :key="h.key"
          class="text-[10px] font-mono text-secondary uppercase tracking-wide"
          :class="isNumericType(h.valueType) ? 'w-24 shrink-0 text-right truncate' : 'flex-1 min-w-0 truncate'"
        >
          {{ h.label }}
        </span>
      </div>
      <!-- Rows -->
      <div
        v-for="(item, i) in details!.items"
        :key="i"
        class="flex gap-4 px-8 py-2 border-b border-border/30 last:border-b-0"
      >
        <span
          v-for="h in visibleHeadings"
          :key="h.key"
          class="text-[10px] font-mono"
          :class="isNumericType(h.valueType) ? 'w-24 shrink-0 text-right text-secondary' : 'flex-1 min-w-0 truncate'"
          :title="typeof item[h.key] === 'string' ? (item[h.key] as string) : undefined"
        >
          {{ formatValue(item[h.key], h.valueType) }}
        </span>
      </div>
    </div>

  </div>
</template>
