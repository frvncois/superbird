<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, type Component } from 'vue'

const props = defineProps<{
  icon: string | Component
  text: string
  value?: string | number
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

const displayValue = computed(() => {
  if (props.value === undefined || props.value === '') return null
  const str = String(props.value)
  return str.length > 12 ? str.slice(0, 12) + '…' : str
})

async function toggle() {
  if (!open.value) {
    open.value = true
    await nextTick()
    const rect = triggerRef.value?.getBoundingClientRect()
    if (rect) {
      panelStyle.value = {
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        minWidth: `${Math.max(rect.width, 220)}px`,
      }
    }
  } else {
    open.value = false
  }
}

function handleOutsideClick(e: MouseEvent) {
  const target = e.target as Node
  if (
    !triggerRef.value?.contains(target) &&
    !panelRef.value?.contains(target)
  ) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>

<template>
  <div class="relative shrink-0">
    <button
      ref="triggerRef"
      class="inline-flex items-center gap-3 h-8 px-3 w-full sm:w-[10em] rounded-xl border text-foreground hover:bg-secondary/10 active:bg-secondary/20 transition-colors cursor-pointer"
      @click="toggle"
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

    <Teleport to="body">
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
          ref="panelRef"
          class="fixed z-[200] rounded-2xl border bg-background p-3 shadow-lg/3"
          :style="panelStyle"
        >
          <slot />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
