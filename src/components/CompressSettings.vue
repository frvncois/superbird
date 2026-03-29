<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { PhotoIcon, ArrowsPointingOutIcon, PencilIcon } from '@heroicons/vue/24/outline'
import { useAppStore } from '@/stores/UseCompressStore'
import { useRouteLeave } from '@/composables/useRouteLeave'
import UiDropdown from '@/components/ui/UiDropdown.vue'
import UiToggle from '@/components/ui/UiToggle.vue'
import UiSelect from '@/components/ui/UiSelect.vue'
import UiSlider from '@/components/ui/UiSlider.vue'
import UiInput from '@/components/ui/UiInput.vue'

const { format, maxWidth, renamePrefix, clearExif } = storeToRefs(useAppStore())

const leaving = useRouteLeave()
const wrapperStyle = computed(() => ({
  animation: leaving.value ? 'superbird-fade-out 0.25s ease both' : 'superbird-fade-in 0.4s ease both',
}))
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-3" :style="wrapperStyle">
    <UiDropdown :icon="PhotoIcon" text="Format" :value="format.toUpperCase()">
      <UiSelect v-model="format" :options="['png', 'jpeg', 'webp']" />
    </UiDropdown>
    <UiDropdown :icon="ArrowsPointingOutIcon" text="Size" :value="`${maxWidth}px`">
      <UiSlider v-model="maxWidth" :min="400" :max="3840" />
    </UiDropdown>
    <UiDropdown :icon="PencilIcon" text="Prefix" :value="renamePrefix">
      <UiInput v-model="renamePrefix" placeholder="e.g. optimized-" />
    </UiDropdown>
    <div class="ml-auto">
      <UiToggle v-model="clearExif" text="Remove EXIF" />
    </div>
  </div>
</template>
