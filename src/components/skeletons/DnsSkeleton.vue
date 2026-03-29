<script setup lang="ts">
import UiSkeleton from '@/components/ui/UiSkeleton.vue'

defineProps<{ loading?: boolean }>()

const sections = [
  { badgeW: 'w-6',  labelW: 'w-36', rows: 2 },
  { badgeW: 'w-10', labelW: 'w-52', rows: 1 },
  { badgeW: 'w-8',  labelW: 'w-44', rows: 2 },
  { badgeW: 'w-8',  labelW: 'w-48', rows: 3 },
  { badgeW: 'w-14', labelW: 'w-40', rows: 1 },
  { badgeW: 'w-6',  labelW: 'w-32', rows: 1 },
]
</script>

<template>
  <UiSkeleton :loading="loading">
    <div v-for="(s, i) in sections" :key="i" class="border rounded-2xl overflow-hidden">
      <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b">
        <div class="h-5 rounded-full bg-foreground/10" :class="s.badgeW" />
        <div class="h-2.5 rounded bg-foreground/10" :class="s.labelW" />
        <div class="h-5 w-5 rounded-full bg-foreground/10 ml-auto" />
      </div>
      <div v-for="r in s.rows" :key="r" class="flex items-center justify-between p-3 border-b last:border-b-0">
        <div class="h-2.5 rounded bg-foreground/10 font-mono" :style="`width: ${40 + r * 15}%`" />
        <div class="flex items-center gap-3">
          <div class="h-2.5 w-16 rounded bg-foreground/10" />
          <div class="size-6 rounded-lg bg-foreground/10" />
        </div>
      </div>
    </div>
  </UiSkeleton>
</template>
