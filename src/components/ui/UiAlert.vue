<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  title: string
  description: string
  buttonLabel?: string
}>()

const open = defineModel<boolean>({ default: false })
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-foreground/20 backdrop-blur-sm" @click="open = false" />

        <!-- Card -->
        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="open" class="relative z-10 w-full max-w-sm rounded-2xl border bg-background p-6 shadow-lg flex flex-col items-center text-center gap-4">
            <!-- Icon -->
            <div class="flex items-center justify-center size-12 rounded-2xl bg-amber-bg text-amber-fg shrink-0">
              <component :is="icon" class="size-6" />
            </div>

            <!-- Text -->
            <div class="space-y-1.5">
              <h2 class="font-semibold text-foreground">{{ title }}</h2>
              <p class="text-sm text-secondary leading-relaxed">{{ description }}</p>
            </div>

            <!-- Button -->
            <button
              class="w-full h-9 px-4 rounded-xl bg-black text-white text-sm font-medium hover:bg-black/85 transition-colors cursor-pointer"
              @click="open = false"
            >
              {{ buttonLabel ?? 'Got it' }}
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
