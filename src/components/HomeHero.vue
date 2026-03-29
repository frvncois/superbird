<script setup lang="ts">
import { computed } from 'vue'
import SuperbirdIcon from '@/assets/SuperbirdIcon.vue'
import { useRouteLeave } from '@/composables/useRouteLeave'

const leaving = useRouteLeave()

const iconStyle = computed(() => ({
  animation: leaving.value
    ? `superbird-hero-icon-exit 0.35s cubic-bezier(0.4, 0, 1, 1) both`
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
</script>

<template>
  <section>
    <div class="flex flex-col items-center gap-6 text-center pb-14 pt-4">
      <span class="inline-flex items-center justify-center shrink-0 bg-icon-bg text-icon-txt size-14 p-4 rounded-2xl overflow-hidden">
        <SuperbirdIcon :style="iconStyle" />
      </span>
      <h1 class="text-4xl font-medium" :style="h1Style">Essential tools for <br>frontend devs</h1>
      <p class="text-sm text-secondary max-w-[25ch]" :style="pStyle">Compress images, audit site speed, check DNS records and test APIs.<br>All in one place, all for free.</p>
    </div>
  </section>
</template>
