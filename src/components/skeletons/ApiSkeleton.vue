<script setup lang="ts">
import UiSkeleton from '@/components/ui/UiSkeleton.vue'

defineProps<{ loading?: boolean }>()

const lines = [75, 55, 88, 42, 66, 90, 38, 72, 58, 80, 45, 68, 35, 76, 50, 60, 40, 82]
</script>

<template>
  <UiSkeleton :loading="loading">
    <div class="border rounded-2xl overflow-hidden">
      <!-- Response header bar -->
      <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b">
        <div class="h-3 w-16 rounded bg-foreground/10" />
        <div class="h-5 w-8 rounded-full bg-foreground/10" />
        <div class="h-2.5 w-14 rounded bg-foreground/10" />
        <div class="size-3.5 rounded bg-foreground/10 ml-auto" />
      </div>
      <!-- JSON body -->
      <div class="p-4 space-y-2">
        <div class="h-2.5 w-4 rounded bg-foreground/10" />
        <div
          v-for="(w, i) in lines"
          :key="i"
          class="h-2.5 rounded bg-foreground/10"
          :style="`width: ${w}%; margin-left: ${i % 3 === 0 ? 0 : 16}px`"
        />
        <div class="h-2.5 w-4 rounded bg-foreground/10" />
      </div>
    </div>
  </UiSkeleton>
</template>
