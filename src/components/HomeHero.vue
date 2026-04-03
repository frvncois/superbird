<script setup lang="ts">
import { computed } from 'vue'
import SuperbirdIcon from '@/assets/SuperbirdIcon.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { useRouteLeave } from '@/composables/useRouteLeave'

const leaving = useRouteLeave()

const iconStyle = computed(() => ({
  animation: leaving.value
    ? `superbird-hero-icon-exit 0.3s cubic-bezier(0.4, 0, 1, 1) both`
    : `superbird-hero-icon-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
}))

const h1Style = computed(() => ({
  animation: leaving.value
    ? `superbird-intro-exit 0.3s cubic-bezier(0.4, 0, 1, 1) both`
    : `superbird-intro-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) 200ms both`,
}))

const pStyle = computed(() => ({
  animation: leaving.value
    ? `superbird-intro-exit 0.3s cubic-bezier(0.4, 0, 1, 1) 80ms both`
    : `superbird-intro-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) 380ms both`,
}))

const badgeStyles = computed(() => [520, 600, 680, 760].map(delay => ({
  animation: leaving.value
    ? `superbird-intro-exit 0.3s cubic-bezier(0.4, 0, 1, 1) both`
    : `superbird-intro-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`,
})))
</script>

<template>
  <section>
    <div class="flex flex-col items-center text-center gap-4 pb-18 pt-2">
      <span class="inline-flex items-center justify-center shrink-0 bg-icon-bg text-icon-txt size-14 p-4 rounded-2xl mb-6">
        <SuperbirdIcon :style="iconStyle" />
      </span>
      <h1 class="flex flex-col text-5xl font-medium" :style="h1Style">Your web toolkit<span>in one tab</span></h1>
      <div class="flex flex-wrap justify-center gap-1.5 mt-1">
        <UiBadge label="Free" color="green" :style="badgeStyles[0]" />
        <UiBadge label="No signup" color="green" :style="badgeStyles[1]" />
        <UiBadge label="Unlimited usage" color="green" :style="badgeStyles[2]" />
      </div>
      <p class="text-sm text-secondary" :style="pStyle">The essentials of building for the web</p>
    </div>
  </section>
</template>
