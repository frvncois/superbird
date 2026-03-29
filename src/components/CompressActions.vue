<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { RocketLaunchIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { useAppStore } from '@/stores/UseCompressStore'
import UiButton from '@/components/ui/UiButton.vue'
import UiBadge from '@/components/ui/UiBadge.vue'

const compressStore = useAppStore()
const { stagedItems, doneFiles, isCompressing, totalSaved } = storeToRefs(compressStore)
const { compress, downloadAll, formatBytes } = compressStore

const compressLabel = computed(() => isCompressing.value ? 'Compressing…' : 'Compress')
</script>

<template>
  <div v-if="stagedItems.length || doneFiles.length" class="flex flex-col items-center gap-2 mb-18">

    <!-- Compress -->
    <UiButton v-if="stagedItems.length" @click="compress">

      <!-- Icon: rocket → spinner -->
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
            v-if="isCompressing"
            key="spinner"
            class="size-4 animate-spin"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.25" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <RocketLaunchIcon v-else key="rocket" class="size-4" />
        </Transition>
      </span>

      <!-- Text: slide up out, slide in from below -->
      <span class="relative overflow-hidden inline-block ml-1.5" style="height: 1.2em; line-height: 1.2em;">
        <span class="invisible whitespace-nowrap pointer-events-none select-none" aria-hidden="true">{{ compressLabel }}</span>
        <Transition
          enter-active-class="transition-transform duration-300 ease-out"
          enter-from-class="translate-y-full"
          enter-to-class="translate-y-0"
          leave-active-class="transition-transform duration-300 ease-in absolute inset-0"
          leave-from-class="translate-y-0"
          leave-to-class="-translate-y-full"
        >
          <span :key="compressLabel" class="absolute inset-0 whitespace-nowrap flex items-center">{{ compressLabel }}</span>
        </Transition>
      </span>

    </UiButton>

    <!-- Download All -->
    <template v-else-if="doneFiles.length">
      <UiButton @click="downloadAll">
        <ArrowDownTrayIcon class="size-4 mr-1.5" />
        Download All
      </UiButton>
      <UiBadge :label="`${formatBytes(totalSaved)} saved`" color="green" />
    </template>

  </div>
</template>
