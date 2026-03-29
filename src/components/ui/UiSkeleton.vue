<script setup lang="ts">
import { computed } from 'vue'
import { useRouteLeave } from '@/composables/useRouteLeave'

defineProps<{ loading?: boolean }>()

const leaving = useRouteLeave()

const wrapperStyle = computed(() => ({
  animation: leaving.value ? 'superbird-fade-out 0.25s ease both' : 'superbird-fade-in 0.4s ease both',
}))
</script>

<template>
  <div class="relative h-[40em] overflow-hidden" :style="wrapperStyle">
    <div
      class="space-y-3"
      :style="loading
        ? 'animation: superbird-skeleton-pulse 1.8s ease-in-out infinite'
        : 'opacity: 0.5'"
    >
      <slot />
    </div>

    <!-- Progressive blur → solid background fade -->
    <div class="absolute inset-x-0 bottom-0 h-52 pointer-events-none">
      <div class="absolute inset-0" style="backdrop-filter: blur(1px); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 30%, transparent 38%); mask-image: linear-gradient(to bottom, transparent 0%, black 30%, transparent 38%)" />
      <div class="absolute inset-0" style="backdrop-filter: blur(3px); -webkit-mask-image: linear-gradient(to bottom, transparent 28%, black 55%, transparent 65%); mask-image: linear-gradient(to bottom, transparent 28%, black 55%, transparent 65%)" />
      <div class="absolute inset-0" style="backdrop-filter: blur(6px); -webkit-mask-image: linear-gradient(to bottom, transparent 55%, black 100%); mask-image: linear-gradient(to bottom, transparent 55%, black 100%)" />
      <div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent 15%, var(--color-background) 100%)" />
    </div>
  </div>
</template>
