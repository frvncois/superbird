<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuditStore } from '@/stores/useAuditStore'
import {
  ExclamationCircleIcon,
  BoltIcon,
  BeakerIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'
import UiBadge from './ui/UiBadge.vue'
import UiButton from './ui/UiButton.vue'
import UiList from './ui/UiList.vue'
import ItemAudit from './ui/items/ItemAudit.vue'
import UiMinis from './ui/UiMinis.vue'

const { status, vitals, opportunities, diagnostics, passedAudits, seoAudits, topIssuesWithActions, quickVerdict, fixPlanPrompt } = storeToRefs(useAuditStore())

const fixPlanCopied = ref(false)
const expandedExplain = ref<Record<string, boolean>>({})
const copiedIds = ref<Record<string, boolean>>({})

async function copyFixPlan() {
  if (!fixPlanPrompt.value) return
  try {
    await navigator.clipboard.writeText(fixPlanPrompt.value)
    fixPlanCopied.value = true
    setTimeout(() => { fixPlanCopied.value = false }, 2000)
  } catch {
    // silent fail
  }
}

function toggleExplain(id: string) {
  expandedExplain.value = { ...expandedExplain.value, [id]: !expandedExplain.value[id] }
}

async function copyPrompt(issue: { id: string; displayTitle: string; savingsLabel: string | null; prompt: ((args: { title: string; savingsLabel?: string }) => string) | null | undefined }) {
  if (!issue.prompt) return
  const text = issue.prompt({ title: issue.displayTitle, savingsLabel: issue.savingsLabel ?? undefined })
  try {
    await navigator.clipboard.writeText(text)
    copiedIds.value = { ...copiedIds.value, [issue.id]: true }
    setTimeout(() => {
      const next = { ...copiedIds.value }
      delete next[issue.id]
      copiedIds.value = next
    }, 2000)
  } catch {
    // clipboard unavailable — silent fail
  }
}
</script>

<template>
  <section class="space-y-8" v-if="status === 'done'">

    <!-- Core Web Vitals -->
    <UiMinis
      :vitals="vitals"
      style="animation: superbird-fade-in-up 0.5s ease both; animation-delay: 0ms"
    />

    <!-- Opportunities -->
    <UiList
      v-if="opportunities.length"
      :icon="BoltIcon"
      title="Opportunities"
      description="Optimisations with estimated savings"
      :count="opportunities.length"
      :animation-delay="80"
    >
      <ItemAudit
        v-for="opp in opportunities"
        :key="opp.id"
        :title="opp.title"
        :value="opp.displayValue"
        :description="opp.description"
        :score="opp.score"
        :details="opp.details"
      />
    </UiList>

    <!-- Diagnostics -->
    <UiList
      v-if="diagnostics.length"
      :icon="BeakerIcon"
      title="Diagnostics"
      description="More information about your page"
      :count="diagnostics.length"
      :animation-delay="160"
    >
      <ItemAudit
        v-for="diag in diagnostics"
        :key="diag.title"
        :title="diag.title"
        :value="diag.displayValue"
        :score="diag.score"
        :details="diag.details"
      />
    </UiList>

    <!-- SEO -->
    <UiList
      v-if="seoAudits.length"
      :icon="MagnifyingGlassIcon"
      title="SEO"
      description="Search engine optimisation audits"
      :count="seoAudits.length"
      :animation-delay="240"
    >
      <ItemAudit
        v-for="audit in seoAudits"
        :key="audit.id"
        :title="audit.title"
        :value="audit.displayValue"
        :description="audit.description"
        :score="audit.score"
        :details="audit.details"
      />
    </UiList>

    <!-- Passed Audits -->
    <UiList
      v-if="passedAudits.length"
      :icon="CheckCircleIcon"
      title="Passed"
      description="Audits that require no action"
      :count="passedAudits.length"
      :animation-delay="320"
    >
      <ItemAudit
        v-for="audit in passedAudits"
        :key="audit.id"
        :title="audit.title"
        :description="audit.description"
        :score="1"
      />
    </UiList>

  </section>
</template>
