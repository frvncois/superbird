<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'

const props = defineProps<{ loading?: boolean }>()

const STEPS = [
  { message: 'Connecting to Lighthouse…',      delay: 900  },
  { message: 'Fetching your page…',            delay: 3200 },
  { message: 'Running performance tests…',     delay: 5500 },
  { message: 'Analysing images and scripts…',  delay: 5000 },
  { message: 'Checking SEO signals…',          delay: 4800 },
  { message: 'Measuring Core Web Vitals…',     delay: 5200 },
  { message: 'Crunching the numbers…',         delay: 4500 },
  { message: 'Almost there…',                  delay: 99999 },
]

const stepIndex = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []

function clearTimers() {
  timers.forEach(clearTimeout)
  timers.length = 0
}

function scheduleSteps() {
  clearTimers()
  stepIndex.value = 0
  let elapsed = 0
  for (let i = 1; i < STEPS.length; i++) {
    elapsed += STEPS[i - 1]!.delay
    const idx = i
    timers.push(setTimeout(() => { stepIndex.value = idx }, elapsed))
  }
}

watch(() => props.loading, (val) => {
  if (val) scheduleSteps()
  else clearTimers()
}, { immediate: true })

onUnmounted(clearTimers)
</script>

<template>
  <div class="relative">
    <UiSkeleton :loading="loading">
      <!-- Score circles — 4 columns -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="flex flex-col items-center gap-3 rounded-2xl py-6 border">
          <div class="size-14 rounded-full bg-secondary/15" />
          <div class="h-2 w-14 rounded bg-secondary/15" />
        </div>
      </div>

      <!-- Core vitals — 2×3 grid -->
      <div class="grid grid-cols-2 gap-2 md:grid-cols-3">
        <div v-for="i in 6" :key="i" class="rounded-2xl p-3 border">
          <div class="flex items-center justify-between mb-1.5">
            <div class="h-2 w-8 rounded bg-secondary/15" />
            <div class="h-4 w-10 rounded-md bg-secondary/15" />
          </div>
          <div class="h-6 w-14 rounded bg-secondary/15 mb-1" />
          <div class="h-2 w-full rounded bg-secondary/15" />
        </div>
      </div>

      <!-- Opportunities section -->
      <div class="border rounded-2xl overflow-hidden">
        <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b">
          <div class="h-5 w-28 rounded-full bg-secondary/15" />
          <div class="h-2.5 w-52 rounded bg-secondary/15" />
          <div class="h-5 w-6 rounded-full bg-secondary/15 ml-auto" />
        </div>
        <div v-for="i in 4" :key="i" class="flex items-start gap-3 p-3 border-b last:border-b-0">
          <div class="size-2 rounded-full mt-1.5 shrink-0 bg-secondary/15" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 rounded bg-secondary/15" :style="`width: ${55 + i * 7}%`" />
            <div class="h-2 w-full rounded bg-secondary/15" />
          </div>
          <div class="h-2.5 w-12 rounded bg-secondary/15 shrink-0 mt-0.5" />
        </div>
      </div>

      <!-- Diagnostics section -->
      <div class="border rounded-2xl overflow-hidden">
        <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b">
          <div class="h-5 w-24 rounded-full bg-secondary/15" />
          <div class="h-2.5 w-44 rounded bg-secondary/15" />
          <div class="h-5 w-6 rounded-full bg-secondary/15 ml-auto" />
        </div>
        <div v-for="i in 3" :key="i" class="flex items-start gap-3 p-3 border-b last:border-b-0">
          <div class="size-2 rounded-full mt-1.5 shrink-0 bg-secondary/15" />
          <div class="flex-1">
            <div class="h-3 rounded bg-secondary/15" :style="`width: ${50 + i * 9}%`" />
          </div>
          <div class="h-2.5 w-16 rounded bg-secondary/15 shrink-0 mt-0.5" />
        </div>
      </div>
    </UiSkeleton>

    <!-- Floating step message -->
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <span
        :key="stepIndex"
        class="rounded-full border bg-background px-3.5 py-1.5 text-[11px] text-secondary shadow-sm"
        style="animation: superbird-fade-in-up 0.4s ease both"
      >
        {{ STEPS[stepIndex]?.message }}
      </span>
    </div>
  </div>
</template>
