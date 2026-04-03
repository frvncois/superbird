<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useAuditStore } from '@/stores/useAuditStore'
import SharedIntro from '@/components/shared/SharedIntro.vue'
import UiLookup from '@/components/ui/UiLookup.vue'
import AuditStats from '@/components/AuditStats.vue'
import AuditSummary from '@/components/AuditSummary.vue'
import AuditList from '@/components/AuditList.vue'
import AuditSkeleton from '@/components/skeletons/AuditSkeleton.vue'
import { useRouteLeave } from '@/composables/useRouteLeave'

const auditStore = useAuditStore()
const { url, status, errorMessage } = storeToRefs(auditStore)
const { audit, reaudit } = auditStore

const auditedUrl = ref('')
watch(status, (val) => {
  if (val === 'done') auditedUrl.value = url.value
})

const isDone = computed(() => status.value === 'done' && url.value === auditedUrl.value)
const buttonLabel = computed(() => isDone.value ? 'Re-audit' : 'Audit')
const action = computed(() => isDone.value ? reaudit : audit)
const showSkeleton = computed(() => status.value === 'idle' || status.value === 'loading')
const leaving = useRouteLeave()
</script>

<template>
  <SharedIntro
    title="Website Audit Tool"
    description="Run a full Lighthouse audit to analyze performance, SEO, accessibility and Core Web Vitals for any website."
  />
  <UiLookup
    v-model="url"
    placeholder="Enter a URL..."
    :buttonIcon="MagnifyingGlassIcon"
    :buttonLabel="buttonLabel"
    loadingLabel="Auditing…"
    :loading="status === 'loading'"
    :onAction="action"
  />

  <div>
    <!-- Skeleton (idle + loading) -->
    <Transition
      leave-active-class="absolute inset-x-0 top-0 transition-opacity duration-500 pointer-events-none"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <AuditSkeleton v-if="showSkeleton" :loading="status === 'loading'" />
    </Transition>

    <!-- Error -->
    <Transition
      enter-active-class="transition-opacity duration-400"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <div
        v-if="status === 'error'"
        class="border border-red-border bg-red-bg rounded-2xl p-4 text-xs text-red-fg"
      >
        {{ errorMessage }}
      </div>
    </Transition>

    <!-- Real content (done) -->
    <Transition
      enter-active-class="transition-opacity duration-600"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <div v-if="status === 'done'" class="space-y-3" :style="leaving ? { animation: 'superbird-fade-out 0.25s ease both' } : {}"  >
        <AuditStats />
        <AuditSummary />
        <AuditList />
      </div>
    </Transition>
  </div>
</template>
