<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useAppStore } from '@/stores/UseCompressStore'
import SharedIntro from '@/components/shared/SharedIntro.vue'
import UiUpload from '@/components/ui/UiUpload.vue'
import CompressSettings from '@/components/CompressSettings.vue'
import CompressList from '@/components/CompressList.vue'
import CompressActions from '@/components/CompressActions.vue'
import UiAlert from '@/components/ui/UiAlert.vue'

const compressStore = useAppStore()
const { items, showLimitAlert } = storeToRefs(compressStore)
const { addFiles } = compressStore
</script>

<template>
  <SharedIntro
    title="Image Compressor & Converter"
    description="Compress, resize and convert images to WebP, JPEG or PNG directly in your browser. Free and Unlimited."
  />
  <UiUpload :compact="items.length > 0" @select="addFiles" />
  <CompressSettings />
  <CompressList />
  <CompressActions />

  <UiAlert
    v-model="showLimitAlert"
    :icon="ExclamationTriangleIcon"
    title="Too many images"
    description="You added more than 20 images at once. To keep things fast, only the first 20 were imported."
  />
</template>
