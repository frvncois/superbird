<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowUpTrayIcon } from '@heroicons/vue/24/outline'
import { useRouteLeave } from '@/composables/useRouteLeave'
import UiIcon from './UiIcon.vue'
import UiBadge from './UiBadge.vue'

const props = defineProps<{ compact?: boolean }>()

const leaving = useRouteLeave()
const sectionStyle = computed(() => ({
  animation: leaving.value ? 'superbird-fade-out 0.25s ease both' : 'superbird-fade-in 0.4s ease both',
}))

const dropStyle = computed(() => ({
  paddingTop: props.compact ? '3.5rem' : '9rem',
  paddingBottom: props.compact ? '3.5rem' : '9rem',
  transition: 'padding 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
}))

const emit = defineEmits<{
  select: [files: FileList]
}>()

const input = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

function openPicker() {
  input.value?.click()
}

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) emit('select', files)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files?.length) emit('select', files)
}
</script>

<template>
  <section :style="sectionStyle">
    <input ref="input" type="file" multiple accept="image/*" class="hidden" @change="onFileChange" />
    <div
      class="group flex flex-col items-center justify-center gap-4 border rounded-2xl cursor-pointer transition-colors"
      :style="dropStyle"
      :class="isDragging ? 'border-foreground/40 bg-foreground/5' : 'hover:border-foreground/20'"
      @click="openPicker"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <UiIcon :icon="ArrowUpTrayIcon" variant="circle" size="large" class="transition-transform duration-200 group-hover:scale-110" />
      <h2 class="text-sm font-medium text-secondary">Drop your images here</h2>
      <div class="flex gap-1.5">
        <UiBadge label="PNG" />
        <UiBadge label="JPEG" />
        <UiBadge label="WEBP" />
        <UiBadge label="GIF" />
        <UiBadge label="Paste" />
      </div>
    </div>
  </section>
</template>
