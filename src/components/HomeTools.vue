<script setup lang="ts">
import { MagnifyingGlassIcon, PhotoIcon, GlobeAltIcon, PlayIcon } from '@heroicons/vue/24/outline'
import UiCard from './ui/UiCard.vue'
import { useRouteLeave } from '@/composables/useRouteLeave'

const leaving = useRouteLeave()

const delays = [250, 300, 350, 400]

function cardStyle(i: number) {
  return leaving.value
    ? { animation: `superbird-fade-out 0.25s ease both` }
    : { animation: `superbird-fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delays[i]}ms both` }
}
</script>

<template>
  <section>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <UiCard
        :icon="PhotoIcon"
        title="Compress your images"
        description="Drop your images. Get smaller files. Done."
        :badges="['Resize', 'Convert', 'Rename', 'EXIF']"
        to="/compress"
        :style="cardStyle(1)"
      />
      <UiCard
        :icon="MagnifyingGlassIcon"
        title="Audit your site"
        description="Run the audit. See what's broken. Ship faster."
        :badges="['Performance', 'SEO', 'Accessibility']"
        to="/audit"
        :style="cardStyle(0)"
      />
      <UiCard
        :icon="GlobeAltIcon"
        title="Check your DNS"
        description="Enter a domain. See the records. No guessing."
        :badges="['Lookup', 'Propagation', 'SPF', 'DKIM']"
        to="/dns"
        :style="cardStyle(2)"
      />
      <UiCard
        :icon="PlayIcon"
        title="Test any API"
        description="Send a request. See the response. That's it."
        :badges="['REST', 'JSON', 'Tree view', 'Proxy']"
        to="/api"
        :style="cardStyle(3)"
      />
    </div>
  </section>
</template>
