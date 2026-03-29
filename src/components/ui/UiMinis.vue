<script setup lang="ts">
interface Vital {
  key: string
  label: string
  value: string
  unit: string
  desc: string
  status: 'pass' | 'warn' | 'fail' | 'n/a'
}

defineProps<{
  vitals: Vital[]
}>()

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pass: { label: 'Good',  classes: 'bg-green-bg text-green-fg' },
  warn: { label: 'Warn',  classes: 'bg-amber-bg text-amber-fg' },
  fail: { label: 'Poor',  classes: 'bg-red-bg text-red-fg'     },
  'n/a':{ label: 'N/A',   classes: 'bg-muted-bg text-muted-fg' },
}
</script>

<template>
  <div class="grid grid-cols-2 gap-2 md:grid-cols-3">
    <div
      v-for="vital in vitals"
      :key="vital.key"
      class="rounded-2xl p-3 border"
    >
      <!-- Key + status badge -->
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-mono uppercase tracking-wider">
          {{ vital.key }}
        </span>
        <span
          class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md"
          :class="STATUS_CONFIG[vital.status]?.classes ?? STATUS_CONFIG['n/a']?.classes ?? ''"
        >
          {{ STATUS_CONFIG[vital.status]?.label ?? 'N/A' }}
        </span>
      </div>

      <!-- Value + unit -->
      <div class="flex items-baseline gap-0.5">
        <span class="text-lg font-semibold tracking-tight">{{ vital.value }}</span>
        <span v-if="vital.unit" class="text-xs text-secondary">{{ vital.unit }}</span>
      </div>

      <!-- Description -->
      <div class="text-[10px] mt-0.5 text-secondary/70 leading-snug">{{ vital.desc }}</div>
    </div>
  </div>
</template>
