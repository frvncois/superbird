<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import {
  ArrowDownIcon,
  PlusIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/outline'
import type { Component } from 'vue'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

defineProps<{ modelValue: Method; flat?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: Method] }>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

const methods: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const METHOD_CONFIG: Record<Method, { classes: string; icon: Component }> = {
  GET:    { classes: 'bg-green-bg  text-green-fg',   icon: ArrowDownIcon  },
  POST:   { classes: 'bg-blue-bg   text-blue-fg',    icon: PlusIcon       },
  PUT:    { classes: 'bg-amber-bg  text-amber-fg',   icon: ArrowPathIcon  },
  PATCH:  { classes: 'bg-purple-bg text-purple-fg',  icon: PencilIcon     },
  DELETE: { classes: 'bg-red-bg    text-red-fg',     icon: TrashIcon      },
}

async function toggleOpen() {
  if (!open.value) {
    open.value = true
    await nextTick()
    const rect = triggerRef.value?.getBoundingClientRect()
    if (rect) {
      panelStyle.value = {
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
      }
    }
  } else {
    open.value = false
  }
}

function select(m: Method) {
  emit('update:modelValue', m)
  open.value = false
}

function handleOutsideClick(e: MouseEvent) {
  const target = e.target as Node
  if (!triggerRef.value?.contains(target) && !panelRef.value?.contains(target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>

<template>
  <div class="relative shrink-0">
    <!-- Trigger -->
    <button
      ref="triggerRef"
      type="button"
      class="flex items-center gap-2.5 h-9 px-4 rounded-xl text-[10px] font-mono font-semibold cursor-pointer transition-opacity hover:opacity-80"
      :class="METHOD_CONFIG[modelValue].classes"
      @click="toggleOpen"
    >
      <component :is="METHOD_CONFIG[modelValue].icon" class="size-2.5" />
      {{ modelValue }}
      <ChevronDownIcon
        class="size-3 transition-transform duration-150"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <!-- Dropdown -->
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
          class="fixed z-[200] flex flex-col gap-1.5 rounded-2xl border bg-background p-2 shadow-lg"
          :style="panelStyle"
        >
          <button
            v-for="m in methods"
            :key="m"
            type="button"
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80 whitespace-nowrap"
            :class="[METHOD_CONFIG[m].classes, m === modelValue ? 'ring-2 ring-offset-1 ring-current' : '']"
            @click="select(m)"
          >
            <component :is="METHOD_CONFIG[m].icon" class="size-3.5" />
            {{ m }}
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
