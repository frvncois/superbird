<script setup lang="ts">
import { computed } from 'vue'
import UiBadge from './UiBadge.vue'

const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
  }>(),
  {
    min: 400,
    max: 3840,
  },
)

const model = defineModel<number>({ default: 1280 })

const badge = computed(() => {
  const v = model.value
  if (v < 800)  return { label: 'Small',         color: 'yellow' }
  if (v < 1280) return { label: 'Web ready',     color: 'blue' }
  if (v < 2000) return { label: 'Sweet spot',    color: 'green' }
  if (v < 2660) return { label: 'Getting big',   color: 'orange' }
  return               { label: 'Way too large', color: 'red' }
})

const fillPercent = computed(() =>
  ((model.value - props.min) / (props.max - props.min)) * 100
)
</script>

<template>
  <div class="flex flex-col gap-3 w-full">
    <div class="flex items-center justify-between">
      <span class="text-sm font-mono text-foreground">{{ model }}px</span>
      <UiBadge :label="badge.label" :color="badge.color as any" />
    </div>

    <input
      type="range"
      :min="min"
      :max="max"
      :value="model"
      class="w-full h-1 rounded-full appearance-none cursor-pointer
             [&::-webkit-slider-thumb]:appearance-none
             [&::-webkit-slider-thumb]:size-4
             [&::-webkit-slider-thumb]:rounded-full
             [&::-webkit-slider-thumb]:bg-foreground
             [&::-webkit-slider-thumb]:cursor-pointer
             [&::-moz-range-thumb]:size-4
             [&::-moz-range-thumb]:rounded-full
             [&::-moz-range-thumb]:bg-foreground
             [&::-moz-range-thumb]:border-0"
      :style="`background: linear-gradient(to right, var(--color-foreground) ${fillPercent}%, var(--color-border) ${fillPercent}%)`"
      @input="model = Number(($event.target as HTMLInputElement).value)"
    />

    <div class="flex justify-between">
      <span class="text-xs text-secondary font-mono">{{ min }}px</span>
      <span class="text-xs text-secondary font-mono">{{ max }}px</span>
    </div>
  </div>
</template>
