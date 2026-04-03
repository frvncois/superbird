<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Component } from 'vue'
import { ClockIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useRouteLeave } from '@/composables/useRouteLeave'
import { useUrlHistory } from '@/composables/useUrlHistory'
import UiInput from './UiInput.vue'
import UiButton from './UiButton.vue'

const props = defineProps<{
  placeholder: string
  buttonIcon: Component
  buttonLabel?: string
  loadingLabel?: string
  loading?: boolean
  onAction: () => void
  historyKey?: string
}>()

const value = defineModel<string>({ default: '' })

const currentLabel = computed(() =>
  props.loading && props.loadingLabel ? props.loadingLabel : props.buttonLabel
)

const leaving = useRouteLeave()

const formStyle = computed(() => ({
  animation: leaving.value
    ? `superbird-fade-out 0.25s ease both`
    : `superbird-fade-in 0.4s ease 120ms both`,
}))

// ── History ───────────────────────────────────────────────────────────────────

const { urls: history, push: pushHistory, remove: removeHistory } = useUrlHistory(props.historyKey)

const historyOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

function handleAction() {
  if (props.historyKey && value.value.trim()) pushHistory(value.value.trim())
  props.onAction()
}

function selectHistory(url: string) {
  value.value = url
  historyOpen.value = false
  if (props.historyKey) pushHistory(url)
  props.onAction()
}

function onRemove(e: MouseEvent, url: string) {
  e.stopPropagation()
  removeHistory(url)
}

function onOutsideClick(e: MouseEvent) {
  if (!containerRef.value?.contains(e.target as Node)) historyOpen.value = false
}

onMounted(() => document.addEventListener('mousedown', onOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', onOutsideClick))
</script>

<template>
  <div ref="containerRef" class="relative">
    <form
      class="flex items-center gap-1.5 border rounded-2xl p-1.5 outline-3 outline-transparent focus-within:outline-secondary/10 transition-[outline-color] duration-150"
      :style="formStyle"
      @submit.prevent="handleAction"
    >
      <slot name="leading" />
      <UiInput v-model="value" :placeholder="placeholder" variant="lookup" class="flex-1" />
      <UiButton size="md">

        <!-- Icon: original → spinner, cross-fade -->
        <span class="relative inline-flex items-center justify-center size-4 shrink-0">
          <Transition
            enter-active-class="transition-opacity duration-200 ease-in"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-150 ease-out absolute"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <svg
              v-if="loading"
              key="spinner"
              class="size-4 animate-spin"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.25" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <component v-else key="orig-icon" :is="buttonIcon" class="size-4" />
          </Transition>
        </span>

        <!-- Text: slide up out, slide in from below -->
        <span v-if="buttonLabel" class="relative overflow-hidden inline-block ml-1.5" style="height: 1.2em; line-height: 1.2em;">
          <span class="invisible whitespace-nowrap pointer-events-none select-none" aria-hidden="true">{{ currentLabel }}</span>
          <Transition
            enter-active-class="transition-transform duration-300 ease-out"
            enter-from-class="translate-y-full"
            enter-to-class="translate-y-0"
            leave-active-class="transition-transform duration-300 ease-in absolute inset-0"
            leave-from-class="translate-y-0"
            leave-to-class="-translate-y-full"
          >
            <span :key="currentLabel" class="absolute inset-0 whitespace-nowrap flex items-center">{{ currentLabel }}</span>
          </Transition>
        </span>

      </UiButton>

      <!-- History toggle -->
      <button
        v-if="historyKey && history.length"
        type="button"
        :class="[
          'h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-xl transition-colors duration-150',
          historyOpen
            ? 'bg-secondary/10 text-foreground'
            : 'text-secondary/50 hover:bg-secondary/10 hover:text-foreground',
        ]"
        @click="historyOpen = !historyOpen"
      >
        <ClockIcon class="size-4" />
      </button>
    </form>

    <!-- History dropdown -->
    <Transition
      enter-active-class="transition-[opacity,transform] duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-[opacity,transform] duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="historyOpen"
        class="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-2xl border bg-background p-1 shadow-lg"
      >
        <button
          v-for="url in history"
          :key="url"
          type="button"
          class="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-left hover:bg-secondary/8 active:bg-secondary/15 cursor-pointer"
          @click="selectHistory(url)"
        >
          <ClockIcon class="size-3.5 shrink-0 text-secondary/40" />
          <span class="flex-1 truncate text-secondary/80">{{ url }}</span>
          <span
            class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 rounded-md p-0.5 hover:bg-secondary/15"
            @click.stop="onRemove($event, url)"
          >
            <XMarkIcon class="size-3 text-secondary/50" />
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>
