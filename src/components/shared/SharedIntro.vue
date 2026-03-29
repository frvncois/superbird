<script setup lang="ts">
import { computed } from 'vue'
import { useRouteLeave } from '@/composables/useRouteLeave'

defineProps<{
  title: string
  description: string
}>()

const leaving = useRouteLeave()

const titleStyle = computed(() => ({
  animation: leaving.value
    ? `superbird-intro-exit 0.3s cubic-bezier(0.4, 0, 1, 1) both`
    : `superbird-intro-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both`,
}))

const descStyle = computed(() => ({
  animation: leaving.value
    ? `superbird-intro-exit 0.3s cubic-bezier(0.4, 0, 1, 1) 60ms both`
    : `superbird-intro-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) 80ms both`,
}))
</script>

<template>
  <section>
    <div class="flex flex-col gap-3">
      <h1 class="text-2xl font-semibold leading-none" :style="titleStyle">{{ title }}</h1>
      <p class="text-sm max-w-[50ch] text-secondary" :style="descStyle">{{ description }}</p>
    </div>
  </section>
</template>
