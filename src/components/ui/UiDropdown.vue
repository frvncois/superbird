<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Component } from 'vue'

const props = defineProps<{
  icon: string | Component
  text: string
  value?: string | number
}>()

const open = ref(false)
const container = ref<HTMLElement | null>(null)

const displayValue = computed(() => {
  if (props.value === undefined || props.value === '') return null
  const str = String(props.value)
  return str.length > 12 ? str.slice(0, 12) + '…' : str
})

function handleOutsideClick(e: MouseEvent) {
  if (container.value && !container.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>

<template>
  <div ref="container" class="relative">
    <button
      class="inline-flex items-center gap-3 h-8 px-3 w-[10em] rounded-xl border text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
      @click="open = !open"
    >
      <component :is="icon" class="size-4 text-secondary shrink-0" />
      <span v-if="!displayValue" class="text-[10px] font-mono uppercase">{{ text }}</span>
      <span v-else class="text-[10px] font-mono text-foreground uppercase">{{ displayValue }}</span>
      <svg
        class="size-3.5 text-secondary shrink-0 ml-auto transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
        viewBox="0 0 16 16" fill="none"
      >
        <path d="M4.5 6.5l3.5 3.5 3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <Transition
      enter-active-class="transition duration-150"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="open"
        class="absolute left-0 top-full mt-2 z-50 min-w-[220px] rounded-2xl border bg-background p-4 shadow-lg"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>
