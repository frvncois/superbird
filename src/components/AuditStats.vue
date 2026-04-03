<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuditStore } from '@/stores/useAuditStore'
import ItemStats from './ui/items/ItemStats.vue'

const { status, scores } = storeToRefs(useAuditStore())
</script>

<template>
  <div v-if="status === 'done'" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <ItemStats
      label="Performance"
      :score="scores?.performance ?? null"
      :revealDelay="520"
      style="animation: superbird-fade-in-up 0.5s ease both; animation-delay: 0ms"
    />
    <ItemStats
      label="SEO"
      :score="scores?.seo ?? null"
      :revealDelay="580"
      style="animation: superbird-fade-in-up 0.5s ease both; animation-delay: 60ms"
    />
    <ItemStats
      label="Accessibility"
      :score="scores?.accessibility ?? null"
      :revealDelay="640"
      style="animation: superbird-fade-in-up 0.5s ease both; animation-delay: 120ms"
    />
    <ItemStats
      label="Best Practices"
      :score="scores?.bestPractices ?? null"
      :revealDelay="700"
      style="animation: superbird-fade-in-up 0.5s ease both; animation-delay: 180ms"
    />
  </div>
</template>
