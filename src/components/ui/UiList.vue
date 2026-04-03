<script setup lang="ts">
import type { Component } from 'vue'
import UiBadge from './UiBadge.vue'

defineProps<{
  icon: Component
  title: string
  description?: string
  count?: number
  animationDelay?: number
}>()
</script>

<template>
  <div
    class="border rounded-2xl overflow-hidden"
    :style="animationDelay !== undefined
      ? `animation: superbird-fade-in-up 0.5s ease both; animation-delay: ${animationDelay}ms`
      : undefined"
  >
    <div class="flex items-start gap-3 bg-secondary/5 px-3 py-3 border-b">
      <component :is="icon" class="size-3.5 shrink-0 mt-0.5" />
      <div class="flex-1 min-w-0 space-y-0.5">
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs font-medium">{{ title }}</span>
          <slot name="action" />
        </div>
        <p v-if="description" class="text-[10px] text-secondary/75">{{ description }}</p>
        <slot name="subheader" />
      </div>
      <UiBadge v-if="count !== undefined" :label="String(count)" class="shrink-0 mt-0.5" />
    </div>
    <slot />
  </div>
</template>
