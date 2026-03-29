<script setup lang="ts">
import { ref, computed } from 'vue'
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/vue/24/outline'
import UiTooltip from '../UiTooltip.vue'

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

const copied = ref(false)
function copy() {
  navigator.clipboard.writeText(displayValue.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="flex items-center justify-between p-3 border-b border-border/50 gap-3 last:border-b-0">
    <div class="flex flex-1 justify-between font-mono text-xs">
      <span>{{ displayValue }}</span>
      <span class="text-secondary/50">TTL {{ record.ttl }}</span>
    </div>
    <UiTooltip label="Copied!" :show="copied">
      <button type="button" class="text-secondary/40 hover:text-secondary transition-colors cursor-pointer" @click="copy">
        <ClipboardDocumentCheckIcon v-if="copied" class="size-3.5" />
        <ClipboardDocumentIcon v-else class="size-3.5" />
      </button>
    </UiTooltip>
  </div>
</template>
