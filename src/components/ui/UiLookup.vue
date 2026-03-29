<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { useRouteLeave } from '@/composables/useRouteLeave'
import UiInput from './UiInput.vue'
import UiButton from './UiButton.vue'

const props = defineProps<{
  placeholder: string
  buttonIcon: Component
  buttonLabel?: string
  loadingLabel?: string
  loading?: boolean
  onAction: () => void
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
</script>

<template>
  <form
    class="flex items-center gap-1.5 border rounded-2xl p-1.5 outline-3 outline-transparent focus-within:outline-secondary/10 transition-[outline-color] duration-150"
    :style="formStyle"
    @submit.prevent="onAction"
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
  </form>
</template>
