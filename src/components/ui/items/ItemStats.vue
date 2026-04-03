<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import NumberFlow from '@number-flow/vue'
import { scoreColor, scoreOffset } from '@/utils/audit.js'

const props = defineProps<{
  label: string
  score: number | null
  revealDelay?: number
}>()

const displayScore = ref(0)
const hasScore = ref(false)

watch(() => props.score, async (val) => {
  if (val !== null) {
    if (!hasScore.value) {
      hasScore.value = true
      await nextTick() // let NumberFlow mount with value=0 first
      if (props.revealDelay) {
        await new Promise(r => setTimeout(r, props.revealDelay))
      }
    }
    displayScore.value = val
  }
}, { immediate: true })

const color = computed(() => props.score !== null ? scoreColor(props.score) : 'var(--color-secondary)')
const offset = computed(() => props.score !== null ? scoreOffset(props.score) : '138.2')
</script>

<template>
  <div class="flex flex-col items-center gap-3 rounded-2xl py-6 border">

    <!-- Circle -->
    <div class="relative size-14">
      <svg width="56" height="56" viewBox="0 0 56 56" class="-rotate-90">
        <circle cx="28" cy="28" r="22" fill="none" stroke="var(--c-border)" stroke-width="1" />
        <circle
          cx="28" cy="28" r="22" fill="none"
          :stroke="color"
          stroke-width="1"
          stroke-dasharray="138.2"
          :stroke-dashoffset="offset"
          stroke-linecap="round"
          style="transition: stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1);"
        />
      </svg>
      <div class="absolute inset-0 flex items-center justify-center text-base font-mono" :style="{ color }">
        <NumberFlow v-if="hasScore" :value="displayScore" />
        <span v-else class="text-secondary text-sm">—</span>
      </div>
    </div>

    <!-- Label -->
    <div class="text-center text-[10px] font-mono uppercase text-secondary">
      {{ label }}
    </div>

  </div>
</template>
