<script setup lang="ts">
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
defineProps<{ loading?: boolean }>()
</script>

<template>
  <UiSkeleton :loading="loading">
    <!-- Score circles — 4 columns -->
    <div class="grid grid-cols-4 gap-3">
      <div v-for="i in 4" :key="i" class="flex flex-col items-center gap-3 rounded-2xl py-6 border">
        <div class="size-14 rounded-full bg-foreground/10" />
        <div class="h-2 w-14 rounded bg-foreground/10" />
      </div>
    </div>

    <!-- Core vitals — 2×3 grid -->
    <div class="grid grid-cols-2 gap-2 md:grid-cols-3">
      <div v-for="i in 6" :key="i" class="rounded-2xl p-3 border">
        <div class="flex items-center justify-between mb-1.5">
          <div class="h-2 w-8 rounded bg-foreground/10" />
          <div class="h-4 w-10 rounded-md bg-foreground/10" />
        </div>
        <div class="h-6 w-14 rounded bg-foreground/10 mb-1" />
        <div class="h-2 w-full rounded bg-foreground/10" />
      </div>
    </div>

    <!-- Opportunities section -->
    <div class="border rounded-2xl overflow-hidden">
      <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b">
        <div class="h-5 w-28 rounded-full bg-foreground/10" />
        <div class="h-2.5 w-52 rounded bg-foreground/10" />
        <div class="h-5 w-6 rounded-full bg-foreground/10 ml-auto" />
      </div>
      <div v-for="i in 4" :key="i" class="flex items-start gap-3 p-3 border-b last:border-b-0">
        <div class="size-2 rounded-full mt-1.5 shrink-0 bg-foreground/10" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3 rounded bg-foreground/10" :style="`width: ${55 + i * 7}%`" />
          <div class="h-2 w-full rounded bg-foreground/10" />
        </div>
        <div class="h-2.5 w-12 rounded bg-foreground/10 shrink-0 mt-0.5" />
      </div>
    </div>

    <!-- Diagnostics section -->
    <div class="border rounded-2xl overflow-hidden">
      <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b">
        <div class="h-5 w-24 rounded-full bg-foreground/10" />
        <div class="h-2.5 w-44 rounded bg-foreground/10" />
        <div class="h-5 w-6 rounded-full bg-foreground/10 ml-auto" />
      </div>
      <div v-for="i in 3" :key="i" class="flex items-start gap-3 p-3 border-b last:border-b-0">
        <div class="size-2 rounded-full mt-1.5 shrink-0 bg-foreground/10" />
        <div class="flex-1">
          <div class="h-3 rounded bg-foreground/10" :style="`width: ${50 + i * 9}%`" />
        </div>
        <div class="h-2.5 w-16 rounded bg-foreground/10 shrink-0 mt-0.5" />
      </div>
    </div>
  </UiSkeleton>
</template>
