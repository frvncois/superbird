<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useScanStore } from '@/stores/useScanStore'
import SharedIntro from '@/components/shared/SharedIntro.vue'
import UiLookup from '@/components/ui/UiLookup.vue'
import ScanStats from '@/components/ScanStats.vue'
import ScanList from '@/components/ScanList.vue'
import ScanSkeleton from '@/components/skeletons/ScanSkeleton.vue'
import { useRouteLeave } from '@/composables/useRouteLeave'

const scanStore = useScanStore()
const { url, status, errorMessage } = storeToRefs(scanStore)
const { scan, rescan } = scanStore

const scannedUrl = ref('')
watch(status, (val) => {
  if (val === 'done') scannedUrl.value = url.value
})

const isDone = computed(() => status.value === 'done' && url.value === scannedUrl.value)
const buttonLabel = computed(() => isDone.value ? 'Rescan' : 'Scan')
const action = computed(() => isDone.value ? rescan : scan)
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
    loadingLabel="Scanning…"
    :loading="status === 'loading'"
    :onAction="action"
  />

  <div class="relative mt-2">
    <!-- Skeleton (idle + loading) -->
    <Transition
      leave-active-class="absolute inset-x-0 top-0 transition-opacity duration-500 pointer-events-none"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <ScanSkeleton v-if="showSkeleton" :loading="status === 'loading'" />
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
        <ScanStats />
        <ScanList />
      </div>
    </Transition>
  </div>
</template>
