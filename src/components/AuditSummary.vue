<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuditStore } from '@/stores/useAuditStore'
import { parseSummary, type SummaryPart } from '@/utils/summaryParser'
import { exportMarkdown, exportCSV, exportPDF } from '@/utils/exportAudit'
import { SparklesIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import UiButton from '@/components/ui/UiButton.vue'

const { auditSummary, fixPlanPrompt, scores, topIssuesWithActions, opportunities, url } = storeToRefs(useAuditStore())

// ── Streaming text ────────────────────────────────────────────────────────────

const displayedText = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

watch(auditSummary, (val) => {
  if (timer) clearTimeout(timer)
  displayedText.value = ''
  if (!val) return
  const text = val
  let i = 0
  function tick() {
    if (i < text.length) {
      displayedText.value = text.slice(0, ++i)
      timer = setTimeout(tick, 14)
    }
  }
  tick()
}, { immediate: true })

onUnmounted(() => { if (timer) clearTimeout(timer) })

const parsed = computed(() =>
  displayedText.value ? parseSummary(displayedText.value) : []
)

const lines = computed(() => {
  const groups: SummaryPart[][] = []
  let current: SummaryPart[] = []
  for (const part of parsed.value) {
    if (part.type === 'br') {
      groups.push(current)
      current = []
    } else {
      current.push(part)
    }
  }
  if (current.length) groups.push(current)
  return groups
})

// ── Copy AI prompt ────────────────────────────────────────────────────────────

const copied = ref(false)

async function copy() {
  if (!fixPlanPrompt.value) return
  try {
    await navigator.clipboard.writeText(fixPlanPrompt.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}

// ── Export ────────────────────────────────────────────────────────────────────

const exportOpen = ref(false)
const exportTriggerRef = ref<HTMLElement | null>(null)
const exportPanelRef = ref<HTMLElement | null>(null)

function handleOutsideClick(e: MouseEvent) {
  const t = e.target as Node
  if (!exportTriggerRef.value?.contains(t) && !exportPanelRef.value?.contains(t)) {
    exportOpen.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))

const exportData = computed(() => ({
  summary: auditSummary.value,
  scores: scores.value,
  topIssues: topIssuesWithActions.value,
  opportunities: opportunities.value,
  url: url.value,
}))

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
  exportOpen.value = false
}

function downloadMarkdown() {
  downloadFile(exportMarkdown(exportData.value), 'audit.md', 'text/markdown')
}
function downloadCSV() {
  downloadFile(exportCSV(exportData.value), 'audit.csv', 'text/csv')
}
function downloadPDF() {
  exportPDF(exportMarkdown(exportData.value), url.value)
  exportOpen.value = false
}
</script>

<template>
  <div
    v-if="auditSummary"
    class="bg-secondary/5 rounded-2xl p-8 space-y-6 mb-8"
    style="animation: superbird-fade-in-up 0.5s ease both; animation-delay: 240ms"
  >
    <div class="space-y-1.5">
      <p v-for="(line, li) in lines" :key="li" class="leading-relaxed">
        <template v-for="(part, i) in line" :key="i">
          <span v-if="part.type === 'text'">{{ part.value }}</span>
          <span
            v-else-if="part.type === 'issue'"
            class="relative group/tip inline underline decoration-dotted underline-offset-2 cursor-help"
          >
            {{ part.value }}
            <span
              v-if="part.explain"
              class="absolute left-0 top-full z-10 mt-1.5 w-52 rounded-lg border bg-background p-2 text-[10px] leading-relaxed text-secondary opacity-0 shadow-sm transition-opacity group-hover/tip:opacity-100 pointer-events-none"
            >
              {{ part.explain }}
            </span>
          </span>
        </template>
      </p>
    </div>

    <div class="flex items-center gap-2">
      <!-- Copy AI prompt -->
      <UiButton v-if="fixPlanPrompt" variant="outline" size="sm" @click="copy">
        <SparklesIcon class="size-3 shrink-0" />
        {{ copied ? 'Copied' : 'Copy AI prompt' }}
      </UiButton>

      <!-- Export dropdown -->
      <div class="relative">
        <UiButton
          ref="exportTriggerRef"
          variant="outline"
          size="sm"
          @click="exportOpen = !exportOpen"
        >
          <ArrowDownTrayIcon class="size-3 shrink-0" />
          Export
        </UiButton>

        <Transition
          enter-active-class="transition duration-150"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="exportOpen"
            ref="exportPanelRef"
            class="absolute left-0 top-full mt-1.5 z-20 min-w-[140px] rounded-xl border bg-background p-1 shadow-lg"
          >
            <button
              v-for="item in [
                { label: 'Markdown', action: downloadMarkdown },
                { label: 'CSV', action: downloadCSV },
                { label: 'PDF (print)', action: downloadPDF },
              ]"
              :key="item.label"
              class="flex w-full items-center rounded-lg px-3 py-1.5 text-xs hover:bg-secondary/10 active:bg-secondary/20 cursor-pointer"
              @click="item.action()"
            >
              {{ item.label }}
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
