<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  label: string
  show?: boolean
}>()

const triggerRef = ref<HTMLElement | null>(null)
const style = ref({ top: '0px', left: '0px' })

watch(() => props.show, async (val) => {
  if (val) {
    await nextTick()
    const rect = triggerRef.value?.getBoundingClientRect()
    if (rect) {
      style.value = {
        top: `${rect.top + window.scrollY - 32}px`,
        left: `${rect.left + rect.width / 2}px`,
      }
    }
  }
})
</script>

<template>
  <div ref="triggerRef" class="inline-flex">
    <slot />
    <Teleport to="body">
      <div
        v-if="show"
        class="absolute -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[10px] rounded-lg whitespace-nowrap pointer-events-none z-50"
        :style="style"
      >
        {{ label }}
      </div>
    </Teleport>
  </div>
</template>
