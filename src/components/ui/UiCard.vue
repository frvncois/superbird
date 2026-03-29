<script setup lang="ts">
import { type Component } from 'vue'
import { type RouteLocationRaw } from 'vue-router'
import { ArrowUpRightIcon } from '@heroicons/vue/24/outline'
import UiIcon from './UiIcon.vue'
import UiBadge from './UiBadge.vue'

defineProps<{
  icon: string | Component
  title: string
  description: string
  badges?: string[]
  to: RouteLocationRaw
}>()
</script>

<template>
  <RouterLink :to="to" class="group relative flex flex-col gap-6 rounded-2xl border border-foreground/10 p-6 hover:border-foreground/20 transition-colors">
    <ArrowUpRightIcon class="absolute top-6 right-6 size-3 text-foreground/40 transition-transform duration-200 group-hover:-translate-y-[0.5em] group-hover:translate-x-[0.5em]" />
    <UiIcon :icon="icon" size="default" />
    <div class="flex flex-col gap-1">
      <h3 class="font-medium text-sm text-foreground">{{ title }}</h3>
      <p class="text-sm text-secondary">{{ description }}</p>
    </div>
    <div v-if="badges?.length" class="flex flex-wrap gap-1.5">
      <UiBadge v-for="badge in badges" :key="badge" :label="badge" />
    </div>
  </RouterLink>
</template>
