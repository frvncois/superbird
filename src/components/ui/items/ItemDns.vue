<script setup lang="ts">
import { computed } from 'vue'
import { ClipboardIcon } from '@heroicons/vue/24/outline'
import UiButton from '../UiButton.vue'

const props = defineProps<{
  record: {
    ttl: number
    raw: string
    value: string
    priority?: number
    subtype?: string | null
    flags?: string
    tag?: string
  }
  type: string
}>()

const displayValue = computed(() => {
  if (props.type === 'MX' && props.record.priority !== undefined) {
    return `${props.record.priority} ${props.record.value}`
  }
  return props.record.value ?? props.record.raw
})

function copy() {
  navigator.clipboard.writeText(displayValue.value)
}
</script>

<template>
  <div class="flex justify-between p-3 border-b border-border/50 gap-3">
    <div class="flex flex-1 justify-between font-mono text-xs uppercase">
      <span>{{ displayValue }}</span>
      <span class="text-secondary/50">TTL {{ record.ttl }}</span>
    </div>
    <div>
      <UiButton variant="ghost" size="xs" @click="copy">
        <ClipboardIcon class="size-4" />
      </UiButton>
    </div>
  </div>
</template>
