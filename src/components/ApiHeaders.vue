<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useApiStore } from '@/stores/useApiStore'
import { useRouteLeave } from '@/composables/useRouteLeave'
import UiButton from '@/components/ui/UiButton.vue'

const { headers } = storeToRefs(useApiStore())
const { addHeader, removeHeader } = useApiStore()

const leaving = useRouteLeave()
const wrapperStyle = computed(() => ({
  animation: leaving.value ? 'superbird-fade-out 0.25s ease both' : 'superbird-fade-in 0.4s ease both',
}))
</script>

<template>
  <div class="border rounded-2xl overflow-hidden" :style="wrapperStyle">
    <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b text-xs">
      <span class="font-medium text-secondary">Headers</span>
      <UiButton variant="ghost" size="xs" class="ml-auto" type="button" @click="addHeader">
        <PlusIcon class="size-3 mr-1" />
        Add
      </UiButton>
    </div>
    <div
      v-for="(header, i) in headers"
      :key="i"
      class="flex items-center gap-2 px-3 py-2 border-b border-border/50 last:border-b-0"
    >
      <input
        v-model="header.enabled"
        type="checkbox"
        class="size-3.5 shrink-0 accent-black cursor-pointer"
      />
      <input
        v-model="header.key"
        placeholder="Key"
        class="flex-1 min-w-0 text-xs bg-transparent outline-none placeholder:text-secondary/40 font-mono"
      />
      <span class="text-secondary/30 text-xs">:</span>
      <input
        v-model="header.value"
        placeholder="Value"
        class="flex-1 min-w-0 text-xs bg-transparent outline-none placeholder:text-secondary/40 font-mono"
      />
      <button
        v-if="headers.length > 1"
        type="button"
        class="shrink-0 text-secondary/40 hover:text-secondary transition-colors cursor-pointer"
        @click="removeHeader(i)"
      >
        <XMarkIcon class="size-3.5" />
      </button>
    </div>
  </div>
</template>
